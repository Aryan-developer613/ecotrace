/* ══════════════════════════════════════
   EcoTrace — data.js
   Activity definitions & constants
══════════════════════════════════════ */

const ACTIVITIES = {
  transport: [
    { id:'car',      name:'Car (petrol)',        em:'🚗', unit:'km',         f:0.21,   color:'#ef4444', bg:'#FEE2E2',
      tip:'Carpooling halves your per-km emissions. Switching 2 days/week to bus or metro can cut transport footprint by ~30%.', save:'~2.5 kg/day', diff:'High impact' },
    { id:'bike',     name:'Motorbike',            em:'🏍️', unit:'km',         f:0.11,   color:'#f97316', bg:'#FEE2E2',
      tip:'Electric two-wheelers (Ola S1, Ather) emit ~90% less per km and cost ₹1–2/km vs ₹4–5 for petrol bikes.', save:'~1.2 kg/day', diff:'Medium impact' },
    { id:'auto',     name:'Auto rickshaw (CNG)',  em:'🛺', unit:'km',         f:0.08,   color:'#f59e0b', bg:'#FEE2E2',
      tip:'CNG autos are already a relatively clean city option. Electric autos, where available, cut emissions by ~70%.', save:'~0.5 kg/day', diff:'Low impact' },
    { id:'bus',      name:'City bus',             em:'🚌', unit:'km',         f:0.089,  color:'#84cc16', bg:'#FEE2E2',
      tip:'Buses emit 4–6× less per passenger-km than a solo petrol car — one of the best upgrades you can make.', save:'~0.4 kg/day', diff:'Low impact' },
    { id:'metro',    name:'Metro / train',        em:'🚆', unit:'km',         f:0.041,  color:'#22c55e', bg:'#FEE2E2',
      tip:'Metro rail is the cleanest motorised urban transport — ~5× less than a petrol car. Great for regular commutes.', save:'~0.2 kg/day', diff:'Very low' },
    { id:'flight',   name:'Flight',               em:'✈️', unit:'km',         f:0.255,  color:'#dc2626', bg:'#FEE2E2',
      tip:'A 1000 km flight emits ~255 kg CO₂ — equal to 3 weeks of average daily emissions. Consider trains for trips under 600 km.', save:'~5+ kg/trip', diff:'Very high' },
  ],
  home: [
    { id:'elec',     name:'Electricity',          em:'⚡', unit:'kWh',         f:0.82,   color:'#f59e0b', bg:'#FEF3C7',
      tip:'5-star ACs and refrigerators use 30–40% less electricity. LED bulbs use 80% less than incandescent bulbs.', save:'~1.6 kg/day', diff:'High impact' },
    { id:'lpg',      name:'LPG cooking gas',      em:'🔥', unit:'cylinders',   f:14.2,   color:'#ef4444', bg:'#FEF3C7',
      tip:'Induction cooktops convert ~85% of energy to heat vs ~40% for gas — faster, cleaner, and cheaper to run.', save:'~2.8 kg/cook', diff:'Medium impact' },
    { id:'ac',       name:'Air conditioning',     em:'❄️', unit:'hours',       f:0.5,    color:'#3b82f6', bg:'#FEF3C7',
      tip:'Raising thermostat from 18°C to 24°C saves 24% electricity per degree. Clean filters monthly for 5–10% more efficiency.', save:'~1 kg/day', diff:'Medium impact' },
    { id:'geyser',   name:'Electric geyser',      em:'🚿', unit:'hours',       f:0.9,    color:'#8b5cf6', bg:'#FEF3C7',
      tip:'Solar water heaters (₹15–25K) eliminate geyser emissions entirely and pay back in 3–5 years through savings.', save:'~0.9 kg/day', diff:'Medium impact' },
    { id:'fan',      name:'Ceiling fans',         em:'🌀', unit:'hours',       f:0.04,   color:'#06b6d4', bg:'#FEF3C7',
      tip:'BEE 5-star fans use ~30W vs older 75W fans. Only run fans when in the room to cut this entirely.', save:'~0.1 kg/day', diff:'Low impact' },
  ],
  food: [
    { id:'beef',     name:'Beef / mutton',        em:'🥩', unit:'servings',    f:3.3,    color:'#dc2626', bg:'#D1FAE5',
      tip:'One beef serving = driving 16 km worth of CO₂. Swapping to dal or paneer twice a week saves ~6.6 kg CO₂.', save:'~3.3 kg/meal', diff:'Very high' },
    { id:'chicken',  name:'Chicken / eggs',       em:'🍗', unit:'servings',    f:0.72,   color:'#f97316', bg:'#D1FAE5',
      tip:'Poultry has 5× lower impact than beef. Eggs (~0.5 kg each) are even more efficient as protein sources.', save:'~0.5 kg/meal', diff:'Medium impact' },
    { id:'dairy',    name:'Dairy (milk, curd)',   em:'🥛', unit:'servings',    f:0.6,    color:'#f59e0b', bg:'#D1FAE5',
      tip:'Local cooperative dairy has lower transport emissions than packaged national brands. Oat milk emits ~70% less than cow\'s milk.', save:'~0.4/serving', diff:'Low impact' },
    { id:'veg',      name:'Vegetables / dal',     em:'🥗', unit:'servings',    f:0.15,   color:'#22c55e', bg:'#D1FAE5',
      tip:'Plant-based meals are the single highest-impact dietary switch. Seasonal, local vegetables have the lowest footprint of all.', save:'Already low!', diff:'Very low' },
    { id:'rice',     name:'Rice',                 em:'🍚', unit:'kg cooked',   f:2.7,    color:'#eab308', bg:'#D1FAE5',
      tip:'Rice paddies emit methane during flooding. Choosing alternate-wetting cultivation varieties reduces rice emissions by ~50%.', save:'~0.8 kg/kg', diff:'Medium impact' },
    { id:'processed',name:'Packaged / junk food', em:'🍟', unit:'servings',    f:1.4,    color:'#f97316', bg:'#D1FAE5',
      tip:'Ultra-processed foods have high-energy manufacturing and long supply chains. Fresh, local food cuts embedded emissions significantly.', save:'~1 kg/serving', diff:'Medium impact' },
  ],
  shopping: [
    { id:'clothes',  name:'New clothing',         em:'👕', unit:'items',       f:10.0,   color:'#ec4899', bg:'#EDE9FE',
      tip:'Fashion has one of the highest per-item footprints. Buying second-hand, repairing, or choosing quality over quantity makes a big difference.', save:'~8 kg/item', diff:'Very high' },
    { id:'phone',    name:'New electronics',      em:'📱', unit:'items',       f:70.0,   color:'#8b5cf6', bg:'#EDE9FE',
      tip:'A smartphone = ~70 kg CO₂ to manufacture. Extending your phone\'s life by one year halves its annual carbon cost.', save:'~35 kg/year', diff:'Very high' },
    { id:'online',   name:'Online deliveries',    em:'📦', unit:'orders',      f:0.5,    color:'#06b6d4', bg:'#EDE9FE',
      tip:'Batching orders into fewer deliveries reduces trips. Choosing slower shipping is often more fuel-efficient than express delivery.', save:'~0.3 kg/order', diff:'Low impact' },
    { id:'plastic',  name:'Single-use plastics',  em:'🧴', unit:'items',       f:0.2,    color:'#ef4444', bg:'#EDE9FE',
      tip:'Beyond CO₂, plastics pollute ecosystems for centuries. Reusable bags, bottles, and containers eliminate this category entirely.', save:'~0.2 kg/item', diff:'Low impact' },
  ]
};

const INDIA_AVG = 4.8;
const WORLD_AVG = 12.0;
const US_AVG    = 47.0;

// kg CO₂ emitted by India per second (2.3 billion tonnes / year)
const INDIA_KG_PER_SEC = (2_300_000_000_000) / (365 * 24 * 3600);
// World: ~37 billion tonnes / year
const WORLD_KG_PER_SEC = (37_000_000_000_000) / (365 * 24 * 3600);
// "Globally today" in tonnes
const WORLD_TONNES_PER_SEC = WORLD_KG_PER_SEC / 1000;
