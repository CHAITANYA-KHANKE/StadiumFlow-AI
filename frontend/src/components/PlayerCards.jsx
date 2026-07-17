import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CheckCircle2 } from 'lucide-react';

export default function PlayerCards({ language = 'en' }) {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState({}); // player_id -> bool
  const [selectedTeam, setSelectedTeam] = useState('All');

  const teams = ['All', 'Argentina', 'France', 'Spain', 'Germany', 'Portugal', 'Croatia', 'Brazil', 'Netherlands'];

  const fetchPlayers = async () => {
    try {
      const data = await apiService.getPlayers();
      setPlayers(data);
    } catch (err) {
      console.error('Failed to load players:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFlip = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Loading player profiles...
      </div>
    );
  }

  const filteredPlayers = selectedTeam === 'All'
    ? players
    : players.filter(p => p.team.toLowerCase() === selectedTeam.toLowerCase());

  return (
    <div className="flex-column" style={{ width: '100%', gap: '20px' }}>
      {/* Team Tabs Selector */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '14px'
        }}
      >
        {teams.map(t => {
          const isActive = selectedTeam === t;
          return (
            <button
              key={t}
              onClick={() => setSelectedTeam(t)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                backgroundColor: isActive ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.15s ease'
              }}
            >
              {t === 'All' 
                ? (language === 'hi' || language === 'hinglish' ? 'सभी टीमें' : language === 'es' ? 'Todos los Equipos' : 'All Teams') 
                : t}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {filteredPlayers.map((p) => {
        const isFlipped = !!flippedCards[p.id];

        return (
          <div 
            key={p.id} 
            style={{ 
              height: '420px', 
              perspective: '1000px',
              cursor: 'pointer'
            }}
            role="button"
            tabIndex={0}
            aria-label={`${p.name}, click or press enter to flip card details`}
            onClick={() => handleFlip(p.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFlip(p.id);
              }
            }}
          >
            {/* 3D Flip Card Container */}
            <div 
              className="flip-card-inner" 
              style={{ 
                transform: isFlipped ? 'rotateY(180deg)' : 'none' 
              }}
            >
              {/* Front side */}
              <div 
                className="flip-card-front glass-card"
                style={{ 
                  padding: '24px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(15, 21, 36, 0.9) 0%, rgba(8, 11, 17, 0.95) 100%)',
                  border: '1px solid var(--border-light)',
                  borderTop: '3px solid var(--primary)',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                {/* Header: Rating & Team */}
                <div className="flex-between">
                  <span className="badge badge-open" style={{ fontSize: '11px', fontWeight: '800' }}>
                    OVR {p.rating}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {p.team.toUpperCase()}
                  </span>
                </div>

                {/* Body: Player photo placeholder & Name */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
                  {/* Photo avatar sphere */}
                  <div 
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%', 
                      background: 'var(--gradient-primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#040814',
                      fontSize: '32px',
                      fontWeight: '800',
                      boxShadow: 'var(--shadow-glow)',
                      marginBottom: '16px',
                      position: 'relative'
                    }}
                  >
                    {p.photo_placeholder}
                    
                    {/* Status Dot badge */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: '2px', 
                        right: '2px', 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        backgroundColor: p.fitness.includes('100%') ? 'var(--status-open)' : 'var(--status-warning)',
                        border: '2px solid #0f1524'
                      }}
                    ></div>
                  </div>

                  <h3 style={{ fontSize: '20px', margin: '0 0 4px 0', fontWeight: '800' }}>{p.name}</h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>{p.position}</p>
                </div>

                {/* Footer: Live status detail */}
                <div 
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-light)', 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '10px 12px', 
                    fontSize: '12.5px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--status-open)' }} />
                    <span style={{ fontWeight: '700', color: 'var(--text-bright)' }}>{p.status}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Fitness: {p.fitness}
                  </div>
                </div>

                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                  {language === 'hi' || language === 'hinglish' ? 'विवरण देखने के लिए क्लिक करें' : language === 'es' ? 'Haz clic para ver detalles' : 'Click card to flip details'}
                </div>
              </div>

              {/* Back side */}
              <div 
                className="flip-card-back glass-card"
                style={{ 
                  padding: '20px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(8, 11, 17, 0.98) 0%, rgba(15, 21, 36, 0.98) 100%)',
                  border: '1px solid var(--border-light)',
                  borderTop: '3px solid var(--secondary)',
                  boxShadow: 'var(--shadow-card)',
                  overflowY: 'auto'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-bright)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', textAlign: 'left' }}>
                    🏆 {p.name} {language === 'hi' || language === 'hinglish' ? 'की उपलब्धियां' : language === 'es' ? 'Logros' : 'Achievements'}
                  </h4>

                  {/* Achievements List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '14px' }}>
                    {p.achievements && p.achievements.map((ach, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', fontSize: '11.5px', color: 'var(--text-main)', lineHeight: '1.35' }}>
                        <span style={{ color: 'var(--primary)' }}>✦</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-bright)', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px', textAlign: 'left' }}>
                    📊 Tournament Stats
                  </h4>
                  {/* Additional Tournament Metrics */}
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '8px 12px', 
                      fontSize: '12px', 
                      textAlign: 'left' 
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Goals:</span> <strong style={{ color: '#fff' }}>{p.stats.goals}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Assists:</span> <strong style={{ color: '#fff' }}>{p.stats.assists}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Pass Accuracy:</span> <strong style={{ color: '#fff' }}>{p.stats.pass_accuracy}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Shots on Target:</span> <strong style={{ color: '#fff' }}>{p.stats.shots_on_target}</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Distance Run:</span> <strong style={{ color: '#fff' }}>{p.stats.distance_run}</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
