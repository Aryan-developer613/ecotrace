/* ══════════════════════════════════════
   EcoTrace — app.js
   Full application logic
══════════════════════════════════════ */

/* ─── STATE ─────────────────────────── */
let values = {};   // { activityId: number }
let history = JSON.parse(localStorage.getItem('ecotrace_history') || '[]');

/* ─── INIT ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildTrackCards();
  updateDashboard();
  renderTips();
  renderHistory();
  startTicker();
  setDate();
});

/* ─── NAVIGATION ────────────────────── */
function launchApp() {
  document.getElementById('page-landing').classList.add('hidden');
  document.getElementById('page-app').classList.remove('hidden');
  window.scrollTo(0, 0);
}

function goLanding() {
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-landing').classList.remove('hidden');
  window.scrollTo(0, 0);
}

function switchTab(name, btn) {
  // deactivate all tabs & panels
  document.querySelectorAll('.a-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.a-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');

  if (name === 'insights') renderInsights();
  if (name === 'tips')     renderTips();
  if (name === 'history')  renderHistory();
}

/* ─── DATE ───────────────────────────── */
function setDate() {
  const el = document.getElementById('a-date');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
}

/* ─── LIVE TICKER ────────────────────── */
function startTicker() {
  const el = document.getElementById('tick-global');
  if (!el) return;
  // seconds elapsed today
  const now = new Date();
  const secToday = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  let tonnes = secToday * WORLD_TONNES_PER_SEC;

  function fmt(n) {
    if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n/1e6).toFixed(2) + 'M';
    return Math.round(n).toLocaleString('en-IN');
  }

  el.textContent = fmt(tonnes);
  setInterval(() => {
    tonnes += WORLD_TONNES_PER_SEC;
    el.textContent = fmt(tonnes);
  }, 1000);
}

/* ─── BUILD TRACK CARDS ─────────────── */
function buildTrackCards() {
  const cats = ['transport','home','food','shopping'];
  cats.forEach(cat => {
    const card = document.getElementById('card-' + cat);
    if (!card) return;
    const rows = ACTIVITIES[cat].map(act => buildRow(act, cat)).join('');
    // append rows after the header
    const div = document.createElement('div');
    div.className = 'a-rows';
    div.innerHTML = rows;
    card.appendChild(div);
  });
}

function buildRow(act, cat) {
  return `
  <div class="a-row" id="row-${act.id}" data-cat="${cat}" data-id="${act.id}">
    <span class="a-row-em">${act.em}</span>
    <div class="a-row-info">
      <div class="a-row-name">${act.name}</div>
      <div class="a-row-unit">${act.unit}</div>
    </div>
    <div class="a-row-inp-w">
      <input class="a-row-inp" type="number" min="0" step="any" placeholder="0"
        id="inp-${act.id}"
        oninput="onInput('${act.id}','${cat}',this.value)"
        aria-label="${act.name} amount in ${act.unit}"
      />
      <span class="a-row-inp-unit">${act.unit}</span>
    </div>
    <div class="a-row-co2 mono" id="co2-${act.id}">—</div>
    <div class="a-row-badge" id="badge-${act.id}">—</div>
  </div>`;
}

/* ─── INPUT HANDLER ─────────────────── */
function onInput(id, cat, raw) {
  const v = parseFloat(raw) || 0;
  values[id] = v;

  const act = findAct(id);
  const kg = v * act.f;

  // update row CO2 display
  const co2El = document.getElementById('co2-' + id);
  const badgeEl = document.getElementById('badge-' + id);
  if (co2El) co2El.textContent = v > 0 ? kg.toFixed(2) + ' kg' : '—';
  if (badgeEl) {
    if (v > 0) {
      badgeEl.textContent = kg.toFixed(2) + ' kg CO₂';
      badgeEl.classList.add('on');
    } else {
      badgeEl.textContent = '—';
      badgeEl.classList.remove('on');
    }
  }

  // update category total
  updateCatTotal(cat);
  updateDashboard();
}

function updateCatTotal(cat) {
  const acts = ACTIVITIES[cat];
  const tot = acts.reduce((s, a) => s + (values[a.id] || 0) * a.f, 0);
  const el = document.getElementById('ctot-' + cat);
  if (el) el.textContent = tot.toFixed(2) + ' kg';
}

