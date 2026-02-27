import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Bot, User } from 'lucide-react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! 👋 I'm your SkillNova AI assistant. I know your profile, skills, and applications. Ask me anything about your career!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) inputRef.current.focus();
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await API.post('/api/chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Sorry, I had trouble responding. Please try again.' }]);
        }
        setLoading(false);
    };

    const clearChat = async () => {
        try { await API.delete('/api/chat/history'); } catch (e) { /* ok */ }
        setMessages([
            { role: 'ai', text: "Chat cleared! 🔄 How can I help you?" }
        ]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick suggestion buttons
    const suggestions = [
        "What's my profile summary?",
        "Which jobs match my skills?",
        "How can I improve my score?",
        "What skills am I missing?"
    ];

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
                style={{
                    zIndex: 9999,
                    background: isOpen ? '#334155' : 'linear-gradient(135deg, #7c3aed, #c026d3)',
                    boxShadow: isOpen ? 'none' : '0 8px 30px rgba(124,58,237,0.3)'
                }}
            >
                {isOpen
                    ? <X className="w-6 h-6" style={{ color: '#fff' }} />
                    : <MessageCircle className="w-6 h-6" style={{ color: '#fff' }} />
                }
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 w-[380px] max-h-[520px] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                    style={{ zIndex: 9998, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    {/* Header */}
                    <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}>
                            <Bot className="w-5 h-5" style={{ color: '#fff' }} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: '#ffffff' }}>SkillNova AI</p>
                            <p className="text-xs flex items-center gap-1" style={{ color: '#34d399' }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: '#34d399' }} /> Online
                            </p>
                        </div>
                        <button onClick={clearChat} className="p-1.5 rounded-lg transition-all" style={{ color: '#94a3b8' }} title="Clear chat">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: '340px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'ai' && (
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(139,92,246,0.2)' }}>
                                        <Bot className="w-4 h-4" style={{ color: '#a78bfa' }} />
                                    </div>
                                )}
                                <div
                                    className="max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                                    style={msg.role === 'user'
                                        ? { background: 'linear-gradient(90deg, #7c3aed, #c026d3)', color: '#ffffff', borderBottomRightRadius: '6px' }
                                        : { backgroundColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0', borderBottomLeftRadius: '6px' }
                                    }
                                >
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(217,70,239,0.2)' }}>
                                        <User className="w-4 h-4" style={{ color: '#e879f9' }} />
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(139,92,246,0.2)' }}>
                                    <Bot className="w-4 h-4" style={{ color: '#a78bfa' }} />
                                </div>
                                <div className="px-4 py-3 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderBottomLeftRadius: '6px' }}>
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#a78bfa', animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#a78bfa', animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#a78bfa', animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions (only when few messages) */}
                    {messages.length <= 2 && !loading && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setMessages(prev => [...prev, { role: 'user', text: s }]);
                                        setLoading(true);
                                        API.post('/api/chat', { message: s })
                                            .then(res => setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]))
                                            .catch(() => setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Sorry, please try again.' }]))
                                            .finally(() => setLoading(false));
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-xs transition-all"
                                    style={{ backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#c4b5fd' }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none transition-all"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#ffffff',
                                    caretColor: '#ffffff'
                                }}
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                className="p-2 rounded-xl disabled:opacity-30 transition-all"
                                style={{ background: 'linear-gradient(90deg, #7c3aed, #c026d3)', color: '#ffffff' }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

