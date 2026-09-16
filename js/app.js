'use strict';

// ── DEFAULT CATEGORIES ──────────────────────────────────────────────────────
const DEFAULT_CATS = [
  { id:'housing', label:'Housing', color:'#378ADD', custom:false, items:[
    {id:'rent',label:'Rent / Home Loan EMI'},{id:'maintenance',label:'Society Maintenance'},
    {id:'maid',label:'House Help / Maid'},{id:'repairs',label:'Home Repairs'}
  ]},
  { id:'food', label:'Food', color:'#639922', custom:false, items:[
    {id:'cow_milk',label:'Cow Milk'},{id:'buffalo_milk',label:'Buffalo Milk'},
    {id:'eggs',label:'Eggs'},{id:'bread',label:'Bread'},
    {id:'groceries',label:'Groceries & Kirana'},{id:'veggies',label:'Vegetables & Fruits'},
    {id:'swiggy',label:'Swiggy / Zomato'},{id:'cafe',label:'Café / Canteen / Tea'}
  ]},
  { id:'bills', label:'Bills & Utilities', color:'#d4900a', custom:false, items:[
    {id:'electricity',label:'Electricity'},{id:'water',label:'Water / Piped Gas'},
    {id:'internet',label:'Broadband / WiFi'},{id:'mobile',label:'Mobile Recharge'},
    {id:'lpg',label:'LPG Cylinder'},{id:'ott',label:'OTT & Subscriptions'}
  ]},
  { id:'lifestyle', label:'Lifestyle', color:'#7f77dd', custom:false, items:[
    {id:'shopping',label:'Clothing & Fashion'},{id:'gifting',label:'Gifting & Occasions'},
    {id:'salon',label:'Personal Care / Salon'},{id:'entertainment',label:'Movies / Events'},
    {id:'kids',label:'Kids School / Tuition'},{id:'books',label:'Books / Courses'},
    {id:'mobile_repair',label:'Mobile / Gadget Repair'}
  ]},
  { id:'health', label:'Health', color:'#e05555', custom:false, items:[
    {id:'doctor',label:'Doctor / Clinic Visits'},{id:'medicines',label:'Medicines / Pharmacy'},
    {id:'gym',label:'Gym / Yoga / Sports'},{id:'insurance_health',label:'Health Insurance Premium'}
  ]},
  { id:'transport', label:'Transport', color:'#1D9E75', custom:false, items:[
    {id:'fuel',label:'Fuel / Petrol / CNG'},{id:'cab',label:'Cab / Auto / Metro'},
    {id:'vehicle',label:'Vehicle Maintenance'},{id:'parking',label:'Parking / Tolls'},
    {id:'travel',label:'Travel / Outstation'}
  ]},
  { id:'emi', label:'Loans & EMIs', color:'#d4537e', custom:false, items:[
    {id:'car_emi',label:'Car Loan EMI'},{id:'personal_loan',label:'Personal Loan EMI'},
    {id:'edu_loan',label:'Education Loan EMI'},{id:'cc_bill',label:'Credit Card Bill'}
  ]},
  { id:'savings', label:'Savings & Investments', color:'#0F6E56', custom:false, items:[
    {id:'ppf',label:'PPF / NPS'},{id:'sip',label:'Mutual Funds / SIP'},
    {id:'rd',label:'RD / FD'},{id:'gold',label:'Gold / SGB'},
    {id:'stocks',label:'Stocks / Direct Equity'},{id:'emergency',label:'Emergency Fund Top-up'}
  ]},
  { id:'other', label:'Others', color:'#5c6070', custom:false, items:[
    {id:'parents',label:'Parents / Family Support'},{id:'charity',label:'Donations / Charity'},
    {id:'tax',label:'Advance Tax / TDS'},{id:'misc',label:'Miscellaneous'}
  ]}
];

