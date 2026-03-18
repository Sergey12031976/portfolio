"""
handlers/master_cabinet.py — личный кабинет мастера v2.6

ИЗМЕНЕНИЯ v2.6:
- Добавлен раздел «⭐ Оценить клиента»
- Мастер видит завершённые визиты без оценки и может поставить 1-5 звёзд + комментарий
"""

import logging
from datetime import datetime
from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import (
    ContextTypes, ConversationHandler,
    MessageHandler, CommandHandler, filters
)
from db.repositories.appointment_repo import (
    get_unread_for_master, mark_master_appointments_seen, get_master_schedule
)
from db.repositories.client_rating_repo import (
    get_appointments_pending_rating, add_client_rating,
    get_client_avg_rating, get_client_rating_history,
)
from db.database import get_pool, get_salon_id

logger = logging.getLogger(__name__)

MASTER_MENU         = 90
MASTER_RATE_SELECT  = 91   # выбор визита для оценки
MASTER_RATE_STARS   = 92   # ввод оценки (1-5)
MASTER_RATE_COMMENT = 93   # необязательный комментарий
MASTER_CLIENT_HIST  = 94   # история оценок клиента


def _fmt_date(date_str: str) -> str:
    return datetime.strptime(date_str, "%Y-%m-%d").strftime("%d.%m.%Y")


def _stars(rating: float | None) -> str:
    """Форматирует рейтинг: 4.5 → ⭐4.5"""
    if rating is None:
        return ""
    return f"⭐{rating}"


async def _get_client_ratings_map(schedule: dict) -> dict[int, dict]:
    """
    Для всех client_id из расписания загружает средний рейтинг одним батчем.
    Возвращает {client_id: avg_info_dict}.
    """
    client_ids = set()
    for slots in schedule.values():
        for slot in slots:
            # slot: (time, client_name, service, appt_id, status, confirmed, is_auto)
            # client_id нужно получить отдельно — schedule его не содержит
            pass
    return {}  # заглушка — рейтинг получаем по appt_id через отдельный запрос


async def _get_ratings_for_clients(client_ids: list[int]) -> dict[int, dict]:
    """Загружает средний рейтинг для списка client_id."""
    from db.database import get_pool, get_salon_id
    if not client_ids:
        return {}
    sid = get_salon_id()
    pool = get_pool()
    async with pool.acquire() as con:
        rows = await con.fetch("""
            SELECT
                client_id,
                ROUND(AVG(rating)::numeric, 1) AS avg_rating,
                COUNT(*) AS cnt
            FROM client_ratings
            WHERE salon_id = $1 AND client_id = ANY($2::bigint[])
            GROUP BY client_id
        """, sid, client_ids)
    return {r["client_id"]: {"avg": float(r["avg_rating"]), "cnt": r["cnt"]} for r in rows}

async def _get_schedule_client_ids(master_id: int, days: int) -> dict[str, int]:
    """
    Возвращает {appt_id: client_id} для расписания мастера.
    Нужен чтобы подтянуть рейтинги по client_id.
    """
    from db.database import get_pool, get_salon_id
    from datetime import datetime, timedelta
    sid   = get_salon_id()
    today = datetime.now().strftime("%Y-%m-%d")
    end   = (datetime.now() + timedelta(days=days)).strftime("%Y-%m-%d")
    pool  = get_pool()
    async with pool.acquire() as con:
        rows = await con.fetch("""
            SELECT id AS appt_id, client_id
            FROM appointments
            WHERE salon_id = $1 AND master_id = $2
              AND date BETWEEN $3::date AND $4::date
              AND status = 'active'
        """, sid, master_id, today, end)
    return {r["appt_id"]: r["client_id"] for r in rows}


async def master_main_menu(telegram_id: int) -> ReplyKeyboardMarkup:
    """Клавиатура кабинета мастера — запрашивает счётчик асинхронно."""
    try:
        count = await get_unread_for_master(telegram_id)
        label = f"🔔 Новые записи ({count})" if count > 0 else "📋 Мои записи"
    except Exception as e:
        logger.error(f"[MASTER] Ошибка get_unread_for_master: {e}")
        label = "📋 Мои записи"
    return ReplyKeyboardMarkup(
        [[label], ["📅 Расписание на неделю"], ["⭐ Оценить клиента"], ["🚪 Закрыть"]],
        resize_keyboard=True
    )

async def _get_master_db_id(telegram_id: int):
    """Возвращает masters row по telegram_id мастера."""
    async with get_pool().acquire() as con:
        row = await con.fetchrow(
            "SELECT id, name FROM masters "
            "WHERE salon_id = $1 AND telegram_id = $2 AND is_active = TRUE",
            get_salon_id(), telegram_id
        )
    return row if row else None


