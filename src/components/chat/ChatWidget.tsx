'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ChevronDown, X } from 'lucide-react';
import './chat-widget.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SearchResult {
  question: string;
  answer: string;
  category: string;
}

type WidgetStep = 'chat' | 'contact';

const SHIFTERA_ORANGE = '#E8850A';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<WidgetStep>('chat');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('en');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages: Record<string, string> = {
        pt: 'Olá! Como posso ajudá-lo com o Shiftera?',
        en: 'Hi there! How can I help you with Shiftera?',
        es: '¡Hola! ¿Cómo puedo ayudarte con Shiftera?',
      };
      addMessage('assistant', welcomeMessages[language]);
    }
  }, [isOpen, language, messages.length]);

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: Math.random().toString(36).substring(7),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    addMessage('user', query);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language }),
      });

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0] as SearchResult;
        addMessage('assistant', result.answer);

        const moreHelpMessages: Record<string, string> = {
          pt: 'Posso ajudá-lo com mais alguma coisa?',
          en: 'Can I help you with anything else?',
          es: '¿Puedo ayudarte con algo más?',
        };
        addMessage('assistant', moreHelpMessages[language]);
      } else {
        const noResultMessages: Record<string, string> = {
          pt: 'Desculpe, não encontrei uma resposta para essa pergunta. Você pode entrar em contato com o suporte?',
          en: "Sorry, I couldn't find an answer to that question. Would you like to contact support?",
          es: 'Lo siento, no pude encontrar una respuesta a esa pregunta. ¿Deseas contactar con el soporte?',
        };
        addMessage('assistant', noResultMessages[language]);
        setStep('contact');
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessages: Record<string, string> = {
        pt: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
        en: "Sorry, an error occurred. Please try again.",
        es: 'Lo siento, ocurrió un error. Por favor, inténtelo de nuevo.',
      };
      addMessage('assistant', errorMessages[language]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitStatus('loading');

    try {
      const response = await fetch('/api/chat/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          language,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        addMessage('assistant', 'Thank you for your message! Our support team will get back to you shortly.');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setStep('chat');
          setSubmitStatus('idle');
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
    }
  };

  const toggleLanguage = () => {
    const languages: ('pt' | 'en' | 'es')[] = ['pt', 'en', 'es'];
    const currentIndex = languages.indexOf(language);
    const nextLanguage = languages[(currentIndex + 1) % languages.length];
    setLanguage(nextLanguage);
    setMessages([]);
    setStep('chat');
  };

  const contactFormLabels: Record<string, Record<string, string>> = {
    pt: {
      name: 'Nome',
      email: 'Email',
      message: 'Mensagem',
      submit: 'Enviar',
      needsHelp: 'Precisa de mais ajuda?',
    },
    en: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      submit: 'Send',
      needsHelp: 'Need more help?',
    },
    es: {
      name: 'Nombre',
      email: 'Correo',
      message: 'Mensaje',
      submit: 'Enviar',
      needsHelp: '¿Necesitas más ayuda?',
    },
  };

  const labels = contactFormLabels[language];

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-widget-button"
        style={{ backgroundColor: SHIFTERA_ORANGE }}
        title="Chat with support"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-widget-panel">
          {/* Header */}
          <div className="chat-widget-header" style={{ backgroundColor: SHIFTERA_ORANGE }}>
            <div className="chat-widget-title">
              <MessageCircle size={20} />
              <span>Shiftera Support</span>
            </div>
            <button
              onClick={toggleLanguage}
              className="language-toggle"
              title="Toggle language"
            >
              {language.toUpperCase()}
            </button>
          </div>

          {/* Messages Area */}
          <div className="chat-widget-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message-${message.type}`}
              >
                <div className="chat-message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-widget-input-area">
            {step === 'chat' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(input);
                }}
                className="chat-input-form"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    language === 'pt'
                      ? 'Digite sua pergunta...'
                      : language === 'es'
                        ? 'Escribe tu pregunta...'
                        : 'Type your question...'
                  }
                  disabled={isLoading}
                  className="chat-input"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="chat-submit-button"
                  style={{ backgroundColor: SHIFTERA_ORANGE }}
                >
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitContact} className="contact-form">
                <h3>{labels.needsHelp}</h3>

                <input
                  type="text"
                  placeholder={labels.name}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={submitStatus === 'loading'}
                  className="contact-input"
                />

                <input
                  type="email"
                  placeholder={labels.email}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={submitStatus === 'loading'}
                  className="contact-input"
                />

                <textarea
                  placeholder={labels.message}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={submitStatus === 'loading'}
                  className="contact-textarea"
                  rows={3}
                />

                {submitStatus === 'success' && (
                  <div className="status-message success">Message sent successfully!</div>
                )}
                {submitStatus === 'error' && (
                  <div className="status-message error">Failed to send message. Please try again.</div>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === 'loading'}
                  className="contact-submit"
                  style={{ backgroundColor: SHIFTERA_ORANGE }}
                >
                  {submitStatus === 'loading' ? 'Sending...' : labels.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