const SWATCH_COLORS = ['#378ADD','#639922','#d4900a','#7f77dd','#e05555','#1D9E75','#d4537e','#0F6E56','#5c6070','#c47b10','#a83260','#2196F3','#FF5722','#9C27B0'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let activeMonth = new Date().getMonth();
let activeYear  = new Date().getFullYear();
let activeView  = 'home';
let entrySheetItemId = null;
let editingMfId = null;
let mfSearchTimeout = null;
let customCatColor = SWATCH_COLORS[0];
let addItemCatId = null;

// ── STORAGE ─────────────────────────────────────────────────────────────────
function getCats() {
  try { return JSON.parse(localStorage.getItem('ft4_cats') || 'null') || DEFAULT_CATS; }
  catch(e) { return DEFAULT_CATS; }
}
function saveCats(c) { try { localStorage.setItem('ft4_cats', JSON.stringify(c)); } catch(e){} }

function eKey(y,m,id) { return `ft4e_${y}_${m}_${id}`; }
function getEntries(id) { try { return JSON.parse(localStorage.getItem(eKey(activeYear,activeMonth,id))||'[]'); } catch(e){return[];} }
function saveEntries(id,arr) { try { localStorage.setItem(eKey(activeYear,activeMonth,id),JSON.stringify(arr)); } catch(e){} }
function sumEntries(id) { return getEntries(id).reduce((s,e)=>s+(parseFloat(e.amount)||0),0); }

function getSalary() { try { return parseFloat(localStorage.getItem(`ft4s_${activeYear}_${activeMonth}`)||'0')||0; } catch(e){return 0;} }
function saveSalary(v) { try { localStorage.setItem(`ft4s_${activeYear}_${activeMonth}`,v); } catch(e){} }
function getGoal() { try { return parseFloat(localStorage.getItem(`ft4g_${activeYear}_${activeMonth}`)||'0')||0; } catch(e){return 0;} }
function saveGoal(v) { try { localStorage.setItem(`ft4g_${activeYear}_${activeMonth}`,v); } catch(e){} }

function getMFs() { try { return JSON.parse(localStorage.getItem('ft4_mfs')||'[]'); } catch(e){return[];} }
function saveMFs(arr) { try { localStorage.setItem('ft4_mfs',JSON.stringify(arr)); } catch(e){} }

// ── FORMAT ───────────────────────────────────────────────────────────────────
function fmt(n) { if(isNaN(n)||n===null)return'₹0'; return '₹'+Math.round(n).toLocaleString('en-IN'); }
function fmtD(n) { if(isNaN(n)||n===null)return'₹0'; const abs=Math.abs(n); return (n<0?'-':''+'₹')+abs.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtDate(d) { const dt=new Date(d); return dt.getDate()+' '+MONTHS_SHORT[dt.getMonth()]; }
function todayStr() { const n=new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; }
function setText(id,v) { const el=document.getElementById(id); if(el)el.textContent=v; }

// ── BUILD EXPENSE VIEW ───────────────────────────────────────────────────────
function buildExpenses() {
  const container = document.getElementById('expenseContainer');
  container.innerHTML = '';
  const cats = getCats();
  cats.forEach(cat => {
    const sec = document.createElement('div');
    sec.id = 'cat-sec-' + cat.id;
    sec.innerHTML = `
      <div class="sec-hdr">
        <div class="sec-dot" style="background:${cat.color}"></div>
        <span class="sec-lbl">${cat.label}</span>
        <span class="sec-tot" id="ctotal-${cat.id}">₹0</span>
        ${cat.custom?`<button class="add-cat-btn" onclick="deleteCat('${cat.id}')"><i class="ti ti-trash" style="color:var(--red-text)"></i></button>`:''}
      </div>
      <div class="exp-list" id="list-${cat.id}"></div>
      <button class="add-cat-btn" style="margin-bottom:12px;padding:6px 0" onclick="openAddItemSheet('${cat.id}')">
        <i class="ti ti-plus"></i> Add item to ${cat.label}
      </button>`;
    container.appendChild(sec);
    renderCatItems(cat);
  });

  // Add custom category button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-mf-btn';
  addBtn.style.background = 'var(--surface2)';
  addBtn.style.color = 'var(--text2)';
  addBtn.style.border = '.5px solid var(--border2)';
  addBtn.innerHTML = '<i class="ti ti-category-plus"></i> Add Custom Category';
  addBtn.onclick = () => openSheet('addCatSheet');
  container.appendChild(addBtn);
}

function renderCatItems(cat) {
  const list = document.getElementById('list-' + cat.id);
  if (!list) return;
  list.innerHTML = '';
  cat.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'exp-item';
    div.id = 'eitem-' + item.id;
    div.innerHTML = `
      <div class="exp-item-left">
        <span class="exp-item-lbl">${item.label}</span>
        <span class="exp-item-cnt" id="ecount-${item.id}"></span>
      </div>
      <div class="exp-item-right">
        <span class="exp-item-tot" id="etotal-${item.id}">₹0</span>
        <button class="add-entry-btn" onclick="openEntrySheet('${item.id}','${item.label.replace(/'/g,"\\'")}','${cat.color}')">
          <i class="ti ti-plus"></i>
        </button>
      </div>`;
    list.appendChild(div);
  });
}

// ── ENTRY SHEET ──────────────────────────────────────────────────────────────
function openEntrySheet(itemId, itemLabel, color) {
  entrySheetItemId = itemId;
  document.getElementById('entrySheetTitle').textContent = itemLabel;
  document.getElementById('entrySheetTitle').style.color = color;
  document.getElementById('entryAmountInput').value = '';
  document.getElementById('entryNoteInput').value = '';
  document.getElementById('entryDateInput').value = todayStr();
  renderEntryLog(itemId);
  openSheet('entrySheet');
  setTimeout(() => document.getElementById('entryAmountInput').focus(), 350);
}

