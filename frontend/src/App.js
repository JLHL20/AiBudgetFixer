import React, { useState, useEffect } from 'react';
import './App.css';

// --- IMPORT ASSETS ---
import groceriesIcon from './assets/groceries.png'; 
import logoWalmart from './assets/walmart.jpg';
import logoUber from './assets/Uber.jpg';
import logoUberEats from './assets/uberEats.jpg';
import logoTarget from './assets/target.png';
import logoCosco from './assets/costco.png';
import logoSpotify from './assets/spotify.png';
import logoNetflix from './assets/netflix.png';
import logoWholeFoods from './assets/wholefoodmarkets.jpg';
import logoAmazon from './assets/amazon.png';
import logoBjs from './assets/Bjs.png';
import logoSteam from './assets/steam.png';

// --- PARTICLES ---
const FloatingParticles = () => {
    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i, left: Math.random() * 100, size: Math.random() * 6 + 4,
        duration: Math.random() * 15 + 10, delay: Math.random() * -20
    }));
    return (
        <div className="particles-container">
            {particles.map(p => (
                <div key={p.id} className="particle" style={{ left: `${p.left}%`, width: `${p.size}px`, height: `${p.size}px`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />
            ))}
        </div>
    );
};

// --- CAROUSEL ---
const InfiniteCarousel = () => {
    const logos = [
        { id: 1, src: logoWalmart, alt: "Walmart" }, { id: 2, src: logoUber, alt: "Uber" },
        { id: 3, src: logoTarget, alt: "Target" }, { id: 4, src: logoWholeFoods, alt: "Whole Foods" },
        { id: 5, src: logoCosco, alt: "Cosco" }, { id: 6, src: logoSpotify, alt: "Spotify" },
        { id: 7, src: logoNetflix, alt: "Netflix" }, { id: 8, src: logoUberEats, alt: "Uber Eats" },
        { id: 9, src: logoAmazon, alt: "Amazon" }, { id: 10, src: logoBjs, alt: "Bjs" },
        { id: 11, src: logoSteam, alt: "Steam" },
    ];
    const duplicatedLogos = [...logos, ...logos];
    return (
        <div className="carousel-container">
            <div className="carousel-track">
                {duplicatedLogos.map((logo, index) => (
                    <div key={`${logo.id}-${index}`} className="carousel-item">
                        <img src={logo.src} alt={logo.alt} className="carousel-logo" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- HELPERS ---
const getCategoryIcon = (category) => {
  const cat = category ? category.toLowerCase().trim() : "unknown";
  if (cat.includes('grocer') || cat.includes('food')) return <img src={groceriesIcon} alt="Groceries" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
  if (cat.includes('entertainment') || cat.includes('movie') || cat.includes('spotify')) return '🎬';
  if (cat.includes('dining') || cat.includes('restaurant') || cat.includes('eats')) return '🍔';
  if (cat.includes('transport') || cat.includes('uber') || cat.includes('gas')) return '🚖';
  if (cat.includes('utility') || cat.includes('bill')) return '⚡';
  if (cat.includes('health') || cat.includes('pharmacy')) return '💊';
  if (cat.includes('shop') || cat.includes('target') || cat.includes('amazon')) return '🛍️';
  return '📦'; 
};

const getSuggestionColor = (suggestion) => {
  if (!suggestion) return '#a0a0a0';
  const text = suggestion.toLowerCase();
  if (text.includes('healthy') || text.includes('approved')) return '#00E676';
  if (text.includes('warning') || text.includes('review')) return '#FF5252';
  return '#a0a0a0';
};

// --- SCREENS ---
function IntroScreen({ onStart }) {
    return (
        <div className="container-intro">
            <h1 className="hero-title">Ready to Save Money?</h1>
            <p className="label-small" style={{opacity: 0.7, marginBottom: '30px'}}>Smart Budget Tracker</p>
            <InfiniteCarousel />
            <button className="btn-ai-glow" onClick={onStart} style={{marginTop: '30px'}}>LET'S GO</button>
        </div>
    );
}

function Onboarding({ onComplete }) {
  const [budget, setBudget] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [catLimit, setCatLimit] = useState('');
  const presets = ["Groceries", "Entertainment", "Dining", "Transport", "Shopping", "Utilities"];

  const handleAddCategory = () => {
      if(catName && catLimit) {
          setCustomCategories([...customCategories, { name: catName, limit: parseFloat(catLimit), spent: 0 }]);
          setCatName(''); setCatLimit('');
      }
  };

  const removeCategory = (index) => {
      const newCats = [...customCategories];
      newCats.splice(index, 1);
      setCustomCategories(newCats);
  };

  return (
    <div className="card container-dashboard" style={{width: '100%', maxWidth: '550px'}}>
      <div style={{textAlign: 'center'}}>
        <h2>Set Monthly Goal</h2>
        <p className="label-small">Enter your total budget & categories.</p>
      </div>
      <div style={{ margin: '20px 0' }}>
        <input type="number" className="input-modern" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Total Monthly Budget (e.g. $3000)" autoFocus />
      </div>
      <div style={{borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px'}}>
        <p className="label-small" style={{marginBottom: '15px'}}>QUICK SELECT CATEGORIES</p>
        <div className="preset-container">
          {presets.map((preset) => (
            <div key={preset} className={`preset-chip ${catName === preset ? 'active' : ''}`} onClick={() => setCatName(preset)}>{preset}</div>
          ))}
        </div>
        <div className="category-creator">
            <input className="input-modern cat-input-name" placeholder="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} />
            <input type="number" className="input-modern cat-input-limit" placeholder="$ Limit" value={catLimit} onChange={(e) => setCatLimit(e.target.value)} />
            <button className="btn-add-plus" onClick={handleAddCategory}>+</button>
        </div>
        <div className="added-categories-list">
            {customCategories.map((cat, i) => (
                <div key={i} className="category-pill"><span>{cat.name}: ${cat.limit}</span><span className="remove-cat" onClick={() => removeCategory(i)}>×</span></div>
            ))}
        </div>
      </div>
      <button className="btn-ai-glow" onClick={() => budget && onComplete(parseFloat(budget), customCategories)}>Start Tracking</button>
    </div>
  );
}

function Dashboard({ globalBudget, initialCategories, onAnalyze }) {
  const [totalSpent, setTotalSpent] = useState(0);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  
  // State for the Category Picker Modal
  const [activeItem, setActiveItem] = useState(null); 

  const remaining = globalBudget - totalSpent;
  const isOver = remaining < 0;
  const percentage = Math.min((totalSpent / globalBudget) * 100, 100);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    const data = await onAnalyze(file);
    setLoading(false);

    if (data && data.total) {
      setTotalSpent(prev => prev + data.total);
      setReceiptData(data);
      autoCategorize(data.items);
    }
  };

  const autoCategorize = (items) => {
      const updatedCategories = [...categories];
      items.forEach(item => {
          const match = updatedCategories.find(c => 
              item.category.toLowerCase().includes(c.name.toLowerCase()) || 
              c.name.toLowerCase().includes(item.category.toLowerCase())
          );
          if (match) match.spent += item.price;
      });
      setCategories(updatedCategories);
  };

  const handleManualAssign = (categoryName) => {
      if (!activeItem) return;

      const updatedCategories = [...categories];
      const targetCat = updatedCategories.find(c => c.name === categoryName);
      
      if (targetCat) {
          // Add cost to the new category
          targetCat.spent += activeItem.price;
          
          // Update the receipt display name for feedback
          const updatedReceiptItems = receiptData.items.map(item => {
              if (item === activeItem) {
                  return { ...item, category: categoryName, suggestion: 'Manually Assigned' };
              }
              return item;
          });
          
          setReceiptData({ ...receiptData, items: updatedReceiptItems });
          setCategories(updatedCategories);
      }
      setActiveItem(null); // Close modal
  };

  const hasData = !!receiptData;

  return (
    <div className={`dashboard-layout ${hasData ? 'has-data' : ''}`}>
      
      {/* --- CATEGORY PICKER MODAL --- */}
      {activeItem && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h3>Assign "{activeItem.name}" to:</h3>
                  <div className="modal-grid">
                      {categories.map((cat, i) => (
                          <div key={i} className="preset-chip" onClick={() => handleManualAssign(cat.name)}>
                              {cat.name}
                          </div>
                      ))}
                  </div>
                  <button className="modal-btn-cancel" onClick={() => setActiveItem(null)}>Cancel</button>
              </div>
          </div>
      )}

      {/* LEFT PANEL */}
      <div className="left-panel">
          <div className="card">
            <div className="budget-header">
              <div><span className="label-small">Available</span><div className="big-money" style={{ color: isOver ? '#FF5252' : '#00E676' }}>${remaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div></div>
              <div style={{textAlign: 'right', opacity: 0.6}}><span className="label-small">Limit</span><div>${globalBudget.toLocaleString()}</div></div>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${percentage}%`, background: isOver ? '#FF5252' : 'var(--ai-gradient)' }}></div></div>
          </div>

          <div>
            <input id="file-upload" type="file" onChange={handleFileChange} style={{display: 'none'}} />
            <label htmlFor="file-upload">
                  <button className="btn-ai-glow" style={{pointerEvents: 'none', margin: '20px 0 0 0', width: '100%', maxWidth: '100%'}} as="div">
                    {loading ? "Processing..." : "Scan Receipt"}
                </button>
            </label>
          </div>

          {categories.length > 0 && (
             <div className="card">
                <h3 style={{fontSize: '1.1rem', marginBottom: '20px'}}>Category Breakdown</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {categories.map((cat, i) => {
                        const catPercent = Math.min((cat.spent / cat.limit) * 100, 100);
                        const isCatOver = cat.spent > cat.limit;
                        return (
                            <div key={i}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem'}}>
                                    <span>{cat.name}</span><span style={{color: isCatOver ? '#FF5252' : '#a0a0a0'}}>${cat.spent.toFixed(2)} / ${cat.limit}</span>
                                </div>
                                <div className="progress-track" style={{height: '6px'}}><div className="progress-fill" style={{ width: `${catPercent}%`, background: isCatOver ? '#FF5252' : 'var(--accent-green)' }}></div></div>
                            </div>
                        )
                    })}
                </div>
             </div>
          )}
      </div>

      {/* CENTER PANEL */}
      {hasData && (
        <div className="center-panel">
            <div className="card">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                 <span className="label-small">Receipt Total</span><span style={{ fontSize: '1.5rem', fontWeight: '700' }}>${receiptData.total.toFixed(2)}</span>
              </div>
              <div>
                {receiptData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <div className="item-icon">{getCategoryIcon(item.category)}</div>
                        <div className="item-details">
                            <span className="item-name">{item.name}</span>
                            <span className="item-sub" style={{ color: getSuggestionColor(item.suggestion) }}>{item.suggestion} • {item.category}</span>
                        </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <span className="item-price" style={{marginRight: '15px'}}>${item.price.toFixed(2)}</span>
                        {/* --- THE NEW PLUS BUTTON --- */}
                        <button className="btn-item-add" onClick={() => setActiveItem(item)} title="Assign Category">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [appPhase, setAppPhase] = useState('intro'); 
  const [userBudget, setUserBudget] = useState(null);
  const [userCategories, setUserCategories] = useState([]);

  const analyzeReceipt = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', { method: 'POST', body: formData });
      return await response.json();
    } catch (error) {
      console.error("Error:", error); alert("Is Backend running?"); return null;
    }
  };

  return (
    <div className="App">
        <FloatingParticles />
        {appPhase === 'intro' && <IntroScreen onStart={() => setAppPhase('setup')} />}
        {appPhase === 'setup' && <Onboarding onComplete={(budget, cats) => { setUserBudget(budget); setUserCategories(cats); setAppPhase('active'); }} />}
        {appPhase === 'active' && <Dashboard globalBudget={userBudget} initialCategories={userCategories} onAnalyze={analyzeReceipt} />}
    </div>
  );
}

export default App;