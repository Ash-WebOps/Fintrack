'use strict';

const CATS = [
  { id:'housing', label:'Housing', color:'#378ADD', items:[
    {id:'rent', label:'Rent / Home Loan EMI'},
    {id:'maintenance', label:'Society Maintenance'},
    {id:'maid', label:'House Help / Maid'},
    {id:'repairs', label:'Home Repairs'}
  ]},
  { id:'food', label:'Food', color:'#639922', items:[
    {id:'cow_milk', label:'Cow Milk'},
    {id:'buffalo_milk', label:'Buffalo Milk'},
    {id:'eggs', label:'Eggs'},
    {id:'bread', label:'Bread'},
    {id:'groceries', label:'Groceries & Kirana'},
    {id:'veggies', label:'Vegetables & Fruits'},
    {id:'swiggy', label:'Swiggy / Zomato'},
    {id:'cafe', label:'Café / Canteen / Tea'}
  ]},
  { id:'bills', label:'Bills & Utilities', color:'#d4900a', items:[
    {id:'electricity', label:'Electricity'},
    {id:'water', label:'Water / Piped Gas'},
    {id:'internet', label:'Broadband / WiFi'},
    {id:'mobile', label:'Mobile Recharge'},
    {id:'lpg', label:'LPG Cylinder'},
    {id:'ott', label:'OTT & Subscriptions'}
  ]},
  { id:'lifestyle', label:'Lifestyle', color:'#7f77dd', items:[
    {id:'shopping', label:'Clothing & Fashion'},
    {id:'gifting', label:'Gifting & Occasions'},
    {id:'salon', label:'Personal Care / Salon'},
    {id:'entertainment', label:'Movies / Events'},
    {id:'kids', label:'Kids School / Tuition'},
    {id:'books', label:'Books / Courses'},
    {id:'mobile_repair', label:'Mobile / Gadget Repair'}
  ]},
  { id:'health', label:'Health', color:'#e05555', items:[
    {id:'doctor', label:'Doctor / Clinic Visits'},
    {id:'medicines', label:'Medicines / Pharmacy'},
    {id:'gym', label:'Gym / Yoga / Sports'},
    {id:'insurance', label:'Health Insurance Premium'}
  ]},
  { id:'transport', label:'Transport', color:'#1D9E75', items:[
    {id:'fuel', label:'Fuel / Petrol / CNG'},
    {id:'cab', label:'Cab / Auto / Metro'},
    {id:'vehicle', label:'Vehicle Maintenance'},
    {id:'parking', label:'Parking / Tolls'},
    {id:'travel', label:'Travel / Outstation'}
  ]},
  { id:'emi', label:'Loans & EMIs', color:'#d4537e', items:[
    {id:'car_emi', label:'Car Loan EMI'},
    {id:'personal_loan', label:'Personal Loan EMI'},
    {id:'edu_loan', label:'Education Loan EMI'},
    {id:'cc_bill', label:'Credit Card Bill'}
  ]},
  { id:'savings', label:'Savings & Investments', color:'#0F6E56', items:[
    {id:'ppf', label:'PPF / NPS'},
    {id:'sip', label:'Mutual Funds / SIP'},
    {id:'rd', label:'RD / FD'},
    {id:'gold', label:'Gold / SGB'},
    {id:'stocks', label:'Stocks / Direct Equity'},
    {id:'emergency', label:'Emergency Fund Top-up'}
  ]},
  { id:'other', label:'Others', color:'#5c6070', items:[
    {id:'parents', label:'Parents / Family Support'},
    {id:'charity', label:'Donations / Charity'},
    {id:'tax', label:'Advance Tax / TDS'},
    {id:'misc', label:'Miscellaneous'}
  ]}
];

const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const today = new Date();
let activeMonth = today.getMonth();
let activeYear = today.getFullYear();

// active entry sheet state
let sheetItemId = null;
let sheetItemLabel = null;
let sheetItemColor = null;

// ---- Storage helpers ----
// Entries: array of {id, amount, date, note} per item per month
function entriesKey(year, month, itemId) { return `fte_${year}_${month}_${itemId}`; }
function salaryKey(year, month) { return `fts_${year}_${month}_salary`; }
function goalKey(year, month) { return `ftg_${year}_${month}_goal`; }

function getEntries(itemId) {
  try { return JSON.parse(localStorage.getItem(entriesKey(activeYear, activeMonth, itemId)) || '[]'); }
  catch(e) { return []; }
}
function saveEntries(itemId, arr) {
  try { localStorage.setItem(entriesKey(activeYear, activeMonth, itemId), JSON.stringify(arr)); }
  catch(e) {}
}
function sumEntries(itemId) { return getEntries(itemId).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0); }

