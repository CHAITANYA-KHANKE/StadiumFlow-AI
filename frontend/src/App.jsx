import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import FanDashboard from './pages/FanDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import { CheckCircle, Globe, Sun, Moon } from 'lucide-react';

function App() {
  const [page, setPage] = useState(() => localStorage.getItem('stadiumflow_page') || 'landing');
  const [theme, setTheme] = useState(() => localStorage.getItem('stadiumflow_theme') || 'dark');
  const [userPrefs, setUserPrefs] = useState(() => {
    const saved = localStorage.getItem('stadiumflow_userprefs');
    return saved ? JSON.parse(saved) : {
      section: 'Section 101',
      sectionId: 'section_101',
      row: 'G',
      seatNum: '12',
      gateId: 'gate_a',
      language: 'en',
      accessibility: false,
    };
  });

  React.useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('stadiumflow_theme', theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('stadiumflow_page', page);
  }, [page]);

  React.useEffect(() => {
    localStorage.setItem('stadiumflow_userprefs', JSON.stringify(userPrefs));
  }, [userPrefs]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSelectRole = (data) => {
    if (data.role === 'fan') {
      setUserPrefs(data.prefs);
      setPage('fan');
    } else if (data.role === 'operator') {
      // Also sync language to prefs for operators
      setUserPrefs(prev => ({ ...prev, language: data.prefs.language }));
      setPage('operator');
    }
  };

  const handleBackToLanding = () => {
    setPage('landing');
  };

  return (
    <>
      {/* Global Navigation Header */}
      <header 
        style={{ 
          borderBottom: '1px solid var(--border-light)', 
          background: 'var(--bg-surface-glass)', 
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div 
          className="container flex-between" 
          style={{ 
            padding: '14px 24px', 
            maxWidth: '1400px' 
          }}
        >
          <div className="flex-row" style={{ cursor: 'pointer' }} onClick={handleBackToLanding}>
            <div 
              style={{ 
                background: 'var(--gradient-primary)', 
                padding: '8px', 
                borderRadius: '8px',
                color: '#040814',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 100 100" 
                style={{ color: '#040814' }}
                aria-label="Football Icon Logo"
              >
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
                <polygon points="50,38 61,46 57,58 43,58 39,46" fill="currentColor" />
                <line x1="50" y1="38" x2="50" y2="16" stroke="currentColor" strokeWidth="6" />
                <line x1="61" y1="46" x2="81" y2="39" stroke="currentColor" strokeWidth="6" />
                <line x1="57" y1="58" x2="70" y2="78" stroke="currentColor" strokeWidth="6" />
                <line x1="43" y1="58" x2="30" y2="78" stroke="currentColor" strokeWidth="6" />
                <line x1="39" y1="46" x2="19" y2="39" stroke="currentColor" strokeWidth="6" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '800', letterSpacing: '-0.3px' }}>
                StadiumFlow <span style={{ color: 'var(--primary)' }}>AI</span>
              </h1>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>
                Decision Intelligence Layer
              </p>
            </div>
          </div>

          <div className="flex-row" style={{ gap: '16px', fontSize: '13px' }}>
            <button 
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label="Toggle light or dark theme"
            >
              {theme === 'dark' ? <Sun size={13} style={{ color: 'var(--primary)' }} /> : <Moon size={13} style={{ color: 'var(--primary)' }} />}
              {theme === 'dark' 
                ? (userPrefs.language === 'hi' || userPrefs.language === 'hinglish' ? 'लाइट मोड' : 'Light Mode') 
                : (userPrefs.language === 'hi' || userPrefs.language === 'hinglish' ? 'डार्क मोड' : 'Dark Mode')}
            </button>
            <span className="flex-row" style={{ gap: '6px', color: 'var(--text-muted)' }}>
              <Globe size={14} /> 
              {userPrefs.language === 'hi' || userPrefs.language === 'hinglish' 
                ? 'भाषा: हिन्दी' 
                : userPrefs.language === 'es' 
                  ? 'Idioma: Español' 
                  : userPrefs.language === 'fr'
                    ? 'Langue: Français'
                    : userPrefs.language === 'de'
                      ? 'Sprache: Deutsch'
                      : 'Language: English'}
            </span>
            {page !== 'landing' && (
              <span className="badge badge-open" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={10} /> {page === 'fan' 
                  ? (userPrefs.language === 'hi' || userPrefs.language === 'hinglish' ? 'दर्शक फैन पोर्टल' : userPrefs.language === 'es' ? 'Portal del Espectador' : 'Spectator Portal') 
                  : (userPrefs.language === 'hi' || userPrefs.language === 'hinglish' ? 'संचालन केंद्र' : userPrefs.language === 'es' ? 'Centro de Mando' : 'Operations Panel')}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'landing' && <LandingPage onSelectRole={handleSelectRole} />}
        {page === 'fan' && <FanDashboard userPrefs={userPrefs} onBack={handleBackToLanding} />}
        {page === 'operator' && <OperatorDashboard onBack={handleBackToLanding} language={userPrefs.language} />}
      </main>

      {/* Global Footer */}
      <footer 
        style={{ 
          borderTop: '1px solid var(--border-light)', 
          padding: '20px 24px', 
          backgroundColor: '#05070a', 
          color: 'var(--text-muted)', 
          fontSize: '12.5px',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ padding: 0, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span>© 2026 StadiumFlow AI. FIFA World Cup Smart Stadium Concept.</span>
          <div className="flex-row" style={{ gap: '16px' }}>
            <span style={{ cursor: 'pointer' }}>Accessibility Statement</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