function renderEntryLog(itemId) {
  const entries = getEntries(itemId).slice().reverse();
  const log = document.getElementById('entryLog');
  const total = entries.reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
  setText('entryLogTotal', total>0 ? 'Total: '+fmt(total) : '');
  if (!entries.length) { log.innerHTML='<div class="empty-state" style="padding:20px 0">No entries yet this month</div>'; return; }
  log.innerHTML = entries.map((e,i) => `
    <div class="entry-row">
      <div class="entry-left">
        <span class="entry-date">${fmtDate(e.date)}</span>
        ${e.note?`<span class="entry-note">${e.note}</span>`:''}
      </div>
      <div class="entry-right">
        <span class="entry-amt">${fmt(e.amount)}</span>
        <button class="del-btn" onclick="deleteEntry('${itemId}',${entries.length-1-i})"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('');
}

function addEntry() {
  const amt = parseFloat(document.getElementById('entryAmountInput').value);
  const date = document.getElementById('entryDateInput').value;
  const note = document.getElementById('entryNoteInput').value.trim();
  if (!amt||amt<=0||!date) { document.getElementById('entryAmountInput').focus(); return; }
  const entries = getEntries(entrySheetItemId);
  entries.push({amount:amt, date, note});
  entries.sort((a,b)=>new Date(a.date)-new Date(b.date));
  saveEntries(entrySheetItemId, entries);
  document.getElementById('entryAmountInput').value = '';
  document.getElementById('entryNoteInput').value = '';
  renderEntryLog(entrySheetItemId);
  refreshTotals();
}

function deleteEntry(itemId, idx) {
  const entries = getEntries(itemId);
  entries.splice(idx, 1);
  saveEntries(itemId, entries);
  renderEntryLog(itemId);
  refreshTotals();
}

// ── CUSTOM CATEGORY ──────────────────────────────────────────────────────────
function openAddCatSheet() {
  document.getElementById('newCatName').value = '';
  document.getElementById('newCatItemName').value = '';
  customCatColor = SWATCH_COLORS[0];
  buildSwatches('catSwatches', customCatColor, c => { customCatColor = c; });
  openSheet('addCatSheet');
}

function buildSwatches(containerId, selected, onSelect) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = SWATCH_COLORS.map(c =>
    `<div class="color-swatch${c===selected?' selected':''}" style="background:${c}" onclick="selectSwatch('${containerId}','${c}')"></div>`
  ).join('');
  el._onSelect = onSelect;
}

function selectSwatch(containerId, color) {
  const el = document.getElementById(containerId);
  el.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.style.background===color||s.style.backgroundColor===color));
  customCatColor = color;
  if (el._onSelect) el._onSelect(color);
}

function saveCustomCat() {
  const name = document.getElementById('newCatName').value.trim();
  const itemName = document.getElementById('newCatItemName').value.trim();
  if (!name) return;
  const cats = getCats();
  const id = 'custom_' + Date.now();
  const items = itemName ? [{id: id+'_0', label: itemName}] : [];
  cats.push({id, label:name, color:customCatColor, custom:true, items});
  saveCats(cats);
  closeSheet('addCatSheet');
  buildExpenses();
  refreshTotals();
}

function openAddItemSheet(catId) {
  addItemCatId = catId;
  document.getElementById('newItemName').value = '';
  openSheet('addItemSheet');
  setTimeout(() => document.getElementById('newItemName').focus(), 350);
}

function saveCustomItem() {
  const name = document.getElementById('newItemName').value.trim();
  if (!name || !addItemCatId) return;
  const cats = getCats();
  const cat = cats.find(c => c.id === addItemCatId);
  if (!cat) return;
  cat.items.push({id: addItemCatId+'_'+Date.now(), label:name});
  saveCats(cats);
  closeSheet('addItemSheet');
  buildExpenses();
  refreshTotals();
}

function deleteCat(catId) {
  if (!confirm('Delete this category and all its data?')) return;
  const cats = getCats().filter(c => c.id !== catId);
  saveCats(cats);
  buildExpenses();
  refreshTotals();
}

// ── MF TRACKER ──────────────────────────────────────────────────────────────
async function searchMF(query) {
  if (!query || query.length < 3) { document.getElementById('mfSearchResults').style.display='none'; return; }
  clearTimeout(mfSearchTimeout);
  mfSearchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const el = document.getElementById('mfSearchResults');
      if (!data.length) { el.style.display='none'; return; }
      el.style.display = 'block';
      el.innerHTML = data.slice(0,8).map(f =>
        `<div class="mf-search-item" onclick="selectMF(${f.schemeCode},'${f.schemeName.replace(/'/g,"\\'")}')">
          ${f.schemeName}
        </div>`
      ).join('');
    } catch(e) { console.log('MF search error',e); }
  }, 400);
}

function selectMF(code, name) {
  document.getElementById('mfFundName').value = name;
  document.getElementById('mfSchemeCode').value = code;
  document.getElementById('mfSearchResults').style.display = 'none';
}

async function fetchNAV(schemeCode) {
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`);
    const data = await res.json();
    if (data.status === 'SUCCESS' && data.data && data.data[0]) {
      return { nav: parseFloat(data.data[0].nav), date: data.data[0].date };
    }
  } catch(e) {}
  return null;
}

