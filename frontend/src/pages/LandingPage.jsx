import React, { useState, useEffect } from 'react';
import ParallaxCard from '../components/ParallaxCard';
import { Users, Shield, Sparkles } from 'lucide-react';
import { translate } from '../services/translator';
import { apiService } from '../services/api';
import landingBg from '../assets/landing_bg.png';

const SECTIONS = [
  { id: 'section_101', name: 'Section 101 (North)' },
  { id: 'section_102', name: 'Section 102 (North-East)' },
  { id: 'section_103', name: 'Section 103 (East)' },
  { id: 'section_104', name: 'Section 104 (South-East)' },
  { id: 'section_105', name: 'Section 105 (South)' },
  { id: 'section_106', name: 'Section 106 (South-West)' },
  { id: 'section_107', name: 'Section 107 (West)' },
  { id: 'section_108', name: 'Section 108 (North-West)' },
];

const GATES = [
  { id: 'gate_a', name: 'Gate A (North Entrance)' },
  { id: 'gate_b', name: 'Gate B (North-East Entrance)' },
  { id: 'gate_c', name: 'Gate C (East Entrance)' },
  { id: 'gate_d', name: 'Gate D (South-East Entrance)' },
  { id: 'gate_e', name: 'Gate E (South Entrance)' },
  { id: 'gate_f', name: 'Gate F (South-West Entrance)' },
  { id: 'gate_g', name: 'Gate G (West Entrance)' },
  { id: 'gate_h', name: 'Gate H (North-West Entrance)' },
];

