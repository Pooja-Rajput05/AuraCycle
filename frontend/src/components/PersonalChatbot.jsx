import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, User, RefreshCw, HeartHandshake } from 'lucide-react';

export default function PersonalChatbot({ userProfile, cycleState, todayLog, logs }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const userName = userProfile?.name || 'there';
  const currentPhase = cycleState?.phase || 'Follicular';
  const currentDay = cycleState?.currentDay || 1;
  const daysLeft = cycleState?.daysLeft || 20;

  // Initialize Chat History (persisted per user in localStorage)
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
        text: `Hi ${userName}! 👋 I am **AuraBot**, your personal cycle & wellness companion. I track your logged symptoms, phase data (${currentPhase} Phase, Day ${currentDay}), and health logs to answer your personalized queries! How can I help you today?`
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Personal AI Smart Knowledge Engine
  const generatePersonalAIResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();
    const symptomsList = todayLog?.symptoms || [];
    const waterMl = todayLog?.water || 0;
    const sleepHrs = todayLog?.sleep || 0;

    // 1. Current Phase & Days Queries
    if (q.includes('phase') || q.includes('cycle') || q.includes('day')) {
      return `You are currently in your **${currentPhase} Phase (Day ${currentDay})**. You have approximately **${daysLeft} days remaining** until your next period. During this phase, ${
        currentPhase === 'Menstrual' ? 'resting and staying warm is your top priority.' :
        currentPhase === 'Follicular' ? 'your estrogen is rising, giving you great mental focus and creative energy!' :
        currentPhase === 'Ovulatory' ? 'you are at peak energy and high fertility window.' :
        'progesterone is dominant. Focus on low-impact exercise and warm foods.'
      }`;
    }

    // 2. Logged Symptoms Queries
    if (q.includes('cramp') || q.includes('pain') || q.includes('symptom') || q.includes('feel')) {
      if (symptomsList.includes('cramps')) {
        return `I noticed you logged **Menstrual Cramps** today, ${userName}. I recommend applying a warm heating pad to your lower belly for 15 minutes and sipping warm **Ginger-Tulsi Tea** (*Adrak Chai*).`;
      }
      if (symptomsList.includes('bloating')) {
        return `You logged **Bloating** today. Try drinking warm **Carom & Fennel water** (*Ajwain-Saunf*) and take a gentle 10-minute walk after your meal.`;
      }
      if (symptomsList.length > 0) {
        return `Based on your recent log, you recorded: **${symptomsList.join(', ')}**. For natural relief, stay hydrated and practice light stretching today.`;
      }
      return `You haven't logged any physical discomfort today! 🎉 If you start feeling cramps or bloating later, log them in your Daily Tracker and I will suggest instant Desi Nuskhe remedies.`;
    }

    // 3. Hydration & Water Query
    if (q.includes('water') || q.includes('drink') || q.includes('hydrate')) {
      const glasses = Math.round(waterMl / 250);
      if (waterMl >= 2000) {
        return `Awesome job ${userName}! You've already drunk **${waterMl} ml (${glasses} glasses)** today, reaching your 2.0 Liters hydration target! 💧`;
      }
      return `You have logged **${waterMl} ml (${glasses} glasses)** of water today. Try drinking ${Math.ceil((2000 - waterMl)/250)} more glasses to stay well-hydrated and avoid period fatigue.`;
    }

    // 4. Sleep & Fatigue Query
    if (q.includes('sleep') || q.includes('tired') || q.includes('energy') || q.includes('rest')) {
      if (sleepHrs > 0 && sleepHrs < 7) {
        return `Your sleep log shows **${sleepHrs} hours** last night. Since sleep is a bit low, take a 20-minute power nap this afternoon and avoid late caffeine.`;
      }
      if (sleepHrs >= 7) {
        return `Great news! You logged **${sleepHrs} hours of sleep**, which will keep your mood and hormone balance strong today. ✨`;
      }
      return `Good sleep is crucial during your ${currentPhase} Phase. Make sure to aim for 7 to 8 hours tonight!`;
    }

    // 5. Diet & Desi Nuskhe Remedies Query
    if (q.includes('eat') || q.includes('diet') || q.includes('food') || q.includes('remedy') || q.includes('nuskhe')) {
      if (currentPhase === 'Menstrual') {
        return `For the **Menstrual Phase**: Eat iron-rich foods like spinach, lentils, dates, and drink warm ginger-jaggery tea. Avoid icy drinks.`;
      }
      if (currentPhase === 'Follicular') {
        return `For the **Follicular Phase**: Eat fresh salads, fermented yogurt, and pumpkin seeds to support rising estrogen levels.`;
      }
      return `For healthy hormone balance: Drink warm water, eat fresh fruits (apples, pomegranate), and snack on soaked almonds and walnuts.`;
    }

    // 6. Doctor Report Query
    if (q.includes('doctor') || q.includes('pdf') || q.includes('report') || q.includes('gynecologist')) {
      return `You can generate a medical 3-month summary PDF anytime! Click the **Print Doctor PDF Report** button on your dashboard to download a formatted clinical summary for your gynecologist visit.`;
    }

    // Default Friendly Wellness Assistant Response
    return `That's a great wellness query, ${userName}! As your personal AuraCycle assistant, I am tracking your ${currentPhase} Phase (Day ${currentDay}) and daily hydration (${waterMl}ml logged). Feel free to ask me about your cycle phase, cramp remedies, water goals, or sleep recommendations!`;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');

    const newMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, newMsgObj]);
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const botResponse = generatePersonalAIResponse(userText);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleClearHistory = () => {
    const reset = [
      {
        id: Date.now(),
        sender: 'bot',
        text: `Chat history cleared! 👋 I am ready to track your latest logs and queries, ${userName}.`
      }
    ];
    setMessages(reset);
    localStorage.removeItem(storageKey);
  };

  return (
    <>
      {/* Hidden bridge trigger button for top banner link */}
      <button
        id="aurabot-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 100px)',
            background: 'var(--bg-primary)',
            borderRadius: '24px',
            border: '1.5px solid var(--card-border)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999999,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, var(--accent-rose) 0%, #7a3a2e 100%)',
              padding: '16px 20px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={20} color="white" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>AuraBot Personal AI</h4>
                <span style={{ fontSize: '0.72rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
                  Tracking {userName}'s Cycle Data
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '4px' }}
              >
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div
            style={{
              background: 'rgba(147, 73, 60, 0.06)',
              padding: '8px 16px',
              borderBottom: '1px solid var(--card-border)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              justify: 'space-between',
              fontWeight: 600
            }}
          >
            <span>🌸 Phase: <strong>{currentPhase}</strong></span>
            <span>💧 Water: <strong>{todayLog?.water || 0}ml</strong></span>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#fffaf8'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}
              >
                {msg.sender === 'bot' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(147, 73, 60, 0.15)',
                      color: 'var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.sender === 'user' ? 'var(--accent-rose)' : 'white',
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                    fontSize: '0.84rem',
                    lineHeight: '1.45',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: msg.sender === 'bot' ? '1px solid var(--card-border)' : 'none'
                  }}
                >
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                </div>

                {msg.sender === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-sage)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <Bot size={16} color="var(--accent-rose)" />
                <span>AuraBot is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Quick Chips */}
          <div
            style={{
              padding: '8px 12px',
              background: 'white',
              borderTop: '1px solid var(--card-border)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto'
            }}
          >
            {[
              "My Current Phase?",
              "Cramp Remedies?",
              "Water Target Status?",
              "Doctor PDF Report"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setInputMsg(chip);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'rgba(147, 73, 60, 0.08)',
                  color: 'var(--accent-rose)',
                  border: '1px solid rgba(147, 73, 60, 0.15)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '10px 14px',
              background: 'white',
              borderTop: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder="Ask AuraBot anything about your wellness..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid var(--card-border)',
                background: 'var(--bg-secondary)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: inputMsg.trim() ? 'var(--accent-rose)' : 'var(--card-border)',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMsg.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
