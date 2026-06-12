# 🌿 EcoTrace — Carbon Footprint Awareness Platform

> **HackerSkill Challenge 3 Submission**

A web platform that helps individuals **understand, track, and reduce** their carbon footprint through simple daily logging and personalized insights.

## 🚀 Live Demo
**[https://aryan-developer613.github.io/ecotrace/](https://aryan-developer613.github.io/ecotrace/)**

## ✨ Features

| Feature | Description |
|---|---|
| 📝 **Daily Tracker** | Log 21 activities across Transport, Home Energy, Food & Shopping |
| 📊 **Real-time Insights** | CO₂ calculated instantly, category breakdown, compare vs India/World/US |
| 🎯 **Eco Score** | 0–100 score based on your daily footprint |
| 💡 **Personalised Tips** | Ranked suggestions based on your actual logged data |
| 📅 **History** | 30-day log with trends, best day, and streak tracking |
| 🌳 **Equivalents** | Trees, km driven, phone charges — makes CO₂ tangible |
| ♿ **Accessible** | Full ARIA roles/labels, keyboard navigation, skip link, focus styles |
| 🔒 **Secure** | CSP headers, XSS sanitization, input validation, max-cap protection |

## 🧪 Tests

**47 unit tests — 100% pass rate**

Run in browser:
```
open tests/index.html
```

Run in Node.js:
```bash
node tests/ecotrace.test.js
```

Test coverage:
- ✅ Carbon factor validation (8 tests)
- ✅ Calculation logic (13 tests)
- ✅ Input validation & security / XSS prevention (12 tests)
- ✅ Data integrity (14 tests)

## 🛠 Tech Stack
- Pure HTML5, CSS3, Vanilla JavaScript — zero dependencies, zero build step
- Google Fonts (Inter, Space Grotesk, JetBrains Mono)
- localStorage for data persistence

## 📂 Project Structure
```
ecotrace/
├── index.html          # Main app + landing page
├── css/
│   └── style.css       # All styles + accessibility fixes
├── js/
│   ├── data.js         # Activity definitions & carbon factors
│   └── app.js          # App logic (sanitized, ARIA-enhanced)
├── tests/
│   ├── ecotrace.test.js  # Node.js test suite (47 tests)
│   └── index.html        # Browser test runner UI
└── README.md
```

## 🌍 Carbon Factors Used
- **Transport**: IPCC AR6 + India-specific values (CNG auto, metro)
- **Electricity**: India CEA Grid Emission Factor 2024 (0.82 kg CO₂/kWh)
- **Food**: FAO lifecycle assessment data
- **Shopping**: Product lifecycle analysis (WRAP)

## 🔒 Security
- Content-Security-Policy meta header
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- All user inputs sanitized via `sanitize()` before DOM insertion
- Input capped at 99999 to prevent abuse
- Negative/NaN/Infinity inputs rejected via `safeParseFloat()`
- No `innerHTML` used with user-controlled data

## ♿ Accessibility
- Skip-to-content link
- All interactive elements have `aria-label`
- Live regions (`aria-live`) for dynamic content
- Proper `role` attributes (tabpanel, tab, progressbar, list, listitem)
- Keyboard navigation (Tab, Enter, Space, Escape)
- Sufficient colour contrast ratios
- SVG has `<title>` and `aria-hidden` where decorative

## 🚀 Deploy to GitHub Pages
1. Create repo → upload all files
2. Settings → Pages → Source: main → / (root) → Save
3. Live at: `https://YOUR_USERNAME.github.io/ecotrace`

---
Built with 💚 for a greener planet · Challenge 3: Carbon Footprint Awareness Platform
