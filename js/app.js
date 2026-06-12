// ===== SECURITY: Input sanitizer =====
function sanitize(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

function safeParseFloat(val) {
  const n = parseFloat(val);
  if (isNaN(n) || !isFinite(n) || n < 0) return 0;
  return Math.min(n, 99999); // max cap to prevent abuse
}

// ===== STATE =====
const vals = {};
let history = [];
try {
  const raw = localStorage.getItem('ecotrace-history');
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) history = parsed;
  }
} catch(e) { history = []; }

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('app-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
  Object.values(ACTIVITIES).flat().forEach(a => vals[a.id] = 0);
  buildAllCards();
  renderHistory();
  updateAll();
  renderTips();
});

// ===== BUILD ACTIVITY CARDS =====
function buildAllCards() {
  buildCard('transport', 'card-transport');
  buildCard('home',      'card-home');
  buildCard('food',      'card-food');
  buildCard('shopping',  'card-shopping');
}

function buildCard(catKey, cardId) {
  const card = document.getElementById(cardId);
  ACTIVITIES[catKey].forEach(act => {
    const row = document.createElement('div');
    row.className = 'act-row';
    row.setAttribute('role', 'listitem');
    // Safe: act.name/unit come from our own data.js constants, not user input
    row.innerHTML = `
      <div class="act-emoji" aria-hidden="true">${sanitize(act.emoji)}</div>
      <div>
        <label class="act-name" for="inp-${sanitize(act.id)}">${sanitize(act.name)}</label>
        <div class="act-factor">${sanitize(String(act.factor))} kg CO₂e / ${sanitize(act.unit)}</div>
      </div>
      <div class="act-input-wrap">
        <input class="act-input" type="number" min="0" max="99999" step="0.5"
          id="inp-${sanitize(act.id)}" placeholder="0"
          oninput="onInput('${sanitize(act.id)}',${Number(act.factor)},'${sanitize(catKey)}',this.value)"
          aria-label="Enter ${sanitize(act.name)} amount in ${sanitize(act.unit)}"
          aria-describedby="badge-${sanitize(act.id)}">
        <span class="act-unit" aria-label="unit">${sanitize(act.unit)}</span>
      </div>
      <div class="act-badge" id="badge-${sanitize(act.id)}" aria-live="polite" aria-label="${sanitize(act.name)} CO2 emissions">0 kg</div>
    `;
    card.appendChild(row);
  });
}

// ===== INPUT HANDLER =====
function onInput(id, factor, catKey, rawVal) {
  const v = safeParseFloat(rawVal);
  vals[id] = v;
  const co2 = v * factor;
  const badge = document.getElementById('badge-' + id);
  if (badge) {
    badge.textContent = co2.toFixed(2) + ' kg';
    badge.classList.toggle('active', co2 > 0);
  }
  updateAll();
}

// ===== TOTALS =====
function catTotal(catKey) {
  return ACTIVITIES[catKey].reduce((s, a) => s + (vals[a.id] || 0) * a.factor, 0);
}
function totalCO2() {
  return ['transport','home','food','shopping'].reduce((s,k) => s + catTotal(k), 0);
}

