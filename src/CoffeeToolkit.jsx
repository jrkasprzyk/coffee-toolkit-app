import { useState, useEffect, useRef } from "react";

const BREW_METHODS = [
  {
    id: "pourover",
    name: "Pour Over",
    icon: "⌵",
    ratio: { min: 14, default: 16, max: 18 },
    desc: "V60, Kalita Wave, Chemex",
    tips: "Hoffmann recommends 1:16.67 for his V60 technique (15g to 250g water). Counter Culture suggests 1:17. Start at 1:16 and adjust.",
    grind: "Medium-fine",
    temp: "200–212°F",
    time: "2:30–4:00",
  },
  {
    id: "frenchpress",
    name: "French Press",
    icon: "⊞",
    ratio: { min: 12, default: 15, max: 17 },
    desc: "Immersion brewing",
    tips: "Hoffmann's famous technique: 1:15 ratio, steep 5 min, break crust & skim, wait 5 more, plunge just to surface. Produces a remarkably clean cup.",
    grind: "Coarse",
    temp: "200°F (off boil)",
    time: "9:00–10:00 (Hoffmann method)",
  },
  {
    id: "espresso",
    name: "Espresso",
    icon: "◉",
    ratio: { min: 1.5, default: 2, max: 3 },
    desc: "Pressurized extraction",
    tips: "Standard is 1:2 (18g in → 36g out). Hoffmann suggests experimenting with dose: try 14–18g and adjust grind to taste rather than locking in 18g. Rao advocates longer ratios up to 1:2.5 for sweetness.",
    grind: "Very fine",
    temp: "195–205°F",
    time: "25–35 sec",
  },
  {
    id: "aeropress",
    name: "AeroPress",
    icon: "⧫",
    ratio: { min: 12, default: 14, max: 17 },
    desc: "Versatile pressure + immersion",
    tips: "The Swiss army knife of coffee. At 1:12 with fine grind you get espresso-like concentration. At 1:16 with medium grind, clean filter-style. Inverted method lets you control steep time precisely.",
    grind: "Fine to medium",
    temp: "175–205°F",
    time: "1:00–2:30",
  },
  {
    id: "coldbrew",
    name: "Cold Brew",
    icon: "❄",
    ratio: { min: 4, default: 5, max: 8 },
    desc: "Concentrate (dilute 1:1)",
    tips: "This makes concentrate — dilute with equal parts water/milk. For ready-to-drink, use 1:12 to 1:15. Steep 14–18 hours in fridge. Hoffmann actually prefers flash-brewed iced coffee (hot pour over onto ice) for brighter flavor.",
    grind: "Very coarse",
    temp: "Cold / room temp",
    time: "14–18 hours",
  },
  {
    id: "drip",
    name: "Auto Drip",
    icon: "▽",
    ratio: { min: 15, default: 17, max: 20 },
    desc: "Machine drip coffee",
    tips: "SCA Golden Cup standard is 1:18. Most home machines run too cool — if your coffee tastes flat, try a tighter ratio (1:16) to compensate. Use a scale; the scoop lies to you.",
    grind: "Medium",
    temp: "197–205°F",
    time: "4:00–6:00",
  },
];

