# ✈️ WanderWise – Smart Travel Planner

> *"Plan Your Journey, Create Your Story"*

[![HTML5](images/badge-html5.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](images/badge-css3.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript_ES6+](images/badge-javascript.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](images/badge-license.svg)](LICENSE)

**WanderWise** is a modern, responsive, front-end travel planning web application built without front-end heavy frameworks (no React, no Angular, no Vue, no Bootstrap, no Tailwind). It empowers travelers to explore world destinations, plan custom trips, generate dynamic day-by-day itineraries, forecast travel budgets, and monitor real-time global weather conditions.

Designed for academic demonstrations, college submissions, and viva evaluations.

---

## 🌟 Key Features

1. **Curated World Destinations**  
   12 destinations including Paris, Dubai, Tokyo, Bali, Switzerland, Goa, Kerala, Hyderabad, London, Singapore, New York, and Maldives, featuring daily cost estimates, seasonal advice, and top attractions.

2. **Live Search & Debouncing**  
   Instant search by destination name, country, or category with a 280ms debounce filter to eliminate unnecessary re-renders.

3. **Multi-Category Filtering & Sorting**  
   Filter by *All, Beach, City, Nature, Adventure, Luxury*, and sort by *Low-to-High Cost, High-to-Low Cost, or Alphabetical (A–Z / Z–A)*.

4. **Destination Details Modal**  
   Interactive modal with high-resolution imagery, itemized daily cost breakdown (stay, dining, commute), highlights, and direct trip planner integration.

5. **Wishlist & Favorites (LocalStorage)**  
   Bookmark destinations with animated heart buttons. Persists across browser refreshes via browser `localStorage` and updates an interactive badge counter.

6. **Smart Trip Planner & Date Validation**  
   Intelligent date calculation with full timezone-safe parsing (`parseLocalDate`). Validates against past dates and reversed travel ranges.

7. **Day-by-Day Itinerary Generator**  
   Generates a daily timetable mapped to attractions. Users can add custom activities (Morning, Afternoon, Evening) or delete scheduled items.

8. **Travel Budget Calculator (ES6 `reduce()`)**  
   Itemized expense engine calculating hotel, food, transit, and sightseeing costs, computing grand totals and per-person splits with proportional visual progress bars.

9. **Live Real-Time Weather (Async / Await / Fetch API)**  
   Queries real-time temperature, condition emojis, humidity, wind speed, pressure, and visibility using native asynchronous JavaScript and `Promise.all()`.

10. **Dark & Light Mode**  
    Switch between daylight and midnight themes with smooth CSS transitions and automatic `localStorage` persistence.

11. **Responsive & Mobile Ready**  
    Fluid layout powered by pure CSS3 Grid and Flexbox, featuring a slide-out hamburger drawer menu for mobile and tablet devices.

12. **Printable / PDF Export Styles**  
    Dedicated `@media print` rules allowing travelers to cleanly print or save their customized itineraries as PDFs.

---

## 🔒 Security & Zero-Secret Architecture

- **No Hardcoded Secrets:** There are **zero API keys, tokens, or credentials stored or committed** in this repository.
- **Keyless Public Meteorological API:** WanderWise connects to the public, open-access Open-Meteo API for real-time weather and geocoding by default. It requires **no API key registration or payment**.
- Weather uses the public Open-Meteo API and does not require a key.
- **Client-Side Privacy:** All user data (favorites, theme preference, planned trips) remains strictly inside the user's browser via `localStorage`.

---

## 📁 Project Structure

```text
WanderWise/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js           # Application and feature logic
├── images/
│   └── charminar.jpg
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

Open `index.html` directly in a modern browser. No installation, package manager, or development server is required.

---

## 🎓 Academic Viva & Oral Examination Guide

### 1. What makes WanderWise a pure front-end application?
It runs entirely inside the client's web browser without an application server or SQL backend. All computations, filtering, rendering, and persistence occur client-side via modern Web APIs (`Fetch`, `DOM`, `LocalStorage`).

### 2. How is Debouncing implemented in the search bar?
A higher-order closure function (`debounce()`) delays triggering the filter search until the user pauses typing for 280ms, preventing expensive layout reflows on every keystroke.

### 3. How does `Array.prototype.reduce()` power the budget calculator?
An array of expense category objects (hotel, food, transit, activities) is reduced into a single numeric Grand Total:
```javascript
const grandTotal = expenseItems.reduce((acc, item) => acc + item.amount, 0);
```

### 4. How does the Weather feature demonstrate Asynchronous JavaScript?
It utilizes:
- `async / await` syntax for clean asynchronous execution.
- Native `fetch()` API to make HTTP requests.
- `Promise.all()` to orchestrate concurrent network operations.
- `try / catch / finally` blocks to guarantee that loading indicators are dismissed regardless of network success or error.

### 5. Why are CSS Custom Properties (Variables) preferred for Dark Mode?
Colors and theme properties are defined once on `:root` and overridden under `[data-theme="dark"]`. Toggling the theme only requires updating one attribute on `<html>`, enabling instantaneous transition without reloading stylesheets.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
