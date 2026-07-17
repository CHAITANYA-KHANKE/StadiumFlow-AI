import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Trophy, Clock, Play, Award, ChevronDown, ChevronRight, Calendar } from 'lucide-react';


export default function MatchCenter({ language = 'en' }) {
  const [matches, setMatches] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const fetchMatches = async () => {
    try {
      const data = await apiService.getMatches();
      setMatches(data.filter(m => m.id !== 'bracket_structure'));
      
      const bracketObj = data.find(m => m.id === 'bracket_structure');
      if (bracketObj && bracketObj.bracket) {
        setBracket(bracketObj.bracket);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTranslatedStage = (stage) => {
    if (language === 'hi' || language === 'hinglish') {
      if (stage === 'Quarterfinals') return 'क्वार्टर फाइनल';
      if (stage === 'Semifinals') return 'सेमीफाइनल';
      if (stage === 'Final') return 'फाइनल';
      if (stage === 'Round of 16') return 'राउंड ऑफ 16';
    }
    if (language === 'es') {
      if (stage === 'Quarterfinals') return 'Cuartos de final';
      if (stage === 'Semifinals') return 'Semifinales';
      if (stage === 'Final') return 'Final';
      if (stage === 'Round of 16') return 'Octavos de final';
    }
    return stage;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'hi' ? 'hi-IN' : 'en-US', options);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        Loading matches and brackets...
      </div>
    );
  }

  // Determine current, today's, upcoming, and past matches
  const liveMatches = matches.filter(m => m.status === 'live');
  
  // Date format comparisons
  const todayStr = '2026-07-17'; // Anchor date of the hackathon simulation
  const todaysMatches = matches.filter(m => m.datetime.startsWith(todayStr) && m.status !== 'completed');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming' && !m.datetime.startsWith(todayStr));
  const completedMatches = matches.filter(m => m.status === 'completed');

  // Find next match
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  const toggleExpandMatch = (id) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  return (
    <div className="flex-column" style={{ gap: '24px' }}>
      
      {/* 1. Live or Today's Match section */}
      {liveMatches.length > 0 ? (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--status-closed)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-closed)', display: 'inline-block', animation: 'pulseGlow 1.5s infinite' }}></span>
            {language === 'hi' || language === 'hinglish' ? 'लाइव मैच' : language === 'es' ? 'Partidos en Vivo' : 'Live Matches'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {liveMatches.map((m) => (
              <div 
                key={m.id} 
                className="glass-card" 
                style={{ 
                  borderLeft: '4px solid var(--status-closed)', 
                  backgroundColor: 'rgba(255, 74, 90, 0.01)',
                  padding: '20px'
                }}
              >
                <div className="flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <span>{getTranslatedStage(m.stage)}</span>
                  <span>{formatDate(m.datetime)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', margin: '14px 0' }}>
                  <div style={{ flex: 1, textAlign: 'right', fontWeight: '800', fontSize: '18px', color: '#fff' }}>{m.home_team}</div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '20px', fontWeight: '800' }}>
                    <span style={{ color: 'var(--primary)' }}>{m.home_score}</span> - <span style={{ color: 'var(--primary)' }}>{m.away_score}</span>
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', fontWeight: '800', fontSize: '18px', color: '#fff' }}>{m.away_team}</div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-closed" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    <Play size={10} /> {m.minute}'
                  </span>
                </div>

                {m.events && m.events.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: '700', marginBottom: '6px', fontSize: '11px', textTransform: 'uppercase' }}>
                      {language === 'hi' || language === 'hinglish' ? 'मुख्य घटनाएं' : language === 'es' ? 'Eventos Clave' : 'Key Events'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {m.events.map((e, idx) => (
                        <div key={idx} className="flex-between">
                          <span>{e.time} - {e.player}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({e.detail})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : todaysMatches.length > 0 ? (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} />
            {language === 'hi' || language === 'hinglish' ? 'आज के मैच' : language === 'es' ? 'Partidos de Hoy' : "Today's Matches"}
          </h4>
          {todaysMatches.map((m) => (
            <div key={m.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)' }}>
              <div className="flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>{getTranslatedStage(m.stage)}</span>
                <span>{formatDate(m.datetime)}</span>
              </div>
              <div className="flex-between" style={{ fontWeight: '800', fontSize: '16px', color: '#fff' }}>
                <span>{m.home_team}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400' }}>vs</span>
                <span>{m.away_team}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State: No matches scheduled for today */
        <div 
          className="glass-card" 
          style={{ 
            padding: '24px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(15, 21, 36, 0.45) 0%, rgba(8, 11, 17, 0.6) 100%)',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#fff', fontWeight: '800' }}>
            {language === 'hi' || language === 'hinglish' ? 'आज कोई मैच नहीं है' : language === 'es' ? 'No hay partidos hoy' : 'No Matches Scheduled Today'}
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
            {language === 'hi' || language === 'hinglish' 
              ? 'आज (१७ जुलाई २०२६) को कोई मैच निर्धारित नहीं है।' 
              : language === 'es' 
                ? 'No hay partidos programados para hoy (17 de julio de 2026).' 
                : 'There are no fixtures scheduled for today (July 17, 2026).'}
          </p>

          {/* Next Match Promo */}
          {nextMatch && (
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '12px', 
                backgroundColor: 'rgba(0, 242, 254, 0.03)', 
                border: '1px solid var(--border-glow)', 
                padding: '10px 16px', 
                borderRadius: 'var(--radius-md)' 
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
                {language === 'hi' || language === 'hinglish' ? 'अगला मैच ➔' : language === 'es' ? 'Próximo Partido ➔' : 'Next Match ➔'}
              </span>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>
                {nextMatch.home_team} vs {nextMatch.away_team} ({getTranslatedStage(nextMatch.stage)})
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {formatDate(nextMatch.datetime)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid for Upcoming & Past Matches */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Upcoming matches */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} className="text-muted" />
            {language === 'hi' || language === 'hinglish' ? 'आगामी मैच' : language === 'es' ? 'Próximos Partidos' : 'Upcoming Matches'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingMatches.map((m) => (
              <div key={m.id} className="glass-card" style={{ padding: '16px' }}>
                <div className="flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span>{getTranslatedStage(m.stage)}</span>
                  <span>{formatDate(m.datetime)}</span>
                </div>
                <div className="flex-between" style={{ fontWeight: '700', fontSize: '14px', color: '#fff' }}>
                  <span>{m.home_team}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '400' }}>vs</span>
                  <span>{m.away_team}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed matches (collapsible with goalscorers details) */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} className="text-muted" />
            {language === 'hi' || language === 'hinglish' ? 'समाप्त मैच (विवरण के लिए क्लिक करें)' : language === 'es' ? 'Resultados Recientes (clic para detalles)' : 'Completed Matches (click for details)'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedMatches.map((m) => {
              const isExpanded = expandedMatchId === m.id;

              return (
                <div 
                  key={m.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '16px', 
                    cursor: 'pointer',
                    borderColor: isExpanded ? 'var(--primary)' : 'var(--border-light)',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => toggleExpandMatch(m.id)}
                >
                  <div className="flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>{getTranslatedStage(m.stage)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {formatDate(m.datetime)}
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                  </div>
                  <div className="flex-between" style={{ fontWeight: '700', fontSize: '14px' }}>
                    <span style={{ color: m.home_score > m.away_score ? '#fff' : 'var(--text-muted)' }}>{m.home_team}</span>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', fontSize: '13px' }}>
                      {m.home_score} - {m.away_score}
                    </span>
                    <span style={{ color: m.away_score > m.home_score ? '#fff' : 'var(--text-muted)' }}>{m.away_team}</span>
                  </div>

                  {/* Expanded events panel */}
                  {isExpanded && m.events && m.events.length > 0 && (
                    <div 
                      style={{ 
                        borderTop: '1px solid var(--border-light)', 
                        marginTop: '12px', 
                        paddingTop: '10px', 
                        fontSize: '12px', 
                        color: 'var(--text-muted)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent double trigger
                    >
                      {m.events.map((e, idx) => (
                        <div key={idx} className="flex-between">
                          <span>⚽ {e.time} - {e.player}</span>
                          <span>({e.detail})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tournament Knockout Bracket */}
      {bracket && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-bright)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={18} style={{ color: 'var(--primary)' }} />
            {language === 'hi' || language === 'hinglish' ? 'टूर्नामेंट ब्रैकेट' : language === 'es' ? 'Cuadro del Torneo' : 'Tournament Bracket'}
          </h4>
          
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              gap: '20px', 
              overflowX: 'auto', 
              paddingBottom: '10px',
              minWidth: '550px'
            }}
          >
            {/* Quarterfinals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', marginBottom: '4px' }}>
                {getTranslatedStage('Quarterfinals')}
              </div>
              {bracket.quarterfinals.map((match) => (
                <div 
                  key={match.id} 
                  style={{ 
                    padding: '8px 12px', 
                    backgroundColor: 'rgba(255,255,255,0.01)', 
                    border: match.winner ? '1px solid var(--border-light)' : '1px dashed var(--border-light)', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px'
                  }}
                >
                  <div className="flex-between" style={{ color: match.winner === match.team1 ? 'var(--status-open)' : 'var(--text-muted)', fontWeight: match.winner === match.team1 ? '700' : '400' }}>
                    <span>{match.team1}</span>
                    <span>{match.score1}</span>
                  </div>
                  <div className="flex-between" style={{ color: match.winner === match.team2 ? 'var(--status-open)' : 'var(--text-muted)', fontWeight: match.winner === match.team2 ? '700' : '400', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px', marginTop: '4px' }}>
                    <span>{match.team2}</span>
                    <span>{match.score2}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting lines spacer */}
            <div style={{ color: 'var(--border-light)', fontSize: '20px', userSelect: 'none' }}>➜</div>

            {/* Semifinals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', marginBottom: '4px' }}>
                {getTranslatedStage('Semifinals')}
              </div>
              {bracket.semifinals.map((match) => (
                <div 
                  key={match.id} 
                  style={{ 
                    padding: '10px 14px', 
                    backgroundColor: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-light)', 
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12.5px'
                  }}
                >
                  <div className="flex-between" style={{ color: match.winner === match.team1 ? 'var(--status-open)' : 'var(--text-muted)', fontWeight: match.winner === match.team1 ? '700' : '400' }}>
                    <span>{match.team1}</span>
                    <span>{match.score1}</span>
                  </div>
                  <div className="flex-between" style={{ color: match.winner === match.team2 ? 'var(--status-open)' : 'var(--text-muted)', fontWeight: match.winner === match.team2 ? '700' : '400', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px', marginTop: '4px' }}>
                    <span>{match.team2}</span>
                    <span>{match.score2}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Connecting lines spacer */}
            <div style={{ color: 'var(--border-light)', fontSize: '20px', userSelect: 'none' }}>➜</div>

            {/* Final */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center', marginBottom: '4px' }}>
                {getTranslatedStage('Final')}
              </div>
              {bracket.final.map((match) => (
                <div 
                  key={match.id} 
                  style={{ 
                    padding: '14px', 
                    backgroundColor: 'rgba(0, 242, 254, 0.01)', 
                    border: '2px solid var(--primary)', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  <div className="flex-between" style={{ color: match.winner === match.team1 ? 'var(--status-open)' : '#fff', fontWeight: '700' }}>
                    <span>{match.team1}</span>
                    <span>{match.score1}</span>
                  </div>
                  <div className="flex-between" style={{ color: match.winner === match.team2 ? 'var(--status-open)' : '#fff', fontWeight: '700', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '6px' }}>
                    <span>{match.team2}</span>
                    <span>{match.score2}</span>
                  </div>
                  {match.detail && (
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                      {match.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
