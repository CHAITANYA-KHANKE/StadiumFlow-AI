import React from 'react';
import { Home, MapPin, Shield, Armchair, Trophy, LogOut, Clock } from 'lucide-react';

// Maps a timeline step type to an appropriate Lucide icon & color
const getStepMeta = (type) => {
  switch (type) {
    case 'departure':
      return { icon: <Home size={16} />, color: '#60a5fa' }; // Blue
    case 'arrival':
      return { icon: <MapPin size={16} />, color: '#00f2fe' }; // Cyan
    case 'security':
      return { icon: <Shield size={16} />, color: '#fbbf24' }; // Amber
    case 'seat':
      return { icon: <Armchair size={16} />, color: '#f02fc2' }; // Magenta
    case 'kickoff':
      return { icon: <Trophy size={16} />, color: '#10b981' }; // Emerald
    case 'exit':
      return { icon: <LogOut size={16} />, color: '#ef4444' }; // Red
    default:
      return { icon: <Clock size={16} />, color: '#94a3b8' }; // Grey
  }
};

export default function TimelineView({
  steps = [],
  _estimatedArrival = '',
  message = '',
}) {
  return (
    <div className="glass-card animate-fade-in flex-column" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 4px 0' }}>Matchday Timeline</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
        Dynamic, real-time timeline recalculated based on congestion.
      </p>

      {message && (
        <div 
          style={{ 
            backgroundColor: 'rgba(0, 242, 254, 0.05)', 
            border: '1px solid rgba(0, 242, 254, 0.15)', 
            borderRadius: 'var(--radius-md)', 
            padding: '12px 16px', 
            fontSize: '13.5px', 
            lineHeight: '1.4',
            color: 'var(--text-main)',
            marginBottom: '24px',
            borderLeft: '4px solid var(--primary)'
          }}
        >
          {message}
        </div>
      )}

      {steps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          No timeline generated yet. Enter seat & gate information above to generate your plan.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '18px' }}>
          {/* Central Connecting Vertical Line */}
          <div 
            style={{ 
              position: 'absolute', 
              left: '9px', 
              top: '8px', 
              bottom: '8px', 
              width: '2px', 
              backgroundColor: 'var(--border-light)' 
            }}
          ></div>

          {/* Timeline Nodes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map((step, idx) => {
              const meta = getStepMeta(step.type);

              return (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Glowing Node Dot / Icon wrapper */}
                  <div 
                    style={{ 
                      zIndex: 2,
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--bg-surface)', 
                      border: `2px solid ${meta.color}`,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: meta.color,
                      boxShadow: `0 0 10px ${meta.color}33`,
                      position: 'absolute',
                      left: '-20px',
                      top: '2px'
                    }}
                  >
                    {meta.icon}
                  </div>

                  {/* Content Panel */}
                  <div style={{ paddingLeft: '16px', flex: 1 }}>
                    <div className="flex-between" style={{ gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span 
                        style={{ 
                          fontFamily: 'var(--font-heading)', 
                          fontSize: '15px', 
                          fontWeight: '700', 
                          color: 'var(--text-bright)' 
                        }}
                      >
                        {step.event_title}
                      </span>
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid var(--border-light)', 
                          color: '#fff', 
                          fontWeight: '700',
                          padding: '2px 8px',
                          fontSize: '12px'
                        }}
                      >
                        {step.time}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
