import React, { useState } from 'react';
import { Play, RotateCcw, ShieldAlert, Users, TrendingUp } from 'lucide-react';

const SCENARIOS = [
  {
    id: 'gate_c_closure',
    name: 'Gate C Structural Blockage',
    description: 'Gate C is temporarily closed. Redirects crowd to Gates B & D.',
    severity: 'high',
  },
  {
    id: 'gate_a_overload',
    name: 'Gate A Security Overload',
    description: 'Heavy visitor arrival at Gate A causes security queues to spike to 25 mins.',
    severity: 'medium',
  },
  {
    id: 'north_concourse_congested',
    name: 'North Concourse Bottleneck',
    description: 'Sudden congestion buildup on lower North concourse near Food Stall L1.',
    severity: 'medium',
  },
  {
    id: 'food_stall_l2_closed',
    name: 'Food Stall L2 Shut Down',
    description: 'Food Stall L2 closed for maintenance. Food traffic shifts to L1 and L3.',
    severity: 'low',
  },
  {
    id: 'exit_transport_block',
    name: 'Southern Gate E & F Congestion',
    description: 'Southern transit bottleneck during exit rush. Advises exit via North gates.',
    severity: 'high',
  },
];

export default function SimulatorControls({
  currentScenarioId = 'reset',
  onTriggerScenario = null,
  onResetSimulation = null,
  impactReport = null,
  isLoading = false,
}) {
  const [selectedId, setSelectedId] = useState('');

  const handleTrigger = () => {
    if (!selectedId || isLoading) return;
    if (onTriggerScenario) {
      onTriggerScenario(selectedId);
    }
  };

  const handleReset = () => {
    setSelectedId('');
    if (onResetSimulation) {
      onResetSimulation();
    }
  };

  // Helper to style severity badges
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return { color: 'var(--status-closed)', border: '1px solid rgba(255, 74, 90, 0.2)', backgroundColor: 'var(--status-closed-bg)' };
      case 'medium':
        return { color: 'var(--status-warning)', border: '1px solid rgba(255, 208, 0, 0.2)', backgroundColor: 'var(--status-warning-bg)' };
      default:
        return { color: 'var(--status-open)', border: '1px solid rgba(0, 245, 160, 0.2)', backgroundColor: 'var(--status-open-bg)' };
    }
  };

  return (
    <div className="glass-card flex-column animate-fade-in" style={{ gap: '20px' }}>
      <div>
        <h3 style={{ margin: '0 0 4px 0' }}>What-If Simulation Engine</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Inject incidents to model crowd redistribution and test system resilience.
        </p>
      </div>

      {/* Scenario Grid Selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {SCENARIOS.map((sc) => {
          const isSelected = selectedId === sc.id;
          const isCurrentlyActive = currentScenarioId === sc.id;
          const sevStyle = getSeverityStyle(sc.severity);

          return (
            <div
              key={sc.id}
              onClick={() => !isLoading && setSelectedId(sc.id)}
              className="glass-card-interactive"
              style={{
                border: isCurrentlyActive 
                  ? '1px solid var(--primary)' 
                  : isSelected 
                    ? '1px solid rgba(255, 255, 255, 0.2)' 
                    : '1px solid var(--border-light)',
                backgroundColor: isCurrentlyActive 
                  ? 'rgba(0, 242, 254, 0.02)' 
                  : isSelected 
                    ? 'rgba(255, 255, 255, 0.02)' 
                    : 'rgba(15, 21, 36, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="flex-row" style={{ gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-bright)' }}>{sc.name}</span>
                  <span className="badge" style={{ ...sevStyle, fontSize: '9px', padding: '1px 6px' }}>{sc.severity}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>{sc.description}</p>
              </div>

              {isCurrentlyActive && (
                <span className="badge badge-closed" style={{ fontSize: '10px', fontWeight: '800' }}>Live</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex-row" style={{ gap: '12px', width: '100%' }}>
        <button
          onClick={handleTrigger}
          disabled={isLoading || !selectedId || currentScenarioId === selectedId}
          className="btn-primary"
          style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
        >
          <Play size={15} /> Inject Scenario
        </button>
        <button
          onClick={handleReset}
          disabled={isLoading || currentScenarioId === 'reset'}
          className="btn-secondary"
          style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}
        >
          <RotateCcw size={15} /> Reset
        </button>
      </div>

      {/* Simulation Impact Report Panel */}
      {impactReport && currentScenarioId !== 'reset' && (
        <div 
          className="animate-fade-in" 
          style={{ 
            marginTop: '12px', 
            borderTop: '1px solid var(--border-light)', 
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-bright)' }}>Simulation Impact Analysis</h4>

          {/* Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Entry Wait Impact */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div className="flex-row" style={{ gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                <Users size={12} /> Avg Gate Security Wait
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{impactReport.average_entry_time_report.after_value}m</span>
                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: impactReport.average_entry_time_report.change > 0 ? 'var(--status-closed)' : 'var(--status-open)' 
                  }}
                >
                  {impactReport.average_entry_time_report.change > 0 ? '+' : ''}{impactReport.average_entry_time_report.change}m
                </span>
              </div>
            </div>

            {/* Concourse Load Impact */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div className="flex-row" style={{ gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                <TrendingUp size={12} /> Concourse Congestion
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{impactReport.crowd_pressure_report.after_value}x</span>
                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: impactReport.crowd_pressure_report.change > 0 ? 'var(--status-closed)' : 'var(--status-open)' 
                  }}
                >
                  {impactReport.crowd_pressure_report.change > 0 ? '+' : ''}{impactReport.crowd_pressure_report.change}x
                </span>
              </div>
            </div>
          </div>

          {/* Critical Zones List */}
          {impactReport.critical_zones && impactReport.critical_zones.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                Critical bottlenecks identified:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {impactReport.critical_zones.map((zoneId) => (
                  <span 
                    key={zoneId} 
                    className="badge badge-closed animate-fade-in"
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                  >
                    ⚠️ {zoneId.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Briefing summary */}
          <div 
            style={{ 
              backgroundColor: 'rgba(0, 242, 254, 0.03)', 
              border: '1px solid rgba(0, 242, 254, 0.12)', 
              borderRadius: 'var(--radius-md)', 
              padding: '12px 14px',
              fontSize: '12.5px',
              lineHeight: '1.45',
              borderLeft: '3px solid var(--primary)'
            }}
          >
            <div className="flex-row" style={{ gap: '6px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>
              <ShieldAlert size={12} /> AI Incident Analysis
            </div>
            {impactReport.ai_impact_summary || 'Analyzing operational redistribution...'}
          </div>
        </div>
      )}
    </div>
  );
}
