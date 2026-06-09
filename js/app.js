'use strict';

const CATS = [
  { id:'housing', label:'Housing', color:'#378ADD', items:[
    {id:'rent', label:'Rent / Home Loan EMI'},
    {id:'maintenance', label:'Society Maintenance'},
    {id:'maid', label:'House Help / Maid'},
    {id:'repairs', label:'Home Repairs'}
  ]},
  { id:'food', label:'Food', color:'#639922', items:[
    {id:'groceries', label:'Groceries & Kirana'},
    {id:'milkveggies', label:'Milk, Eggs & Veggies'},
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
    {id:'books', label:'Books / Courses'}
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

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let activeMonth = new Date().getMonth();
let activeView = 'home';

// ---- Storage ----
function sk(m, id) { return `ft2_${m}_${id}`; }
function sv(m, id, val) { try { localStorage.setItem(sk(m,id), val); } catch(e){} }
function gv(m, id) { try { return localStorage.getItem(sk(m,id)) || ''; } catch(e){ return ''; } }

// ---- Build DOM ----
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
      <div class="exp-list" id="list-${cat.id}"></div>
    `;
    container.appendChild(sec);
    const list = sec.querySelector(`#list-${cat.id}`);
    cat.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'exp-item';
      div.innerHTML = `
        <label for="inp-${item.id}">${item.label}</label>
        <div class="irow"><span class="rsym">₹</span><input type="number" inputmode="numeric" id="inp-${item.id}" placeholder="0" /></div>
      `;
      list.appendChild(div);
      div.querySelector('input').addEventListener('input', recalc);
    });
  });
}

// ---- Month picker ----
function buildMonthSheet() {
  const grid = document.getElementById('monthGrid');
  grid.innerHTML = '';
  monthsShort.forEach((m, i) => {
    const b = document.createElement('button');
    b.className = 'month-btn' + (i === activeMonth ? ' active' : '');
    b.textContent = m;
    b.onclick = () => { activeMonth = i; closeSheet(); loadData(); };
    grid.appendChild(b);
  });
}

function openSheet() {
  buildMonthSheet();
  document.getElementById('sheetBackdrop').classList.add('open');
}
function closeSheet() {
  document.getElementById('sheetBackdrop').classList.remove('open');
}

// ---- Load / Save ----
function loadData() {
  document.getElementById('salaryInput').value = gv(activeMonth, 'salary');
  document.getElementById('goalInput').value = gv(activeMonth, 'goal');
  CATS.forEach(cat => cat.items.forEach(item => {
    const el = document.getElementById('inp-' + item.id);
    if (el) el.value = gv(activeMonth, item.id);
  }));
  document.getElementById('monthPill').innerHTML = `<i class="ti ti-calendar"></i>${monthsShort[activeMonth]}`;
  recalc();
}

// ---- Recalculate ----
function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