function openMFSheet(editId = null) {
  editingMfId = editId;
  document.getElementById('mfSheetTitle').textContent = editId ? 'Edit Fund' : 'Add Mutual Fund';
  document.getElementById('mfFundName').value = '';
  document.getElementById('mfSchemeCode').value = '';
  document.getElementById('mfUnits').value = '';
  document.getElementById('mfAvgNav').value = '';
  document.getElementById('mfInvested').value = '';
  document.getElementById('mfSipAmt').value = '';
  document.getElementById('mfSipDate').value = '';
  document.getElementById('mfType').value = 'sip';
  document.getElementById('mfSipRow').style.display = 'flex';
  document.getElementById('mfSearchResults').style.display = 'none';

  if (editId) {
    const mfs = getMFs();
    const mf = mfs.find(m => m.id === editId);
    if (mf) {
      document.getElementById('mfFundName').value = mf.name;
      document.getElementById('mfSchemeCode').value = mf.schemeCode || '';
      document.getElementById('mfUnits').value = mf.units || '';
      document.getElementById('mfAvgNav').value = mf.avgNav || '';
      document.getElementById('mfInvested').value = mf.invested || '';
      document.getElementById('mfType').value = mf.type || 'sip';
      document.getElementById('mfSipAmt').value = mf.sipAmt || '';
      document.getElementById('mfSipDate').value = mf.sipDate || '';
      document.getElementById('mfSipRow').style.display = mf.type==='lumpsum' ? 'none' : 'flex';
    }
  }
  openSheet('mfSheet');
}

function toggleSipRow() {
  const type = document.getElementById('mfType').value;
  document.getElementById('mfSipRow').style.display = type === 'lumpsum' ? 'none' : 'flex';
}

async function saveMF() {
  const name = document.getElementById('mfFundName').value.trim();
  const schemeCode = document.getElementById('mfSchemeCode').value.trim();
  const units = parseFloat(document.getElementById('mfUnits').value) || 0;
  const avgNav = parseFloat(document.getElementById('mfAvgNav').value) || 0;
  const invested = parseFloat(document.getElementById('mfInvested').value) || 0;
  const type = document.getElementById('mfType').value;
  const sipAmt = parseFloat(document.getElementById('mfSipAmt').value) || 0;
  const sipDate = document.getElementById('mfSipDate').value;

  if (!name) { document.getElementById('mfFundName').focus(); return; }

  const mfs = getMFs();
  const mfData = { name, schemeCode, units, avgNav, invested, type, sipAmt, sipDate, currentNav: null, navDate: null };

  if (editingMfId) {
    const idx = mfs.findIndex(m => m.id === editingMfId);
    if (idx >= 0) { mfData.id = editingMfId; mfs[idx] = mfData; }
  } else {
    mfData.id = 'mf_' + Date.now();
    mfs.push(mfData);
  }

  saveMFs(mfs);
  closeSheet('mfSheet');
  buildMFView();
  // Fetch NAV for newly saved fund
  if (schemeCode) refreshMFNav(mfData.id);
}

async function refreshMFNav(mfId) {
  const mfs = getMFs();
  const mf = mfs.find(m => m.id === mfId);
  if (!mf || !mf.schemeCode) return;
  const el = document.getElementById('mf-nav-' + mfId);
  if (el) el.innerHTML = '<span class="nav-fetching"><i class="ti ti-refresh"></i> Fetching NAV...</span>';
  const result = await fetchNAV(mf.schemeCode);
  if (result) {
    mf.currentNav = result.nav;
    mf.navDate = result.date;
    saveMFs(mfs);
  }
  buildMFView();
}

async function refreshAllNAVs() {
  const mfs = getMFs();
  const promises = mfs.filter(m => m.schemeCode).map(m => refreshMFNav(m.id));
  await Promise.all(promises);
}

function deleteMF(mfId) {
  if (!confirm('Remove this fund?')) return;
  saveMFs(getMFs().filter(m => m.id !== mfId));
  buildMFView();
}

