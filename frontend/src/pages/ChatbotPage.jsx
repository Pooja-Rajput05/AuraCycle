import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, RefreshCw, User, ArrowLeft, MessageSquare, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch real user profile and logs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/insights`);
        const json = await res.json();
        setCycleData(json.cycleState);
        setUserProfile(json.profile);

        const logsRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/logs`);
        const logsJson = await logsRes.json();
        const todayStr = new Date().toISOString().split('T')[0];
        const logForToday = logsJson.find(l => l.date === todayStr) || null;
        setTodayLog(logForToday);
      } catch (err) {
        console.error("Chatbot page data fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // Determine user name
  let userName = 'there';
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      userName = parsed.name || userProfile?.name || 'there';
    } else if (userProfile?.name) {
      userName = userProfile.name;
    }
  } catch {}

  const currentPhase = cycleData?.phase || 'Follicular';
  const currentDay = cycleData?.currentDay || 1;
  const daysLeft = cycleData?.daysLeft || 20;

  const storageKey = `auracycle_chat_${userName.replace(/\s+/g, '_').toLowerCase()}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        sender: 'bot',
        text: `Welcome to your personal AI Health Space, ${userName}! 🌸\n\nI am **AuraBot**, your dedicated wellness companion. I track your live cycle metrics (**${currentPhase} Phase, Day ${currentDay}**), logged symptoms, and daily hydration to answer your personal health queries accurately. How are you feeling today?`
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // AI Logic
  const generatePersonalAIResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();
    const symptomsList = todayLog?.symptoms || [];
    const waterMl = todayLog?.water || 0;
    const sleepHrs = todayLog?.sleep || 0;

    if (q.includes('phase') || q.includes('cycle') || q.includes('day')) {
      return `You are currently in your **${currentPhase} Phase (Day ${currentDay})**. You have approximately **${daysLeft} days remaining** until your next period.\n\n${
        currentPhase === 'Menstrual' ? 'Resting and warm fluids are key right now.' :
        currentPhase === 'Follicular' ? 'Estrogen is rising, giving you high mental clarity and creative energy!' :
        currentPhase === 'Ovulatory' ? 'You are in your fertile peak window with maximum energy.' :
        'Progesterone is dominant now. Focus on low-impact exercise and warm nourishing foods.'
      }`;
    }

    if (q.includes('cramp') || q.includes('pain') || q.includes('symptom') || q.includes('feel')) {
      if (symptomsList.includes('cramps')) {
        return `I noticed you logged **Menstrual Cramps** today, ${userName}. I strongly recommend applying a hot water bag to your lower belly for 15 minutes and sipping warm **Ginger-Tulsi Tea** (*Adrak Chai*).`;
      }
      if (symptomsList.includes('bloating')) {
        return `You recorded **Bloating** today. Try sipping warm **Carom & Fennel water** (*Ajwain-Saunf*) and take a light 10-minute walk after meals.`;
      }
      if (symptomsList.length > 0) {
        return `Your logged symptoms today include: **${symptomsList.join(', ')}**. Make sure to rest, stay hydrated, and try light stretching.`;
      }
      return `You haven't recorded any physical discomfort today! 🎉 If you start feeling cramps or bloating later, log them in your Daily Tracker and I will provide natural Desi Nuskhe remedies right here.`;
    }

    if (q.includes('water') || q.includes('drink') || q.includes('hydrate')) {
      const glasses = Math.round(waterMl / 250);
      if (waterMl >= 2000) {
        return `Awesome job ${userName}! You have logged **${waterMl} ml (${glasses} glasses)** of water today, hitting your 2.0L hydration goal! 💧`;
      }
      return `You have recorded **${waterMl} ml (${glasses} glasses)** of water today. Drink ${Math.ceil((2000 - waterMl)/250)} more glasses to keep your body hydrated and prevent cramps!`;
    }

    if (q.includes('sleep') || q.includes('tired') || q.includes('energy') || q.includes('rest')) {
      if (sleepHrs > 0 && sleepHrs < 7) {
        return `Your sleep log shows **${sleepHrs} hours** last night. Since it's a bit low, take a 20-minute power rest this afternoon and sleep early tonight.`;
      }
      if (sleepHrs >= 7) {
        return `Great! You logged **${sleepHrs} hours of sleep**, which will keep your mood and energy balanced today. ✨`;
      }
      return `Restful sleep is essential during your ${currentPhase} Phase. Aim for 7 to 8 hours tonight!`;
    }

    if (q.includes('diet') || q.includes('food') || q.includes('eat') || q.includes('nuskhe') || q.includes('remedy')) {
      if (currentPhase === 'Menstrual') {
        return `For the **Menstrual Phase**: Eat iron-rich foods (spinach, lentils, dates), warm soups, and drink ginger-jaggery tea. Avoid cold drinks.`;
      }
      return `For healthy hormone balance: Drink warm fluids, eat fresh fruits (apples, pomegranate), and snack on soaked almonds and walnuts.`;
    }

    if (q.includes('doctor') || q.includes('pdf') || q.includes('report') || q.includes('gynecologist')) {
      return `You can generate a medical summary PDF anytime from your Dashboard! Click the **Print Doctor PDF Report** button to download a 3-month clinical report for your gynecologist.`;
    }

    return `I am here for you, ${userName}! I am currently tracking your **${currentPhase} Phase (Day ${currentDay})** and daily health metrics (${waterMl}ml water logged). Ask me anything about your symptoms, period dates, or natural remedies!`;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = generatePersonalAIResponse(userText);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response }]);
      setIsTyping(false);
    }, 600);
  };

  const handleClearHistory = () => {
    const reset = [{ id: Date.now(), sender: 'bot', text: `Chat history cleared! I am ready for your fresh queries, ${userName}.` }];
    setMessages(reset);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Card */}
      <div 
        className="glass-card" 
        style={{ 
          padding: '20px 24px', 
          borderRadius: '24px', 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(147, 73, 60, 0.08) 0%, rgba(74, 101, 78, 0.08) 100%)',
          border: '1.5px solid rgba(147, 73, 60, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'white',
              border: '1px solid var(--card-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="font-headline-md" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={24} color="var(--accent-rose)" />
                AuraBot AI Personal Health Room
              </h1>
              <span style={{ fontSize: '0.72rem', background: 'rgba(74, 101, 78, 0.15)', color: 'var(--accent-sage)', padding: '2px 10px', borderRadius: '12px', fontWeight: 800 }}>
                100% Private & Encrypted
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Dedicated conversation space tracking <strong>{userName}</strong>'s health logs & cycle data.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={15} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Full Page Chat Area */}
      <div 
        className="glass-card" 
        style={{ 
          height: '620px', 
          borderRadius: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden', 
          border: '1.5px solid var(--card-border)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.06)'
        }}
      >
        {/* Sub Header Metrics Bar */}
        <div 
          style={{ 
            background: 'linear-gradient(90deg, var(--accent-rose) 0%, #7a3a2e 100%)', 
            padding: '12px 24px', 
            color: 'white', 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center', 
            fontSize: '0.84rem',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>🌸 Phase: <strong>{currentPhase} (Day {currentDay})</strong></span>
            <span>💧 Water: <strong>{todayLog?.water || 0} ml</strong></span>
            <span>🌙 Sleep: <strong>{todayLog?.sleep || 0} hrs</strong></span>
          </div>
          <span style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></span>
            AuraBot AI Active
          </span>
        </div>

        {/* Messages Stream */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fffcfb' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(147, 73, 60, 0.12)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
              )}

              <div
                style={{
                  maxWidth: '78%',
                  padding: '14px 18px',
                  borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.sender === 'user' ? 'var(--accent-rose)' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.92rem',
                  lineHeight: '1.55',
                  boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(147, 73, 60, 0.25)' : '0 2px 10px rgba(0,0,0,0.04)',
                  border: msg.sender === 'bot' ? '1px solid var(--card-border)' : 'none',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
              </div>

              {msg.sender === 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-sage)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.9rem' }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              <Bot size={18} color="var(--accent-rose)" />
              <span>AuraBot AI is preparing your personalized response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '10px 20px', background: 'white', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            "What is my current phase?",
            "Suggest remedies for my cramps",
            "Did I drink enough water today?",
            "How to print doctor PDF report?"
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setInputMsg(chip)}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                background: 'rgba(147, 73, 60, 0.08)',
                color: 'var(--accent-rose)',
                border: '1px solid rgba(147, 73, 60, 0.18)',
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(147, 73, 60, 0.16)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(147, 73, 60, 0.08)'}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '14px 20px', background: 'white', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={`Ask AuraBot anything about your wellness or ${currentPhase} Phase...`}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '24px',
              border: '1.5px solid var(--card-border)',
              background: 'var(--bg-secondary)',
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            style={{
              padding: '12px 22px',
              borderRadius: '24px',
              background: inputMsg.trim() ? 'var(--accent-rose)' : 'var(--card-border)',
              border: 'none',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: inputMsg.trim() ? 'pointer' : 'default',
              boxShadow: inputMsg.trim() ? '0 4px 14px rgba(147, 73, 60, 0.3)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
}