function recalc() {
  sv(activeMonth, 'salary', document.getElementById('salaryInput').value);
  sv(activeMonth, 'goal', document.getElementById('goalInput').value);

  const salary = parseFloat(document.getElementById('salaryInput').value) || 0;
  let catTotals = {};
  let totalExp = 0, totalSav = 0;

  CATS.forEach(cat => {
    let sum = 0;
    cat.items.forEach(item => {
      const el = document.getElementById('inp-' + item.id);
      const v = parseFloat(el ? el.value : 0) || 0;
      sum += v;
      sv(activeMonth, item.id, el ? el.value : '');
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

  // Summary cards
  document.getElementById('sIncome').textContent = fmt(salary);
  document.getElementById('sSpent').textContent = fmt(totalExp);
  document.getElementById('sPct').textContent = salary > 0 ? Math.round(expRate) + '% of income' : '—';
  document.getElementById('sRemaining').textContent = fmt(remaining);
  document.getElementById('sRemNote').textContent = remaining < 0 ? 'Overspent!' : 'Left this month';
  document.getElementById('sSavings').textContent = fmt(totalSav);
  document.getElementById('sSavPct').textContent = Math.round(savRate) + '% savings rate';

  // Card colors
  const remCard = document.getElementById('remCard');
  remCard.className = 'sum-card ' + (remaining < 0 ? 'red-card' : remaining < salary * 0.05 ? 'amber-card' : '');
  document.getElementById('sRemaining').style.color = remaining < 0 ? 'var(--red-text)' : remaining < salary * 0.05 ? 'var(--amber-text)' : 'var(--text)';

  // Progress bar
  const pct = salary > 0 ? Math.min(100, Math.round(expRate)) : 0;
  const fill = document.getElementById('expFill');
  fill.style.width = pct + '%';
  fill.style.background = pct > 80 ? '#e05555' : pct > 60 ? '#d4900a' : '#1D9E75';
  document.getElementById('expPctLabel').textContent = pct + '%';

  // Breakdown bar
  const bbar = document.getElementById('bbar');
  const bleg = document.getElementById('bleg');
  bbar.innerHTML = ''; bleg.innerHTML = '';
  if (totalOut > 0) {
    CATS.forEach(cat => {
      const v = catTotals[cat.id];
      if (v <= 0) return;
      const s = document.createElement('div');
      s.className = 'seg'; s.style.flex = v; s.style.background = cat.color;
      bbar.appendChild(s);
      const li = document.createElement('div');
      li.className = 'leg';
      li.innerHTML = `<span class="leg-dot" style="background:${cat.color}"></span>${cat.label} ${fmt(v)}`;
      bleg.appendChild(li);
    });
  }

  // Alert
  const alert = document.getElementById('alertBanner');
  if (salary > 0 && totalOut > 0) {
    if (remaining < 0) {
      alert.className = 'alert over';
      alert.innerHTML = '⚠️ Overspent by ' + fmt(Math.abs(remaining)) + ' this month!';
    } else if (savRate < 10) {
      alert.className = 'alert warn';
      alert.innerHTML = '📉 Savings rate under 10%. Try to cut back on discretionary spend.';
    } else if (savRate >= 20) {
      alert.className = 'alert ok';
      alert.innerHTML = '🎉 Excellent! Saving ' + Math.round(savRate) + '% of income this month.';
    } else {
      alert.className = 'alert'; alert.style.display = 'none';
    }
  } else {
    alert.className = 'alert'; alert.style.display = 'none';
  }

  // Savings goal
  const goal = parseFloat(document.getElementById('goalInput').value) || 0;
  const gBlock = document.getElementById('goalProg');
  if (goal > 0) {
    gBlock.style.display = 'block';
    const gpct = Math.min(100, Math.round(totalSav / goal * 100));
    document.getElementById('goalFill').style.width = gpct + '%';
    document.getElementById('goalFill').style.background = gpct >= 100 ? '#1D9E75' : gpct > 60 ? '#d4900a' : '#e05555';
    document.getElementById('goalLabel').textContent = fmt(totalSav) + ' of ' + fmt(goal);
    document.getElementById('goalPct').textContent = gpct + '%';
  } else {
    gBlock.style.display = 'none';
  }

  buildTips(salary, catTotals, totalExp, totalSav, remaining, savRate);
  updateAnalytics(salary, catTotals, totalExp, totalSav, savRate);
}

// ---- Tips ----
function buildTips(salary, cats, totalExp, totalSav, remaining, savRate) {
  const tips = [];
  if (salary > 0) {
    if (cats.housing / salary > 0.3) tips.push({icon:'🏠', text:'Housing is over 30% of income. The ideal is ≤30% — review rent vs. commute tradeoffs.'});
    if (savRate < 20) tips.push({icon:'💰', text:'Aim for 20%+ savings. The 50-30-20 rule: 50% needs, 30% wants, 20% savings works well.'});
    if (cats.food > salary * 0.2) tips.push({icon:'🍱', text:'Food spending is high. Home cooking vs. ordering out can save ₹3,000–8,000/month.'});
    if (cats.emi > salary * 0.4) tips.push({icon:'📋', text:'EMIs above 40% of income is risky. Prioritise prepaying high-interest personal loans first.'});
    if (cats.savings === 0) tips.push({icon:'📈', text:'No investments yet! A ₹1,000/month SIP over 20 years at 12% CAGR = ₹9.9 lakh.'});
    if (cats.health < 800 && salary > 30000) tips.push({icon:'🏥', text:'No health insurance tracked. A family floater for ₹5L cover starts at ~₹8,000/year.'});
    if (remaining > salary * 0.15) tips.push({icon:'💡', text:fmt(remaining) + ' is unallocated. Park it in a liquid fund or start/top-up an SIP.'});
    if (cats.other > 0 && cats.parents === 0 && salary > 50000) tips.push({icon:'👨‍👩‍👧', text:'Consider allocating a fixed amount for parents. Many Indian families under-plan for this.'});
  }
  if (tips.length === 0) tips.push({icon:'👆', text:'Enter your salary and expenses above to see personalised insights for your finances.'});
  document.getElementById('tipsList').innerHTML = tips.map(t => `<div class="tip-row"><span class="tip-icon">${t.icon}</span><span>${t.text}</span></div>`).join('');
}

// ---- Analytics view ----
function updateAnalytics(salary, cats, totalExp, totalSav, savRate) {
  if (!document.getElementById('analyticsView')) return;
  const rows = CATS.map(c => ({ label: c.label, val: cats[c.id] || 0, color: c.color }))
    .filter(r => r.val > 0).sort((a,b) => b.val - a.val);
  const list = document.getElementById('analyticsList');
  if (!list) return;
  list.innerHTML = '';
  rows.forEach(r => {
    const pct = salary > 0 ? (r.val / salary * 100).toFixed(1) : 0;
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:10px';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text2);margin-bottom:4px">
        <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:2px;background:${r.color};display:inline-block"></span>${r.label}</span>
        <span style="color:var(--text);font-weight:600">${fmt(r.val)} <span style="color:var(--text3);font-weight:400">${pct}%</span></span>
      </div>
      <div style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${Math.min(100,pct)}%;background:${r.color};border-radius:3px"></div>
      </div>`;
    list.appendChild(div);
  });
  document.getElementById('aSalary').textContent = fmt(salary);
  document.getElementById('aExpenses').textContent = fmt(totalExp);
  document.getElementById('aSavings').textContent = fmt(totalSav);
  document.getElementById('aSavRate').textContent = Math.round(savRate) + '%';
}

// ---- Nav ----
function switchView(v) {
  activeView = v;
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(v + 'View').classList.add('active');
  document.getElementById('nav-' + v).classList.add('active');
  recalc();
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  buildExpenses();
  document.getElementById('salaryInput').addEventListener('input', recalc);
  document.getElementById('goalInput').addEventListener('input', recalc);
  document.getElementById('monthPill').addEventListener('click', openSheet);
  document.getElementById('sheetBackdrop').addEventListener('click', e => { if (e.target === document.getElementById('sheetBackdrop')) closeSheet(); });
  loadData();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/Fintrack/sw.js').catch(()=>{});
});