export default function LandingPage({ onSelectRole }) {
  const [role, setRole] = useState('fan'); // 'fan' or 'operator'

  // Spectator Preferences State
  const [section, setSection] = useState('section_101');
  const [row, setRow] = useState('G');
  const [seatNum, setSeatNum] = useState('12');
  const [gateId, setGateId] = useState('gate_a');
  const [language, setLanguage] = useState('en');
  const [accessibility, setAccessibility] = useState(false);

  // Admin access state
  const [adminToken, setAdminToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) * 0.012;
      const moveY = (clientY - window.innerHeight / 2) * 0.012;
      document.documentElement.style.setProperty('--bg-tx', `${moveX}px`);
      document.documentElement.style.setProperty('--bg-ty', `${moveY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === 'fan') {
      const sectionObj = SECTIONS.find(s => s.id === section);
      onSelectRole({
        role,
        prefs: {
          section: sectionObj ? sectionObj.name.split(' (')[0] : 'Section 101',
          sectionId: section,
          row,
          seatNum,
          gateId,
          language,
          accessibility,
        }
      });
    } else {
      // Validate operator access token via backend API
      setIsValidating(true);
      setAuthError('');
      try {
        localStorage.setItem('stadiumflow_admin_token', adminToken);
        await apiService.getOperationsSummary();
        onSelectRole({ role, prefs: { language } });
      } catch (err) {
        setAuthError('Unauthorized operator token. X-Admin-Token header missing or incorrect.');
        localStorage.removeItem('stadiumflow_admin_token');
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <div 
      className="flex-row animate-fade-in" 
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 72px)',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        backgroundImage: `linear-gradient(rgba(8, 11, 17, 0.7), rgba(8, 11, 17, 0.7)), url(${landingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '40px 20px',
        perspective: '1000px',
        position: 'relative'
      }}
    >
      <ParallaxCard 
        style={{ 
          width: '100%', 
          maxWidth: '540px', 
          position: 'relative',
          background: 'rgba(15, 21, 36, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid var(--primary)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
        maxRotation={6}
      >
        {/* Glowing Football Logo Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 100 100" 
            className="glow-soccer-ball"
            style={{ color: 'var(--primary)' }}
            aria-label="Football Icon Logo"
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
            <circle cx="50" cy="50" r="34" fill="rgba(15, 21, 36, 0.9)" stroke="currentColor" strokeWidth="3" />
            <polygon points="50,38 61,46 57,58 43,58 39,46" fill="currentColor" />
            <line x1="50" y1="38" x2="50" y2="16" stroke="currentColor" strokeWidth="2.5" />
            <line x1="61" y1="46" x2="81" y2="39" stroke="currentColor" strokeWidth="2.5" />
            <line x1="57" y1="58" x2="70" y2="78" stroke="currentColor" strokeWidth="2.5" />
            <line x1="43" y1="58" x2="30" y2="78" stroke="currentColor" strokeWidth="2.5" />
            <line x1="39" y1="46" x2="19" y2="39" stroke="currentColor" strokeWidth="2.5" />
            <polygon points="50,16 57,21 43,21" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="81,39 84,48 76,46" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="70,78 61,82 66,88" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="30,78 39,82 34,88" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="19,39 16,48 24,46" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px', color: '#fff' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '6px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
            {translate('stadiumflow_ai', language)}
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '13px', margin: 0 }}>
            {translate('decision_layer', language)}
          </p>
        </div>

        {/* Tab Role Selector */}
        <div 
          style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            padding: '4px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '24px',
            border: '1px solid var(--border-light)'
          }}
        >
          <button
            type="button"
            onClick={() => setRole('fan')}
            style={{
              flex: 1,
              backgroundColor: role === 'fan' ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: role === 'fan' ? '1px solid var(--border-light)' : 'none',
              color: role === 'fan' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              fontWeight: '700',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={16} /> {translate('spectator_portal', language)}
          </button>
          <button
            type="button"
            onClick={() => setRole('operator')}
            style={{
              flex: 1,
              backgroundColor: role === 'operator' ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: role === 'operator' ? '1px solid var(--border-light)' : 'none',
              color: role === 'operator' ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              fontWeight: '700',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={16} /> {translate('command_center', language)}
          </button>
        </div>

        {/* Dynamic Config Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {role === 'fan' ? (
            <>
              {/* Seat Details (Section, Row, Seat) */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {translate('seat_section', language)}
                  </label>
                  <select 
                    value={section} 
                    onChange={(e) => setSection(e.target.value)}
                    className="form-select"
                  >
                    {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {translate('row', language)}
                  </label>
                  <input 
                    type="text" 
                    value={row} 
                    onChange={(e) => setRow(e.target.value.toUpperCase())}
                    className="form-input" 
                    maxLength={2}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {translate('seat', language)}
                  </label>
                  <input 
                    type="text" 
                    value={seatNum} 
                    onChange={(e) => setSeatNum(e.target.value)}
                    className="form-input" 
                    required
                  />
                </div>
              </div>

              {/* Arrival Gate & Language */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {translate('arrival_entrance', language)}
                  </label>
                  <select 
                    value={gateId} 
                    onChange={(e) => setGateId(e.target.value)}
                    className="form-select"
                  >
                    {GATES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {translate('preferred_language', language)}
                  </label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="form-select"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi - Devanagari)</option>
                    <option value="hinglish">Hinglish (Hindi in Roman script)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                  </select>
                </div>
              </div>

              {/* Accessibility Toggle */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <input
                  type="checkbox"
                  id="acc-mode"
                  checked={accessibility}
                  onChange={(e) => setAccessibility(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="acc-mode" style={{ fontSize: '13px', color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                  <strong>{translate('accessibility_mode', language)}</strong> {translate('accessibility_desc', language)}
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Operator Language Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {translate('preferred_language', language)}
                </label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="form-select"
                  style={{ marginBottom: '18px' }}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                </select>
              </div>

              {/* Operator Access Token */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Operator Access Token
                </label>
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => {
                    setAdminToken(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Enter operator access token..."
                  className="form-input"
                  required
                />
                {authError && (
                  <p style={{ color: 'var(--status-closed)', fontSize: '12px', marginTop: '6px', margin: 0 }}>
                    {authError}
                  </p>
                )}
              </div>

              <div 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '20px', 
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '13.5px',
                  lineHeight: '1.5',
                  marginBottom: '10px'
                }}
              >
                <Shield size={24} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                <p style={{ margin: 0 }}>
                  Operations Command Center enables monitoring of live stadium conditions, crowd heatmap overlays, dynamic incident management, and What-If scenario forecasting.
                </p>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ 
              width: '100%', 
              justifyContent: 'center', 
              fontSize: '15px', 
              padding: '14px',
              marginTop: '10px'
            }}
          >
            <Sparkles size={16} /> 
            {role === 'fan' 
              ? translate('enter_stadium', language) 
              : translate('launch_command', language)}
          </button>
        </form>
      </ParallaxCard>
    </div>
  );
}