async def _init_context(user_id: int, context: ContextTypes.DEFAULT_TYPE):
    """Заполняет master_cabinet_id и master_cabinet_name в user_data. Возвращает master_id."""
    if context.user_data.get("master_cabinet_id"):
        return context.user_data["master_cabinet_id"]

    row = await _get_master_db_id(user_id)
    if not row:
        return None

    context.user_data["master_cabinet_id"]   = row["id"]
    context.user_data["master_cabinet_name"] = row["name"]
    return row["id"]


async def _show_schedule(update: Update, context: ContextTypes.DEFAULT_TYPE,
                          master_id: int, days: int):
    user = update.effective_user
    try:
        await mark_master_appointments_seen(user.id)
    except Exception as e:
        logger.error(f"[MASTER] mark_master_appointments_seen: {e}")

    try:
        schedule = await get_master_schedule(master_id, days_ahead=days)
    except Exception as e:
        logger.error(f"[MASTER] get_master_schedule: {e}", exc_info=True)
        await update.message.reply_text("⚠️ Ошибка при получении расписания.")
        return

    menu = await master_main_menu(user.id)

    if not schedule:
        label = "3 дня" if days == 3 else "неделю"
        await update.message.reply_text(
            f"📭 Записей на ближайшие {label} нет.",
            reply_markup=menu
        )
        return

    # Загружаем рейтинги клиентов из расписания
    appt_client_map = await _get_schedule_client_ids(master_id, days)
    client_ids = list(set(appt_client_map.values()))
    ratings_map = await _get_ratings_for_clients(client_ids)

    # Строим маппинг клиентов для перехода в историю
    # {«кнопка_истории»: client_id}
    history_map = {}

    wd    = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    label = "ближайшие 3 дня" if days == 3 else "неделю"
    lines = [f"📅 *Ваше расписание на {label}*\n"]

    for date_str, slots in sorted(schedule.items()):
        day_fmt = _fmt_date(date_str)
        w       = datetime.strptime(date_str, "%Y-%m-%d").weekday()
        lines.append(f"\n📆 *{day_fmt} ({wd[w]})*")
        for slot in slots:
            time, client, service, appt_id, status, confirmed, is_auto = slot
            flags      = ("✅ " if confirmed else "") + ("🤖" if is_auto else "")
            client_id  = appt_client_map.get(appt_id)
            rating_info = ratings_map.get(client_id) if client_id else None

            if rating_info:
                r_str = f"  ⭐{rating_info['avg']} ({rating_info['cnt']})"
            else:
                r_str = ""

            lines.append(
                f"  🕐 {time} — {client}{r_str}\n"
                f"       💅 {service} {flags}".rstrip()
            )

            # Добавляем клиента в маппинг истории если есть оценки
            if rating_info and client_id:
                btn = f"📋 История: {client}"
                history_map[btn] = {"client_id": client_id, "client_name": client}

    text_out = "\n".join(lines)
    if len(text_out) > 3800:
        text_out = text_out[:3800] + "\n\n_...список обрезан_"

    # Если есть клиенты с историей — предлагаем кнопки
    if history_map:
        context.user_data["schedule_history_map"] = history_map
        btn_rows = [[btn] for btn in history_map.keys()] + [["🔙 Назад в меню"]]
        from telegram import ReplyKeyboardMarkup as RKM
        kb = RKM(btn_rows, resize_keyboard=True)
        await update.message.reply_text(text_out, parse_mode="Markdown", reply_markup=kb)
        return MASTER_CLIENT_HIST
    else:
        context.user_data.pop("schedule_history_map", None)
        await update.message.reply_text(text_out, parse_mode="Markdown", reply_markup=menu)
        return MASTER_MENU

# ОЦЕНКА КЛИЕНТОВ