const ROASTERS = [
  {
    name: "Onyx Coffee Lab",
    location: "Rogers, AR",
    vibe: "Competition-winning, radically transparent",
    priceRange: "$16–$28 / 10oz",
    url: "https://onyxcoffeelab.com/",
    highlight: "Transparency reports on every bag",
  },
  {
    name: "Verb Coffee Roasters",
    location: "Boulder, CO",
    vibe: "Small-batch single origins, clarity-focused",
    priceRange: "$18–$28 / 10oz",
    url: "https://www.verbcoffeeroasters.com/collections/coffee-offerings",
    highlight: "Geisha lots & seasonal rotations",
  },
  {
    name: "Flower Child Coffee",
    location: "Oakland, CA",
    vibe: "Micro-lot, light roast, curated for vibrancy",
    priceRange: "$25–$28 / 250g",
    url: "https://flowerchildcoffee.com/collections/active-coffee",
    highlight: "Fully developed light roasts — no baked, no raw",
  },
  {
    name: "Counter Culture",
    location: "Durham, NC",
    vibe: "OG specialty, widely available, consistent",
    priceRange: "$14–$22 / 12oz",
    url: "https://counterculturecoffee.com/collections/coffee",
    highlight: "Great entry point — the 1:17 ratio preachers",
  },
  {
    name: "George Howell Coffee",
    location: "Acton, MA",
    vibe: "The godfather of American specialty coffee",
    priceRange: "$18–$45 / 8–12oz",
    url: "https://georgehowellcoffee.com/",
    highlight: "Co-founded Cup of Excellence; treats coffee like fine wine",
  },
  {
    name: "Verve Coffee Roasters",
    location: "Santa Cruz, CA",
    vibe: "West coast staple, balanced & approachable",
    priceRange: "$18–$26 / 12oz",
    url: "https://www.vervecoffee.com/",
    highlight: "Roaster of the Year winner; killer Streetlevel blend",
  },
  {
    name: "Heart Coffee Roasters",
    location: "Portland, OR",
    vibe: "Portland's finest, minimal & precise",
    priceRange: "$20–$32 / 10oz",
    url: "https://www.heartroasters.com/",
    highlight: "Japanese-influenced precision and aesthetic",
  },
  {
    name: "Prodigal Coffee (Scott Rao)",
    location: "Online",
    vibe: "Industry legend roaster + author",
    priceRange: "$20–$30 / 12oz",
    url: "https://www.prodigalcoffee.com/",
    highlight: "From the author of The Coffee Roaster's Companion",
  },
];

const BAG_PRESETS = [
  { label: "250g (≈8.8oz)", grams: 250 },
  { label: "284g (10oz)", grams: 284 },
  { label: "340g (12oz)", grams: 340 },
  { label: "454g (1 lb)", grams: 454 },
  { label: "907g (2 lb)", grams: 907 },
];

