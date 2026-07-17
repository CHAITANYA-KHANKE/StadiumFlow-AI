import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Clock, Navigation } from 'lucide-react';

export default function AICompanion({
  messages = [],
  onSendMessage = null,
  isLoading = false,
  language = 'en',
  currentNodeName = 'Unknown',
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll chat history to the bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (onSendMessage) {
      onSendMessage(input.trim());
    }
    setInput('');
  };

  // Quick Action Buttons
  const quickActions = [
    { text: 'Fastest Restroom?', en: 'Fastest Restroom?', hi: 'Sabse tez Restroom?' },
    { text: 'Fastest Food Counter?', en: 'Fastest Food Counter?', hi: 'Sabse tez Food counter?' },
    { text: 'Is Gate C open?', en: 'Is Gate C open?', hi: 'Kya Gate C khula hai?' },
    { text: 'Concourse congestion status?', en: 'Concourse congestion status?', hi: 'Concourse crowd level?' },
  ];

  return (
    <div className="glass-card flex-column animate-fade-in" style={{ height: '500px', display: 'flex', flexDirection: 'column', padding: '18px' }}>
      {/* Header */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '12px' }}>
        <div className="flex-row" style={{ gap: '8px' }}>
          <div style={{ backgroundColor: 'rgba(0, 242, 254, 0.1)', padding: '6px', borderRadius: '50%', color: 'var(--primary)' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h4 style={{ margin: 0 }}>AI Companion</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Grounded Live Decision Assistant • Location: <strong>{currentNodeName}</strong>
            </p>
          </div>
        </div>
        <span className="badge badge-open" style={{ fontSize: '10px' }}>Active</span>
      </div>

      {/* Message History */}
      <div 
        aria-live="polite" 
        style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}
      >
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', opacity: 0.8 }}>
            <MessageSquare size={36} style={{ color: 'var(--primary)', marginBottom: '12px', opacity: 0.6 }} />
            <p style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-bright)' }}>Ask the StadiumFlow AI</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '280px' }}>
              I can help you navigate paths, find short queues, and check gate operational status.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.sender === 'user';
          const isRecommendation = msg.type === 'recommendation';

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              {/* Message Bubble */}
              {!isRecommendation ? (
                <div
                  style={{
                    maxWidth: '85%',
                    backgroundColor: isUser ? 'var(--primary)' : 'var(--bg-dark)',
                    color: isUser ? '#040814' : 'var(--text-main)',
                    fontWeight: isUser ? '600' : '400',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    border: isUser ? 'none' : '1px solid var(--border-light)',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
              ) : (
                /* Structured Decision Card */
                <div 
                  className="glass-card animate-fade-in"
                  style={{
                    width: '100%',
                    maxWidth: '92%',
                    borderLeft: '4px solid var(--primary)',
                    backgroundColor: 'rgba(0, 242, 254, 0.02)',
                    padding: '16px',
                    borderRadius: '4px 12px 12px 4px',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex-row" style={{ gap: '6px', marginBottom: '8px', color: 'var(--primary)' }}>
                    <Navigation size={15} style={{ transform: 'rotate(45deg)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' }}>RECOMMENDED FACILITY</span>
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{msg.data.recommended_option}</h4>

                  <div className="flex-row" style={{ gap: '16px', fontSize: '13px', margin: '10px 0', color: 'var(--text-bright)' }}>
                    <span className="flex-row" style={{ gap: '4px' }}>
                      <Clock size={14} className="text-muted" /> {msg.data.estimated_total_time} mins (Total)
                    </span>
                    {msg.data.time_saved > 0 && (
                      <span className="badge badge-open" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        ⚡ Saves {msg.data.time_saved}m
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
                    {msg.text || msg.data.reason_explanation}
                  </p>

                  {/* Alternatives List */}
                  {msg.data.alternatives && msg.data.alternatives.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Alternatives considered:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {msg.data.alternatives.map((alt, idx) => (
                          <div key={idx} className="flex-between" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            <span>{alt.name}</span>
                            <span>Walk {alt.walking_time}m + Wait {alt.queue_time}m = {alt.total_time}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <div
              style={{
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 18px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', animation: 'pulseGlow 1s infinite' }}></div>
              <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', animation: 'pulseGlow 1s infinite 0.2s' }}></div>
              <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%', animation: 'pulseGlow 1s infinite 0.4s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Panel */}
      {messages.length < 3 && !isLoading && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '8px', marginBottom: '8px' }}>
          {quickActions.map((act, index) => (
            <button
              key={index}
              onClick={() => onSendMessage && onSendMessage(language === 'hi' || language === 'hinglish' ? act.hi : act.en)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
                borderRadius: '9999px',
                padding: '6px 12px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-light)'; e.target.style.color = 'var(--text-muted)'; }}
            >
              {language === 'hi' || language === 'hinglish' ? act.hi : act.en}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === 'hi' || language === 'hinglish' ? 'AI companion se pucho...' : 'Ask AI companion...'}
          className="form-input"
          disabled={isLoading}
          style={{ flex: 1 }}
          aria-label="Ask assistant text entry box"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary"
          style={{ padding: '0 18px', display: 'flex', justifyContent: 'center' }}
          aria-label="Send message button"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
