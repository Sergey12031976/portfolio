// ── DATA ──
const products = [
  {name:'Кресло офисное EasyComfort Pro',sku:'SKU-00412',cat:'Мебель',price:8900,cost:4200,stock:2,wb:11,ozon:4,status:'critical'},
  {name:'Лампа настольная LightPro X2',sku:'SKU-00887',cat:'Освещение',price:2490,cost:990,stock:0,wb:0,ozon:0,status:'out'},
  {name:'Коврик для мыши XL Gaming',sku:'SKU-01203',cat:'Аксессуары',price:990,cost:340,stock:7,wb:3,ozon:2,status:'low'},
  {name:'Монитор UltraView 27"',sku:'SKU-02201',cat:'Электроника',price:28900,cost:18500,stock:15,wb:12,ozon:15,status:'ok'},
  {name:'Клавиатура MechType Pro',sku:'SKU-01874',cat:'Электроника',price:4990,cost:2200,stock:100,wb:100,ozon:97,status:'ok'},
  {name:'Мышь беспроводная SilentClick',sku:'SKU-01650',cat:'Электроника',price:2190,cost:880,stock:45,wb:45,ozon:44,status:'ok'},
  {name:'Стол компьютерный WorkDesk L',sku:'SKU-00234',cat:'Мебель',price:12500,cost:6800,stock:8,wb:8,ozon:7,status:'ok'},
  {name:'Полка настенная A3',sku:'SKU-00567',cat:'Мебель',price:1890,cost:700,stock:32,wb:30,ozon:32,status:'ok'},
  {name:'Светильник SmartLight RGB',sku:'SKU-01102',cat:'Освещение',price:3490,cost:1400,stock:21,wb:21,ozon:20,status:'ok'},
  {name:'Сумка для ноутбука SlimCase',sku:'SKU-01411',cat:'Аксессуары',price:1990,cost:750,stock:55,wb:55,ozon:55,status:'ok'},
  {name:'Вебкамера StreamPro 4K',sku:'SKU-02088',cat:'Электроника',price:6990,cost:3400,stock:12,wb:10,ozon:12,status:'ok'},
  {name:'Органайзер для стола DeskBox',sku:'SKU-01305',cat:'Аксессуары',price:890,cost:320,stock:67,wb:67,ozon:65,status:'ok'},
];

const statusBadge = {
  critical:'<span class="badge badge-red">Критично</span>',
  out:'<span class="badge badge-red">Нет в наличии</span>',
  low:'<span class="badge badge-yellow">Мало</span>',
  ok:'<span class="badge badge-green">В наличии</span>',
};

function stockBarColor(s){return s===0?'var(--red)':s<10?'var(--yellow)':'var(--green)'}
function stockBarPct(s){return Math.min(100,Math.round(s/120*100)+5)}

function renderCatalog(filter='all'){
  const tbody=document.getElementById('catalog-tbody');
  const filtered=filter==='all'?products:products.filter(p=>p.cat===filter);
  tbody.innerHTML=filtered.map(p=>`
    <tr onclick="openProduct('${p.name}')">
      <td><div class="prod-name">${p.name}</div><div class="prod-sku">${p.sku}</div></td>
      <td><span class="badge badge-gray">${p.cat}</span></td>
      <td><strong>${p.price.toLocaleString('ru')} ₽</strong></td>
      <td>
        <div class="stock-bar-wrap" style="min-width:70px">
          <div class="stock-bar-bg"><div class="stock-bar-fill" style="width:${stockBarPct(p.stock)}%;background:${stockBarColor(p.stock)}"></div></div>
          <div class="stock-num" style="color:${stockBarColor(p.stock)}">${p.stock} шт</div>
        </div>
      </td>
      <td><span style="color:var(--wb);font-weight:600">${p.wb}</span></td>
      <td><span style="color:#60a5fa;font-weight:600">${p.ozon}</span></td>
      <td>${statusBadge[p.status]}</td>
    </tr>`).join('');
  document.getElementById('cat-count').textContent=filtered.length+' товаров';
}
renderCatalog();

