import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import StadiumMap from '../components/StadiumMap';
import SimulatorControls from '../components/SimulatorControls';
import ParallaxCard from '../components/ParallaxCard';
import { Shield, RefreshCw, LogOut, ShieldAlert, AlertCircle, Sparkles, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { translate } from '../services/translator';

export default function OperatorDashboard({ onBack, language = 'en' }) {
  // Stadium layout state
  const [stadiumNodes, setStadiumNodes] = useState({});
  const [stadiumEdges, setStadiumEdges] = useState([]);
  const [liveState, setLiveState] = useState({});

  // Active scenario details
  const [currentScenarioId, setCurrentScenarioId] = useState('reset');
  const [impactReport, setImpactReport] = useState(null);
  const [aiOperationsBrief, setAiOperationsBrief] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);

  // Selected node inspect state
  const [inspectedNode, setInspectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch initial static data (stadium map topology)
  useEffect(() => {
    async function loadStaticData() {
      try {
        const data = await apiService.getStadium();
        const nodesMap = {};
        data.nodes.forEach(n => {
          nodesMap[n.id] = n;
        });
        setStadiumNodes(nodesMap);
        setStadiumEdges(data.edges);
      } catch (err) {
        console.error('Failed to load stadium layout:', err);
      }
    }
    loadStaticData();
  }, []);

  // 2. Fetch live state, AI briefs, and spectator feedbacks
  const fetchLiveState = async () => {
    setIsLoading(true);
    try {
      const state = await apiService.getLiveState();
      setLiveState(state);

      // Fetch AI Operations Brief
      const summary = await apiService.getOperationsSummary();
      
      // If language is Hindi, let AI model translate the operations brief
      if (language === 'hi' || language === 'hinglish') {
        const explainedObj = await apiService.chatAssistant(
          `Translate this stadium operations summary briefing into professional Hindi. Output ONLY the translated summary: \n${summary.summary}`,
          'gate_a',
          language
        );
        setAiOperationsBrief(explainedObj.answer);
      } else {
        setAiOperationsBrief(summary.summary);
      }

      // Fetch recent feedbacks
      const fbList = await apiService.getFeedbacks();
      setFeedbacks(fbList);
    } catch (err) {
      console.error('Failed to sync command center state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScenarioId, language]);

  // 3. Trigger simulation scenario
  const handleTriggerScenario = async (scenarioId) => {
    setIsLoading(true);
    try {
      const report = await apiService.triggerScenario(scenarioId);
      setImpactReport(report);
      setCurrentScenarioId(scenarioId);
      setInspectedNode(null); // Clear inspect
    } catch (err) {
      console.error('Failed to trigger scenario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Reset simulation to Normal Operations
  const handleResetSimulation = async () => {
    setIsLoading(true);
    try {
      await apiService.resetSimulation();
      setImpactReport(null);
      setCurrentScenarioId('reset');
      setInspectedNode(null);
    } catch (err) {
      console.error('Failed to reset simulation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Node inspect click
  const handleMapNodeClick = (node) => {
    setInspectedNode(node);
  };

  // 6. Calculate local KPI metrics
  const activeIncidents = liveState.active_incidents || [];
  const closuresCount = (liveState.gate_closures?.length || 0) + (liveState.facility_closures?.length || 0);
  
  // Calculate average gate wait (excluding closed gates)
  const gates = Object.values(stadiumNodes).filter(n => n.category === 'gate');
  const openGates = gates.filter(g => !liveState.gate_closures?.includes(g.id));
  const avgWait = openGates.length > 0
    ? (openGates.reduce((sum, g) => sum + (liveState.gate_security_wait?.[g.id] || 0.0), 0.0) / openGates.length).toFixed(1)
    : '0.0';

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Command Center Banner Header */}
      <div 
        className="glass-card flex-between" 
        style={{ 
          padding: '16px 24px', 
          borderLeft: '4px solid var(--border-focus)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div className="flex-row" style={{ gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(79, 172, 254, 0.1)', padding: '10px', borderRadius: '50%', color: 'var(--border-focus)' }}>
            <Shield size={22} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
              {translate('command_center', language)}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Operational Status: <strong style={{ color: currentScenarioId === 'reset' ? 'var(--status-open)' : 'var(--status-closed)' }}>
                {currentScenarioId === 'reset' ? translate('normal_ops', language) : translate('incident_mode', language)}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex-row" style={{ gap: '10px' }}>
          <button 
            onClick={fetchLiveState} 
            disabled={isLoading}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', gap: '4px' }}
          >
            <RefreshCw size={13} style={isLoading ? { animation: 'pulseGlow 1s infinite' } : {}} /> {translate('sync_live', language)}
          </button>
          <button 
            onClick={onBack} 
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', border: '1px solid rgba(255, 74, 90, 0.2)', color: 'var(--status-closed)' }}
          >
            <LogOut size={13} /> {translate('exit', language)}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* KPI 1: Active Incidents */}
        <ParallaxCard maxRotation={4} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Active Incidents</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: activeIncidents.length > 0 ? 'var(--status-closed)' : '#fff' }}>{activeIncidents.length}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>active reports</span>
          </div>
        </ParallaxCard>

        {/* KPI 2: Average Security Wait */}
        <ParallaxCard maxRotation={4} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Avg Gate Wait Time</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: parseFloat(avgWait) >= 15 ? 'var(--status-closed)' : '#fff' }}>{avgWait}m</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>screening wait</span>
          </div>
        </ParallaxCard>

        {/* KPI 3: System Closures */}
        <ParallaxCard maxRotation={4} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Closed Zones & Gates</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: closuresCount > 0 ? 'var(--status-warning)' : '#fff' }}>{closuresCount}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>closed nodes</span>
          </div>
        </ParallaxCard>

        {/* KPI 4: Feedback Alerts */}
        <ParallaxCard maxRotation={4} style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>Spectator Reports</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>{feedbacks.length}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>feedback submissions</span>
          </div>
        </ParallaxCard>
      </div>

      {/* Main Panel grid */}
      <div className="grid-cols-12">
        {/* Left Side: SVG Map & Details */}
        <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Map in ParallaxCard */}
          <ParallaxCard maxRotation={3} style={{ padding: '16px' }}>
            <StadiumMap
              nodes={stadiumNodes}
              edges={stadiumEdges}
              liveState={liveState}
              onSelectNode={handleMapNodeClick}
              role="operator"
              language={language}
            />
          </ParallaxCard>

          {/* Node inspect panel */}
          {inspectedNode && (
            <ParallaxCard maxRotation={4} style={{ borderLeft: '4px solid var(--border-focus)', padding: '20px' }}>
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Inspect Node: {inspectedNode.name}</h4>
                <span className="badge badge-open" style={{ fontSize: '10px' }}>ID: {inspectedNode.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Category:</span> <strong style={{ textTransform: 'capitalize' }}>{inspectedNode.category}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Accessibility:</span> <strong>{inspectedNode.accessible ? 'Wheelchair OK' : 'Inaccessible'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Live Status:</span>{' '}
                  <strong 
                    style={{ 
                      color: liveState.gate_closures?.includes(inspectedNode.id) || liveState.facility_closures?.includes(inspectedNode.id) 
                        ? 'var(--status-closed)' 
                        : 'var(--status-open)' 
                    }}
                  >
                    {liveState.gate_closures?.includes(inspectedNode.id) || liveState.facility_closures?.includes(inspectedNode.id) ? 'Closed' : 'Operational'}
                  </strong>
                </div>

                {/* Gates details */}
                {inspectedNode.category === 'gate' && (
                  <div style={{ gridColumn: 'span 3', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Security wait time:</span>{' '}
                    <strong>{liveState.gate_security_wait?.[inspectedNode.id] || 0.0} minutes</strong>
                  </div>
                )}

                {/* Restrooms/food details */}
                {['restroom', 'food'].includes(inspectedNode.category) && (
                  <div style={{ gridColumn: 'span 3', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated queue delay:</span>{' '}
                    <strong>{liveState.facility_queues?.[inspectedNode.id] || 0.0} minutes</strong>
                  </div>
                )}
              </div>
            </ParallaxCard>
          )}

          {/* AI Briefing Command Panel */}
          <ParallaxCard maxRotation={4} className="flex-column" style={{ padding: '24px', gap: '12px' }}>
            <div className="flex-row" style={{ gap: '6px', color: 'var(--primary)' }}>
              <Sparkles size={16} />
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                {language === 'hi' ? 'एआई लाइव संचालन संश्लेषण' : 'GenAI Live Operational Synthesis'}
              </h3>
            </div>
            <div 
              style={{ 
                fontSize: '13.5px', 
                color: 'var(--text-main)', 
                lineHeight: '1.5',
                whiteSpace: 'pre-line',
                backgroundColor: 'rgba(255,255,255,0.01)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}
            >
              {aiOperationsBrief || 'Generating operational synthesis summary...'}
            </div>
          </ParallaxCard>
        </div>

        {/* Right Side: Simulation Panel & Incidents */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Simulator Panel wrapped in ParallaxCard */}
          <ParallaxCard maxRotation={3} style={{ padding: 0 }}>
            <SimulatorControls
              currentScenarioId={currentScenarioId}
              onTriggerScenario={handleTriggerScenario}
              onResetSimulation={handleResetSimulation}
              impactReport={impactReport}
              isLoading={isLoading}
            />
          </ParallaxCard>

          {/* Incidents Logger */}
          <ParallaxCard maxRotation={4} className="flex-column" style={{ gap: '16px' }}>
            <div className="flex-row" style={{ gap: '8px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--status-closed)' }} />
              <h3 style={{ margin: 0, fontSize: '15px' }}>Venue Incidents Logger</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              {activeIncidents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No active incidents. Stadium is operating smoothly.
                </div>
              ) : (
                activeIncidents.map((inc) => (
                  <div 
                    key={inc.id} 
                    style={{ 
                      padding: '12px', 
                      backgroundColor: 'rgba(255, 74, 90, 0.02)', 
                      border: '1px solid rgba(255, 74, 90, 0.12)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <AlertCircle size={16} style={{ color: 'var(--status-closed)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div className="flex-row" style={{ gap: '6px', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--text-bright)' }}>{inc.title}</strong>
                        <span className="badge badge-closed" style={{ fontSize: '8px', padding: '1px 4px' }}>{inc.severity}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.45' }}>{inc.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ParallaxCard>

          {/* Feedback Monitoring Panel */}
          <ParallaxCard maxRotation={4} className="flex-column" style={{ gap: '16px' }}>
            <div className="flex-row" style={{ gap: '8px' }}>
              <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: '15px' }}>Spectator Queue Feeds Monitor</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
              {feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No spectator queue reports received yet.
                </div>
              ) : (
                feedbacks.slice().reverse().map((fb, idx) => (
                  <div 
                    key={idx}
                    style={{ 
                      padding: '10px 12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12.5px'
                    }}
                  >
                    <div className="flex-between" style={{ marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-bright)' }}>{fb.location_id.replace('_', ' ').toUpperCase()}</strong>
                      <span className="flex-row" style={{ gap: '4px', fontSize: '11px', color: fb.helpful ? 'var(--status-open)' : 'var(--status-closed)' }}>
                        {fb.helpful ? <ThumbsUp size={11} /> : <ThumbsDown size={11} />}
                        {fb.helpful ? 'Helpful' : 'Crowded / Inaccurate'}
                      </span>
                    </div>
                    {fb.comment && <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.4' }}>"{fb.comment}"</p>}
                  </div>
                ))
              )}
            </div>
          </ParallaxCard>
        </div>
      </div>
    </div>
  );
}