function buildMFView() {
  const container = document.getElementById('mfContainer');
  const mfs = getMFs();

  // Summary
  let totalInvested = 0, totalCurrent = 0;
  mfs.forEach(mf => {
    totalInvested += mf.invested || (mf.units * mf.avgNav) || 0;
    totalCurrent += mf.currentNav ? (mf.units * mf.currentNav) : (mf.invested || mf.units * mf.avgNav || 0);
  });
  const totalGain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested * 100) : 0;

  let html = `
    <div class="mf-summary-card">
      <div style="font-size:13px;font-weight:600;color:var(--green-text);opacity:.8">Portfolio Summary</div>
      <div class="mf-sum-grid">
        <div class="mf-sum-item"><div class="lbl">Invested</div><div class="val">${fmt(totalInvested)}</div></div>
        <div class="mf-sum-item"><div class="lbl">Current</div><div class="val">${fmt(totalCurrent)}</div></div>
        <div class="mf-sum-item"><div class="lbl">Returns</div><div class="val ${totalGain>=0?'up':'down'}">${totalGain>=0?'+':''}${fmt(totalGain)}<br><span style="font-size:12px">${gainPct>=0?'+':''}${gainPct.toFixed(1)}%</span></div></div>
      </div>
    </div>
    <button class="add-mf-btn" onclick="openMFSheet()"><i class="ti ti-plus"></i> Add Mutual Fund</button>
    ${mfs.length?`<button class="add-mf-btn" style="background:var(--surface2);color:var(--text2);border:.5px solid var(--border2);margin-top:-6px;margin-bottom:14px" onclick="refreshAllNAVs()"><i class="ti ti-refresh"></i> Refresh All NAVs</button>`:''}
  `;

  if (!mfs.length) {
    html += `<div class="empty-state"><i class="ti ti-chart-candle"></i>No funds added yet.<br>Tap "Add Mutual Fund" to start tracking your portfolio.</div>`;
  } else {
    mfs.forEach(mf => {
      const invested = mf.invested || (mf.units * mf.avgNav) || 0;
      const current = mf.currentNav ? (mf.units * mf.currentNav) : invested;
      const gain = current - invested;
      const gainP = invested > 0 ? (gain / invested * 100) : 0;
      html += `
        <div class="mf-card">
          <div class="mf-card-top">
            <span class="mf-name">${mf.name}</span>
            <span class="mf-type-badge ${mf.type}">${mf.type === 'sip' ? 'SIP' : 'Lumpsum'}</span>
          </div>
          <div class="mf-grid">
            <div class="mf-stat"><div class="mf-stat-lbl">Invested</div><div class="mf-stat-val">${fmt(invested)}</div></div>
            <div class="mf-stat"><div class="mf-stat-lbl">Current Value</div><div class="mf-stat-val">${fmt(current)}</div></div>
            <div class="mf-stat"><div class="mf-stat-lbl">Units</div><div class="mf-stat-val">${mf.units||0}</div></div>
            <div class="mf-stat"><div class="mf-stat-lbl">Returns</div><div class="mf-stat-val ${gain>=0?'up':'down'}">${gain>=0?'+':''}${fmt(gain)} (${gainP>=0?'+':''}${gainP.toFixed(1)}%)</div></div>
          </div>
          <div class="mf-nav-row" id="mf-nav-${mf.id}">
            <span class="mf-nav-lbl">NAV${mf.navDate?' ('+mf.navDate+')':''}</span>
            <span class="mf-nav-val">${mf.currentNav ? '₹'+mf.currentNav.toFixed(4) : mf.schemeCode ? '<span style="color:var(--text3)">Tap refresh</span>' : '<span style="color:var(--text3)">No scheme code</span>'}</span>
          </div>
          ${mf.type==='sip'&&mf.sipAmt?`
          <div class="mf-nav-row" style="margin-top:6px">
            <span class="mf-nav-lbl">Monthly SIP</span>
            <span class="mf-nav-val">${fmt(mf.sipAmt)} ${mf.sipDate?'on '+mf.sipDate+'th':''}</span>
          </div>`:``}
          <div class="mf-actions">
            ${mf.schemeCode?`<button class="mf-btn refresh" onclick="refreshMFNav('${mf.id}')"><i class="ti ti-refresh"></i> NAV</button>`:''}
            <button class="mf-btn edit" onclick="openMFSheet('${mf.id}')"><i class="ti ti-pencil"></i> Edit</button>
            <button class="mf-btn del" onclick="deleteMF('${mf.id}')"><i class="ti ti-trash"></i></button>
          </div>
        </div>`;
    });
  }
  container.innerHTML = html;
}