function catFilter(cat,el){
  document.querySelectorAll('[id^=cat-filter-]').forEach(b=>{
    b.style.borderColor='';b.style.color='';b.style.background='';
  });
  el.style.borderColor='var(--accent)';el.style.color='var(--accent)';el.style.background='var(--accent-dim)';
  renderCatalog(cat);
}

function searchCatalog(q){
  const rows=document.querySelectorAll('#catalog-tbody tr');
  rows.forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q.toLowerCase())?'':'none'});
}

// ── PRODUCT MODAL ──
function openProduct(name){
  const p=products.find(x=>x.name===name);if(!p)return;
  document.getElementById('pm-title').textContent=p.name;
  document.getElementById('pm-sku').textContent=p.sku+' · '+p.cat;
  document.getElementById('pm-price').textContent=p.price.toLocaleString('ru')+' ₽';
  document.getElementById('pm-cost').textContent=p.cost.toLocaleString('ru')+' ₽';
  document.getElementById('pm-stock').textContent=p.stock+' шт';
  document.getElementById('pm-cat').textContent=p.cat;
  document.getElementById('pm-mp-list').innerHTML=`
    <div class="mp-sync-row">
      <div class="mp-sync-name"><div class="mp-dot" style="background:var(--wb)"></div>Wildberries</div>
      <div class="mp-sync-status"><span style="color:var(--wb);font-weight:600">${p.wb} шт</span>${p.wb>0?'<span class="badge badge-green" style="font-size:10px">Активен</span>':'<span class="badge badge-red" style="font-size:10px">Нет</span>'}</div>
    </div>
    <div class="mp-sync-row">
      <div class="mp-sync-name"><div class="mp-dot" style="background:#60a5fa"></div>OZON</div>
      <div class="mp-sync-status"><span style="color:#60a5fa;font-weight:600">${p.ozon} шт</span>${p.ozon>0?'<span class="badge badge-green" style="font-size:10px">Активен</span>':'<span class="badge badge-red" style="font-size:10px">Нет</span>'}</div>
    </div>`;
  document.getElementById('product-modal').classList.add('open');
}
function closeProduct(){document.getElementById('product-modal').classList.remove('open')}
function openNewProduct(){document.getElementById('new-product-modal').classList.add('open')}
function closeNewProduct(){document.getElementById('new-product-modal').classList.remove('open')}
function saveNewProduct(){closeNewProduct();showToast('✅ Товар добавлен в каталог')}

// ── TABS ──
const tabTitles={dashboard:'СВОДКА',catalog:'КАТАЛОГ ТОВАРОВ',warehouse:'СКЛАД',orders:'ЗАКАЗЫ И ДОСТАВКА',marketplaces:'ИНТЕГРАЦИИ С МАРКЕТПЛЕЙСАМИ',analytics:'АНАЛИТИКА'};
function switchTab(name,el){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if(el)el.classList.add('active');
  document.getElementById('topbar-title').textContent=tabTitles[name]||name;
}

// ── SYNC ──
function doSync(btn,name){
  const orig=btn?btn.textContent:'';
  if(btn){btn.innerHTML='<span class="sync-spinning">↻</span> Синхронизация...';btn.disabled=true}
  setTimeout(()=>{
    if(btn){btn.textContent=orig;btn.disabled=false}
    showToast('✅ '+name+': данные обновлены');
  },1800);
}