/* ─── DASHBOARD ─────────────────────── */
function updateDashboard() {
  const total = totalKg();
  const score = ecoScore(total);

  // big number
  const numEl = document.getElementById('d-num');
  if (numEl) numEl.textContent = total.toFixed(1);

  // score ring
  const ring = document.getElementById('score-ring');
  const scoreEl = document.getElementById('d-score');
  if (ring) {
    const circumference = 314;
    const offset = circumference - (score / 100) * circumference;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = scoreColor(score);
  }
  if (scoreEl) scoreEl.textContent = total > 0 ? score : '—';

  // sub-text
  const subEl = document.getElementById('d-sub');
  if (subEl) {
    if (total === 0) {
      subEl.textContent = 'Log your activities below to see your impact';
    } else if (total < INDIA_AVG) {
      subEl.textContent = `Below India's average of ${INDIA_AVG} kg/day 👏`;
    } else if (total < WORLD_AVG) {
      subEl.textContent = `Below the world average of ${WORLD_AVG} kg/day`;
    } else {
      subEl.textContent = `Above the world average of ${WORLD_AVG} kg/day`;
    }
  }

  // pills
  const pillsEl = document.getElementById('d-pills');
  if (pillsEl) {
    const cats = ['transport','home','food','shopping'];
    pillsEl.innerHTML = cats.map(cat => {
      const tot = ACTIVITIES[cat].reduce((s,a) => s + (values[a.id]||0)*a.f, 0);
      if (tot <= 0) return '';
      const bg = {transport:'#FEE2E2',home:'#FEF3C7',food:'#D1FAE5',shopping:'#EDE9FE'}[cat];
      const ic = {transport:'🚗',home:'⚡',food:'🥗',shopping:'🛍️'}[cat];
      return `<span class="d-pill" style="background:${bg}">${ic} ${tot.toFixed(1)} kg</span>`;
    }).join('');
  }

  // stats
  const weekEl = document.getElementById('d-week');
  const treesEl = document.getElementById('d-trees');
  const vsEl = document.getElementById('d-vs');
  if (weekEl)  weekEl.textContent  = (total * 7).toFixed(1);
  if (treesEl) treesEl.textContent = Math.ceil(total / 21.77);
  if (vsEl) {
    if (total === 0) { vsEl.textContent = '—'; }
    else {
      const pct = ((total - INDIA_AVG) / INDIA_AVG * 100);
      vsEl.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(0) + '%';
    }
  }

  // progress bar
  const bar = document.getElementById('a-progress-bar');
  if (bar) {
    const pct = Math.min(100, (total / (US_AVG)) * 100);
    bar.style.width = pct + '%';
    bar.style.background = total < INDIA_AVG ? '#16a34a' : total < WORLD_AVG ? '#f59e0b' : '#ef4444';
  }
}

function totalKg() {
  let t = 0;
  Object.keys(ACTIVITIES).forEach(cat => {
    ACTIVITIES[cat].forEach(act => { t += (values[act.id] || 0) * act.f; });
  });
  return t;
}

function ecoScore(kg) {
  // 100 = zero, 0 = US_AVG or above
  if (kg <= 0) return 100;
  if (kg >= US_AVG) return 0;
  return Math.round(100 - (kg / US_AVG) * 100);
}

function scoreColor(s) {
  if (s >= 70) return '#4ade80';
  if (s >= 40) return '#fbbf24';
  return '#f87171';
}

/* ─── SAVE / RESET ───────────────────── */
function saveDay() {
  const total = totalKg();
  if (total === 0) { showToast('Nothing logged yet — add some activities first.'); return; }

  const dateKey = new Date().toISOString().slice(0, 10);
  // remove existing entry for today if any
  history = history.filter(h => h.date !== dateKey);
  history.unshift({ date: dateKey, kg: parseFloat(total.toFixed(2)), score: ecoScore(total), values: { ...values } });
  if (history.length > 30) history = history.slice(0, 30);
  localStorage.setItem('ecotrace_history', JSON.stringify(history));
  showToast('✅ Today\'s log saved!');
  renderHistory();
}

function resetDay() {
  values = {};
  document.querySelectorAll('.a-row-inp').forEach(el => el.value = '');
  document.querySelectorAll('.a-row-co2').forEach(el => el.textContent = '—');
  document.querySelectorAll('.a-row-badge').forEach(el => { el.textContent = '—'; el.classList.remove('on'); });
  ['transport','home','food','shopping'].forEach(cat => {
    const el = document.getElementById('ctot-' + cat);
    if (el) el.textContent = '0.00 kg';
  });
  updateDashboard();
  showToast('↺ Reset for a fresh start.');
}