function BrewCalculator() {
  const [method, setMethod] = useState(BREW_METHODS[0]);
  const [inputMode, setInputMode] = useState("coffee"); // "coffee" or "water" or "cups"
  const [coffeeGrams, setCoffeeGrams] = useState(20);
  const [waterGrams, setWaterGrams] = useState(320);
  const [cups, setCups] = useState(1);
  const [ratio, setRatio] = useState(BREW_METHODS[0].ratio.default);
  const [showTips, setShowTips] = useState(false);

  const isEspresso = method.id === "espresso";
  const cupSizeMl = isEspresso ? 36 : 240;

  useEffect(() => {
    setRatio(method.ratio.default);
  }, [method]);

  useEffect(() => {
    if (inputMode === "coffee") {
      setWaterGrams(Math.round(coffeeGrams * ratio * 10) / 10);
      setCups(Math.round((coffeeGrams * ratio) / cupSizeMl * 10) / 10);
    } else if (inputMode === "water") {
      setCoffeeGrams(Math.round((waterGrams / ratio) * 10) / 10);
      setCups(Math.round(waterGrams / cupSizeMl * 10) / 10);
    } else {
      const totalWater = cups * cupSizeMl;
      setWaterGrams(Math.round(totalWater * 10) / 10);
      setCoffeeGrams(Math.round((totalWater / ratio) * 10) / 10);
    }
  }, [coffeeGrams, waterGrams, cups, ratio, inputMode, cupSizeMl]);

  return (
    <div className="tool-card">
      <div className="tool-header">
        <h2>Brew Ratio Calculator</h2>
        <p className="tool-subtitle">Dial in your perfect cup</p>
      </div>

      <div className="method-selector">
        {BREW_METHODS.map((m) => (
          <button
            key={m.id}
            className={`method-btn ${method.id === m.id ? "active" : ""}`}
            onClick={() => setMethod(m)}
          >
            <span className="method-icon">{m.icon}</span>
            <span className="method-label">{m.name}</span>
          </button>
        ))}
      </div>

      <div className="ratio-control">
        <label className="ratio-label">
          Ratio — <strong>1:{ratio}</strong>
          <span className="ratio-hint">
            {ratio <= method.ratio.min + 1
              ? " (bold)"
              : ratio >= method.ratio.max - 1
              ? " (light)"
              : " (balanced)"}
          </span>
        </label>
        <input
          type="range"
          min={method.ratio.min * 10}
          max={method.ratio.max * 10}
          value={ratio * 10}
          onChange={(e) => setRatio(e.target.value / 10)}
          className="ratio-slider"
        />
        <div className="ratio-range-labels">
          <span>1:{method.ratio.min} stronger</span>
          <span>1:{method.ratio.max} lighter</span>
        </div>
      </div>

      <div className="calc-grid">
        <div
          className={`calc-input-group ${inputMode === "coffee" ? "active-input" : ""}`}
          onClick={() => setInputMode("coffee")}
        >
          <label>Coffee</label>
          <div className="input-row">
            <input
              type="number"
              value={coffeeGrams}
              onChange={(e) => {
                setInputMode("coffee");
                setCoffeeGrams(parseFloat(e.target.value) || 0);
              }}
              step="0.5"
              min="0"
            />
            <span className="unit">g</span>
          </div>
          <span className="conversion">{(coffeeGrams / 28.35).toFixed(1)} oz · ~{Math.round(coffeeGrams / 5.5)} tbsp</span>
        </div>

        <div className="calc-divider">
          <span className="ratio-badge">1:{ratio}</span>
        </div>

        <div
          className={`calc-input-group ${inputMode === "water" ? "active-input" : ""}`}
          onClick={() => setInputMode("water")}
        >
          <label>{isEspresso ? "Yield" : "Water"}</label>
          <div className="input-row">
            <input
              type="number"
              value={waterGrams}
              onChange={(e) => {
                setInputMode("water");
                setWaterGrams(parseFloat(e.target.value) || 0);
              }}
              step="1"
              min="0"
            />
            <span className="unit">{isEspresso ? "g" : "ml"}</span>
          </div>
          <span className="conversion">
            {isEspresso
              ? `${(waterGrams / 28.35).toFixed(1)} fl oz`
              : `${(waterGrams / 29.57).toFixed(1)} fl oz · ${(waterGrams / 236.6).toFixed(1)} cups`}
          </span>
        </div>

        <div
          className={`calc-input-group cups-group ${inputMode === "cups" ? "active-input" : ""}`}
          onClick={() => setInputMode("cups")}
        >
          <label>{isEspresso ? "Shots" : "Mugs"}</label>
          <div className="input-row">
            <input
              type="number"
              value={cups}
              onChange={(e) => {
                setInputMode("cups");
                setCups(parseFloat(e.target.value) || 0);
              }}
              step="0.5"
              min="0"
            />
            <span className="unit">{isEspresso ? "×36g" : "×8oz"}</span>
          </div>
        </div>
      </div>

      <button className="tips-toggle" onClick={() => setShowTips(!showTips)}>
        {showTips ? "Hide" : "Show"} expert tips & parameters ↓
      </button>

      {showTips && (
        <div className="tips-panel">
          <div className="tip-meta">
            <span><strong>Grind:</strong> {method.grind}</span>
            <span><strong>Temp:</strong> {method.temp}</span>
            <span><strong>Time:</strong> {method.time}</span>
          </div>
          <p className="tip-text">{method.tips}</p>
        </div>
      )}
    </div>
  );
}

