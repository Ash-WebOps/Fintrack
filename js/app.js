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
let activeMonth = new Date().getMonth();

// ---- Storage ----
function sk(m, id) { return `ft2_${m}_${id}`; }
function sv(m, id, val) { try { localStorage.setItem(sk(m,id), val); } catch(e){} }
function gv(m, id) { try { return localStorage.getItem(sk(m,id)) || ''; } catch(e){ return ''; } }
function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }

// ---- Build expense inputs ----
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
function openSheet() { buildMonthSheet(); document.getElementById('sheetBackdrop').classList.add('open'); }
function closeSheet() { document.getElementById('sheetBackdrop').classList.remove('open'); }

// ---- Load data ----
function loadData() {
  document.getElementById('salaryInput').value = gv(activeMonth, 'salary');
  document.getElementById('goalInput').value = gv(activeMonth, 'goal');
  CATS.forEach(cat => cat.items.forEach(item => {
    const el = document.getElementById('inp-' + item.id);
    if (el) el.value = gv(activeMonth, item.id);
  }));
  document.getElementById('monthPill').innerHTML = `<i class="ti ti-calendar"></i> ${monthsShort[activeMonth]}`;
  recalc();
}

// ---- Recalculate everything ----
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

  // ---- Home view summary cards ----
  setText('s-income', fmt(salary));
  setText('s-spent', fmt(totalExp));
  setText('s-pct', salary > 0 ? Math.round(expRate) + '% of income' : '—');
  setText('s-remaining', fmt(remaining));
  setText('s-rem-note', remaining < 0 ? 'Overspent!' : 'Left this month');
  setText('s-savings', fmt(totalSav));
  setText('s-sav-pct', Math.round(savRate) + '% savings rate');

  const remCard = document.getElementById('remCard');
  if (remCard) remCard.className = 'sum-card' + (remaining < 0 ? ' red-card' : remaining < salary * 0.05 ? ' amber-card' : '');

  // ---- Progress bar ----
  const pct = salary > 0 ? Math.min(100, Math.round(expRate)) : 0;
  const fill = document.getElementById('expFill');
  if (fill) { fill.style.width = pct + '%'; fill.style.background = pct > 80 ? '#e05555' : pct > 60 ? '#d4900a' : '#1D9E75'; }
  setText('expPctLabel', pct + '%');

  // ---- Breakdown bar ----
  const bbar = document.getElementById('bbar');
  const bleg = document.getElementById('bleg');
  if (bbar && bleg) {
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
  }

  // ---- Alert banner ----
  const alertEl = document.getElementById('alertBanner');
  if (alertEl) {
    if (salary > 0 && totalOut > 0) {
      if (remaining < 0) {
        alertEl.className = 'alert over';
        alertEl.innerHTML = '⚠️ Overspent by ' + fmt(Math.abs(remaining)) + ' this month!';
      } else if (savRate < 10) {
        alertEl.className = 'alert warn';
        alertEl.innerHTML = '📉 Savings rate under 10%. Try to cut back on discretionary spend.';
      } else if (savRate >= 20) {
        alertEl.className = 'alert ok';
        alertEl.innerHTML = '🎉 Saving ' + Math.round(savRate) + '% of income. Excellent discipline!';
      } else {
        alertEl.className = 'alert';
      }
    } else {
      alertEl.className = 'alert';
    }
  }

  // ---- Savings goal ----
  const goal = parseFloat(document.getElementById('goalInput').value) || 0;
  const gBlock = document.getElementById('goalProg');
  if (gBlock) {
    if (goal > 0) {
      gBlock.style.display = 'block';
      const gpct = Math.min(100, Math.round(totalSav / goal * 100));
      const goalFill = document.getElementById('goalFill');
      if (goalFill) { goalFill.style.width = gpct + '%'; goalFill.style.background = gpct >= 100 ? '#1D9E75' : gpct > 60 ? '#d4900a' : '#e05555'; }
      setText('goalLabel', fmt(totalSav) + ' of ' + fmt(goal));
      setText('goalPct', gpct + '%');
    } else {
      gBlock.style.display = 'none';
    }
  }

  buildTips(salary, catTotals, totalExp, totalSav, remaining, savRate);
  updateAnalytics(salary, catTotals, totalExp, totalSav, savRate);
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// ---- Tips ----
function buildTips(salary, cats, totalExp, totalSav, remaining, savRate) {
  const tips = [];
  if (salary > 0) {
    if (cats.housing / salary > 0.3) tips.push({icon:'🏠', text:'Housing is over 30% of income. Ideal is ≤30% — review rent vs. commute tradeoffs.'});
    if (savRate < 20) tips.push({icon:'💰', text:'Aim for 20%+ savings. The 50-30-20 rule: 50% needs, 30% wants, 20% savings works great.'});
    if (cats.food > salary * 0.2) tips.push({icon:'🍱', text:'Food spending is high. Home cooking vs. ordering can save ₹3,000–8,000/month.'});
    if (cats.emi > salary * 0.4) tips.push({icon:'📋', text:'EMIs above 40% of income is risky. Prepay high-interest loans first.'});
    if (cats.savings === 0) tips.push({icon:'📈', text:'No investments tracked yet! ₹1,000/month SIP at 12% CAGR over 20 years = ₹9.9 lakh.'});
    if (cats.health < 800 && salary > 30000) tips.push({icon:'🏥', text:'No health insurance tracked. A family floater ₹5L cover starts ~₹8,000/year.'});
    if (remaining > salary * 0.15) tips.push({icon:'💡', text: fmt(remaining) + ' is unallocated. Park it in a liquid fund or top-up your SIP.'});
  }
  if (tips.length === 0) tips.push({icon:'👆', text:'Enter your salary and expenses above to see personalised insights.'});
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
  rows.forEach(r => {
    const pct = salary > 0 ? (r.val / salary * 100).toFixed(1) : 0;
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:12px';
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
  recalc();
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  buildExpenses();
  const salEl = document.getElementById('salaryInput');
  const goalEl = document.getElementById('goalInput');
  if (salEl) salEl.addEventListener('input', recalc);
  if (goalEl) goalEl.addEventListener('input', recalc);
  const pill = document.getElementById('monthPill');
  if (pill) pill.addEventListener('click', openSheet);
  const backdrop = document.getElementById('sheetBackdrop');
  if (backdrop) backdrop.addEventListener('click', e => { if (e.target === backdrop) closeSheet(); });
  loadData();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/Fintrack/sw.js').catch(() => {});
});