/* ─── INSIGHTS ───────────────────────── */
function renderInsights() {
  const total = totalKg();
  const empty = document.getElementById('ins-empty');
  const content = document.getElementById('ins-content');
  if (!empty || !content) return;

  if (total === 0) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  content.classList.remove('hidden');

  // Category bars
  renderCatBars();
  // Comparison bars
  renderCompBars(total);
  // Top contributors
  renderTop();
  // Equivalents
  renderEquiv(total);
}

function renderCatBars() {
  const el = document.getElementById('ins-cat-bars');
  if (!el) return;
  const cats = [
    { key:'transport', name:'Transport', color:'#ef4444' },
    { key:'home',      name:'Home',      color:'#f59e0b' },
    { key:'food',      name:'Food',      color:'#22c55e' },
    { key:'shopping',  name:'Shopping',  color:'#8b5cf6' },
  ];
  const totals = cats.map(c => ({
    ...c,
    kg: ACTIVITIES[c.key].reduce((s,a) => s + (values[a.id]||0)*a.f, 0)
  }));
  const max = Math.max(...totals.map(t => t.kg), 0.01);
  el.innerHTML = totals.map(t => `
    <div class="ins-bar-row">
      <div class="ins-bar-meta">
        <span class="ins-bar-name">${t.name}</span>
        <span class="ins-bar-val">${t.kg.toFixed(2)} kg</span>
      </div>
      <div class="ins-bar-track">
        <div class="ins-bar-fill" style="width:${(t.kg/max*100).toFixed(1)}%;background:${t.color}"></div>
      </div>
    </div>
  `).join('');
}

function renderCompBars(total) {
  const el = document.getElementById('ins-comp-bars');
  if (!el) return;
  const rows = [
    { who:'You',   kg: total,     color:'#16a34a' },
    { who:'India', kg: INDIA_AVG, color:'#4ade80' },
    { who:'World', kg: WORLD_AVG, color:'#f59e0b' },
    { who:'US',    kg: US_AVG,    color:'#ef4444' },
  ];
  const max = Math.max(...rows.map(r => r.kg), 0.01);
  el.innerHTML = rows.map(r => `
    <div class="ins-comp-row">
      <span class="ins-comp-who">${r.who}</span>
      <div class="ins-comp-track">
        <div class="ins-comp-fill" style="width:${(r.kg/max*100).toFixed(1)}%;background:${r.color}"></div>
      </div>
      <span class="ins-comp-kg">${r.kg.toFixed(1)}</span>
    </div>
  `).join('');
}

function renderTop() {
  const el = document.getElementById('ins-top');
  if (!el) return;
  const all = [];
  Object.keys(ACTIVITIES).forEach(cat => {
    ACTIVITIES[cat].forEach(act => {
      const kg = (values[act.id] || 0) * act.f;
      if (kg > 0) all.push({ ...act, kg });
    });
  });
  all.sort((a, b) => b.kg - a.kg);
  const top = all.slice(0, 5);
  const max = top[0]?.kg || 1;
  el.innerHTML = top.map(a => `
    <div class="ins-top-row">
      <span class="ins-top-em">${a.em}</span>
      <span class="ins-top-name">${a.name}</span>
      <div class="ins-top-bar-w">
        <div class="ins-top-bar" style="width:${(a.kg/max*100).toFixed(0)}%;background:${a.color}"></div>
      </div>
      <span class="ins-top-kg">${a.kg.toFixed(2)} kg</span>
    </div>
  `).join('') || '<p style="padding:.5rem;font-size:13px;color:var(--text-muted)">No activities logged yet.</p>';
}

function renderEquiv(kg) {
  const el = document.getElementById('ins-equiv');
  if (!el) return;
  const items = [
    { em:'🌳', val: (kg / 21.77).toFixed(1),   desc:'trees to offset for one year' },
    { em:'🚗', val: (kg / 0.21).toFixed(0),     desc:'km driven in a petrol car' },
    { em:'📱', val: (kg * 1000 / 8.2).toFixed(0), desc:'smartphone charges' },
    { em:'💡', val: (kg / 0.082).toFixed(0),    desc:'hours of LED lighting' },
  ];
  el.innerHTML = items.map(i => `
    <div class="ins-equiv-item">
      <div class="ins-equiv-em">${i.em}</div>
      <div class="ins-equiv-val">${i.val}</div>
      <div class="ins-equiv-desc">${i.desc}</div>
    </div>
  `).join('');
}

