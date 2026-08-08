import React, { useState } from 'react';
import { Play, Pause, Flame, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function YogaExerciseVisualizer({ phase, loggedSymptoms = [] }) {
  const [isPlaying, setIsPlaying] = useState(true);

  // Symptom-Specific Remedy Exercises Database (Directly targeting logged physical discomforts)
  const symptomExerciseMap = {
    cramps: {
      symptomName: 'Period Cramps & Lower Abdominal Pain',
      exerciseName: '🦋 Baddha Konasana (Butterfly Pose)',
      tagline: 'Instant Uterine Cramp & Pelvic Relief',
      benefit: 'Opens hip flexors, releases pelvic floor tension, and relaxes uterine muscle contractions to quickly soothe severe period pain.',
      duration: '3–5 Minutes',
      intensity: 'Gentle Restorative',
      image: '/demo_butterfly.jpg',
      steps: [
        'Sit straight on your yoga mat with your spine erect and shoulders relaxed.',
        'Bend your knees and bring the soles of your feet together close to your pelvis.',
        'Hold your feet firmly with both hands and inhale deeply.',
        'Gently pulse your knees up and down slowly like butterfly wings.',
        'Breathe deeply into your lower abdomen for 3 to 5 minutes.'
      ]
    },
    bloating: {
      symptomName: 'Abdominal Bloating & Digestion Gas',
      exerciseName: '🧘 Apanasana (Knees-to-Chest Wind Relieving Pose)',
      tagline: 'Trapped Gas & Stomach Pressure Relief',
      benefit: 'Gently presses the abdominal organs to release trapped gas, reduce bloating swelling, and improve digestion flow.',
      duration: '3–4 Minutes',
      intensity: 'Gentle Pressure',
      image: '/demo_bloating.jpg',
      steps: [
        'Lie flat on your back on the yoga mat with legs extended.',
        'Inhale deeply, then bend both knees and hug them in towards your chest.',
        'Clasp your hands or forearms around your shins.',
        'Gently rock side to side to massage your lower spine and belly.',
        'Hold for 10 deep abdominal breaths to release trapped intestinal gas.'
      ]
    },
    headache: {
      symptomName: 'Headache & Neck Muscle Tension',
      exerciseName: '🙇‍♀️ Uttanasana (Standing Forward Fold)',
      tagline: 'Cranial Blood Flow & Migraine Relief',
      benefit: 'Allows fresh oxygenated blood to flow to the head and neck, instantly easing PMS headaches and tension.',
      duration: '2 Minutes',
      intensity: 'Calming Inversion',
      image: '/demo_headache.jpg',
      steps: [
        'Stand tall with feet hip-width apart and hands on your hips.',
        'Exhale and hinge forward from your hips, lengthening your spine.',
        'Softly bend your knees and let your head and neck hang completely loose toward the floor.',
        'Hold opposite elbows with your hands and gently sway your head side to side.',
        'Slowly roll back up to standing after 1 to 2 minutes.'
      ]
    },
    backache: {
      symptomName: 'Lower Back Strain & Lumbar Stiffness',
      exerciseName: '🧘‍♀️ Balasana (Child\'s Pose)',
      tagline: 'Lumbar Decompression & Spinal Stretch',
      benefit: 'Decompresses tight lumbar vertebrae, stretches lower back muscles, and calms body fatigue.',
      duration: '3–5 Minutes',
      intensity: 'Deep Restorative',
      image: '/demo_child.jpg',
      steps: [
        'Kneel on the floor with your big toes touching and knees hip-width apart.',
        'Inhale deeply, then exhale as you lay your torso down between your thighs.',
        'Extend both arms straight out in front of you on the mat, palms resting down.',
        'Rest your forehead gently on the mat and relax your shoulders.',
        'Hold this restful position and take 10 deep abdominal breaths.'
      ]
    },
    fatigue: {
      symptomName: 'Low Energy & PMS Fatigue',
      exerciseName: '🐍 Bhujangasana (Cobra Stretch)',
      tagline: 'Chest Expansion & Energy Boost',
      benefit: 'Stretches the entire chest and abdominal cavity, boosting oxygen intake and waking up fatigued muscles.',
      duration: '5 Breaths',
      intensity: 'Moderate Active',
      image: '/demo_cobra.jpg',
      steps: [
        'Lie flat on your stomach with legs extended and tops of feet on the mat.',
        'Place your hands under your shoulders with elbows tucked close to your body.',
        'Inhale and slowly lift your chest off the floor, keeping your navel near the mat.',
        'Keep your shoulders down and away from your ears; hold for 5 breaths.'
      ]
    }
  };

  // Phase Default Backup Exercises
  const phaseDefaultMap = {
    Menstrual: [symptomExerciseMap.cramps, symptomExerciseMap.backache],
    Follicular: [symptomExerciseMap.fatigue],
    Ovulatory: [symptomExerciseMap.fatigue],
    Luteal: [symptomExerciseMap.bloating, symptomExerciseMap.headache]
  };

  // Determine active exercises based on user's logged symptoms today
  let activeExercises = [];
  if (loggedSymptoms && loggedSymptoms.length > 0) {
    loggedSymptoms.forEach(sym => {
      const sKey = sym.toLowerCase();
      if (symptomExerciseMap[sKey]) {
        activeExercises.push(symptomExerciseMap[sKey]);
      }
    });
  }

  // Fallback to phase exercises if no symptoms logged today
  if (activeExercises.length === 0) {
    activeExercises = phaseDefaultMap[phase] || phaseDefaultMap['Menstrual'];
  }

  return (
    <div 
      className="glass-card animated-bento-card" 
      style={{ 
        gridColumn: 'span 6', 
        padding: '24px', 
        borderRadius: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '20px',
        background: 'var(--bg-primary)',
        border: '1.5px solid var(--card-border)',
        boxShadow: '0 12px 32px rgba(147, 73, 60, 0.08)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} style={{ color: 'var(--accent-rose)' }} />
          <h3 className="font-headline-md" style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            🧘‍♀️ Symptom-Targeted Exercise Demos
          </h3>
          <span style={{ fontSize: '0.72rem', background: loggedSymptoms.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(147, 73, 60, 0.1)', color: loggedSymptoms.length > 0 ? '#dc2626' : 'var(--accent-rose)', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
            {loggedSymptoms.length > 0 ? `Targeting Today's Symptoms (${loggedSymptoms.join(', ')})` : `${phase} Phase Care`}
          </span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: isPlaying ? 'rgba(147, 73, 60, 0.1)' : 'var(--accent-rose)',
            color: isPlaying ? 'var(--accent-rose)' : 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '5px 12px',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
        </button>
      </div>

      {/* Grid of Symptom-Targeted Exercises */}
      <div style={{ display: 'grid', gridTemplateColumns: activeExercises.length > 1 ? '1fr 1fr' : '1fr', gap: '16px' }}>
        {activeExercises.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: 'white',
              borderRadius: '20px',
              border: '1.5px solid var(--card-border)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            {/* 1. TARGETED SYMPTOM BADGE (Symptom Name) */}
            <div 
              style={{ 
                background: 'rgba(147, 73, 60, 0.09)', 
                padding: '8px 14px', 
                borderBottom: '1px solid var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.76rem',
                fontWeight: 800,
                color: 'var(--accent-rose)'
              }}
            >
              <AlertCircle size={15} color="var(--accent-rose)" />
              <span>Targeting: {item.symptomName}</span>
            </div>

            {/* 2. REALISTIC VISUAL AT TOP */}
            <div
              style={{
                height: '185px',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid var(--card-border)'
              }}
            >
              <img
                src={item.image}
                alt={item.exerciseName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'contrast(1.03) brightness(0.98)',
                  animation: isPlaying ? 'realisticPosePulse 4s ease-in-out infinite' : 'none',
                  transition: 'transform 0.4s ease'
                }}
              />

              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)',
                  pointerEvents: 'none'
                }}
              />

              <span 
                style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  fontSize: '0.66rem', 
                  fontWeight: 800, 
                  color: 'white', 
                  background: 'rgba(147, 73, 60, 0.88)',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></span>
                REALISTIC DEMO
              </span>
            </div>

            {/* 3. EXERCISE NAME IN MIDDLE */}
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', fontWeight: 800, lineHeight: '1.35' }}>
                {item.exerciseName}
              </strong>

              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                {item.benefit}
              </p>

              {/* 4. STEP-BY-STEP HOW TO PERFORM */}
              <div 
                style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '10px 12px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--card-border)',
                  marginTop: '4px'
                }}
              >
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent-rose)', display: 'block', marginBottom: '6px' }}>
                  📋 HOW TO PERFORM STEP-BY-STEP:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.steps.map((step, sIdx) => (
                    <div key={sIdx} style={{ fontSize: '0.74rem', color: 'var(--text-primary)', lineHeight: '1.4', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-sage)' }}>{sIdx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.7rem', background: 'rgba(147, 73, 60, 0.08)', color: 'var(--accent-rose)', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                  ⏱️ {item.duration}
                </span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(74, 101, 78, 0.08)', color: 'var(--accent-sage)', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                  ⚡ {item.intensity}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      <style>{`
        @keyframes realisticPosePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}
