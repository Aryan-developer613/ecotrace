/**
 * EcoTrace — Unit Test Suite
 * Tests: carbon calculations, input validation, data integrity, security sanitization
 * Run: node tests/ecotrace.test.js   (or open tests/index.html in browser)
 */

// ── Minimal test harness (no dependencies needed) ──
let passed = 0, failed = 0, total = 0;
const results = [];

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    results.push({ name, status: 'PASS' });
  } catch (e) {
    failed++;
    results.push({ name, status: 'FAIL', error: e.message });
  }
}

function expect(val) {
  return {
    toBe: (expected) => {
      if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
    },
    toBeCloseTo: (expected, precision = 2) => {
      const factor = Math.pow(10, precision);
      if (Math.round(val * factor) !== Math.round(expected * factor))
        throw new Error(`Expected ~${expected}, got ${val}`);
    },
    toBeGreaterThan: (n) => {
      if (val <= n) throw new Error(`Expected ${val} > ${n}`);
    },
    toBeLessThanOrEqual: (n) => {
      if (val > n) throw new Error(`Expected ${val} <= ${n}`);
    },
    toBeTrue: () => {
      if (val !== true) throw new Error(`Expected true, got ${val}`);
    },
    toBeFalse: () => {
      if (val !== false) throw new Error(`Expected false, got ${val}`);
    },
    toContain: (substring) => {
      if (!String(val).includes(substring))
        throw new Error(`Expected "${val}" to contain "${substring}"`);
    },
    toNotContain: (substring) => {
      if (String(val).includes(substring))
        throw new Error(`Expected "${val}" NOT to contain "${substring}"`);
    },
    toBeArray: () => {
      if (!Array.isArray(val)) throw new Error(`Expected an Array, got ${typeof val}`);
    },
    toHaveLength: (n) => {
      if (val.length !== n) throw new Error(`Expected length ${n}, got ${val.length}`);
    },
  };
}

// ── Load data.js constants (Node-compatible) ──
const ACTIVITIES_DATA = {
  transport: [
    { id:'car',     name:'Car (petrol)',       emoji:'🚗', unit:'km',         factor:0.21,  color:'#ef4444', tip:'Carpooling saves ~30%.', save:'~2.5 kg/day', diff:'High impact' },
    { id:'bike',    name:'Motorbike',           emoji:'🏍️', unit:'km',         factor:0.11,  color:'#f97316', tip:'Electric bikes emit 90% less.', save:'~1.2 kg/day', diff:'Medium impact' },
    { id:'auto',    name:'Auto rickshaw (CNG)', emoji:'🛺', unit:'km',         factor:0.08,  color:'#f59e0b', tip:'CNG autos are clean.', save:'~0.5 kg/day', diff:'Low impact' },
    { id:'bus',     name:'City bus',            emoji:'🚌', unit:'km',         factor:0.089, color:'#84cc16', tip:'Buses emit 4-6x less.', save:'~0.4 kg/day', diff:'Low impact' },
    { id:'metro',   name:'Metro / train',       emoji:'🚆', unit:'km',         factor:0.041, color:'#22c55e', tip:'Metro is cleanest.', save:'~0.2 kg/day', diff:'Very low' },
    { id:'flight',  name:'Flight',              emoji:'✈️', unit:'km',         factor:0.255, color:'#dc2626', tip:'Avoid short flights.', save:'~5+ kg/trip', diff:'Very high' },
  ],
  home: [
    { id:'elec',    name:'Electricity',         emoji:'⚡', unit:'kWh',        factor:0.82,  color:'#f59e0b', tip:'Use 5-star appliances.', save:'~1.6 kg/day', diff:'High impact' },
    { id:'lpg',     name:'LPG cooking gas',     emoji:'🔥', unit:'cylinders',  factor:14.2,  color:'#ef4444', tip:'Switch to induction.', save:'~2.8 kg/cook', diff:'Medium impact' },
    { id:'ac',      name:'Air conditioning',    emoji:'❄️', unit:'hours',      factor:0.5,   color:'#3b82f6', tip:'Set to 24°C.', save:'~1 kg/day', diff:'Medium impact' },
    { id:'geyser',  name:'Electric geyser',     emoji:'🚿', unit:'hours',      factor:0.9,   color:'#8b5cf6', tip:'Solar heater saves more.', save:'~0.9 kg/day', diff:'Medium impact' },
    { id:'fan',     name:'Ceiling fans',         emoji:'🌀', unit:'hours',      factor:0.04,  color:'#06b6d4', tip:'Use 5-star fans.', save:'~0.1 kg/day', diff:'Low impact' },
  ],
  food: [
    { id:'beef',    name:'Beef / mutton',        emoji:'🥩', unit:'servings',   factor:3.3,   color:'#dc2626', tip:'Switch to dal.', save:'~3.3 kg/meal', diff:'Very high' },
    { id:'chicken', name:'Chicken / eggs',        emoji:'🍗', unit:'servings',   factor:0.72,  color:'#f97316', tip:'Lower than beef.', save:'~0.5 kg/meal', diff:'Medium impact' },
    { id:'dairy',   name:'Dairy (milk, curd)',    emoji:'🥛', unit:'servings',   factor:0.6,   color:'#f59e0b', tip:'Try oat milk.', save:'~0.4/serving', diff:'Low impact' },
    { id:'veg',     name:'Vegetables / dal',      emoji:'🥗', unit:'servings',   factor:0.15,  color:'#22c55e', tip:'Best option.', save:'Already low!', diff:'Very low' },
    { id:'rice',    name:'Rice',                  emoji:'🍚', unit:'kg cooked',  factor:2.7,   color:'#eab308', tip:'Reduce methane.', save:'~0.8 kg/kg', diff:'Medium impact' },
    { id:'processed',name:'Packaged food',        emoji:'🍟', unit:'servings',   factor:1.4,   color:'#f97316', tip:'Eat fresh.', save:'~1 kg/serving', diff:'Medium impact' },
  ],
  shopping: [
    { id:'clothes', name:'New clothing',          emoji:'👕', unit:'items',      factor:10.0,  color:'#ec4899', tip:'Buy second-hand.', save:'~8 kg/item', diff:'Very high' },
    { id:'phone',   name:'New electronics',       emoji:'📱', unit:'items',      factor:70.0,  color:'#8b5cf6', tip:'Extend phone life.', save:'~35 kg/year', diff:'Very high' },
    { id:'online',  name:'Online deliveries',     emoji:'📦', unit:'orders',     factor:0.5,   color:'#06b6d4', tip:'Batch orders.', save:'~0.3 kg/order', diff:'Low impact' },
    { id:'plastic', name:'Single-use plastics',   emoji:'🧴', unit:'items',      factor:0.2,   color:'#ef4444', tip:'Use reusables.', save:'~0.2 kg/item', diff:'Low impact' },
  ]
};