/* ─── TIPS ───────────────────────────── */
function renderTips() {
  const el = document.getElementById('tips-list');
  const sub = document.getElementById('tips-sub');
  if (!el) return;

  // Gather all activities with logged values, sorted by CO₂
  const logged = [];
  const unlogged = [];
  Object.keys(ACTIVITIES).forEach(cat => {
    ACTIVITIES[cat].forEach(act => {
      const kg = (values[act.id] || 0) * act.f;
      if (kg > 0) logged.push({ ...act, kg });
      else unlogged.push({ ...act, kg: 0 });
    });
  });
  logged.sort((a, b) => b.kg - a.kg);

  const hasLogged = logged.length > 0;
  if (sub) {
    sub.textContent = hasLogged
      ? `Ranked by your emissions — biggest opportunities first`
      : `Log your activities on the Track tab to get personalised suggestions`;
  }

  const items = hasLogged ? [...logged, ...unlogged] : unlogged;
  el.innerHTML = items.map((act, i) => `
    <div class="tip-item ${i < 3 && act.kg > 0 ? 'priority' : ''}">
      <div class="tip-ic" style="background:${act.bg}">${act.em}</div>
      <div>
        <div class="tip-title">${act.name}${act.kg > 0 ? ` — ${act.kg.toFixed(2)} kg today` : ''}</div>
        <div class="tip-body">${act.tip}</div>
        <div class="tip-tags">
          <span class="tip-tag save">Save ${act.save}</span>
          <span class="tip-tag diff">${act.diff}</span>
          ${act.kg > 0 ? '<span class="tip-tag logged">✓ Logged today</span>' : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/* ─── HISTORY ────────────────────────── */
function renderHistory() {
  const rowsEl = document.getElementById('hist-rows');
  const summEl = document.getElementById('hist-summary');
  if (!rowsEl) return;

  if (history.length === 0) {
    if (summEl) summEl.style.display = 'none';
    rowsEl.innerHTML = `
      <div class="a-empty">
        <div class="a-empty-icon">📅</div>
        <div class="a-empty-title">No logs yet</div>
        <div class="a-empty-body">Save today's entry from the Track tab to start your history.</div>
      </div>`;
    return;
  }

  if (summEl) {
    summEl.style.display = 'grid';
    const recent7 = history.slice(0, 7);
    const avg7 = recent7.reduce((s, h) => s + h.kg, 0) / recent7.length;
    const best  = Math.min(...history.map(h => h.kg));
    document.getElementById('hs-avg').textContent  = avg7.toFixed(1) + ' kg';
    document.getElementById('hs-best').textContent = best.toFixed(1) + ' kg';
    document.getElementById('hs-logged').textContent = history.length;
  }

  const maxKg = Math.max(...history.map(h => h.kg), 0.01);
  rowsEl.innerHTML = history.map(h => {
    const pct = (h.kg / maxKg * 100).toFixed(1);
    const color = h.kg < INDIA_AVG ? '#16a34a' : h.kg < WORLD_AVG ? '#f59e0b' : '#ef4444';
    const scBg  = h.score >= 70 ? '#dcfce7' : h.score >= 40 ? '#fef3c7' : '#fee2e2';
    const scC   = h.score >= 70 ? '#166534' : h.score >= 40 ? '#92400e' : '#991b1b';
    return `
      <div class="hist-row">
        <span class="hist-date">${h.date}</span>
        <div class="hist-bar-w"><div class="hist-bar" style="width:${pct}%;background:${color}"></div></div>
        <span class="hist-kg">${h.kg.toFixed(1)} kg</span>
        <span class="hist-sc" style="background:${scBg};color:${scC}">${h.score}</span>
      </div>`;
  }).join('');
}

/* ─── TOAST ──────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─── HELPERS ────────────────────────── */
function findAct(id) {
  for (const cat of Object.values(ACTIVITIES)) {
    const a = cat.find(a => a.id === id);
    if (a) return a;
  }
  return null;
}