// ===== MASTER UPDATE =====
function updateAll() {
  const t  = totalCO2();
  const tT = catTotal('transport');
  const tH = catTotal('home');
  const tF = catTotal('food');
  const tS = catTotal('shopping');

  // Card totals
  document.getElementById('tot-transport').textContent = tT.toFixed(2) + ' kg';
  document.getElementById('tot-home').textContent      = tH.toFixed(2) + ' kg';
  document.getElementById('tot-food').textContent      = tF.toFixed(2) + ' kg';
  document.getElementById('tot-shopping').textContent  = tS.toFixed(2) + ' kg';

  const score = t === 0 ? null : Math.max(0, Math.min(100, Math.round(100 - (t / 15) * 85)));

  // Dash strip
  document.getElementById('dash-num').textContent = t.toFixed(1);
  document.getElementById('m-week').textContent   = (t * 7).toFixed(1);
  document.getElementById('m-trees').textContent  = Math.ceil(t / 0.06);

  const vsIndia = t > 0 ? Math.round(t / INDIA_AVG * 100) : null;
  const mVs = document.getElementById('m-vs');
  mVs.textContent = vsIndia ? vsIndia + '%' : '—';

  // Score ring
  const scoreContainer = document.getElementById('score-container');
  if (score !== null) {
    document.getElementById('score-val').textContent = score;
    document.getElementById('score-circle').style.strokeDashoffset = 352 - (352 * score / 100);
    if (scoreContainer) scoreContainer.setAttribute('aria-label', `Eco score: ${score} out of 100`);
  } else {
    document.getElementById('score-val').textContent = '—';
    document.getElementById('score-circle').style.strokeDashoffset = 352;
    if (scoreContainer) scoreContainer.setAttribute('aria-label', 'Eco score: not yet calculated');
  }

  // Dash sub + badges
  let subText = 'Start logging your activities below';
  const badges = document.getElementById('dash-badges');
  badges.innerHTML = '';
  if (t > 0) {
    if (score >= 70)      subText = `You're well below the world average of 12 kg/day 🎉`;
    else if (score >= 40) subText = `Around average — a few swaps could make a big difference`;
    else                  subText = `Above average — check the Tips tab for quick wins`;

    const bClass = score >= 70 ? 'good' : score >= 40 ? 'warn' : 'bad';
    const bLabel = score >= 70 ? '✓ Excellent' : score >= 40 ? '~ Average' : '⚠ High';
    // Use textContent for badge text (no innerHTML with user data)
    const badge1 = document.createElement('span');
    badge1.className = `eco-badge ${bClass}`;
    badge1.textContent = bLabel;
    const badge2 = document.createElement('span');
    badge2.className = 'eco-badge';
    badge2.textContent = `${vsIndia}% of India avg`;
    const badge3 = document.createElement('span');
    badge3.className = 'eco-badge';
    badge3.textContent = `${Math.ceil(t/0.06)} trees to offset`;
    badges.appendChild(badge1);
    badges.appendChild(badge2);
    badges.appendChild(badge3);
  }
  document.getElementById('dash-sub').textContent = subText;

  updateInsights(t, tT, tH, tF, tS, score);
  renderTips();
}

