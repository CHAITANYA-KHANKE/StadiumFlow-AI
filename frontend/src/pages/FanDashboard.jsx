import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import StadiumMap from '../components/StadiumMap';
import TimelineView from '../components/TimelineView';
import AICompanion from '../components/AICompanion';
import ParallaxCard from '../components/ParallaxCard';
import { LogOut, RefreshCw, Star } from 'lucide-react';
import { translate } from '../services/translator';
import MatchCenter from '../components/MatchCenter';
import PlayerCards from '../components/PlayerCards';

export default function FanDashboard({ userPrefs, onBack }) {
  const language = userPrefs.language || 'en';

  // State for Stadium Data & Live Conditions
  const [stadiumNodes, setStadiumNodes] = useState({});
  const [stadiumEdges, setStadiumEdges] = useState([]);
  const [liveState, setLiveState] = useState({});

  // Route & Navigation State
  const [selectedStart, setSelectedStart] = useState(userPrefs.gateId || 'gate_a');
  const [selectedEnd, setSelectedEnd] = useState(userPrefs.sectionId || 'section_101');
  const [pathNodes, setPathNodes] = useState([]);
  const [pathTime, setPathTime] = useState(0.0);
  const [pathDistance, setPathDistance] = useState(0.0);
  const [pathExplanation, setPathExplanation] = useState('');

  // Timeline State
  const [timelineSteps, setTimelineSteps] = useState([]);
  const [timelineArrival, setTimelineArrival] = useState('');
  const [timelineMessage, setTimelineMessage] = useState('');

  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Facility Explorer State
  const [facilityCategory, setFacilityCategory] = useState('restroom');
  const [facilityList, setFacilityList] = useState([]);

  const [feedbackNodeId, setFeedbackNodeId] = useState('');
  const [feedbackHelpful, setFeedbackHelpful] = useState(true);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [isLoadingState, setIsLoadingState] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'match' | 'player'

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

  // 2. Fetch live state and calculate timeline / route
  const fetchLiveState = async () => {
    setIsLoadingState(true);
    try {
      const state = await apiService.getLiveState();
      setLiveState(state);
      
      // Calculate Timeline
      const timeline = await apiService.generateTimeline(
        userPrefs.section,
        userPrefs.row,
        userPrefs.seatNum,
        userPrefs.gateId,
        userPrefs.accessibility,
        "17:20"
      );
      setTimelineSteps(timeline.steps);
      setTimelineArrival(timeline.estimated_seat_arrival);
      setTimelineMessage(timeline.message);
    } catch (err) {
      console.error('Failed to sync live conditions:', err);
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPrefs]);

  // Translate timeline steps to Hindi if preferred
  const getTranslatedTimelineSteps = () => {
    return timelineSteps.map(step => {
      // Basic dynamic content replacers
      let title = translate(step.type, language);
      let desc = translate(`desc_${step.type}`, language);

      if (step.type === 'security') {
        const wait = liveState.gate_security_wait?.[userPrefs.gateId] || 5;
        const level = wait >= 15 ? translate('heavy', language) : translate('normal', language);
        desc = desc.replace('{wait}', wait).replace('{level}', level);
      } else if (step.type === 'navigate_seat') {
        desc = desc.replace('{section}', userPrefs.section).replace('{dist}', pathDistance || 200);
      } else if (step.type === 'reach_seat') {
        desc = desc.replace('{section}', userPrefs.section).replace('{row}', userPrefs.row).replace('{seat}', userPrefs.seatNum);
      } else if (step.type === 'smart_exit') {
        desc = desc.replace('{gate}', userPrefs.gateId.replace('gate_', '').toUpperCase()).replace('{wait}', 12);
      }

      return {
        ...step,
        event_title: title !== step.type ? title : step.event_title,
        description: desc !== `desc_${step.type}` ? desc : step.description
      };
    });
  };

  // 3. Recalculate route whenever start/end nodes or accessibility toggle changes
  const calculateRoute = async (start, end) => {
    if (!start || !end) return;
    try {
      const route = await apiService.calculateRoute(start, end, userPrefs.accessibility);
      setPathNodes(route.path_nodes);
      setPathDistance(route.total_distance);
      setPathTime(route.estimated_time);

      // Request translated explanation if language is Hindi
      if (language === 'hi' || language === 'hinglish') {
        const explainedObj = await apiService.chatAssistant(
          `Explain the walking route from ${start} to ${end}. Keep it short.`,
          start,
          language
        );
        setPathExplanation(explainedObj.answer);
      } else {
        setPathExplanation(route.reason_explanation);
      }
    } catch (err) {
      console.error('Failed to compute route:', err);
    }
  };

  useEffect(() => {
    if (Object.keys(stadiumNodes).length > 0) {
      calculateRoute(selectedStart, selectedEnd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStart, selectedEnd, stadiumNodes, userPrefs.accessibility, liveState]);

  // 4. Calculate Facility recommendations based on Explorer Category
  const loadFacilityRecommendations = async () => {
    try {
      const rec = await apiService.recommendFacility(
        selectedStart, // current location is base
        facilityCategory,
        userPrefs.accessibility
      );

      // Build facilities list from recommended + alternatives
      const list = [];
      if (rec.facility_id) {
        // Add best choice
        const queueVal = liveState.facility_queues?.[rec.facility_id] || 0.0;
        const walkVal = Math.max(0, rec.estimated_total_time - queueVal);
        list.push({
          id: rec.facility_id,
          name: rec.recommended_option,
          walking_time: walkVal,
          queue_time: queueVal,
          total_time: rec.estimated_total_time,
          isRecommended: true,
        });

        // Add alternatives
        rec.alternatives.forEach(alt => {
          list.push({
            id: alt.facility_id,
            name: alt.name,
            walking_time: alt.walking_time,
            queue_time: alt.queue_time,
            total_time: alt.total_time,
            isRecommended: false,
          });
        });
      }
      setFacilityList(list);
    } catch (err) {
      console.error('Failed to get facility recommendations:', err);
    }
  };

  useEffect(() => {
    if (Object.keys(stadiumNodes).length > 0 && liveState.last_updated) {
      loadFacilityRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityCategory, selectedStart, stadiumNodes, liveState]);

  // 5. Handle node click on Map
  const handleMapNodeClick = (node) => {
    if (node.category === 'gate') {
      setSelectedStart(node.id);
    } else {
      setSelectedEnd(node.id);
    }
  };

  // 6. Send message to AI Assistant
  const handleSendMessage = async (text) => {
    const userMsg = { sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      if ((text.toLowerCase().includes('restroom') || text.toLowerCase().includes('shauchalay')) && 
          (text.toLowerCase().includes('fastest') || text.toLowerCase().includes('sabse'))) {
        const rec = await apiService.recommendFacility(selectedStart, 'restroom', userPrefs.accessibility);
        const aiResponseMsg = {
          sender: 'assistant',
          type: 'recommendation',
          text: rec.reason_explanation,
          data: rec
        };
        setChatMessages(prev => [...prev, aiResponseMsg]);
      } else if ((text.toLowerCase().includes('food') || text.toLowerCase().includes('khana')) && 
                 (text.toLowerCase().includes('fastest') || text.toLowerCase().includes('sabse'))) {
        const rec = await apiService.recommendFacility(selectedStart, 'food', userPrefs.accessibility);
        const aiResponseMsg = {
          sender: 'assistant',
          type: 'recommendation',
          text: rec.reason_explanation,
          data: rec
        };
        setChatMessages(prev => [...prev, aiResponseMsg]);
      } else {
        const ansObj = await apiService.chatAssistant(text, selectedStart, language);
        const botMsg = { sender: 'assistant', text: ansObj.answer };
        setChatMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = language === 'hi' 
        ? 'माफ़ कीजिये, इस समय अनुरोध को संसाधित करने में समस्या आ रही है।' 
        : 'Sorry, I had trouble processing that request. Please try again.';
      const botMsg = { sender: 'assistant', text: errorMsg };
      setChatMessages(prev => [...prev, botMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 7. Submit Feedback Form
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackNodeId) return;
    try {
      await apiService.submitFeedback(feedbackNodeId, feedbackHelpful, feedbackComment);
      setFeedbackMessage(translate('feedback_sent', language));
      setFeedbackComment('');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const currentStartName = stadiumNodes[selectedStart]?.name || 'Gate';

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner Dashboard Header */}
      <div 
        className="glass-card flex-between" 
        style={{ 
          padding: '16px 24px', 
          borderLeft: '4px solid var(--primary)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>
            {translate('spectator_portal', language)}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            {translate('seat', language)}: <strong>{userPrefs.section} (Row {userPrefs.row}, Seat {userPrefs.seatNum})</strong> • {translate('arrival_entrance', language)}: <strong>{currentStartName.split(' (')[0]}</strong>
          </p>
        </div>

        <div className="flex-row" style={{ gap: '10px' }}>
          {userPrefs.accessibility && (
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>♿ Accessible</span>
          )}
          <button 
            onClick={fetchLiveState} 
            disabled={isLoadingState}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '13px', gap: '4px' }}
          >
            <RefreshCw size={13} style={isLoadingState ? { animation: 'pulseGlow 1s infinite' } : {}} /> {translate('sync_live', language)}
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

      {/* Grid Dashboard */}
      <div className="grid-cols-12">
        {/* Left Column (Map & Explorer & Stats) */}
        <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-surface-glass)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <button 
              onClick={() => setActiveTab('map')} 
              className={activeTab === 'map' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '10px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)', border: 'none', transition: 'all 0.2s' }}
            >
              🗺️ {translate('smart_stadium_map', language)}
            </button>
            <button 
              onClick={() => setActiveTab('match')} 
              className={activeTab === 'match' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '10px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)', border: 'none', transition: 'all 0.2s' }}
            >
              ⚽ {language === 'hi' || language === 'hinglish' ? 'मैच केंद्र' : language === 'es' ? 'Centro de Partidos' : 'Match Center'}
            </button>
            <button 
              onClick={() => setActiveTab('player')} 
              className={activeTab === 'player' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '10px 14px', fontSize: '13px', borderRadius: 'var(--radius-sm)', border: 'none', transition: 'all 0.2s' }}
            >
              🏃‍♂️ {language === 'hi' || language === 'hinglish' ? 'खिलाड़ी प्रोफाइल' : language === 'es' ? 'Jugadores' : 'Player Profiles'}
            </button>
          </div>

          {activeTab === 'map' && (
            <>
              {/* Quick Navigation Control Panel */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '18px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '14px',
                  background: 'linear-gradient(135deg, var(--bg-surface-glass) 0%, rgba(8,11,17,0.7) 100%)',
                  border: '1px solid var(--border-light)' 
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                      📍 {language === 'hi' || language === 'hinglish' ? 'आप अभी कहाँ हैं?' : language === 'es' ? '¿Dónde se encuentra?' : 'Where are you now?'}
                    </label>
                    <select 
                      value={selectedStart} 
                      onChange={(e) => setSelectedStart(e.target.value)}
                      className="form-select"
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                    >
                      {Object.values(stadiumNodes).filter(n => n.category === 'gate' || n.category === 'concourse').map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                      🎯 {language === 'hi' || language === 'hinglish' ? 'सीट अनुभाग' : language === 'es' ? 'Sección de Destino' : 'Destination Seat'}
                    </label>
                    <select 
                      value={selectedEnd.startsWith('section_') ? selectedEnd : 'section_101'} 
                      onChange={(e) => setSelectedEnd(e.target.value)}
                      className="form-select"
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                    >
                      {Object.values(stadiumNodes).filter(n => n.category === 'section').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick actions for Nearest facilities */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                    ⚡ {language === 'hi' || language === 'hinglish' ? 'त्वरित खोजें' : language === 'es' ? 'Encontrar Servicio Cercano' : 'Quick Find Nearest'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => {
                        setFacilityCategory('restroom');
                        // Find closest restroom in the static list if loaded
                        const restList = Object.values(stadiumNodes).filter(n => n.category === 'restroom');
                        if (restList.length > 0) setSelectedEnd(restList[0].id);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      🚾 {language === 'hi' || language === 'hinglish' ? 'शौचालय' : language === 'es' ? 'Baño' : 'Restroom'}
                    </button>
                    <button 
                      onClick={() => {
                        setFacilityCategory('food');
                        const foodList = Object.values(stadiumNodes).filter(n => n.category === 'food');
                        if (foodList.length > 0) setSelectedEnd(foodList[0].id);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      🍔 {language === 'hi' || language === 'hinglish' ? 'भोजन' : language === 'es' ? 'Comida' : 'Food Stand'}
                    </button>
                    <button 
                      onClick={() => {
                        setFacilityCategory('medical');
                        const medList = Object.values(stadiumNodes).filter(n => n.category === 'medical');
                        if (medList.length > 0) setSelectedEnd(medList[0].id);
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      🚑 {language === 'hi' || language === 'hinglish' ? 'चिकित्सा' : language === 'es' ? 'Punto Médico' : 'First Aid'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Map wrapper in ParallaxCard */}
              <ParallaxCard maxRotation={4} style={{ padding: '16px' }}>
                <StadiumMap
                  nodes={stadiumNodes}
                  edges={stadiumEdges}
                  liveState={liveState}
                  pathNodes={pathNodes}
                  selectedStart={selectedStart}
                  selectedEnd={selectedEnd}
                  onSelectNode={handleMapNodeClick}
                  role="fan"
                  language={language}
                />
              </ParallaxCard>

              {/* Route Description Card */}
              {pathNodes.length > 0 && (
                <ParallaxCard maxRotation={4} style={{ borderLeft: '4px solid var(--primary)', padding: '16px' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-bright)' }}>
                      {translate('path_details', language)}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <strong>{translate('distance', language)}:</strong> {pathDistance} {translate('meters', language)} • <strong>{translate('time', language)}:</strong> {pathTime} {translate('minutes', language)}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.45', margin: 0 }}>
                    {pathExplanation}
                  </p>
                </ParallaxCard>
              )}

              {/* Facility Explorer */}
              <ParallaxCard maxRotation={3} className="flex-column" style={{ gap: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                    {translate('facility_explorer', language)}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    {translate('facility_sub', language)}
                  </p>
                </div>

                {/* Category selection */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['restroom', 'food', 'medical', 'info'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFacilityCategory(cat)}
                      className={facilityCategory === cat ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '6px 16px', fontSize: '12.5px' }}
                    >
                      {translate(`${cat}s`, language)}
                    </button>
                  ))}
                </div>

                {/* Recommendations List Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 12px' }}>{translate('name', language)}</th>
                        <th style={{ padding: '8px 12px' }}>{translate('walk_time', language)}</th>
                        <th style={{ padding: '8px 12px' }}>{translate('queue_wait', language)}</th>
                        <th style={{ padding: '8px 12px' }}>{translate('total_est', language)}</th>
                        <th style={{ padding: '8px 12px' }}>{translate('actions', language)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilityList.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                            {translate('no_facilities', language)}
                          </td>
                        </tr>
                      ) : (
                        facilityList.map((fac) => (
                          <tr 
                            key={fac.id}
                            style={{ 
                              borderBottom: '1px solid var(--border-light)',
                              backgroundColor: fac.isRecommended ? 'rgba(0, 242, 254, 0.02)' : 'transparent',
                            }}
                          >
                            <td style={{ padding: '12px 12px', fontWeight: fac.isRecommended ? '700' : '400' }}>
                              {fac.name} {fac.isRecommended && <span className="badge badge-open" style={{ fontSize: '9px', padding: '1px 6px', marginLeft: '6px' }}>{translate('fastest', language)}</span>}
                            </td>
                            <td style={{ padding: '12px 12px', color: 'var(--text-muted)' }}>{fac.walking_time}m</td>
                            <td style={{ padding: '12px 12px', color: 'var(--text-muted)' }}>{fac.queue_time}m</td>
                            <td style={{ padding: '12px 12px', color: fac.isRecommended ? 'var(--status-open)' : 'var(--text-bright)', fontWeight: '700' }}>
                              {fac.total_time} {translate('minutes', language)}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <button
                                onClick={() => setSelectedEnd(fac.id)}
                                className="btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
                              >
                                {translate('route_here', language)}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Spectator Feedback Loop Form */}
                {facilityList.length > 0 && (
                  <div 
                    style={{ 
                      marginTop: '10px', 
                      padding: '16px', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: 'var(--radius-md)', 
                      backgroundColor: 'rgba(255,255,255,0.01)' 
                    }}
                  >
                    <div className="flex-row" style={{ gap: '6px', marginBottom: '8px', color: 'var(--text-bright)' }}>
                      <Star size={13} style={{ fill: 'var(--primary)', color: 'var(--primary)' }} />
                      <span style={{ fontSize: '12.5px', fontWeight: '700' }}>{translate('feedback_title', language)}</span>
                    </div>

                    <form onSubmit={handleFeedbackSubmit} className="flex-row" style={{ gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                          {translate('select_fac_label', language)}
                        </label>
                        <select
                          value={feedbackNodeId}
                          onChange={(e) => setFeedbackNodeId(e.target.value)}
                          className="form-select"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <option value="">{translate('select_node', language)}</option>
                          {facilityList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', height: '32px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setFeedbackHelpful(true)}
                          className={feedbackHelpful ? 'btn-primary' : 'btn-secondary'}
                          style={{ padding: '4px 10px', fontSize: '11px', height: '100%', display: 'flex', alignItems: 'center' }}
                        >
                          {translate('accurate', language)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedbackHelpful(false)}
                          className={!feedbackHelpful ? 'btn-primary' : 'btn-secondary'}
                          style={{ padding: '4px 10px', fontSize: '11px', height: '100%', display: 'flex', alignItems: 'center' }}
                        >
                          {translate('inaccurate', language)}
                        </button>
                      </div>

                      <div style={{ flex: 1.5, minWidth: '180px', display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder={translate('comment_placeholder', language)}
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="form-input"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        />
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          disabled={!feedbackNodeId}
                        >
                          {translate('submit', language)}
                        </button>
                      </div>
                    </form>

                    {feedbackMessage && (
                      <p style={{ color: 'var(--status-open)', fontSize: '12px', margin: '8px 0 0 0', fontWeight: '600' }} className="animate-fade-in">
                        {feedbackMessage}
                      </p>
                    )}
                  </div>
                )}
              </ParallaxCard>
            </>
          )}

          {activeTab === 'match' && <MatchCenter language={language} />}
          {activeTab === 'player' && <PlayerCards language={language} />}

        </div>

        {/* Right Column (Timeline & AI Companion) */}
        <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Chat Assistant panel inside ParallaxCard */}
          <ParallaxCard maxRotation={4} style={{ padding: 0 }}>
            <AICompanion
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              language={language}
              currentNodeName={currentStartName.split(' (')[0]}
            />
          </ParallaxCard>

          {/* Timeline View inside ParallaxCard */}
          <ParallaxCard maxRotation={3} style={{ padding: 0 }}>
            <TimelineView
              steps={getTranslatedTimelineSteps()}
              estimatedArrival={timelineArrival}
              message={timelineMessage}
            />
          </ParallaxCard>
        </div>
      </div>
    </div>
  );
}