function CostCalculator() {
  const [bagPrice, setBagPrice] = useState(22);
  const [bagSize, setBagSize] = useState(340);
  const [customSize, setCustomSize] = useState(false);
  const [doseGrams, setDoseGrams] = useState(18);
  const [cupsPerDay, setCupsPerDay] = useState(2);

  const costPerGram = bagPrice / bagSize;
  const costPerCup = costPerGram * doseGrams;
  const cupsPerBag = Math.floor(bagSize / doseGrams);
  const costPerDay = costPerCup * cupsPerDay;
  const costPerMonth = costPerDay * 30;
  const daysPerBag = cupsPerBag / cupsPerDay;

  return (
    <div className="tool-card">
      <div className="tool-header">
        <h2>Cost Per Cup</h2>
        <p className="tool-subtitle">Know what you're paying per sip</p>
      </div>

      <div className="cost-inputs">
        <div className="cost-row">
          <label>Bag Price</label>
          <div className="input-row">
            <span className="unit-prefix">$</span>
            <input
              type="number"
              value={bagPrice}
              onChange={(e) => setBagPrice(parseFloat(e.target.value) || 0)}
              step="0.50"
              min="0"
            />
          </div>
        </div>

        <div className="cost-row">
          <label>Bag Size</label>
          {!customSize ? (
            <div className="preset-btns">
              {BAG_PRESETS.map((p) => (
                <button
                  key={p.grams}
                  className={`preset-btn ${bagSize === p.grams ? "active" : ""}`}
                  onClick={() => setBagSize(p.grams)}
                >
                  {p.label}
                </button>
              ))}
              <button className="preset-btn custom-btn" onClick={() => setCustomSize(true)}>
                Custom
              </button>
            </div>
          ) : (
            <div className="input-row">
              <input
                type="number"
                value={bagSize}
                onChange={(e) => setBagSize(parseFloat(e.target.value) || 1)}
                min="1"
              />
              <span className="unit">g</span>
              <button className="preset-btn" onClick={() => setCustomSize(false)} style={{marginLeft: 8}}>
                Presets
              </button>
            </div>
          )}
        </div>

        <div className="cost-row">
          <label>Dose per cup</label>
          <div className="input-row">
            <input
              type="number"
              value={doseGrams}
              onChange={(e) => setDoseGrams(parseFloat(e.target.value) || 1)}
              step="0.5"
              min="1"
            />
            <span className="unit">g</span>
          </div>
          <span className="conversion">
            Pour over ~15–20g · Espresso ~14–18g · French press ~25–35g
          </span>
        </div>

        <div className="cost-row">
          <label>Cups per day</label>
          <div className="input-row">
            <input
              type="number"
              value={cupsPerDay}
              onChange={(e) => setCupsPerDay(parseFloat(e.target.value) || 0)}
              step="0.5"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="cost-results">
        <div className="cost-stat hero-stat">
          <span className="stat-value">${costPerCup.toFixed(2)}</span>
          <span className="stat-label">per cup</span>
        </div>
        <div className="cost-stats-grid">
          <div className="cost-stat">
            <span className="stat-value">${costPerMonth.toFixed(0)}</span>
            <span className="stat-label">per month</span>
          </div>
          <div className="cost-stat">
            <span className="stat-value">{cupsPerBag}</span>
            <span className="stat-label">cups per bag</span>
          </div>
          <div className="cost-stat">
            <span className="stat-value">{daysPerBag.toFixed(1)}</span>
            <span className="stat-label">days per bag</span>
          </div>
          <div className="cost-stat">
            <span className="stat-value">${(costPerGram * 1000).toFixed(2)}</span>
            <span className="stat-label">per kg</span>
          </div>
        </div>
        <p className="cost-compare">
          For reference: A $6 café latte uses ~18g of coffee worth ${(costPerGram * 18).toFixed(2)} in beans. 
          You're paying mostly for labor, rent, and milk.
        </p>
      </div>
    </div>
  );
}