// ── DONUT CHART ──────────────────────────────────────────────────────────────
function buildDonut(canvasId, slices) {
  const svg = document.getElementById(canvasId);
  if (!svg) return;
  const total = slices.reduce((s,x)=>s+x.val,0);
  if (total === 0) { svg.innerHTML=''; return; }
  const r = 54, cx = 64, cy = 64, stroke = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  let paths = '';
  slices.forEach(s => {
    const pct = s.val / total;
    const dash = pct * circ;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}"
      stroke-dasharray="${dash} ${circ-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"
      style="transition:stroke-dasharray .4s ease"/>`;
    offset += dash;
  });
  svg.innerHTML = paths + `<text x="${cx}" y="${cy-6}" text-anchor="middle" fill="#f0f0f0" font-size="11" font-family="Plus Jakarta Sans" font-weight="600">${MONTHS_SHORT[activeMonth]}</text>
    <text x="${cx}" y="${cy+10}" text-anchor="middle" fill="#4ecba0" font-size="13" font-family="Plus Jakarta Sans" font-weight="700">${fmt(total)}</text>`;
}

// ── HEALTH SCORE ─────────────────────────────────────────────────────────────
function calcHealthScore(salary, catTotals, totalExp, totalSav) {
  if (!salary) return { score: 0, color: '#e05555', factors: [] };
  let score = 0;
  const factors = [];
  const savRate = totalSav / salary * 100;
  const rentRatio = (catTotals.housing||0) / salary * 100;
  const emiRatio = (catTotals.emi||0) / salary * 100;
  const hasInsurance = (catTotals.health||0) > 0;
  const hasInvestments = (catTotals.savings||0) > 0;
  const hasEmergency = (catTotals.savings||0) > salary * 2;

  if (savRate >= 20) { score += 30; factors.push({ok:true, text:`Savings rate ${Math.round(savRate)}% ✓`}); }
  else { score += Math.round(savRate/20*30); factors.push({ok:false, text:`Savings rate only ${Math.round(savRate)}% (target 20%)`}); }

  if (rentRatio <= 30) { score += 20; factors.push({ok:true, text:'Housing cost in healthy range ✓'}); }
  else { score += Math.max(0,Math.round((60-rentRatio)/30*20)); factors.push({ok:false, text:`Housing is ${Math.round(rentRatio)}% of income (keep ≤30%)`}); }

  if (emiRatio <= 30) { score += 20; factors.push({ok:true, text:'EMI-to-income ratio healthy ✓'}); }
  else { score += Math.max(0,Math.round((50-emiRatio)/20*20)); factors.push({ok:false, text:`EMIs are ${Math.round(emiRatio)}% of income (keep ≤30%)`}); }

  if (hasInsurance) { score += 15; factors.push({ok:true, text:'Health insurance tracked ✓'}); }
  else factors.push({ok:false, text:'No health insurance tracked'});

  if (hasInvestments) { score += 15; factors.push({ok:true, text:'Investing regularly ✓'}); }
  else factors.push({ok:false, text:'No investments this month'});

  score = Math.min(100, Math.max(0, score));
  const color = score >= 75 ? '#1D9E75' : score >= 50 ? '#d4900a' : '#e05555';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Fair' : 'Needs Work';
  return { score, color, label, factors };
}

// ── REFRESH ALL TOTALS ────────────────────────────────────────────────────────
function refreshTotals() {
  const salary = getSalary();
  const cats = getCats();
  let catTotals = {};
  let totalExp = 0, totalSav = 0;

  cats.forEach(cat => {
    let sum = 0;
    cat.items.forEach(item => {
      const v = sumEntries(item.id); sum += v;
      const tot = document.getElementById('etotal-'+item.id);
      const cnt = document.getElementById('ecount-'+item.id);
      const entries = getEntries(item.id);
      if (tot) tot.textContent = v>0?fmt(v):'₹0';
      if (cnt) cnt.textContent = entries.length>0 ? entries.length+(entries.length===1?' entry':' entries') : '';
    });
    catTotals[cat.id] = sum;
    const ct = document.getElementById('ctotal-'+cat.id);
    if (ct) ct.textContent = sum>0?fmt(sum):'₹0';
    if (cat.id==='savings') totalSav+=sum; else totalExp+=sum;
  });

  const remaining = salary-(totalExp+totalSav);
  const savRate = salary>0?totalSav/salary*100:0;
  const expRate = salary>0?totalExp/salary*100:0;

  // Summary cards
  setText('s-savings', fmt(totalSav));
  setText('s-sav-pct', Math.round(savRate)+'% savings rate');
  setText('s-spent', fmt(totalExp));
  setText('s-pct', salary>0?Math.round(expRate)+'% of income':'—');
  setText('s-remaining', fmt(remaining));
  setText('s-rem-note', remaining<0?'Overspent!':'Left this month');

  const remCard = document.getElementById('remCard');
  if (remCard) remCard.className='scard full'+(remaining<0?' r':remaining<salary*.05?' a':'');

  // Progress bar
  const pct = salary>0?Math.min(100,Math.round(expRate)):0;
  const fill = document.getElementById('expFill');
  if (fill) { fill.style.width=pct+'%'; fill.style.background=pct>80?'#e05555':pct>60?'#d4900a':'#1D9E75'; }
  setText('expPctLabel', pct+'%');

  // Breakdown bar
  const bbar=document.getElementById('bbar'), bleg=document.getElementById('bleg');
  if (bbar&&bleg) {
    bbar.innerHTML=''; bleg.innerHTML='';
    const total=totalExp+totalSav;
    if (total>0) cats.forEach(c=>{
      const v=catTotals[c.id]; if(v<=0)return;
      const s=document.createElement('div'); s.className='bseg'; s.style.flex=v; s.style.background=c.color; bbar.appendChild(s);
      const li=document.createElement('div'); li.className='bleg-item';
      li.innerHTML=`<span class="bleg-dot" style="background:${c.color}"></span>${c.label} ${fmt(v)}`; bleg.appendChild(li);
    });
  }

  // Donut chart
  const donutSlices = cats.filter(c=>catTotals[c.id]>0).map(c=>({color:c.color,val:catTotals[c.id],label:c.label}));
  buildDonut('donutSvg', donutSlices);

  // Donut legend (top 5)
  const dl = document.getElementById('donutLegend');
  if (dl) {
    dl.innerHTML = donutSlices.sort((a,b)=>b.val-a.val).slice(0,5).map(s=>
      `<div class="donut-leg-item"><span class="donut-leg-dot" style="background:${s.color}"></span>${s.label}<span class="donut-leg-val">${fmt(s.val)}</span></div>`
    ).join('');
  }

  // Health score
  const hs = calcHealthScore(salary, catTotals, totalExp, totalSav);
  const hScore = document.getElementById('healthScore');
  const hBar = document.getElementById('healthBar');
  const hLabel = document.getElementById('healthLabel');
  const hFactors = document.getElementById('healthFactors');
  if (hScore) { hScore.textContent=hs.score; hScore.style.color=hs.color; }
  if (hBar) { hBar.style.width=hs.score+'%'; hBar.style.background=hs.color; }
  if (hLabel) hLabel.textContent=hs.label||'';
  if (hFactors) hFactors.innerHTML=(hs.factors||[]).map(f=>`<div class="hf-row"><div class="hf-dot" style="background:${f.ok?'#1D9E75':'#e05555'}"></div>${f.text}</div>`).join('');

  // Alert
  const alertEl = document.getElementById('alertBanner');
  if (alertEl) {
    if (salary>0&&(totalExp+totalSav)>0) {
      if (remaining<0) { alertEl.className='alert over'; alertEl.innerHTML='⚠️ Overspent by '+fmt(Math.abs(remaining))+'!'; }
      else if (savRate<10) { alertEl.className='alert warn'; alertEl.innerHTML='📉 Savings rate under 10%. Try the 50-30-20 rule.'; }
      else if (savRate>=20) { alertEl.className='alert ok'; alertEl.innerHTML='🎉 Saving '+Math.round(savRate)+'% of income. Excellent!'; }
      else alertEl.className='alert';
    } else alertEl.className='alert';
  }

  // Savings goal
  const goal=getGoal();
  const gBlock=document.getElementById('goalProg');
  if (gBlock) {
    if (goal>0) {
      gBlock.style.display='block';
      const gpct=Math.min(100,Math.round(totalSav/goal*100));
      const gf=document.getElementById('goalFill');
      if (gf){gf.style.width=gpct+'%';gf.style.background=gpct>=100?'#1D9E75':gpct>60?'#d4900a':'#e05555';}
      setText('goalLabel',fmt(totalSav)+' of '+fmt(goal));
      setText('goalPct',gpct+'%');
    } else gBlock.style.display='none';
  }

  buildTips(salary, catTotals, totalExp, totalSav, remaining, savRate);
  updateAnalytics(salary, cats, catTotals, totalExp, totalSav, savRate);
}

// ── TIPS ─────────────────────────────────────────────────────────────────────
function buildTips(salary, cats, totalExp, totalSav, remaining, savRate) {
  const tips = [];
  if (salary>0) {
    if ((cats.housing||0)/salary>.3) tips.push({icon:'🏠',text:'Housing over 30% of income. Ideal is ≤30%.'});
    if (savRate<20) tips.push({icon:'💰',text:'Target 20%+ savings. Try 50-30-20: needs / wants / savings.'});
    if ((cats.food||0)>salary*.2) tips.push({icon:'🍱',text:'Food spend is high. Cooking home vs. ordering saves ₹3,000–8,000/month.'});
    if ((cats.emi||0)>salary*.4) tips.push({icon:'📋',text:'EMIs above 40% is risky. Prepay high-interest loans first.'});
    if (!cats.savings) tips.push({icon:'📈',text:'No investments yet! ₹1,000/month SIP at 12% CAGR for 20 yrs = ₹9.9L.'});
    if (!(cats.health>0)&&salary>30000) tips.push({icon:'🏥',text:'No health insurance tracked. Family floater ₹5L ~₹8,000/year.'});
    if (remaining>salary*.15) tips.push({icon:'💡',text:fmt(remaining)+' unallocated. Park in liquid fund or top-up SIP.'});
    const mfs=getMFs();
    if (mfs.length>0) {
      const sipDue=mfs.filter(m=>m.type==='sip'&&m.sipDate);
      if (sipDue.length>0) tips.push({icon:'📅',text:`SIP reminder: ${sipDue.map(m=>m.name.split(' ').slice(0,3).join(' ')+' on '+m.sipDate+'th').join(', ')}`});
    }
  }
  if (!tips.length) tips.push({icon:'👆',text:'Enter your salary and start adding expenses to see insights.'});
  const el=document.getElementById('tipsList');
  if (el) el.innerHTML=tips.map(t=>`<div class="tip-row"><span class="tip-ico">${t.icon}</span><span>${t.text}</span></div>`).join('');
}

// ── ANALYTICS ────────────────────────────────────────────────────────────────
function updateAnalytics(salary, cats, catTotals, totalExp, totalSav, savRate) {
  setText('aSalary', fmt(salary));
  setText('aExpenses', fmt(totalExp));
  setText('aSavings', fmt(totalSav));
  setText('aSavRate', Math.round(savRate)+'%');
  setText('aRemaining', fmt(salary-totalExp-totalSav));

  const list=document.getElementById('analyticsList');
  if (!list) return;
  const rows=cats.map(c=>({label:c.label,val:catTotals[c.id]||0,color:c.color})).filter(r=>r.val>0).sort((a,b)=>b.val-a.val);
  list.innerHTML='';
  if (!rows.length){list.innerHTML='<div class="empty-state" style="padding:20px 0">No expenses recorded yet</div>';return;}
  rows.forEach(r=>{
    const pct=salary>0?(r.val/salary*100).toFixed(1):0;
    const d=document.createElement('div'); d.className='an-bar-row';
    d.innerHTML=`<div class="an-bar-lbl"><span class="an-bar-dot" style="background:${r.color}"></span>${r.label}</div>
      <div class="an-bar-track"><div class="an-bar-fill" style="width:${Math.min(100,pct)}%;background:${r.color}"></div></div>
      <span class="an-bar-pct">${pct}%</span><span class="an-bar-val">${fmt(r.val)}</span>`;
    list.appendChild(d);
  });
}

// ── SHEET HELPERS ────────────────────────────────────────────────────────────
function openSheet(id) { document.getElementById(id+'Backdrop').classList.add('open'); }
function closeSheet(id) { document.getElementById(id+'Backdrop').classList.remove('open'); }

// ── MONTH PICKER ─────────────────────────────────────────────────────────────
function openMonthSheet() {
  const grid=document.getElementById('monthGrid');
  grid.innerHTML='';
  MONTHS_SHORT.forEach((m,i)=>{
    const b=document.createElement('button'); b.className='month-btn'+(i===activeMonth?' active':''); b.textContent=m;
    b.onclick=()=>{ activeMonth=i; closeSheet('month'); loadData(); };
    grid.appendChild(b);
  });
  openSheet('month');
}

// ── LOAD DATA ────────────────────────────────────────────────────────────────
function loadData() {
  const sal=getSalary(); document.getElementById('salaryInput').value=sal>0?sal:'';
  const goal=getGoal(); document.getElementById('goalInput').value=goal>0?goal:'';
  document.getElementById('monthPill').innerHTML=`<i class="ti ti-calendar"></i> ${MONTHS_SHORT[activeMonth]}`;
  refreshTotals();
}

// ── NAV ──────────────────────────────────────────────────────────────────────
function switchView(v) {
  activeView=v;
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el=>el.classList.remove('active'));
  const view=document.getElementById(v+'View'), nav=document.getElementById('nav-'+v);
  if(view)view.classList.add('active');
  if(nav)nav.classList.add('active');
  if(v==='mf') buildMFView();
}

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildExpenses();
  buildMFView();

  document.getElementById('salaryInput').addEventListener('input', e=>{ saveSalary(e.target.value); refreshTotals(); });
  document.getElementById('goalInput').addEventListener('input', e=>{ saveGoal(e.target.value); refreshTotals(); });
  document.getElementById('monthPill').addEventListener('click', openMonthSheet);
  document.getElementById('entryAmountInput').addEventListener('keydown', e=>{ if(e.key==='Enter') addEntry(); });
  document.getElementById('mfFundName').addEventListener('input', e=>searchMF(e.target.value));

  // Close sheets on backdrop click
  ['month','entry','mf','addCat','addItem'].forEach(id=>{
    const bd=document.getElementById(id+'SheetBackdrop');
    if(bd) bd.addEventListener('click', e=>{ if(e.target===bd) closeSheet(id+'Sheet'.replace('SheetSheet','Sheet')||id); });
  });

  loadData();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/Fintrack/sw.js').catch(()=>{});
});

// ── BACKDROP CLOSE FIX ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const backdropMap = {
    'monthSheetBackdrop': 'monthSheet',
    'entrySheetBackdrop': 'entrySheet',
    'mfSheetBackdrop': 'mfSheet',
    'addCatSheetBackdrop': 'addCatSheet',
    'addItemSheetBackdrop': 'addItemSheet'
  };
  Object.entries(backdropMap).forEach(([bdId, sheetId]) => {
    const bd = document.getElementById(bdId);
    if (bd) bd.addEventListener('click', e => { if (e.target === bd) closeSheet(sheetId); });
  });
}, { once: true });