// ── WAREHOUSE ──
const zones=[
  {name:'ЗОНА A',cap:'500 ячеек',pct:92,color:'var(--red)',items:[
    {name:'Кресла офисные',loc:'A-1 · A-2',qty:2},
    {name:'Столы компьютерные',loc:'A-3',qty:8},
    {name:'Полки настенные',loc:'A-4 · A-5',qty:32},
  ]},
  {name:'ЗОНА B',cap:'600 ячеек',pct:71,color:'var(--yellow)',items:[
    {name:'Мониторы UltraView',loc:'B-1 · B-2',qty:15},
    {name:'Лампы LightPro',loc:'B-3',qty:0},
    {name:'Светильники RGB',loc:'B-4',qty:21},
  ]},
  {name:'ЗОНА C',cap:'400 ячеек',pct:55,color:'var(--green)',items:[
    {name:'Клавиатуры MechType',loc:'C-1',qty:100},
    {name:'Мыши SilentClick',loc:'C-2',qty:45},
    {name:'Коврики XL Gaming',loc:'C-3',qty:7},
  ]},
];
document.getElementById('warehouse-grid').innerHTML=zones.map(z=>`
  <div class="zone-card">
    <div class="zone-header"><div class="zone-name">${z.name}</div><div class="zone-cap">${z.cap}</div></div>
    <div class="zone-fill"><div class="zone-fill-bar" style="width:${z.pct}%;background:${z.color}"></div></div>
    <div style="font-size:10px;color:var(--text3);margin-bottom:10px;text-align:right">${z.pct}% заполнено</div>
    <div class="zone-items">${z.items.map(i=>`
      <div class="zone-item" onclick="showToast('📦 ${i.name}: ${i.qty} шт · ${i.loc}')">
        <div><div class="zone-item-name">${i.name}</div><div class="zone-item-loc">${i.loc}</div></div>
        <div style="font-size:12px;font-weight:600;color:${i.qty===0?'var(--red)':i.qty<10?'var(--yellow)':'var(--text)'}">${i.qty} шт</div>
      </div>`).join('')}
    </div>
  </div>`).join('');

// ── ORDERS ──
const sdekOrders=[
  {num:'#ORD-8840',name:'Петрова М.В.',city:'Санкт-Петербург',stages:4},
  {num:'#ORD-8836',name:'Волков К.Д.',city:'Новосибирск',stages:3},
  {num:'#ORD-8831',name:'Соколова Р.И.',city:'Екатеринбург',stages:2},
];
const boxberryOrders=[
  {num:'#ORD-8835',name:'Лебедев О.М.',city:'Казань',stages:4},
  {num:'#ORD-8830',name:'Иванова А.С.',city:'Ростов-на-Дону',stages:3},
];
function renderOrders(orders,elId){
  document.getElementById(elId).innerHTML=orders.map(o=>`
    <div class="order-item" onclick="showToast('🚚 ${o.num} · ${o.name} · ${o.city}')">
      <div>
        <div class="order-num">${o.num}</div>
        <div class="order-stage">
          ${[1,2,3,4].map(s=>`<div class="stage ${s<o.stages?'done':s===o.stages?'active':''}"></div>`).join('')}
        </div>
      </div>
      <div class="order-info">
        <div class="order-name">${o.name}</div>
        <div class="order-city">${o.city}</div>
      </div>
    </div>`).join('');
}
renderOrders(sdekOrders,'sdek-orders');
renderOrders(boxberryOrders,'boxberry-orders');