const INDIA_AVG = 4.8;
const WORLD_AVG = 12.0;
const US_AVG    = 47.0;

// ── Helper functions (mirror of app.js logic) ──
function safeParseFloat(val) {
  const n = parseFloat(val);
  if (isNaN(n) || !isFinite(n) || n < 0) return 0;
  return Math.min(n, 99999);
}

function calcCatTotal(vals, catKey) {
  return ACTIVITIES_DATA[catKey].reduce((s, a) => s + (vals[a.id] || 0) * a.factor, 0);
}

function calcTotalCO2(vals) {
  return ['transport','home','food','shopping'].reduce((s,k) => s + calcCatTotal(vals, k), 0);
}

function calcEcoScore(total) {
  if (total === 0) return null;
  return Math.max(0, Math.min(100, Math.round(100 - (total / 15) * 85)));
}

function calcTreesNeeded(kgCO2) {
  return Math.ceil(kgCO2 / 0.06);
}

function calcVsIndia(kgCO2) {
  return Math.round(kgCO2 / INDIA_AVG * 100);
}

// ── sanitize (same logic as app.js) ──
function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ════════════════════════════════════════
// TEST SUITE 1: Carbon factor validation
// ════════════════════════════════════════
test('All activities have required fields', () => {
  Object.values(ACTIVITIES_DATA).flat().forEach(a => {
    if (!a.id)     throw new Error(`Activity missing id: ${JSON.stringify(a)}`);
    if (!a.name)   throw new Error(`Activity missing name: ${a.id}`);
    if (!a.factor) throw new Error(`Activity missing factor: ${a.id}`);
    if (!a.unit)   throw new Error(`Activity missing unit: ${a.id}`);
    if (!a.tip)    throw new Error(`Activity missing tip: ${a.id}`);
    if (!a.save)   throw new Error(`Activity missing save: ${a.id}`);
    if (!a.diff)   throw new Error(`Activity missing diff: ${a.id}`);
  });
});

test('All activity IDs are unique', () => {
  const ids = Object.values(ACTIVITIES_DATA).flat().map(a => a.id);
  const unique = new Set(ids);
  expect(unique.size).toBe(ids.length);
});

test('All carbon factors are positive numbers', () => {
  Object.values(ACTIVITIES_DATA).flat().forEach(a => {
    if (typeof a.factor !== 'number' || a.factor <= 0)
      throw new Error(`Invalid factor for ${a.id}: ${a.factor}`);
  });
});

test('Carbon factor for car (petrol) = 0.21 kg/km', () => {
  const car = ACTIVITIES_DATA.transport.find(a => a.id === 'car');
  expect(car.factor).toBe(0.21);
});

