import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Send, X, Minimize2, Sparkles, Bot, Loader2 } from 'lucide-react';
import { getOfflineAnswer } from '../data/offlineFaq';

const STARTER_QUESTIONS = [
  "Why does the actual line dip at the throat?",
  "What's the difference between P1 total head and mean total head?",
  "Explain stagnation pressure",
  "What assumptions does Bernoulli's theorem make?"
];

function FormattedMessage({ text }) {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {paragraphs.map((p, pIdx) => {
        const parts = p.split(/(`[^`]+`)/g);
        return (
          <p key={pIdx} style={{ margin: 0, lineHeight: 1.55 }}>
            {parts.map((part, i) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                const inner = part.slice(1, -1);
                return (
                  <code key={i} style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: 'rgba(13,148,136,0.10)',
                    color: '#0D9488',
                    padding: '1px 5px',
                    borderRadius: 4,
                    fontSize: '0.92em',
                    fontWeight: 600,
                  }}>
                    {inner}
                  </code>
                );
              }
              if (part.includes('_(') || (part.startsWith('_') && part.endsWith('_'))) {
                return <em key={i} style={{ color: '#64748B', fontSize: '0.95em' }}>{part.replace(/_/g, '')}</em>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatbotWidget() {
  const location = useLocation();
  const experimentSlug = location.pathname.match(/^\/experiments\/([^/]+)/)?.[1] ?? 'bernoulli';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query || !query.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: query.trim() }]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          experimentSlug,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      const reply = data.reply || '';
      const needsOffline =
        !res.ok ||
        /GEMINI_API_KEY|not set|unable to connect|Server Configuration/i.test(reply);

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: needsOffline ? getOfflineAnswer(query) : reply },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: getOfflineAnswer(query) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0D9488 0%, #0F172A 100%)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 8px 20px rgba(13, 148, 136, 0.35), 0 2px 6px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'scale(0.92)' : 'scale(1)',
        }}
        title={isOpen ? 'Close Lab Assistant' : 'Ask Lab Assistant'}
        aria-label="Lab Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && messages.length === 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#F59E0B',
            border: '2px solid #FFFFFF',
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          zIndex: 1000,
          width: 380,
          height: 540,
          maxHeight: 'calc(100vh - 114px)',
          maxWidth: 'calc(100vw - 48px)',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(13, 148, 136, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#FFFFFF',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(13, 148, 136, 0.25)',
                border: '1px solid rgba(13, 148, 136, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2DD4BF',
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Lab Assistant</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Bernoulli · Venturimeter</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
              title="Minimize"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: '#F8FAFC',
          }}>
            {messages.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center',
                padding: '12px 6px',
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'rgba(13, 148, 136, 0.1)',
                  color: '#0D9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Bot size={24} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 6 }}>
                  Have a doubt about the experiment?
                </div>
                <div style={{ fontSize: 12, color: '#64748B', maxWidth: 280, marginBottom: 18, lineHeight: 1.4 }}>
                  Ask about Bernoulli heads, venturimeter ports, or lab steps. Offline FAQ works without an API key.
                </div>
                <div style={{ width: '100%', textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: 8 }}>
                    Suggested Questions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {STARTER_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        style={{
                          textAlign: 'left',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: 12,
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '88%',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: '#0D9488',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                        <Bot size={15} />
                      </div>
                    )}
                    <div style={{
                      background: msg.role === 'user' ? '#0F172A' : '#FFFFFF',
                      color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                      fontSize: 13,
                    }}>
                      {msg.role === 'user' ? msg.content : <FormattedMessage text={msg.content} />}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#64748B', fontSize: 12.5 }}>
                    <Loader2 size={15} className="spin-animation" style={{ color: '#0D9488' }} />
                    Assistant is thinking…
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div style={{ padding: '12px 14px', background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Bernoulli's theorem..."
                rows={1}
                disabled={isLoading}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1px solid #CBD5E1',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputMessage.trim() || isLoading}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: !inputMessage.trim() || isLoading ? '#E2E8F0' : '#0D9488',
                  color: !inputMessage.trim() || isLoading ? '#94A3B8' : '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>
              Offline FAQ always available · Gemini optional via GEMINI_API_KEY
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation { animation: spin 1s linear infinite; }
      `}</style>
    </>
  );
}