async def _start_rate_client(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показывает список завершённых визитов без оценки."""
    master_id = context.user_data.get("master_cabinet_id")
    rows      = await get_appointments_pending_rating(master_id)

    if not rows:
        await update.message.reply_text(
            "✅ Все визиты уже оценены!\nКак только появятся новые завершённые записи — "
            "они будут доступны здесь.",
            reply_markup=await master_main_menu(update.effective_user.id)
        )
        return MASTER_MENU

    # Строим кнопки и маппинг
    appt_map = {}
    btn_rows = []
    for r in rows:
        label = f"{_fmt_date(r['date'])} {r['time'][:5]} — {r['client_name']} | {r['service']}"
        btn_rows.append([label])
        appt_map[label] = {
            "appt_id":    r["appt_id"],
            "client_id":  r["client_id"],
            "client_name": r["client_name"],
        }
    btn_rows.append(["🔙 Назад"])

    context.user_data["rate_appt_map"] = appt_map
    await update.message.reply_text(
        "⭐ *Оценить клиента*\n\nВыберите визит:",
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(btn_rows, resize_keyboard=True)
    )
    return MASTER_RATE_SELECT

async def master_rate_select(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка выбора визита."""
    text     = update.message.text
    appt_map = context.user_data.get("rate_appt_map", {})

    if text == "🔙 Назад":
        context.user_data.pop("rate_appt_map", None)
        await update.message.reply_text(
            "Кабинет мастера:",
            reply_markup=await master_main_menu(update.effective_user.id)
        )
        return MASTER_MENU

    if text not in appt_map:
        await update.message.reply_text("Выберите визит из списка.")
        return MASTER_RATE_SELECT

    entry = appt_map[text]
    context.user_data["rate_entry"]   = entry
    context.user_data["rate_label"]   = text
    context.user_data.pop("rate_appt_map", None)

    kb = ReplyKeyboardMarkup(
        [["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"], ["🔙 Назад"]],
        resize_keyboard=True
    )
    await update.message.reply_text(
        f"👤 *{entry['client_name']}*\n📋 {text}\n\n"
        f"Поставьте оценку клиенту:",
        parse_mode="Markdown",
        reply_markup=kb
    )
    return MASTER_RATE_STARS


async def master_rate_stars(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка оценки звёздами."""
    text = update.message.text

    if text == "🔙 Назад":
        return await _start_rate_client(update, context)

    stars_map = {"⭐": 1, "⭐⭐": 2, "⭐⭐⭐": 3, "⭐⭐⭐⭐": 4, "⭐⭐⭐⭐⭐": 5}
    if text not in stars_map:
        await update.message.reply_text("Выберите оценку от ⭐ до ⭐⭐⭐⭐⭐")
        return MASTER_RATE_STARS

    context.user_data["rate_stars"] = stars_map[text]
    entry = context.user_data.get("rate_entry", {})

    kb = ReplyKeyboardMarkup(
        [["➡️ Без комментария"], ["🔙 Назад"]],
        resize_keyboard=True
    )
    await update.message.reply_text(
        f"{'⭐' * stars_map[text]} — *{entry['client_name']}*\n\n"
        f"Добавьте комментарий или пропустите:",
        parse_mode="Markdown",
        reply_markup=kb
    )
    return MASTER_RATE_COMMENT


async def master_rate_comment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Сохраняет оценку с комментарием."""
    text = update.message.text

    if text == "🔙 Назад":
        entry = context.user_data.get("rate_entry", {})
        kb = ReplyKeyboardMarkup(
            [["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"], ["🔙 Назад"]],
            resize_keyboard=True
        )
        await update.message.reply_text(
            f"👤 *{entry.get('client_name', '')}*\n\nПоставьте оценку:",
            parse_mode="Markdown",
            reply_markup=kb
        )
        return MASTER_RATE_STARS

    comment   = "" if text == "➡️ Без комментария" else text.strip()
    entry     = context.user_data.pop("rate_entry", {})
    stars     = context.user_data.pop("rate_stars", 5)
    label     = context.user_data.pop("rate_label", "")
    master_id = context.user_data.get("master_cabinet_id")

    saved = await add_client_rating(
        master_id     = master_id,
        client_id     = entry["client_id"],
        client_name   = entry["client_name"],
        appointment_id= entry["appt_id"],
        rating        = stars,
        comment       = comment,
    )

    if saved:
        vis = "⭐" * stars + "☆" * (5 - stars)
        await update.message.reply_text(
            f"✅ Оценка сохранена!\n\n"
            f"👤 {entry['client_name']}\n"
            f"{vis} *{stars}/5*" +
            (f"\n💬 _{comment}_" if comment else ""),
            parse_mode="Markdown",
            reply_markup=await master_main_menu(update.effective_user.id)
        )
    else:
        await update.message.reply_text(
            "⚠️ Этот визит уже оценён.",
            reply_markup=await master_main_menu(update.effective_user.id)
        )

    context.user_data.pop("rate_appt_map", None)
    return MASTER_MENU

# ИСТОРИЯ ОЦЕНОК КЛИЕНТА

async def master_client_history(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показывает историю оценок выбранного клиента."""
    text        = update.message.text
    history_map = context.user_data.get("schedule_history_map", {})

    if text == "🔙 Назад в меню":
        context.user_data.pop("schedule_history_map", None)
        await update.message.reply_text(
            "Кабинет мастера:",
            reply_markup=await master_main_menu(update.effective_user.id)
        )
        return MASTER_MENU

    entry = history_map.get(text)
    if not entry:
        await update.message.reply_text("Выберите клиента из списка.")
        return MASTER_CLIENT_HIST

    client_id   = entry["client_id"]
    client_name = entry["client_name"]

    history = await get_client_rating_history(client_id)

    if not history:
        await update.message.reply_text(
            f"👤 *{client_name}*\n\nОценок пока нет.",
            parse_mode="Markdown",
            reply_markup=await master_main_menu(update.effective_user.id)
        )
        context.user_data.pop("schedule_history_map", None)
        return MASTER_MENU

    # Считаем итоговый рейтинг
    avg    = round(sum(r["rating"] for r in history) / len(history), 1)
    stars  = "⭐" * round(avg)
    lines  = [f"👤 *{client_name}*\n{stars} *{avg}/5* — {len(history)} оценок\n"]

    for r in history:
        date_fmt = _fmt_date(r["visit_date"])
        time_fmt = r["visit_time"][:5]
        star_str = "⭐" * r["rating"] + "☆" * (5 - r["rating"])
        line     = f"📅 {date_fmt} {time_fmt} — {r['service']}\n   {star_str} *мастер {r['master_name']}*"
        if r["comment"]:
            line += f"\n   💬 _{r['comment']}_"
        lines.append(line)

    text_out = "\n\n".join(lines)
    if len(text_out) > 3800:
        text_out = text_out[:3800] + "\n\n_...обрезано_"

    # Остаёмся в состоянии истории — можно выбрать другого клиента
    btn_rows = [[btn] for btn in history_map.keys()] + [["🔙 Назад в меню"]]
    await update.message.reply_text(
        text_out, parse_mode="Markdown",
        reply_markup=ReplyKeyboardMarkup(btn_rows, resize_keyboard=True)
    )
    return MASTER_CLIENT_HIST

# MAIN HANDLERS

async def cmd_master(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user      = update.effective_user
    master_id = await _init_context(user.id, context)

    if not master_id:
        await update.message.reply_text(
            "⚠️ Ваш Telegram не привязан к мастеру.\nОбратитесь к администратору."
        )
        return ConversationHandler.END

    name  = context.user_data["master_cabinet_name"]
    count = await get_unread_for_master(user.id)
    text  = f"👋 Добрый день, *{name}*!"
    if count > 0:
        text += f"\n\n🔔 У вас *{count}* новых записей!"

    await update.message.reply_text(
        text, parse_mode="Markdown",
        reply_markup=await master_main_menu(user.id)
    )
    return MASTER_MENU


async def btn_schedule_week(update: Update, context: ContextTypes.DEFAULT_TYPE):
    master_id = await _init_context(update.effective_user.id, context)
    if not master_id:
        return
    await _show_schedule(update, context, master_id, days=7)
    return MASTER_MENU


async def master_menu_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text      = update.message.text
    user      = update.effective_user
    master_id = await _init_context(user.id, context)

    if not master_id:
        from handlers.menu import _build_menu
        await update.message.reply_text("Главное меню:", reply_markup=await _build_menu(user.id))
        return ConversationHandler.END

    if text == "🚪 Закрыть":
        context.user_data.pop("master_cabinet_id",   None)
        context.user_data.pop("master_cabinet_name", None)
        from handlers.menu import _build_menu
        await update.message.reply_text(
            "Кабинет мастера закрыт.", reply_markup=await _build_menu(user.id)
        )
        return ConversationHandler.END

    if text.startswith("📋 Мои записи") or text.startswith("🔔 Новые записи"):
        await _show_schedule(update, context, master_id, days=3)
        return MASTER_MENU

    if text == "📅 Расписание на неделю":
        await _show_schedule(update, context, master_id, days=7)
        return MASTER_MENU

    if text == "⭐ Оценить клиента":
        return await _start_rate_client(update, context)

    await update.message.reply_text(
        "Выберите действие:",
        reply_markup=await master_main_menu(user.id)
    )
    return MASTER_MENU


async def _cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from handlers.menu import cmd_start
    return await cmd_start(update, context)


def get_master_cabinet_handler() -> ConversationHandler:
    return ConversationHandler(
        entry_points=[
            CommandHandler("master", cmd_master),
            MessageHandler(filters.Regex(r"^📅 Расписание на неделю$"), btn_schedule_week),
        ],
        states={
            MASTER_MENU: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, master_menu_handler)
            ],
            MASTER_RATE_SELECT: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, master_rate_select)
            ],
            MASTER_RATE_STARS: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, master_rate_stars)
            ],
            MASTER_RATE_COMMENT: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, master_rate_comment)
            ],
            MASTER_CLIENT_HIST: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, master_client_history)
            ],
        },
        fallbacks=[
            CommandHandler("start", _cmd_start),
            CommandHandler("menu",  master_menu_handler),
            MessageHandler(filters.Regex("^🚪 Закрыть$"), master_menu_handler),
        ]
    )