// ===== INSIGHTS =====
function updateInsights(t, tT, tH, tF, tS, score) {
  const empty   = document.getElementById('insights-empty');
  const content = document.getElementById('insights-content');

  if (t === 0) {
    empty.classList.remove('hidden');
    content.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  content.classList.remove('hidden');

  // Category bars
  const cats = [
    { label: 'Transport', val: tT, color: '#ef4444' },
    { label: 'Home',      val: tH, color: '#f59e0b' },
    { label: 'Food',      val: tF, color: '#22c55e' },
    { label: 'Shopping',  val: tS, color: '#8b5cf6' },
  ];
  const maxCat = Math.max(...cats.map(c => c.val), 0.01);
  const catBarsEl = document.getElementById('cat-bars');
  catBarsEl.innerHTML = '';
  cats.forEach(c => {
    const pct = Math.round(c.val / maxCat * 100);
    const div = document.createElement('div');
    div.className = 'ibar-row';
    div.setAttribute('role', 'listitem');
    div.setAttribute('aria-label', `${c.label}: ${c.val.toFixed(2)} kg CO2`);
    div.innerHTML = `
      <div class="ibar-meta">
        <span class="ibar-name">${sanitize(c.label)}</span>
        <span class="ibar-val">${c.val.toFixed(2)} kg</span>
      </div>
      <div class="ibar-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${sanitize(c.label)} emissions proportion">
        <div class="ibar-fill" style="width:${pct}%;background:${sanitize(c.color)}"></div>
      </div>`;
    catBarsEl.appendChild(div);
  });

  // Compare bars
  const MAX_COMP = 50;
  const compRows = [
    { who: 'You today', val: t,        color: '#16a34a' },
    { who: 'India avg', val: INDIA_AVG, color: '#9ca3af' },
    { who: 'World avg', val: WORLD_AVG, color: '#9ca3af' },
    { who: 'US avg',    val: US_AVG,    color: '#9ca3af' },
  ];
  const compBarsEl = document.getElementById('compare-bars');
  compBarsEl.innerHTML = '';
  compRows.forEach(c => {
    const pct = Math.min(100, Math.round(c.val / MAX_COMP * 100));
    const div = document.createElement('div');
    div.className = 'comp-row';
    div.setAttribute('role', 'listitem');
    div.innerHTML = `
      <span class="comp-who">${sanitize(c.who)}</span>
      <div class="comp-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${sanitize(c.who)}: ${c.val.toFixed(1)} kg per day">
        <div class="comp-fill" style="width:${pct}%;background:${sanitize(c.color)}"></div>
      </div>
      <span class="comp-kg">${c.val.toFixed(1)}</span>`;
    compBarsEl.appendChild(div);
  });

  // Top contributors
  const allActs = Object.values(ACTIVITIES).flat()
    .map(a => ({ name: a.name, emoji: a.emoji, val: (vals[a.id]||0)*a.factor, color: a.color }))
    .filter(a => a.val > 0)
    .sort((a,b) => b.val - a.val)
    .slice(0, 6);

  const topEl = document.getElementById('top-contributors');
  topEl.innerHTML = '';
  if (allActs.length === 0) {
    const p = document.createElement('p');
    p.style.cssText = 'padding:1rem;color:var(--text-muted);font-size:14px';
    p.textContent = 'Nothing logged yet.';
    topEl.appendChild(p);
  } else {
    const maxAct = Math.max(...allActs.map(a => a.val), 0.01);
    allActs.forEach(a => {
      const pct = Math.round(a.val / maxAct * 100);
      const div = document.createElement('div');
      div.className = 'contrib-row';
      div.setAttribute('role', 'listitem');
      div.setAttribute('aria-label', `${a.name}: ${a.val.toFixed(2)} kg CO2`);
      div.innerHTML = `
        <div class="contrib-emoji" aria-hidden="true">${sanitize(a.emoji)}</div>
        <div class="contrib-name">${sanitize(a.name)}</div>
        <div class="contrib-bar-wrap" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="contrib-bar" style="width:${pct}%;background:${sanitize(a.color)}"></div>
        </div>
        <div class="contrib-kg">${a.val.toFixed(2)} kg</div>`;
      topEl.appendChild(div);
    });
  }

  // Environmental equivalents
  const equivEl = document.getElementById('equiv-grid');
  equivEl.innerHTML = '';
  const equivData = [
    { em:'🌳', val: Math.ceil(t/0.06),           desc:'trees to absorb today\'s CO₂ in a year' },
    { em:'🚗', val: (t/0.21).toFixed(0) + ' km', desc:'equivalent petrol car distance' },
    { em:'💡', val: (t/0.082).toFixed(0) + ' h', desc:'LED bulb runtime equivalent' },
    { em:'📱', val: Math.round(t/0.007),          desc:'smartphone charges equivalent' },
  ];
  equivData.forEach(e => {
    const div = document.createElement('div');
    div.className = 'equiv-item';
    div.setAttribute('role', 'listitem');
    div.setAttribute('aria-label', `${e.val} ${e.desc}`);
    div.innerHTML = `
      <div class="equiv-emoji" aria-hidden="true">${sanitize(e.em)}</div>
      <div class="equiv-val">${sanitize(String(e.val))}</div>
      <div class="equiv-desc">${sanitize(e.desc)}</div>`;
    equivEl.appendChild(div);
  });
}

// ===== TIPS =====
function renderTips() {
  const allActs = Object.values(ACTIVITIES).flat();
  const sorted = [...allActs].sort((a, b) => {
    const aLogged = (vals[a.id] || 0) > 0 ? 1 : 0;
    const bLogged = (vals[b.id] || 0) > 0 ? 1 : 0;
    if (bLogged !== aLogged) return bLogged - aLogged;
    return b.factor - a.factor;
  });

  const tipColors = {
    transport: '#FAECE7', home: '#FAEEDA', food: '#EAF3DE', shopping: '#EDE9FE'
  };
  function catOf(id) {
    for (const [k, acts] of Object.entries(ACTIVITIES)) {
      if (acts.find(a => a.id === id)) return k;
    }
    return 'transport';
  }

  const loggedTotal = totalCO2();
  document.getElementById('tips-sub').textContent = loggedTotal > 0
    ? `Based on your ${loggedTotal.toFixed(1)} kg logged today — ranked by biggest savings`
    : 'General tips ranked by impact — log activities for personalised advice';

  const tipsList = document.getElementById('tips-list');
  tipsList.innerHTML = '';
  sorted.slice(0, 10).forEach((a, i) => {
    const isLogged = (vals[a.id] || 0) > 0;
    const cat = catOf(a.id);
    const bg  = tipColors[cat] || '#f3f4f6';
    const div = document.createElement('div');
    div.className = `tip-item ${i < 3 ? 'priority' : ''}`;
    div.setAttribute('role', 'listitem');
    div.setAttribute('aria-label', `Tip for ${a.name}: ${a.tip}`);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'tip-title';
    nameSpan.textContent = a.name;
    if (isLogged) {
      const logged = document.createElement('span');
      logged.style.cssText = 'color:var(--green);font-size:11px;margin-left:6px';
      logged.textContent = '● logged';
      logged.setAttribute('aria-label', 'You have logged this activity today');
      nameSpan.appendChild(logged);
    }

    div.innerHTML = `
      <div class="tip-emoji-wrap" style="background:${sanitize(bg)}" aria-hidden="true">${sanitize(a.emoji)}</div>
      <div style="flex:1">
        <div class="tip-title-wrap"></div>
        <div class="tip-body">${sanitize(a.tip)}</div>
        <div class="tip-tags">
          <span class="tip-tag save" aria-label="Potential saving: ${sanitize(a.save)}">Save ${sanitize(a.save)}</span>
          <span class="tip-tag diff" aria-label="Impact level: ${sanitize(a.diff)}">${sanitize(a.diff)}</span>
        </div>
      </div>`;
    div.querySelector('.tip-title-wrap').appendChild(nameSpan);
    tipsList.appendChild(div);
  });
}

// ===== HISTORY =====
function saveDay() {
  const t = totalCO2();
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
  const filtered = history.filter(h => h.date !== today);
  filtered.unshift({ date: today, kg: parseFloat(t.toFixed(2)) });
  if (filtered.length > 30) filtered.pop();
  history = filtered;
  try {
    localStorage.setItem('ecotrace-history', JSON.stringify(history));
  } catch(e) {
    console.warn('Could not save to localStorage:', e);
  }
  renderHistory();
  showToast('✅ Today\'s log saved!');
}

function resetDay() {
  Object.keys(vals).forEach(k => vals[k] = 0);
  document.querySelectorAll('.act-input').forEach(inp => inp.value = '');
  document.querySelectorAll('.act-badge').forEach(b => {
    b.textContent = '0 kg';
    b.classList.remove('active');
  });
  ['transport','home','food','shopping'].forEach(k => {
    const el = document.getElementById('tot-' + k);
    if (el) el.textContent = '0.00 kg';
  });
  updateAll();
  showToast('↺ Reset for today');
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (history.length === 0) {
    list.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'empty-state small';
    empty.setAttribute('role', 'status');
    empty.innerHTML = `
      <div class="empty-icon" aria-hidden="true">📅</div>
      <div class="empty-title">No history yet</div>
      <div class="empty-body">Save today's entry to start tracking your progress.</div>`;
    list.appendChild(empty);
    document.getElementById('history-summary').style.display = 'none';
    return;
  }

  const maxKg   = Math.max(...history.map(h => h.kg), 0.01);
  const recent7 = history.slice(0, 7);
  const avg7    = (recent7.reduce((s, h) => s + h.kg, 0) / recent7.length).toFixed(1);
  const best    = Math.min(...history.map(h => h.kg)).toFixed(1);
  const streak  = history.length;

  document.getElementById('hs-avg').textContent    = avg7 + ' kg';
  document.getElementById('hs-best').textContent   = best + ' kg';
  document.getElementById('hs-streak').textContent = streak;
  document.getElementById('history-summary').style.display = 'grid';

  list.innerHTML = '';
  history.forEach(h => {
    const score = Math.max(0, Math.min(100, Math.round(100 - (h.kg/15)*85)));
    const bgColor = score >= 70 ? '#dcfce7' : score >= 40 ? '#fef9c3' : '#fee2e2';
    const txtColor = score >= 70 ? '#14532d' : score >= 40 ? '#713f12' : '#991b1b';
    const barColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
    const pct = Math.round(h.kg / maxKg * 100);

    const row = document.createElement('div');
    row.className = 'hist-row';
    row.setAttribute('role', 'listitem');
    row.setAttribute('aria-label', `${h.date}: ${h.kg} kg CO2, eco score ${score}`);
    row.innerHTML = `
      <div class="hist-date">${sanitize(h.date)}</div>
      <div class="hist-bar-wrap" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <div class="hist-bar" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div class="hist-kg">${h.kg} kg</div>
      <span class="hist-badge" style="background:${bgColor};color:${txtColor}">${score}</span>`;
    list.appendChild(row);
  });
}

// ===== NAV =====
function switchTab(name, btn) {
  document.querySelectorAll('.anav-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('tab-' + name);
  if (panel) panel.classList.add('active');
}

function startApp() {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  window.scrollTo(0, 0);
  document.querySelector('.anav-btn[data-tab="track"]').focus();
}

function goLanding() {
  document.getElementById('app').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
  window.scrollTo(0, 0);
}

function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; // textContent not innerHTML — safe
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const app = document.getElementById('app');
    if (!app.classList.contains('hidden')) goLanding();
  }
});