function getSalary() { try { return parseFloat(localStorage.getItem(salaryKey(activeYear, activeMonth)) || '0') || 0; } catch(e) { return 0; } }
function saveSalary(v) { try { localStorage.setItem(salaryKey(activeYear, activeMonth), v); } catch(e) {} }
function getGoal() { try { return parseFloat(localStorage.getItem(goalKey(activeYear, activeMonth)) || '0') || 0; } catch(e) { return 0; } }
function saveGoal(v) { try { localStorage.setItem(goalKey(activeYear, activeMonth), v); } catch(e) {} }

function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtDate(d) {
  const dt = new Date(d);
  return dt.getDate() + ' ' + monthsShort[dt.getMonth()];
}

// ---- Build expense list ----
function buildExpenses() {
  const container = document.getElementById('expenseContainer');
  container.innerHTML = '';
  CATS.forEach(cat => {
    const sec = document.createElement('div');
    sec.innerHTML = `
      <div class="sec-header">
        <div class="sec-dot" style="background:${cat.color}"></div>
        <span class="sec-title">${cat.label}</span>
        <span class="sec-total" id="ctotal-${cat.id}">₹0</span>
      </div>
      <div class="exp-list" id="list-${cat.id}"></div>`;
    container.appendChild(sec);
    const list = sec.querySelector(`#list-${cat.id}`);
    cat.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'exp-item';
      div.setAttribute('data-item', item.id);
      div.setAttribute('data-label', item.label);
      div.setAttribute('data-color', cat.color);
      div.innerHTML = `
        <div class="exp-item-left">
          <span class="exp-item-label">${item.label}</span>
          <span class="exp-item-count" id="ecount-${item.id}"></span>
        </div>
        <div class="exp-item-right">
          <span class="exp-item-total" id="etotal-${item.id}">₹0</span>
          <button class="add-entry-btn" onclick="openEntrySheet('${item.id}','${item.label.replace(/'/g,"\\'")}','${cat.color}')">
            <i class="ti ti-plus"></i>
          </button>
        </div>`;
      list.appendChild(div);
    });
  });
}

// ---- Entry sheet ----
function openEntrySheet(itemId, itemLabel, color) {
  sheetItemId = itemId;
  sheetItemLabel = itemLabel;
  sheetItemColor = color;

  document.getElementById('entrySheetTitle').textContent = itemLabel;
  document.getElementById('entrySheetTitle').style.color = color;
  document.getElementById('entryAmountInput').value = '';
  document.getElementById('entryNoteInput').value = '';
  // default date = today
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,'0');
  const dd = String(now.getDate()).padStart(2,'0');
  document.getElementById('entryDateInput').value = `${yyyy}-${mm}-${dd}`;

  renderEntryLog(itemId);
  document.getElementById('entrySheetBackdrop').classList.add('open');
  setTimeout(() => document.getElementById('entryAmountInput').focus(), 300);
}

function closeEntrySheet() {
  document.getElementById('entrySheetBackdrop').classList.remove('open');
  sheetItemId = null;
}

function renderEntryLog(itemId) {
  const entries = getEntries(itemId).slice().reverse();
  const log = document.getElementById('entryLog');
  const totalEl = document.getElementById('entryLogTotal');
  const total = entries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  if (totalEl) totalEl.textContent = total > 0 ? 'Total: ' + fmt(total) : '';
  if (entries.length === 0) {
    log.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:16px 0">No entries yet this month</div>';
    return;
  }
  log.innerHTML = entries.map((e, i) => `
    <div class="entry-row">
      <div class="entry-row-left">
        <span class="entry-date">${fmtDate(e.date)}</span>
        ${e.note ? `<span class="entry-note">${e.note}</span>` : ''}
      </div>
      <div class="entry-row-right">
        <span class="entry-amount">${fmt(e.amount)}</span>
        <button class="del-btn" onclick="deleteEntry('${itemId}',${entries.length-1-i})"><i class="ti ti-trash"></i></button>
      </div>
    </div>`).join('');
}

function addEntry() {
  const amt = parseFloat(document.getElementById('entryAmountInput').value);
  const date = document.getElementById('entryDateInput').value;
  const note = document.getElementById('entryNoteInput').value.trim();
  if (!amt || amt <= 0 || !date) {
    document.getElementById('entryAmountInput').focus();
    return;
  }
  const entries = getEntries(sheetItemId);
  entries.push({ amount: amt, date, note });
  entries.sort((a,b) => new Date(a.date) - new Date(b.date));
  saveEntries(sheetItemId, entries);
  document.getElementById('entryAmountInput').value = '';
  document.getElementById('entryNoteInput').value = '';
  renderEntryLog(sheetItemId);
  refreshTotals();
}

function deleteEntry(itemId, idx) {
  const entries = getEntries(itemId);
  entries.splice(idx, 1);
  saveEntries(itemId, entries);
  renderEntryLog(itemId);
  refreshTotals();
}

