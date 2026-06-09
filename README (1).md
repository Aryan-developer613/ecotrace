# 🌿 EcoTrace — Carbon Footprint Awareness Platform

A web-based carbon footprint tracker built for the **HackerSkill Challenge 3**. EcoTrace helps users understand, measure, and reduce their daily CO₂ emissions through real-time tracking, education, and personalised action plans.

---

## 🔗 Live Demo

👉 [View Live App](https://YOUR_USERNAME.github.io/ecotrace)

---

## 📌 Features

- **Real-time CO₂ Tracker** — Log 20+ activities across transport, home energy, food, and shopping. Emissions calculate instantly as you type.
- **Eco Score & Dashboard** — Get rated 0–100 with a visual ring indicator. See weekly estimates, trees needed to offset, and comparison vs India average.
- **Insights Tab** — Category-wise breakdown, comparison with India / World / US averages, top contributors, and visual equivalents (trees, car km, phone charges).
- **Personalised Tips** — Action plan ranked by your actual logged emissions with estimated savings per change.
- **Learn Tab** — Educational cards on carbon footprints, transport impact, diet emissions, India's electricity grid, and the 1.5°C pathway.
- **30-Day History** — Save daily logs, track progress over time, see your best day and 7-day average.
- **India-Specific Data** — Carbon factors based on India CEA grid intensity (0.82 kg/kWh), CNG autos, LPG, and local food systems.
- **No Sign-up Required** — All data stays on your device via localStorage. 100% private.

---

## 🛠️ Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Custom design system with CSS variables, responsive layout
- **Vanilla JavaScript** — Zero dependencies, no frameworks
- **localStorage** — Client-side data persistence
- **Google Fonts** — Syne, DM Sans, JetBrains Mono

---

## 📁 Project Structure

```
ecotrace/
├── index.html        # Landing page + App shell
├── css/
│   └── style.css     # Full design system & component styles
└── js/
    ├── data.js       # Activity definitions & emission factors
    └── app.js        # All app logic (tracking, insights, tips, history)
```

---

## 🚀 Run Locally

No build step needed. Just open in browser:

```bash
git clone https://github.com/YOUR_USERNAME/ecotrace.git
cd ecotrace
# Open index.html in your browser
```

Or use Live Server in VS Code for best experience.

---

## 📊 Carbon Emission Factors Used

| Activity | Factor | Source |
|---|---|---|
| Electricity (India) | 0.82 kg CO₂/kWh | India CEA 2024 |
| Petrol car | 0.21 kg CO₂/km | IPCC AR6 |
| Metro/train | 0.041 kg CO₂/km | IPCC AR6 |
| Flight | 0.255 kg CO₂/km | IPCC AR6 |
| Beef/mutton | 3.3 kg CO₂/serving | FAO lifecycle data |
| LPG cylinder | 14.2 kg CO₂/cylinder | India MoPNG |

---

## 🏆 Built For

**HackerSkill Challenge 3 — Carbon Footprint Awareness Platform**

---

## 📄 License

MIT License — free to use and modify.
