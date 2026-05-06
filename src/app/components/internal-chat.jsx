'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User as UserIcon, Clock } from 'lucide-react';
import { sendInternalMessage, getInternalMessages } from '@/app/actions';

export default function InternalChat({ clientId, currentUsername }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // 5 saniyede bir kontrol et
      return () => clearInterval(interval);
    }
  }, [isOpen, clientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const result = await getInternalMessages(clientId);
    if (result.success) {
      setMessages(result.messages);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('clientId', clientId);
    formData.append('content', inputValue);

    const result = await sendInternalMessage(formData);
    if (result.success) {
      setInputValue('');
      setMessages(prev => [...prev, result.message]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(90deg)' : 'none'
        }}
        className="hover-glow"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>

      {/* Chat Window */}
      <div style={{
        position: 'fixed',
        bottom: '6rem',
        right: '2rem',
        width: '380px',
        height: '500px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        zIndex: 9998,
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease-out',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)',
          color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Ajans İçi Notlar</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.7rem', opacity: 0.8, fontWeight: 600 }}>
            Bu müşteri hakkındaki teknik detayları buradan paylaşabilirsiniz.
          </p>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'rgba(0,0,0,0.1)'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.3 }}>
              <MessageSquare size={48} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.8rem' }}>Henüz mesaj yok. İlk notu siz düşün!</p>
            </div>
          ) : messages.map((msg) => {
            const isMe = msg.user.username === currentUsername;
            return (
              <div key={msg.id} style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  marginBottom: '4px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: 'var(--text-secondary)'
                }}>
                  {!isMe && <span style={{ color: 'var(--accent-primary)' }}>{msg.user.username}</span>}
                  <span style={{ fontSize: '0.55rem', opacity: 0.5 }}>• {msg.user.role}</span>
                </div>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? 'var(--accent-primary)' : 'var(--bg-primary)',
                  color: isMe ? 'white' : 'var(--text-primary)',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: isMe ? 'none' : '1px solid var(--border-color)'
                }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.4 }}>
                  {new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} style={{
          padding: '1.25rem',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.75rem'
        }}>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Notunuzu yazın..."
            style={{
              flex: 1,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || loading}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: inputValue.trim() ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Clock size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>

        <style jsx>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