function RoasterDirectory() {
  return (
    <div className="tool-card roaster-card">
      <div className="tool-header">
        <h2>Craft Roasters</h2>
        <p className="tool-subtitle">Worth every cent over grocery store beans</p>
      </div>

      <div className="roaster-list">
        {ROASTERS.map((r) => (
          <a
            key={r.name}
            className="roaster-item"
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="roaster-top">
              <h3>{r.name}</h3>
              <span className="roaster-price">{r.priceRange}</span>
            </div>
            <p className="roaster-location">{r.location}</p>
            <p className="roaster-vibe">{r.vibe}</p>
            <p className="roaster-highlight">★ {r.highlight}</p>
            <span className="shop-link">Shop →</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function QuickRef() {
  return (
    <div className="tool-card ref-card">
      <div className="tool-header">
        <h2>Quick Reference</h2>
        <p className="tool-subtitle">The cheat sheet taped inside your cabinet</p>
      </div>
      <div className="ref-table-wrap">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Ratio</th>
              <th>Grind</th>
              <th>Temp</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {BREW_METHODS.map((m) => (
              <tr key={m.id}>
                <td><strong>{m.name}</strong></td>
                <td>1:{m.ratio.default}</td>
                <td>{m.grind}</td>
                <td>{m.temp}</td>
                <td>{m.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ref-notes">
        <h4>Sources & Credits</h4>
        <p>
          Ratios drawn from James Hoffmann's published recipes (V60, French press, iced coffee), 
          Counter Culture's brewing guide (1:17 for drip), the SCA Golden Cup standard (1:18), 
          Scott Rao's espresso ratio research, and Methodical Coffee's comprehensive guide. 
          When in doubt: <strong>buy a $12 scale</strong> — it's the single biggest upgrade you can make.
        </p>
      </div>
    </div>
  );
}

export default function CoffeeToolkit() {
  const [activeTab, setActiveTab] = useState("brew");
  const tabs = [
    { id: "brew", label: "Brew Ratios", icon: "☕" },
    { id: "cost", label: "Cost / Cup", icon: "$" },
    { id: "roasters", label: "Roasters", icon: "◈" },
    { id: "ref", label: "Cheat Sheet", icon: "≡" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --espresso: #1a120b;
          --dark-roast: #2c1e12;
          --crema: #d4a574;
          --crema-light: #e8cdb0;
          --latte: #f5ebe0;
          --milk: #faf7f2;
          --steam: #ffffff;
          --accent: #c05e2c;
          --accent-hover: #a84e22;
          --sage: #7a8b6f;
          --muted: #8b7d6b;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--milk);
          color: var(--espresso);
          -webkit-font-smoothing: antialiased;
        }

        .app-container {
          max-width: 680px;
          margin: 0 auto;
          min-height: 100vh;
          background: var(--steam);
          position: relative;
        }

        /* Header */
        .app-header {
          background: var(--espresso);
          color: var(--crema-light);
          padding: 40px 28px 24px;
          position: relative;
          overflow: hidden;
        }

        .app-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(ellipse at 70% 20%, rgba(212,165,116,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .header-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--crema);
          margin-bottom: 8px;
          opacity: 0.8;
        }

        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 1.1;
          color: var(--steam);
          margin-bottom: 6px;
        }

        .header-sub {
          font-size: 14px;
          color: var(--crema);
          font-weight: 300;
          max-width: 400px;
          line-height: 1.5;
        }

        /* Tab Navigation */
        .tab-nav {
          display: flex;
          background: var(--dark-roast);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(212,165,116,0.15);
        }

        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: var(--crema);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          padding: 14px 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          opacity: 0.6;
          position: relative;
        }

        .tab-btn:hover { opacity: 0.85; }

        .tab-btn.active {
          opacity: 1;
          color: var(--steam);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--crema);
          border-radius: 2px 2px 0 0;
        }

        .tab-icon {
          font-size: 16px;
          line-height: 1;
        }

        /* Tool Cards */
        .tool-card {
          padding: 28px;
          animation: fadeUp 0.35s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tool-header {
          margin-bottom: 24px;
        }

        .tool-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: var(--espresso);
          margin-bottom: 4px;
        }

        .tool-subtitle {
          font-size: 13px;
          color: var(--muted);
          font-weight: 300;
          font-style: italic;
        }

        /* Method Selector */
        .method-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }

        .method-btn {
          background: var(--latte);
          border: 1.5px solid transparent;
          border-radius: 10px;
          padding: 12px 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-family: 'DM Sans', sans-serif;
        }

        .method-btn:hover {
          border-color: var(--crema);
          background: var(--crema-light);
        }

        .method-btn.active {
          background: var(--espresso);
          color: var(--crema-light);
          border-color: var(--espresso);
        }

        .method-icon {
          font-size: 18px;
          line-height: 1;
        }

        .method-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* Ratio Control */
        .ratio-control {
          margin-bottom: 24px;
          padding: 18px;
          background: var(--latte);
          border-radius: 12px;
        }

        .ratio-label {
          font-size: 14px;
          display: block;
          margin-bottom: 10px;
        }

        .ratio-label strong {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          color: var(--accent);
        }

        .ratio-hint {
          font-size: 12px;
          color: var(--muted);
          font-weight: 300;
        }

        .ratio-slider {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--crema-light);
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }

        .ratio-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 3px solid var(--steam);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .ratio-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--muted);
          margin-top: 6px;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Calculator Grid */
        .calc-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: start;
          margin-bottom: 20px;
        }

        .calc-input-group {
          background: var(--milk);
          border: 1.5px solid var(--crema-light);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calc-input-group.active-input {
          border-color: var(--accent);
          background: var(--steam);
          box-shadow: 0 0 0 3px rgba(192,94,44,0.1);
        }

        .calc-input-group label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          display: block;
          margin-bottom: 6px;
        }

        .calc-input-group .conversion {
          font-size: 10px;
          color: var(--muted);
          margin-top: 4px;
          display: block;
          font-family: 'JetBrains Mono', monospace;
        }

        .cups-group {
          grid-column: 1 / -1;
          max-width: 200px;
          justify-self: center;
        }

        .calc-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 30px;
        }

        .ratio-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--accent);
          background: rgba(192,94,44,0.08);
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .input-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .input-row input {
          width: 100%;
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 500;
          background: none;
          border: none;
          outline: none;
          color: var(--espresso);
          min-width: 0;
        }

        .input-row input::-webkit-inner-spin-button,
        .input-row input::-webkit-outer-spin-button {
          opacity: 1;
        }

        .unit, .unit-prefix {
          font-size: 14px;
          color: var(--muted);
          font-weight: 500;
          flex-shrink: 0;
        }

        /* Tips */
        .tips-toggle {
          width: 100%;
          background: none;
          border: 1px dashed var(--crema);
          border-radius: 8px;
          padding: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tips-toggle:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .tips-panel {
          margin-top: 16px;
          padding: 18px;
          background: linear-gradient(135deg, var(--latte), rgba(122,139,111,0.08));
          border-radius: 12px;
          border-left: 3px solid var(--sage);
          animation: fadeUp 0.25s ease;
        }

        .tip-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
        }

        .tip-meta strong {
          color: var(--sage);
        }

        .tip-text {
          font-size: 13px;
          line-height: 1.65;
          color: var(--dark-roast);
          font-style: italic;
        }

        /* Cost Calculator */
        .cost-inputs {
          margin-bottom: 24px;
        }

        .cost-row {
          margin-bottom: 18px;
        }

        .cost-row > label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
          display: block;
          margin-bottom: 8px;
        }

        .cost-row .input-row input {
          font-size: 20px;
          max-width: 120px;
          border-bottom: 2px solid var(--crema);
          padding-bottom: 4px;
        }

        .cost-row .input-row input:focus {
          border-bottom-color: var(--accent);
        }

        .cost-row .conversion {
          font-size: 11px;
          color: var(--muted);
          margin-top: 6px;
          display: block;
        }

        .preset-btns {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .preset-btn {
          background: var(--latte);
          border: 1.5px solid var(--crema-light);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
          color: var(--dark-roast);
        }

        .preset-btn:hover {
          border-color: var(--crema);
        }

        .preset-btn.active {
          background: var(--espresso);
          color: var(--crema-light);
          border-color: var(--espresso);
        }

        .custom-btn {
          background: none;
          border-style: dashed;
          color: var(--muted);
        }

        /* Cost Results */
        .cost-results {
          background: var(--espresso);
          color: var(--crema-light);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .hero-stat {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(212,165,116,0.2);
        }

        .hero-stat .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          color: var(--steam);
          display: block;
        }

        .cost-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        .cost-stat .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 500;
          color: var(--crema);
          display: block;
        }

        .cost-stat .stat-label {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cost-compare {
          font-size: 12px;
          color: var(--crema);
          opacity: 0.7;
          line-height: 1.5;
          font-style: italic;
          margin-top: 8px;
        }

        /* Roaster Directory */
        .roaster-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .roaster-item {
          display: block;
          background: var(--milk);
          border: 1.5px solid var(--crema-light);
          border-radius: 12px;
          padding: 18px;
          text-decoration: none;
          color: var(--espresso);
          transition: all 0.2s ease;
          position: relative;
        }

        .roaster-item:hover {
          border-color: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(26,18,11,0.08);
        }

        .roaster-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .roaster-top h3 {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
        }

        .roaster-price {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--muted);
          flex-shrink: 0;
        }

        .roaster-location {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .roaster-vibe {
          font-size: 13px;
          color: var(--dark-roast);
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .roaster-highlight {
          font-size: 12px;
          color: var(--sage);
          font-style: italic;
        }

        .shop-link {
          position: absolute;
          bottom: 14px;
          right: 18px;
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.5px;
        }

        /* Quick Reference */
        .ref-table-wrap {
          overflow-x: auto;
          margin-bottom: 20px;
          border-radius: 12px;
          border: 1px solid var(--crema-light);
        }

        .ref-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .ref-table th {
          background: var(--espresso);
          color: var(--crema-light);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 12px 14px;
          text-align: left;
        }

        .ref-table td {
          padding: 11px 14px;
          border-bottom: 1px solid var(--latte);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        .ref-table td strong {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
        }

        .ref-table tr:last-child td { border-bottom: none; }
        .ref-table tr:hover td { background: var(--latte); }

        .ref-notes {
          padding: 18px;
          background: var(--latte);
          border-radius: 12px;
        }

        .ref-notes h4 {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--dark-roast);
        }

        .ref-notes p {
          font-size: 12px;
          line-height: 1.65;
          color: var(--muted);
        }

        .ref-notes strong {
          color: var(--accent);
        }

        /* Footer */
        .app-footer {
          text-align: center;
          padding: 24px 28px;
          font-size: 11px;
          color: var(--muted);
          border-top: 1px solid var(--latte);
        }

        .app-footer a {
          color: var(--accent);
          text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .method-selector {
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }
          .method-btn { padding: 10px 4px; }
          .method-label { font-size: 10px; }
          .calc-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .calc-divider { display: none; }
          .cups-group {
            grid-column: 1;
            max-width: none;
          }
          .header-title { font-size: 28px; }
          .tool-card { padding: 20px; }
          .cost-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .roaster-top { flex-direction: column; gap: 2px; }
          .preset-btns { gap: 4px; }
          .preset-btn { padding: 6px 8px; font-size: 10px; }
        }
      `}</style>

      <div className="app-container">
        <header className="app-header">
          <div className="header-eyebrow">Ratios · Cost · Roasters</div>
          <h1 className="header-title">The Coffee<br />Toolkit</h1>
          <p className="header-sub">
            Everything you need to brew better coffee at home — backed by Hoffmann, 
            Counter Culture, and the SCA.
          </p>
        </header>

        <nav className="tab-nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {activeTab === "brew" && <BrewCalculator />}
        {activeTab === "cost" && <CostCalculator />}
        {activeTab === "roasters" && <RoasterDirectory />}
        {activeTab === "ref" && <QuickRef />}

        <footer className="app-footer">
          Built with data from James Hoffmann, Counter Culture, SCA, and Scott Rao.
          <br />
          Roaster prices approximate — check sites for current offerings.
        </footer>
      </div>
    </>
  );
}