// ---- Month picker ----
function buildMonthSheet() {
  const grid = document.getElementById('monthGrid');
  grid.innerHTML = '';
  monthsShort.forEach((m, i) => {
    const b = document.createElement('button');
    b.className = 'month-btn' + (i === activeMonth ? ' active' : '');
    b.textContent = m;
    b.onclick = () => { activeMonth = i; closeMonthSheet(); loadData(); };
    grid.appendChild(b);
  });
}
function openMonthSheet() { buildMonthSheet(); document.getElementById('sheetBackdrop').classList.add('open'); }
function closeMonthSheet() { document.getElementById('sheetBackdrop').classList.remove('open'); }

// ---- Load data for current month ----
function loadData() {
  const sal = getSalary();
  document.getElementById('salaryInput').value = sal > 0 ? sal : '';
  const goal = getGoal();
  document.getElementById('goalInput').value = goal > 0 ? goal : '';
  document.getElementById('monthPill').innerHTML = `<i class="ti ti-calendar"></i> ${monthsShort[activeMonth]}`;
  refreshTotals();
}

// ---- Refresh all totals and UI ----
function refreshTotals() {
  const salary = getSalary();
  let catTotals = {};
  let totalExp = 0, totalSav = 0;

  CATS.forEach(cat => {
    let sum = 0;
    cat.items.forEach(item => {
      const v = sumEntries(item.id);
      sum += v;
      const tot = document.getElementById('etotal-' + item.id);
      const cnt = document.getElementById('ecount-' + item.id);
      const entries = getEntries(item.id);
      if (tot) tot.textContent = v > 0 ? fmt(v) : '₹0';
      if (cnt) cnt.textContent = entries.length > 0 ? entries.length + (entries.length === 1 ? ' entry' : ' entries') : '';
    });
    catTotals[cat.id] = sum;
    const ct = document.getElementById('ctotal-' + cat.id);
    if (ct) ct.textContent = sum > 0 ? fmt(sum) : '₹0';
    if (cat.id === 'savings') totalSav += sum; else totalExp += sum;
  });

  const totalOut = totalExp + totalSav;
  const remaining = salary - totalOut;
  const savRate = salary > 0 ? totalSav / salary * 100 : 0;
  const expRate = salary > 0 ? totalExp / salary * 100 : 0;

  setText('s-savings', fmt(totalSav));
  setText('s-sav-pct', Math.round(savRate) + '% savings rate');
  setText('s-spent', fmt(totalExp));
  setText('s-pct', salary > 0 ? Math.round(expRate) + '% of income' : '—');
  setText('s-remaining', fmt(remaining));
  setText('s-rem-note', remaining < 0 ? 'Overspent!' : 'Left this month');

  const remCard = document.getElementById('remCard');
  if (remCard) remCard.className = 'sum-card' + (remaining < 0 ? ' red-card' : remaining < salary * 0.05 ? ' amber-card' : '');

  const pct = salary > 0 ? Math.min(100, Math.round(expRate)) : 0;
  const fill = document.getElementById('expFill');
  if (fill) { fill.style.width = pct + '%'; fill.style.background = pct > 80 ? '#e05555' : pct > 60 ? '#d4900a' : '#1D9E75'; }
  setText('expPctLabel', pct + '%');

  const bbar = document.getElementById('bbar'), bleg = document.getElementById('bleg');
  if (bbar && bleg) {
    bbar.innerHTML = ''; bleg.innerHTML = '';
    if (totalOut > 0) {
      CATS.forEach(cat => {
        const v = catTotals[cat.id]; if (v <= 0) return;
        const s = document.createElement('div'); s.className = 'seg'; s.style.flex = v; s.style.background = cat.color; bbar.appendChild(s);
        const li = document.createElement('div'); li.className = 'leg';
        li.innerHTML = `<span class="leg-dot" style="background:${cat.color}"></span>${cat.label} ${fmt(v)}`; bleg.appendChild(li);
      });
    }
  }

  const alertEl = document.getElementById('alertBanner');
  if (alertEl) {
    if (salary > 0 && totalOut > 0) {
      if (remaining < 0) { alertEl.className = 'alert over'; alertEl.innerHTML = '⚠️ Overspent by ' + fmt(Math.abs(remaining)) + ' this month!'; }
      else if (savRate < 10) { alertEl.className = 'alert warn'; alertEl.innerHTML = '📉 Savings rate under 10%. Try cutting discretionary spend.'; }
      else if (savRate >= 20) { alertEl.className = 'alert ok'; alertEl.innerHTML = '🎉 Saving ' + Math.round(savRate) + '% of income. Excellent!'; }
      else alertEl.className = 'alert';
    } else alertEl.className = 'alert';
  }

  const goal = getGoal();
  const gBlock = document.getElementById('goalProg');
  if (gBlock) {
    if (goal > 0) {
      gBlock.style.display = 'block';
      const gpct = Math.min(100, Math.round(totalSav / goal * 100));
      const gf = document.getElementById('goalFill');
      if (gf) { gf.style.width = gpct + '%'; gf.style.background = gpct >= 100 ? '#1D9E75' : gpct > 60 ? '#d4900a' : '#e05555'; }
      setText('goalLabel', fmt(totalSav) + ' of ' + fmt(goal));
      setText('goalPct', gpct + '%');
    } else gBlock.style.display = 'none';
  }

  buildTips(salary, catTotals, totalExp, totalSav, remaining, savRate);
  updateAnalytics(salary, catTotals, totalExp, totalSav, savRate);
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// ---- Tips ----
function buildTips(salary, cats, totalExp, totalSav, remaining, savRate) {
  const tips = [];
  if (salary > 0) {
    if (cats.housing / salary > 0.3) tips.push({icon:'🏠', text:'Housing is over 30% of income. Ideal is ≤30%.'});
    if (savRate < 20) tips.push({icon:'💰', text:'Target 20%+ savings. Try the 50-30-20 rule: needs / wants / savings.'});
    if (cats.food > salary * 0.2) tips.push({icon:'🍱', text:'Food spend is high. Ordering less can save ₹3,000–8,000/month.'});
    if (cats.emi > salary * 0.4) tips.push({icon:'📋', text:'EMIs above 40% of income is risky. Prepay high-interest loans first.'});
    if (cats.savings === 0) tips.push({icon:'📈', text:'No investments yet! ₹1,000/month SIP at 12% CAGR for 20 yrs = ₹9.9L.'});
    if (cats.health < 800 && salary > 30000) tips.push({icon:'🏥', text:'No health insurance tracked. Family floater ₹5L cover ~₹8,000/year.'});
    if (remaining > salary * 0.15) tips.push({icon:'💡', text: fmt(remaining) + ' unallocated. Park it in a liquid fund or SIP.'});
  }
  if (tips.length === 0) tips.push({icon:'👆', text:'Enter your salary and start adding expenses to see insights.'});
  const el = document.getElementById('tipsList');
  if (el) el.innerHTML = tips.map(t => `<div class="tip-row"><span class="tip-icon">${t.icon}</span><span>${t.text}</span></div>`).join('');
}

// ---- Analytics ----
function updateAnalytics(salary, cats, totalExp, totalSav, savRate) {
  setText('aSalary', fmt(salary));
  setText('aExpenses', fmt(totalExp));
  setText('aSavings', fmt(totalSav));
  setText('aSavRate', Math.round(savRate) + '%');

  const list = document.getElementById('analyticsList');
  if (!list) return;
  const rows = CATS.map(c => ({ label: c.label, val: cats[c.id] || 0, color: c.color }))
    .filter(r => r.val > 0).sort((a, b) => b.val - a.val);
  list.innerHTML = '';
  if (rows.length === 0) { list.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px 0">No expenses recorded yet</div>'; return; }
  rows.forEach(r => {
    const pct = salary > 0 ? (r.val / salary * 100).toFixed(1) : 0;
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:13px';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
        <span style="display:flex;align-items:center;gap:6px;color:var(--text2)">
          <span style="width:8px;height:8px;border-radius:2px;background:${r.color};display:inline-block;flex-shrink:0"></span>${r.label}
        </span>
        <span style="color:var(--text);font-weight:600">${fmt(r.val)} <span style="color:var(--text3);font-weight:400;font-size:12px">${pct}%</span></span>
      </div>
      <div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${Math.min(100, pct)}%;background:${r.color};border-radius:3px;transition:width .4s ease"></div>
      </div>`;
    list.appendChild(div);
  });
}

// ---- Nav ----
function switchView(v) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  const view = document.getElementById(v + 'View');
  const nav = document.getElementById('nav-' + v);
  if (view) view.classList.add('active');
  if (nav) nav.classList.add('active');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  buildExpenses();

  document.getElementById('salaryInput').addEventListener('input', e => { saveSalary(e.target.value); refreshTotals(); });
  document.getElementById('goalInput').addEventListener('input', e => { saveGoal(e.target.value); refreshTotals(); });

  document.getElementById('monthPill').addEventListener('click', openMonthSheet);
  document.getElementById('sheetBackdrop').addEventListener('click', e => { if (e.target === document.getElementById('sheetBackdrop')) closeMonthSheet(); });
  document.getElementById('entrySheetBackdrop').addEventListener('click', e => { if (e.target === document.getElementById('entrySheetBackdrop')) closeEntrySheet(); });

  document.getElementById('entryAmountInput').addEventListener('keydown', e => { if (e.key === 'Enter') addEntry(); });

  loadData();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/Fintrack/sw.js').catch(() => {});
});