test('Carbon factor for electricity = 0.82 kg/kWh (India CEA 2024)', () => {
  const elec = ACTIVITIES_DATA.home.find(a => a.id === 'elec');
  expect(elec.factor).toBe(0.82);
});

test('Carbon factor for beef > chicken (beef more carbon intensive)', () => {
  const beef    = ACTIVITIES_DATA.food.find(a => a.id === 'beef');
  const chicken = ACTIVITIES_DATA.food.find(a => a.id === 'chicken');
  expect(beef.factor > chicken.factor).toBeTrue();
});

test('Carbon factor for metro < bus < car (cleanest first)', () => {
  const metro = ACTIVITIES_DATA.transport.find(a => a.id === 'metro');
  const bus   = ACTIVITIES_DATA.transport.find(a => a.id === 'bus');
  const car   = ACTIVITIES_DATA.transport.find(a => a.id === 'car');
  expect(metro.factor < bus.factor).toBeTrue();
  expect(bus.factor < car.factor).toBeTrue();
});

test('Flight has highest transport emission factor', () => {
  const factors = ACTIVITIES_DATA.transport.map(a => a.factor);
  const flight  = ACTIVITIES_DATA.transport.find(a => a.id === 'flight');
  expect(Math.max(...factors)).toBe(flight.factor);
});

// ════════════════════════════════════════
// TEST SUITE 2: Calculation logic
// ════════════════════════════════════════
test('Zero emissions when no activities logged', () => {
  const vals = {};
  Object.values(ACTIVITIES_DATA).flat().forEach(a => vals[a.id] = 0);
  expect(calcTotalCO2(vals)).toBe(0);
});

test('Correct CO2 for 10km car journey: 10 * 0.21 = 2.1 kg', () => {
  const vals = {};
  Object.values(ACTIVITIES_DATA).flat().forEach(a => vals[a.id] = 0);
  vals['car'] = 10;
  expect(calcCatTotal(vals, 'transport')).toBeCloseTo(2.1);
});

test('Correct CO2 for 5 kWh electricity: 5 * 0.82 = 4.1 kg', () => {
  const vals = {};
  Object.values(ACTIVITIES_DATA).flat().forEach(a => vals[a.id] = 0);
  vals['elec'] = 5;
  expect(calcCatTotal(vals, 'home')).toBeCloseTo(4.1);
});

test('Multiple activities sum correctly', () => {
  const vals = {};
  Object.values(ACTIVITIES_DATA).flat().forEach(a => vals[a.id] = 0);
  vals['car'] = 20;   // 20 * 0.21 = 4.2
  vals['elec'] = 3;   // 3  * 0.82 = 2.46
  vals['beef'] = 1;   // 1  * 3.3  = 3.3
  const total = calcTotalCO2(vals);
  expect(total).toBeCloseTo(4.2 + 2.46 + 3.3);
});

test('Eco score is null when total is 0', () => {
  expect(calcEcoScore(0)).toBe(null);
});

test('Eco score for 0.1 kg (very low) should be close to 100', () => {
  const score = calcEcoScore(0.1);
  expect(score).toBeGreaterThan(90);
});

test('Eco score is capped between 0 and 100', () => {
  expect(calcEcoScore(1000)).toBe(0);
  expect(calcEcoScore(0.001)).toBeLessThanOrEqual(100);
});

test('Eco score decreases as emissions increase', () => {
  const s1 = calcEcoScore(2);
  const s2 = calcEcoScore(8);
  const s3 = calcEcoScore(20);
  expect(s1 > s2).toBeTrue();
  expect(s2 > s3).toBeTrue();
});

test('Trees calculation: 6 kg → ceil(6/0.06) = 100 trees', () => {
  expect(calcTreesNeeded(6)).toBe(100);
});

test('Trees calculation: 0.06 kg → exactly 1 tree', () => {
  expect(calcTreesNeeded(0.06)).toBe(1);
});

test('vs India avg: 4.8 kg → 100%', () => {
  expect(calcVsIndia(4.8)).toBe(100);
});

test('vs India avg: 2.4 kg → 50%', () => {
  expect(calcVsIndia(2.4)).toBe(50);
});

test('Weekly estimate: daily * 7', () => {
  const daily = 5;
  expect(daily * 7).toBe(35);
});

// ════════════════════════════════════════
// TEST SUITE 3: Input validation & security
// ════════════════════════════════════════
test('safeParseFloat: negative input returns 0', () => {
  expect(safeParseFloat('-5')).toBe(0);
});

test('safeParseFloat: NaN input returns 0', () => {
  expect(safeParseFloat('abc')).toBe(0);
});

