const DB = {

  doctors: [
    { id: 'd1', name: 'Петров А.В.',    spec: 'Кардиолог', load: 92, visits: 138, color: '#1a6b4a', bg: '#e8f4ef' },
    { id: 'd2', name: 'Сидорова Е.К.', spec: 'Терапевт',  load: 78, visits: 117, color: '#1a4a6b', bg: '#e8eff4' },
    { id: 'd3', name: 'Кузнецов И.Р.', spec: 'Невролог',  load: 65, visits: 97,  color: '#c0392b', bg: '#fdf0ef' },
    { id: 'd4', name: 'Богданов С.Т.', spec: 'УЗИ',       load: 55, visits: 79,  color: '#d4a017', bg: '#fdf8e8' },
  ],

  patients: [
    {
      id: 'П-1042', status: 'active',
      name: 'Морозова Татьяна Игоревна',
      dob: '12.06.1972 (52 года)', phone: '+7 (912) 345-67-89',
      doctorId: 'd1', insurance: 'ОМС 1234 5678 9012 3456',
      diagnosis: 'Гипертоническая болезнь II ст. Регулярный контроль АД.',
    },
    {
      id: 'П-0831', status: 'active',
      name: 'Захаров Михаил Петрович',
      dob: '03.11.1986 (38 лет)', phone: '+7 (903) 221-44-10',
      doctorId: 'd2', insurance: 'ДМС «Альфа-страхование»',
      diagnosis: 'ОРВИ, часто. Наблюдение терапевта.',
    },
    {
      id: 'П-2107', status: 'chronic',
      name: 'Новикова Ольга Дмитриевна',
      dob: '18.04.1957 (67 лет)', phone: '+7 (916) 877-20-33',
      doctorId: 'd3', insurance: 'ОМС 9876 5432 1098 7654',
      diagnosis: 'Остеохондроз шейного отдела. Хроническое наблюдение.',
    },
    {
      id: 'П-0576', status: 'active',
      name: 'Соловьёв Андрей Борисович',
      dob: '29.07.1979 (45 лет)', phone: '+7 (926) 100-90-80',
      doctorId: 'd1', insurance: 'ДМС «СОГАЗ»',
      diagnosis: 'ИБС. Регулярный контроль.',
    },
    {
      id: 'П-1389', status: 'new',
      name: 'Волкова Светлана Николаевна',
      dob: '05.02.1996 (29 лет)', phone: '+7 (909) 555-12-34',
      doctorId: 'd2', insurance: 'ОМС (уточнить)',
      diagnosis: 'Первичный пациент, жалобы не указаны.',
    },
    {
      id: 'П-0344', status: 'chronic',
      name: 'Ершов Дмитрий Алексеевич',
      dob: '11.12.1953 (71 год)', phone: '+7 (985) 663-41-07',
      doctorId: 'd3', insurance: 'ОМС 4455 6677 8899 0011',
      diagnosis: 'Дисциркуляторная энцефалопатия II ст.',
    },
    {
      id: 'П-2203', status: 'new',
      name: 'Белова Ирина Сергеевна',
      dob: '22.08.1991 (33 года)', phone: '+7 (931) 772-58-90',
      doctorId: null, insurance: 'ОМС (не предоставлен)',
      diagnosis: 'Новый пациент, данные не заполнены.',
    },
    {
      id: 'П-1755', status: 'active',
      name: 'Орлов Павел Игоревич',
      dob: '14.03.1968 (56 лет)', phone: '+7 (965) 319-22-44',
      doctorId: 'd1', insurance: 'ДМС «ВТБ Страхование»',
      diagnosis: 'Аритмия. Под наблюдением кардиолога.',
    },
  ],

  // visitType → цветовой токен
  visitTypeColor: {
    'Кардиология':  'var(--accent)',
    'Терапия':      'var(--accent)',
    'Неврология':   'var(--accent3)',
    'ЭКГ':          'var(--accent)',
    'МРТ':          'var(--accent2)',
    'УЗИ':          'var(--muted)',
    'default':      'var(--muted)',
  },

  visits: [
    { id: 'v01', patientId: 'П-1042', date: '17.03.2025', type: 'Кардиология', note: 'Контроль давления, корректировка дозы.', pending: true },
    { id: 'v02', patientId: 'П-1042', date: '14.03.2025', type: 'ЭКГ',          note: 'Без патологий, ритм синусовый.' },
    { id: 'v03', patientId: 'П-1042', date: '28.02.2025', type: 'Кардиология',  note: 'Жалобы на усталость. Назначена ЭКГ.' },

    { id: 'v04', patientId: 'П-0831', date: '17.03.2025', type: 'Терапия', note: 'Плановый осмотр.', pending: true },
    { id: 'v05', patientId: 'П-0831', date: '02.03.2025', type: 'Терапия', note: 'ОРВИ. Назначены антибиотики.' },

    { id: 'v06', patientId: 'П-2107', date: '17.03.2025', type: 'Неврология', note: 'Плановый приём, боль в шее.', pending: true },
    { id: 'v07', patientId: 'П-2107', date: '10.03.2025', type: 'МРТ',        note: 'Снимки направлены к неврологу.' },
    { id: 'v08', patientId: 'П-2107', date: '20.02.2025', type: 'Неврология', note: 'Обострение. Назначено МРТ.' },

    { id: 'v09', patientId: 'П-0576', date: '17.03.2025', type: 'Кардиология', note: 'Идёт приём.', inProgress: true },
    { id: 'v10', patientId: 'П-0576', date: '15.03.2025', type: 'ЭКГ',         note: 'Результаты в норме.' },

    { id: 'v11', patientId: 'П-1389', date: '17.03.2025 15:30', type: 'УЗИ', note: 'Первый визит, запись сегодня.', pending: true },

    { id: 'v12', patientId: 'П-0344', date: '24.03.2025', type: 'Неврология', note: '', scheduled: true },
    { id: 'v13', patientId: 'П-0344', date: '05.03.2025', type: 'Неврология', note: 'Плановый приём. Жалобы на головокружение.' },

    { id: 'v14', patientId: 'П-2203', date: '21.03.2025', type: 'Терапия', note: 'Первый визит.', scheduled: true },

    { id: 'v15', patientId: 'П-1755', date: '25.03.2025', type: 'Кардиология', note: '', scheduled: true },
    { id: 'v16', patientId: 'П-1755', date: '12.03.2025', type: 'ЭКГ',         note: 'Результаты обработаны.' },
    { id: 'v17', patientId: 'П-1755', date: '01.03.2025', type: 'Кардиология', note: 'Назначено холтеровское мониторирование.' },
  ],

  appointments: [
    { time: '09:00', dayIdx: 0, patientShort: 'Морозова Т.',  type: 'Кардиология', cls: 'green' },
    { time: '09:00', dayIdx: 1, patientShort: 'Захаров М.',   type: 'Терапия',     cls: 'blue'  },
    { time: '10:00', dayIdx: 2, patientShort: 'Новикова О.',  type: 'Неврология',  cls: 'red'   },
    { time: '10:00', dayIdx: 0, patientShort: 'Соловьёв А.', type: 'Кардиология', cls: 'green' },
    { time: '11:00', dayIdx: 1, patientShort: 'Волкова С.',   type: 'УЗИ',         cls: 'yellow'},
    { time: '11:00', dayIdx: 3, patientShort: 'Белова И.',    type: 'Терапия',     cls: 'blue'  },
    { time: '12:00', dayIdx: 4, patientShort: 'Орлов П.',     type: 'Кардиология', cls: 'green' },
    { time: '13:00', dayIdx: 0, patientShort: 'Ершов Д.',     type: 'Неврология',  cls: 'red'   },
    { time: '14:00', dayIdx: 2, patientShort: 'Морозова Т.',  type: 'Кардиология', cls: 'green' },
    { time: '15:00', dayIdx: 1, patientShort: 'Захаров М.',   type: 'Повторный',   cls: 'blue'  },
  ],

  analytics: {
    weekVisits:  [58, 72, 65, 81, 44, 28, 0],
    weekRevenue: [168, 201, 185, 248, 142, 88, 0],
    weekDays: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
    diagnoses: [
      { code: 'J06', name: 'ОРВИ',        share: 22 },
      { code: 'I10', name: 'Гипертония',  share: 18 },
      { code: 'M54', name: 'Боль в спине',share: 14 },
      { code: 'G35', name: 'Остеохондроз',share: 11 },
      { code: 'I25', name: 'ИБС',         share: 9  },
    ],
  },

  ui: {
    hourlyLoad: [3, 5, 7, 4, 6, 8, 5, 3],
    hourlyLabels: ['9','10','11','12','13','14','15','16'],
    peakHourIdx: 5,
    scheduleDays: [
      { label: 'Пн', date: '17', isToday: true  },
      { label: 'Вт', date: '18', isToday: false },
      { label: 'Ср', date: '19', isToday: false },
      { label: 'Чт', date: '20', isToday: false },
      { label: 'Пт', date: '21', isToday: false },
    ],
    scheduleTimes: ['09:00','10:00','11:00','12:00','13:00','14:00','15:00'],
    specialtyDoctorMap: {
      'Терапия':       ['d2'],
      'Кардиология':   ['d1'],
      'Неврология':    ['d3'],
      'УЗИ-диагностика': ['d2', 'd4'],
    },
    tabTitles: {
      dashboard: 'Сводка — сегодня',
      patients:  'Пациенты',
      schedule:  'Расписание',
      analytics: 'Аналитика',
    },
  },
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  SELECTORS — единственный способ читать данные             ║
// ╚══════════════════════════════════════════════════════════════╝

const DB_API = {
  getPatient:      (id)       => DB.patients.find(p => p.id === id),
  getDoctor:       (id)       => DB.doctors.find(d => d.id === id),
  getPatientVisits:(patientId)=> DB.visits.filter(v => v.patientId === patientId),
  getVisitColor:   (type)     => DB.visitTypeColor[type] ?? DB.visitTypeColor.default,
  getDoctorsForSpec:(spec)    => {
    const ids = DB.ui.specialtyDoctorMap[spec] ?? [];
    return ids.map(id => DB_API.getDoctor(id)).filter(Boolean);
  },
  getAppointment:  (time, dayIdx) => DB.appointments.find(a => a.time === time && a.dayIdx === dayIdx),
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  STATE                                                       ║
// ╚══════════════════════════════════════════════════════════════╝

const state = {
  activePatientId: null,
  chartMode: 'visits',
};

// ╔══════════════════════════════════════════════════════════════╗
// ║  RENDERERS                                                   ║
// ╚══════════════════════════════════════════════════════════════╝

function renderHourlyChart() {
  const { hourlyLoad, hourlyLabels, peakHourIdx } = DB.ui;
  const max = Math.max(...hourlyLoad);
  document.getElementById('hourly-chart').innerHTML = hourlyLoad.map((v, i) => `
    <div class="chart-bar-wrap">
      <div class="chart-bar ${i === peakHourIdx ? 'today' : ''}"
           style="height:${Math.round(v / max * 80) + 10}px"
           title="${v} визитов"></div>
      <div class="chart-bar-label">${hourlyLabels[i]}</div>
    </div>`).join('');
}

function renderSchedule() {
  const { scheduleDays, scheduleTimes } = DB.ui;
  const grid = document.getElementById('schedule-grid');

  const header = `<div class="sched-header"></div>` +
    scheduleDays.map(d => `
      <div class="sched-header ${d.isToday ? 'today-col' : ''}">
        <div>${d.label}</div><div class="date">${d.date}</div>
      </div>`).join('');

  const body = scheduleTimes.map(time =>
    `<div class="sched-time-cell">${time}</div>` +
    scheduleDays.map((_, di) => {
      const appt = DB_API.getAppointment(time, di);
      return `<div class="sched-cell">${appt ? `
        <div class="sched-appt ${appt.cls}"
             onclick="showToast('👤 ${appt.patientShort} — ${appt.type}')">
          <div class="s-name">${appt.patientShort}</div>
          <div class="s-type">${appt.type}</div>
        </div>` : ''}</div>`;
    }).join('')
  ).join('');

  grid.innerHTML = header + body;
}

function renderBigChart() {
  const values = state.chartMode === 'visits'
    ? DB.analytics.weekVisits
    : DB.analytics.weekRevenue;
  const labels = DB.analytics.weekDays;
  const mx = Math.max(...values) || 1;
  const peakIdx = values.indexOf(Math.max(...values));

  document.getElementById('big-chart').innerHTML = values.map((v, i) => {
    const label = state.chartMode === 'revenue' ? v + 'к' : String(v);
    const tip   = state.chartMode === 'revenue' ? `${labels[i]}: ${v}к ₽` : `${labels[i]}: ${v} визитов`;
    return `
      <div class="big-bar-wrap">
        <div class="big-bar-val" style="color:${i === peakIdx ? 'var(--accent)' : 'var(--muted)'}">${label}</div>
        <div class="big-bar ${i === peakIdx ? 'peak' : ''}"
             style="height:${Math.round(v / mx * 140) + 4}px"
             onclick="showToast('📊 ${tip}')"></div>
        <div class="big-bar-label ${i === peakIdx ? 'current' : ''}">${labels[i]}</div>
      </div>`;
  }).join('');
}

function renderDoctors() {
  document.getElementById('doctors-list').innerHTML = DB.doctors.map(d => {
    const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    return `
      <div class="doc-item">
        <div class="doc-avatar" style="background:${d.bg};color:${d.color}">${initials}</div>
        <div class="doc-info">
          <div class="doc-name">${d.name}</div>
          <div class="doc-spec">${d.spec}</div>
        </div>
        <div class="doc-bar-wrap">
          <div class="doc-bar-bg">
            <div class="doc-bar-fill" style="width:${d.load}%;background:${d.color}"></div>
          </div>
          <div class="doc-count">${d.visits} визитов</div>
        </div>
      </div>`;
  }).join('');
}

function renderDiagnoses() {
  document.getElementById('diagnoses-list').innerHTML = DB.analytics.diagnoses.map((d, i) => `
    <div class="diag-item">
      <div class="diag-rank">${i + 1}</div>
      <div class="diag-info">
        <div class="diag-name">${d.name}</div>
        <div class="diag-code">МКБ-10: ${d.code}</div>
      </div>
      <div class="diag-pct">${d.share}%</div>
    </div>`).join('');
}

function renderPatientModal(patientId) {
  const patient = DB_API.getPatient(patientId);
  if (!patient) return;

  const doctor  = patient.doctorId ? DB_API.getDoctor(patient.doctorId) : null;
  const visits  = DB_API.getPatientVisits(patientId);

  document.getElementById('modal-patient-name').textContent = patient.name;
  document.getElementById('modal-patient-id').textContent =
    `#${patient.id} · ${patient.diagnosis.split('.')[0]}`;
  document.getElementById('modal-dob').textContent    = patient.dob;
  document.getElementById('modal-phone').textContent  = patient.phone;
  document.getElementById('modal-doctor').textContent = doctor
    ? `${doctor.name} (${doctor.spec})`
    : '—';
  document.getElementById('modal-ins').textContent  = patient.insurance;
  document.getElementById('modal-diag').textContent = patient.diagnosis;

  document.getElementById('modal-visits').innerHTML = visits.map((v, i) => `
    <div class="visit-item">
      <div class="visit-dot-wrap">
        <div class="visit-dot" style="background:${DB_API.getVisitColor(v.type)}"></div>
        ${i < visits.length - 1 ? '<div class="visit-line"></div>' : ''}
      </div>
      <div class="visit-content">
        <div class="visit-date">${v.date}</div>
        <div class="visit-name">${v.type}${v.pending ? ' (ожидает)' : v.scheduled ? ' (запись)' : v.inProgress ? ' — идёт приём' : ''}</div>
        ${v.note ? `<div class="visit-note">${v.note}</div>` : ''}
      </div>
    </div>`).join('');
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  UI HANDLERS                                                 ║
// ╚══════════════════════════════════════════════════════════════╝

function openPatient(patientId) {
  state.activePatientId = patientId;
  renderPatientModal(patientId);
  document.getElementById('patient-modal').classList.add('open');
}
function closePatient() {
  document.getElementById('patient-modal').classList.remove('open');
}
function openBookingForCurrent() {
  const patient = DB_API.getPatient(state.activePatientId);
  closePatient();
  if (patient) openBooking(patient.name);
}

function openBooking(name = '') {
  if (name) document.getElementById('book-name').value = name;
  document.getElementById('booking-modal').classList.add('open');
}
function closeBooking() {
  document.getElementById('booking-modal').classList.remove('open');
}
function selectSlot(el) {
  if (el.classList.contains('busy')) return;
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}
function confirmBooking() {
  const name     = document.getElementById('book-name').value.trim();
  const selected = document.querySelector('.time-slot.selected');
  if (!name)     { showToast('⚠️ Введите имя пациента'); return; }
  if (!selected) { showToast('⚠️ Выберите время');       return; }
  closeBooking();
  showToast(`✅ Пациент ${name.split(' ')[0]} записан на ${selected.textContent}`);
}
function updateDoctors() {
  const spec    = document.getElementById('book-spec').value;
  const doctors = DB_API.getDoctorsForSpec(spec);
  document.getElementById('book-doctor').innerHTML = doctors.length
    ? doctors.map(d => `<option value="${d.id}">${d.name}</option>`).join('')
    : `<option>— Нет доступных врачей —</option>`;
}

function switchTab(name, navEl) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (navEl) navEl.classList.add('active');
  document.getElementById('topbar-title').textContent =
    DB.ui.tabTitles[name] ?? name;
}

function setFilter(el, type) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  const rows = document.querySelectorAll('#patients-table tr');
  let count = 0;
  rows.forEach(r => {
    const show = type === 'all' || r.dataset.status === type;
    r.style.display = show ? '' : 'none';
    if (show) count++;
  });
  document.getElementById('patients-count').textContent = `Найдено: ${count} пациентов`;
}

function filterPatients(q) {
  const rows = document.querySelectorAll('#patients-table tr');
  let count = 0;
  rows.forEach(r => {
    const show = r.textContent.toLowerCase().includes(q.toLowerCase());
    r.style.display = show ? '' : 'none';
    if (show) count++;
  });
  document.getElementById('patients-count').textContent = `Найдено: ${count} пациентов`;
}

function setChartTab(el, mode) {
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  state.chartMode = mode;
  renderBigChart();
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ╔══════════════════════════════════════════════════════════════╗
// ║  INIT                                                        ║
// ╚══════════════════════════════════════════════════════════════╝

renderHourlyChart();
renderSchedule();
renderBigChart();
renderDoctors();
renderDiagnoses();