const allOrders=[
  {num:'#ORD-8841',buyer:'Смирнов А.К.',items:'Кресло ×1',sum:4870,ch:'wb',del:'СДЭК · Москва',st:'blue',stl:'Сборка'},
  {num:'#ORD-8840',buyer:'Петрова М.В.',items:'Монитор ×1',sum:12300,ch:'oz',del:'Boxberry · СПб',st:'green',stl:'Отправлен'},
  {num:'#ORD-8839',buyer:'Козлов Д.Р.',items:'Мышь ×2',sum:2150,ch:'site',del:'Самовывоз',st:'green',stl:'Доставлен'},
  {num:'#ORD-8838',buyer:'Федорова И.С.',items:'Стол ×1',sum:7640,ch:'wb',del:'WB Лог. · Казань',st:'orange',stl:'Новый'},
  {num:'#ORD-8837',buyer:'Новиков Р.А.',items:'Клавиатура ×1',sum:4990,ch:'oz',del:'СДЭК · Уфа',st:'blue',stl:'Сборка'},
];
document.getElementById('all-orders-tbody').innerHTML=allOrders.map(o=>`
  <tr onclick="showToast('📦 ${o.num}: ${o.buyer}')">
    <td><span style="color:var(--accent);font-weight:600">${o.num}</span></td>
    <td>${o.buyer}</td><td style="color:var(--text3)">${o.items}</td>
    <td><strong>${o.sum.toLocaleString('ru')} ₽</strong></td>
    <td><span class="badge badge-${o.ch==='wb'?'wb':o.ch==='oz'?'oz':'green'}">${o.ch==='wb'?'WB':o.ch==='oz'?'OZON':'Сайт'}</span></td>
    <td style="color:var(--text3);font-size:11px">${o.del}</td>
    <td><span class="badge badge-${o.st}">${o.stl}</span></td>
  </tr>`).join('');

// ── REVENUE CHART ──
const revData=[{l:'Пн',v:142,cur:false},{l:'Вт',v:198},{l:'Ср',v:167},{l:'Чт',v:231},{l:'Пт',v:184,cur:true},{l:'Сб',v:89},{l:'Вс',v:0}];
const rmx=Math.max(...revData.map(d=>d.v));
document.getElementById('rev-bars').innerHTML=revData.map(d=>`
  <div class="rev-bar-w">
    <div class="rev-bar-label ${d.cur?'cur':''}">${d.v?d.v+'к':''}</div>
    <div class="rev-bar ${d.cur?'hi':''}" style="height:${Math.round(d.v/rmx*108)+4}px"
         onclick="showToast('💰 ${d.l}: ${d.v}к ₽')"></div>
    <div class="rev-bar-label ${d.cur?'cur':''}">${d.l}</div>
  </div>`).join('');

// ── TOP PRODUCTS ──
const topProds=[
  {name:'Монитор UltraView 27"',sku:'SKU-02201',rev:289000,sold:10},
  {name:'Клавиатура MechType Pro',sku:'SKU-01874',rev:174650,sold:35},
  {name:'Кресло офисное EasyComfort',sku:'SKU-00412',rev:142400,sold:16},
  {name:'Вебкамера StreamPro 4K',sku:'SKU-02088',rev:104850,sold:15},
  {name:'Стол компьютерный WorkDesk',sku:'SKU-00234',rev:87500,sold:7},
];
document.getElementById('top-products-list').innerHTML=topProds.map((p,i)=>`
  <div class="tp-item" onclick="openProduct('${p.name}')">
    <div class="tp-rank">${i+1}</div>
    <div class="tp-info"><div class="tp-name">${p.name}</div><div class="tp-sku">${p.sku}</div></div>
    <div class="tp-nums"><div class="tp-rev">${p.rev.toLocaleString('ru')} ₽</div><div class="tp-sold">${p.sold} продано</div></div>
  </div>`).join('');

// ── CATEGORIES ──
const cats=[
  {name:'Электроника',pct:48,color:'var(--blue)'},
  {name:'Мебель',pct:31,color:'var(--accent)'},
  {name:'Освещение',pct:12,color:'var(--yellow)'},
  {name:'Аксессуары',pct:9,color:'var(--green)'},
];
document.getElementById('categories-list').innerHTML=cats.map(c=>`
  <div class="cat-item">
    <div class="cat-row"><div class="cat-name">${c.name}</div><div class="cat-pct" style="color:${c.color}">${c.pct}%</div></div>
    <div class="cat-bar-bg"><div class="cat-bar-fill" style="width:${c.pct}%;background:${c.color}"></div></div>
  </div>`).join('');

// ── TOAST ──
let toastTimer;
function showToast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toast-msg').textContent=msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}