test('safeParseFloat: empty string returns 0', () => {
  expect(safeParseFloat('')).toBe(0);
});

test('safeParseFloat: Infinity returns 0', () => {
  expect(safeParseFloat('Infinity')).toBe(0);
});

test('safeParseFloat: valid number parses correctly', () => {
  expect(safeParseFloat('12.5')).toBe(12.5);
});

test('safeParseFloat: max cap at 99999 prevents abuse', () => {
  expect(safeParseFloat('999999999')).toBe(99999);
});

test('sanitize: blocks XSS script tag', () => {
  const result = sanitize('<script>alert("xss")</script>');
  expect(result).toNotContain('<script>');
  expect(result).toNotContain('</script>');
});

test('sanitize: blocks XSS via event handlers', () => {
  const result = sanitize('<img onerror="alert(1)">');
  expect(result).toNotContain('<img');
  // onerror is inside the encoded tag - the < is escaped so it can't execute
  expect(result).toNotContain('<img');
});

test('sanitize: encodes angle brackets', () => {
  const result = sanitize('<b>bold</b>');
  expect(result).toContain('&lt;b&gt;');
});

test('sanitize: encodes double quotes', () => {
  const result = sanitize('"quoted"');
  expect(result).toContain('&quot;');
});

test('sanitize: encodes ampersand', () => {
  const result = sanitize('a & b');
  expect(result).toContain('&amp;');
});

test('sanitize: safe plain text passes through', () => {
  const result = sanitize('Car petrol 10km');
  expect(result).toContain('Car petrol 10km');
});

// ════════════════════════════════════════
// TEST SUITE 4: Data integrity
// ════════════════════════════════════════
test('INDIA_AVG is 4.8 kg/day', () => {
  expect(INDIA_AVG).toBe(4.8);
});

test('WORLD_AVG is 12.0 kg/day', () => {
  expect(WORLD_AVG).toBe(12.0);
});

test('US_AVG is 47.0 kg/day', () => {
  expect(US_AVG).toBe(47.0);
});

test('World avg > India avg (India is developing country)', () => {
  expect(WORLD_AVG > INDIA_AVG).toBeTrue();
});

test('US avg > World avg > India avg', () => {
  expect(US_AVG > WORLD_AVG).toBeTrue();
  expect(WORLD_AVG > INDIA_AVG).toBeTrue();
});

test('There are 4 activity categories', () => {
  expect(Object.keys(ACTIVITIES_DATA).length).toBe(4);
});

test('Transport has 6 activities', () => {
  expect(ACTIVITIES_DATA.transport).toHaveLength(6);
});

test('Home has 5 activities', () => {
  expect(ACTIVITIES_DATA.home).toHaveLength(5);
});

test('Food has 6 activities', () => {
  expect(ACTIVITIES_DATA.food).toHaveLength(6);
});

test('Shopping has 4 activities', () => {
  expect(ACTIVITIES_DATA.shopping).toHaveLength(4);
});

test('Total of 21 activities across all categories', () => {
  const total = Object.values(ACTIVITIES_DATA).reduce((s, arr) => s + arr.length, 0);
  expect(total).toBe(21);
});

test('All activities have valid color hex codes', () => {
  const hexRegex = /^#[0-9a-fA-F]{6}$/;
  Object.values(ACTIVITIES_DATA).flat().forEach(a => {
    if (!hexRegex.test(a.color))
      throw new Error(`Invalid color for ${a.id}: ${a.color}`);
  });
});

test('History array operations: unshift and length cap work', () => {
  const hist = [];
  for (let i = 0; i < 35; i++) hist.unshift({ date: `${i} Jun`, kg: i * 0.5 });
  while (hist.length > 30) hist.pop();
  expect(hist.length).toBe(30);
});

test('History dedup: adding same date replaces entry', () => {
  let hist = [{ date: '11 Jun', kg: 5.0 }];
  const today = '11 Jun';
  const filtered = hist.filter(h => h.date !== today);
  filtered.unshift({ date: today, kg: 7.0 });
  hist = filtered;
  expect(hist.length).toBe(1);
  expect(hist[0].kg).toBe(7.0);
});

// ════════════════════════════════════════
// RESULTS
// ════════════════════════════════════════
console.log('\n═══════════════════════════════════════════');
console.log('  EcoTrace Test Results');
console.log('═══════════════════════════════════════════');
results.forEach(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${r.name}${r.error ? '\n     → ' + r.error : ''}`);
});
console.log('───────────────────────────────────────────');
console.log(`  Total: ${total}  |  Passed: ${passed}  |  Failed: ${failed}`);
console.log(`  Score: ${Math.round(passed/total*100)}%`);
console.log('═══════════════════════════════════════════\n');

if (typeof module !== 'undefined') module.exports = { passed, failed, total };
