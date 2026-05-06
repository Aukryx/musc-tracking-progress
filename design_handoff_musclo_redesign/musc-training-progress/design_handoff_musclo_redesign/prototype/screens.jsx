// ============================================================
// SCREENS — Musclo redesign
// Each screen is a self-contained 393x852 component.
// Navigation handled by app.jsx via setScreen / setSubscreen.
// ============================================================

const C = {
  bg: '#0a0a0b', bg1: '#111114', bg2: '#17171b', bg3: '#1f1f24',
  line: '#26262c', line2: '#34343c',
  ink: '#f5f5f7', ink2: '#c1c1c8', ink3: '#7a7a82', ink4: '#4a4a52',
  accent: 'oklch(0.86 0.20 130)', accentSoft: 'oklch(0.86 0.20 130 / 0.14)',
  accentInk: '#0a0a0b',
  warn: 'oklch(0.78 0.18 60)', bad: 'oklch(0.68 0.22 25)',
  pr: 'oklch(0.86 0.20 90)',
};

// ─────────────── Shared bits ───────────────
function Eyebrow({ children, style = {} }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: C.ink3, ...style,
    }}>{children}</div>
  );
}

function Stat({ value, label, accent = false, mono = true }) {
  return (
    <div style={{
      background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: '14px 14px',
      flex: 1,
    }}>
      <div className={mono ? 'mono' : ''} style={{
        fontSize: 28, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
        color: accent ? C.accent : C.ink,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: C.ink3, marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ─────────────── DASHBOARD ───────────────
function ScreenHome({ go }) {
  const t = window.MOCK.TEMPLATES;
  const s = window.MOCK.STATS;
  const last = window.MOCK.LAST_SESSION;
  return (
    <div style={{ background: C.bg, height: '100%', overflow: 'auto', paddingBottom: 110 }} className="no-scrollbar">
      {/* Header */}
      <div style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: C.ink3, fontWeight: 500 }}>Lundi 27 avr.</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 2 }}>Salut Auk.</div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.line}`,
          display: 'grid', placeItems: 'center', color: C.ink2,
        }}>
          <I.Settings size={18} />
        </div>
      </div>

      {/* Streak banner */}
      <div style={{ margin: '8px 20px 18px', display: 'flex', gap: 10, alignItems: 'center',
                    background: 'linear-gradient(180deg, rgba(180,255,80,0.1), rgba(180,255,80,0.02))',
                    border: '1px solid rgba(180,255,80,0.2)', borderRadius: 14, padding: '10px 14px' }}>
        <I.Flame size={18} stroke={C.accent} />
        <div style={{ fontSize: 13, color: C.ink2, fontWeight: 500 }}>
          <span className="mono" style={{ color: C.accent, fontWeight: 700 }}>{s.streak} jours</span> de série
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: C.ink3 }} className="mono">
          {s.thisWeek}/5 cette semaine
        </div>
      </div>

      {/* Hero — start workout */}
      <div style={{ padding: '0 20px' }}>
        <Eyebrow>Démarrer</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
          {t.map((tpl) => (
            <button key={tpl.id} onClick={() => go('session')} style={{
              background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: '14px 12px',
              textAlign: 'left', color: C.ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, background: C.accent, color: C.accentInk,
                display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14,
              }}>{tpl.emoji}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{tpl.name}</div>
                <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }} className="mono">{tpl.count} ex.</div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => go('session')} style={{
          marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          background: C.accent, color: C.accentInk, border: 'none', borderRadius: 18,
          padding: '16px 18px', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 10px 30px -10px oklch(0.86 0.20 130 / 0.5)',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,0,0,0.18)',
                        display: 'grid', placeItems: 'center' }}>
            <I.Bolt size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div>Séance vide</div>
            <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>Tu choisis tes exercices</div>
          </div>
          <I.ArrowR size={20} style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      {/* Last session */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Eyebrow>Dernière séance</Eyebrow>
          <button onClick={() => go('progress')} style={{
            background: 'none', border: 'none', color: C.ink3, fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
          }}>Tout voir <I.Right size={12} /></button>
        </div>

        <div style={{ background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 20, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{last.name}</div>
              <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{last.date}</div>
            </div>
            {last.prs > 0 && (
              <div style={{
                background: C.accentSoft, color: C.accent, fontSize: 11, fontWeight: 700,
                padding: '4px 8px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <I.Star size={11} stroke={C.accent} fill={C.accent} /> {last.prs} PR
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
            <div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{last.duration}<span style={{ fontSize: 11, color: C.ink3, marginLeft: 2 }}>min</span></div>
              <div style={{ fontSize: 10, color: C.ink3, marginTop: 2 }}>Durée</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{last.sets}</div>
              <div style={{ fontSize: 10, color: C.ink3, marginTop: 2 }}>Séries</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{(last.volume/1000).toFixed(1)}<span style={{ fontSize: 11, color: C.ink3, marginLeft: 2 }}>t</span></div>
              <div style={{ fontSize: 10, color: C.ink3, marginTop: 2 }}>Volume</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div style={{ padding: '18px 20px 0', display: 'flex', gap: 8 }}>
        <Stat value={s.totalWorkouts} label="Séances" />
        <Stat value={s.totalSets} label="Séries" accent />
      </div>
    </div>
  );
}

// ─────────────── ACTIVE SESSION (logging) ───────────────
function ScreenSession({ go, openExercise, openPicker }) {
  const w = window.MOCK.ACTIVE_WORKOUT;
  const [exIdx, setExIdx] = React.useState(0);
  const [sets, setSets] = React.useState(w.exercises[0].sets);
  const [holding, setHolding] = React.useState(null); // index of set being held
  const [holdProg, setHoldProg] = React.useState(0);
  const holdTimerRef = React.useRef(null);

  React.useEffect(() => { setSets(w.exercises[exIdx].sets); }, [exIdx]);

  const ex = w.exercises[exIdx];
  const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0);

  function fmtTime(s) { const m = Math.floor(s/60); const x = s%60; return `${m}:${String(x).padStart(2,'0')}`; }

  function startHold(i) {
    if (sets[i].completed || !sets[i].weight || !sets[i].reps) return;
    setHolding(i); setHoldProg(0);
    const start = Date.now();
    holdTimerRef.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 600);
      setHoldProg(p);
      if (p >= 1) {
        clearInterval(holdTimerRef.current);
        setSets(prev => prev.map((s, idx) => idx === i ? { ...s, completed: true } : s));
        setHolding(null); setHoldProg(0);
      }
    }, 16);
  }
  function endHold() {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setHolding(null); setHoldProg(0);
  }

  return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid ${C.line}`,
      }}>
        <button onClick={() => go('home')} style={{
          width: 36, height: 36, borderRadius: 10, background: C.bg2, border: `1px solid ${C.line}`,
          display: 'grid', placeItems: 'center', color: C.ink2, cursor: 'pointer',
        }}><I.Close size={16} /></button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{w.name}</div>
          <div style={{ fontSize: 11, color: C.ink3, display: 'flex', gap: 10, marginTop: 1 }}>
            <span className="mono" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <I.Clock size={11} /> {fmtTime(w.elapsed)}
            </span>
            <span className="mono">{completedSets}/{totalSets} séries</span>
          </div>
        </div>

        <button style={{
          background: C.accent, color: C.accentInk, border: 'none', borderRadius: 12,
          padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>Terminer</button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: C.bg2 }}>
        <div style={{ height: '100%', background: C.accent, width: `${(completedSets/totalSets)*100}%`, transition: 'width 0.4s' }} />
      </div>

      {/* Exercise tabs (carousel) */}
      <div style={{ padding: '12px 16px 4px', display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
        {w.exercises.map((e, i) => {
          const done = e.sets.filter(s => s.completed).length;
          const all = e.sets.length;
          const active = i === exIdx;
          return (
            <button key={e.id} onClick={() => setExIdx(i)} style={{
              flexShrink: 0, background: active ? C.bg2 : 'transparent',
              border: `1px solid ${active ? C.line2 : C.line}`,
              borderRadius: 10, padding: '7px 12px', cursor: 'pointer',
              color: active ? C.ink : C.ink3, fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>{i + 1}</span>
              <span className="mono" style={{ color: done === all ? C.accent : C.ink3, fontSize: 11 }}>
                {done}/{all}
              </span>
            </button>
          );
        })}
        <button onClick={openPicker} style={{
          flexShrink: 0, background: 'transparent', border: `1px dashed ${C.line2}`,
          borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: C.ink3,
          display: 'grid', placeItems: 'center',
        }}><I.Plus size={14} /></button>
      </div>

      {/* Current exercise */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 100px' }} className="no-scrollbar">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{ex.name}</div>
            <div style={{ fontSize: 12, color: C.ink3, marginTop: 4 }}>{ex.muscles}</div>
          </div>
          <button onClick={() => openExercise(ex.name)} style={{
            background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10,
            padding: '6px 10px', fontSize: 11, color: C.ink2, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0,
          }}>Détails <I.Right size={12} /></button>
        </div>

        {ex.lastBest && (
          <div style={{
            marginTop: 14, padding: '10px 12px', background: C.bg1, border: `1px solid ${C.line}`,
            borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Eyebrow>Dernier best</Eyebrow>
            <div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>
              {ex.lastBest.weight}<span style={{ color: C.ink3, fontSize: 11 }}>kg</span>
              <span style={{ color: C.ink3, margin: '0 6px' }}>×</span>
              {ex.lastBest.reps}
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: C.ink3 }} className="mono">
              1RM <span style={{ color: C.ink2 }}>{ex.lastBest.oneRM}kg</span>
            </div>
          </div>
        )}

        {/* Sets */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 60px', gap: 10, padding: '0 8px',
                        fontSize: 10, color: C.ink4, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span>#</span><span style={{ textAlign: 'center' }}>Poids · kg</span>
            <span style={{ textAlign: 'center' }}>Reps</span><span style={{ textAlign: 'right' }}>1RM</span>
          </div>

          {sets.map((s, i) => (
            <SetSwipeRow
              key={i} set={s} idx={i}
              isHolding={holding === i} holdProg={holdProg}
              onHoldStart={() => startHold(i)} onHoldEnd={endHold}
            />
          ))}

          <button style={{
            marginTop: 4, padding: '12px', background: 'transparent',
            border: `1px dashed ${C.line2}`, borderRadius: 14, color: C.ink3,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}><I.Plus size={14} /> Ajouter une série</button>
        </div>

        {/* Hint */}
        <div style={{
          marginTop: 18, padding: '12px 14px', background: C.bg1, border: `1px solid ${C.line}`,
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 999, border: `2px solid ${C.accent}`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}><I.Check size={14} stroke={C.accent} /></div>
          <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.45 }}>
            <strong style={{ color: C.ink }}>Maintiens</strong> sur une série pour la valider.
            Swipe vers la gauche pour la supprimer.
          </div>
        </div>
      </div>

      {/* Floating rest timer fab */}
      <div style={{ position: 'absolute', bottom: 30, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={{
          width: 52, height: 52, borderRadius: 16, background: C.bg2, border: `1px solid ${C.line2}`,
          color: C.ink, display: 'grid', placeItems: 'center', cursor: 'pointer',
          boxShadow: '0 10px 24px -8px rgba(0,0,0,0.6)',
        }}><I.Timer size={20} /></button>
      </div>
    </div>
  );
}

function SetSwipeRow({ set, idx, isHolding, holdProg, onHoldStart, onHoldEnd }) {
  const [w, setW] = React.useState(set.weight || '');
  const [r, setR] = React.useState(set.reps || '');
  React.useEffect(() => { setW(set.weight || ''); setR(set.reps || ''); }, [set.weight, set.reps]);

  const oneRM = (w && r) ? Math.round(w / (1.0278 - 0.0278 * r) * 10) / 10 : 0;
  const completed = set.completed;

  return (
    <div
      onMouseDown={completed ? undefined : onHoldStart}
      onMouseUp={onHoldEnd} onMouseLeave={onHoldEnd}
      onTouchStart={completed ? undefined : onHoldStart}
      onTouchEnd={onHoldEnd}
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'grid', gridTemplateColumns: '24px 1fr 1fr 60px', gap: 10, alignItems: 'center',
        padding: '12px 12px',
        background: completed ? 'oklch(0.86 0.20 130 / 0.08)' : C.bg1,
        border: `1px solid ${completed ? 'oklch(0.86 0.20 130 / 0.35)' : C.line}`,
        borderRadius: 14,
        transition: 'background 0.3s, border 0.3s',
        userSelect: 'none', cursor: completed ? 'default' : 'pointer',
      }}>
      {/* hold progress */}
      {isHolding && (
        <div style={{
          position: 'absolute', inset: 0, background: C.accent, opacity: 0.12,
          width: `${holdProg * 100}%`, transition: 'width 0.05s linear', pointerEvents: 'none',
        }} />
      )}

      <span className="mono" style={{ fontSize: 13, color: C.ink3, fontWeight: 700, position: 'relative' }}>{idx + 1}</span>

      <div style={{ position: 'relative' }}>
        <input
          value={w} onChange={e => setW(e.target.value)} disabled={completed}
          inputMode="decimal" placeholder="—"
          onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
          style={{
            width: '100%', textAlign: 'center', background: completed ? 'transparent' : C.bg2,
            border: `1px solid ${completed ? 'transparent' : C.line2}`, color: C.ink,
            borderRadius: 10, padding: '8px 4px', fontSize: 17, fontWeight: 700,
            fontFamily: 'JetBrains Mono', outline: 'none',
          }} />
      </div>

      <div style={{ position: 'relative' }}>
        <input
          value={r} onChange={e => setR(e.target.value)} disabled={completed}
          inputMode="numeric" placeholder="—"
          onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}
          style={{
            width: '100%', textAlign: 'center', background: completed ? 'transparent' : C.bg2,
            border: `1px solid ${completed ? 'transparent' : C.line2}`, color: C.ink,
            borderRadius: 10, padding: '8px 4px', fontSize: 17, fontWeight: 700,
            fontFamily: 'JetBrains Mono', outline: 'none',
          }} />
      </div>

      <div className="mono" style={{ textAlign: 'right', position: 'relative' }}>
        {set.isPR && <I.Star size={11} stroke={C.pr} fill={C.pr} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
        <span style={{ fontSize: 13, fontWeight: 700, color: completed ? (set.isPR ? C.pr : C.ink2) : (oneRM > 0 ? C.ink2 : C.ink4) }}>
          {oneRM > 0 ? oneRM.toFixed(0) : '—'}
        </span>
      </div>
    </div>
  );
}

// ─────────────── EXERCISE PICKER ───────────────
function ScreenPicker({ close, onPick }) {
  const lib = window.MOCK.EXERCISE_LIBRARY;
  const groups = ['All', 'Chest', 'Back', 'Legs', 'Arms'];
  const [g, setG] = React.useState('All');
  const [q, setQ] = React.useState('');
  const filtered = lib.filter(e => (g === 'All' || e.group === g) && (!q || e.name.toLowerCase().includes(q.toLowerCase())));
  const pinned = filtered.filter(e => e.pinned);
  const others = filtered.filter(e => !e.pinned);

  return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${C.line}` }}>
        <button onClick={close} style={{
          width: 36, height: 36, borderRadius: 10, background: C.bg2, border: `1px solid ${C.line}`,
          display: 'grid', placeItems: 'center', color: C.ink2, cursor: 'pointer',
        }}><I.Close size={16} /></button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Choisir un exercice</div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ position: 'relative' }}>
          <I.Search size={15} stroke={C.ink3} style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Rechercher dans 873 exercices…"
            style={{
              width: '100%', background: C.bg1, border: `1px solid ${C.line}`,
              borderRadius: 12, padding: '10px 14px 10px 36px', color: C.ink, fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
            }} />
        </div>
      </div>

      {/* Group chips */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
        {groups.map(grp => (
          <button key={grp} onClick={() => setG(grp)} style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 999,
            background: g === grp ? C.accent : C.bg1,
            border: `1px solid ${g === grp ? C.accent : C.line}`,
            color: g === grp ? C.accentInk : C.ink2,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>{grp}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto' }} className="no-scrollbar">
        {pinned.length > 0 && !q && (
          <div>
            <div style={{ padding: '8px 20px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <I.Pin size={11} stroke={C.ink3} />
              <Eyebrow>Récents</Eyebrow>
            </div>
            {pinned.map(ex => <ExerciseRow key={ex.id} ex={ex} onPick={onPick} />)}
            <div style={{ height: 1, background: C.line, margin: '8px 16px' }} />
          </div>
        )}
        <div style={{ padding: '8px 20px 6px' }}><Eyebrow>Tous</Eyebrow></div>
        {others.map(ex => <ExerciseRow key={ex.id} ex={ex} onPick={onPick} />)}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: C.ink3, fontSize: 13 }}>
            Aucun exercice trouvé
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseRow({ ex, onPick }) {
  return (
    <button onClick={() => onPick(ex)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 20px', background: 'transparent', border: 'none',
      borderBottom: `1px solid ${C.line}`, color: C.ink, cursor: 'pointer', textAlign: 'left',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: C.bg2,
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <I.Dumbbell size={18} stroke={C.ink3} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</div>
        <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>
          {ex.muscles} · <span style={{ color: C.ink4 }}>{ex.equip}</span>
        </div>
      </div>
      <I.Plus size={18} stroke={C.ink3} />
    </button>
  );
}

// ─────────────── EXERCISE DETAIL ───────────────
function ScreenExerciseDetail({ name, close }) {
  return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${C.line}` }}>
        <button onClick={close} style={{
          width: 36, height: 36, borderRadius: 10, background: C.bg2, border: `1px solid ${C.line}`,
          display: 'grid', placeItems: 'center', color: C.ink2, cursor: 'pointer',
        }}><I.Left size={16} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 11, color: C.ink3 }}>Pectoraux · Barre</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 100 }} className="no-scrollbar">
        {/* placeholder demo */}
        <div style={{
          margin: 16, height: 200, borderRadius: 18,
          background: `repeating-linear-gradient(135deg, ${C.bg1} 0 12px, ${C.bg2} 12px 24px)`,
          border: `1px solid ${C.line}`,
          display: 'grid', placeItems: 'center', color: C.ink3, fontSize: 12,
        }} className="mono">[GIF démonstration]</div>

        {/* Personal best */}
        <div style={{ padding: '0 16px' }}>
          <Eyebrow>Ton record</Eyebrow>
          <div style={{
            marginTop: 8, background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 16,
            padding: 16, display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: C.accentSoft,
              display: 'grid', placeItems: 'center',
            }}>
              <I.Star size={22} stroke={C.accent} fill={C.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                80<span style={{ fontSize: 13, color: C.ink3, marginLeft: 2 }}>kg</span>
                <span style={{ color: C.ink3, margin: '0 6px' }}>×</span>8
              </div>
              <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>1RM estimé · 99kg · il y a 4 jours</div>
            </div>
          </div>
        </div>

        {/* Muscles worked */}
        <div style={{ padding: '20px 16px 0' }}>
          <Eyebrow>Muscles ciblés</Eyebrow>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {['Pectoraux', 'Triceps', 'Deltoïde ant.'].map((m, i) => (
              <span key={m} style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: i === 0 ? C.accentSoft : C.bg1,
                color: i === 0 ? C.accent : C.ink2,
                border: `1px solid ${i === 0 ? 'transparent' : C.line}`,
              }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div style={{ padding: '20px 16px 0' }}>
          <Eyebrow>Exécution</Eyebrow>
          <ol style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
            {[
              'Allonge-toi sur le banc, les pieds bien ancrés au sol.',
              'Saisis la barre légèrement plus large que les épaules.',
              'Descends la barre vers la poitrine en contrôlant.',
              'Pousse la barre vers le haut sans verrouiller les coudes.',
            ].map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0' }}>
                <span className="mono" style={{
                  width: 22, height: 22, borderRadius: 999, background: C.bg2, color: C.ink2,
                  display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: C.ink2, lineHeight: 1.45 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─────────────── PROGRESS (history + stats merged) ───────────────
function ScreenProgress({ go }) {
  const [tab, setTab] = React.useState('progress'); // 'progress' | 'history'
  const p = window.MOCK.PROGRESS;
  const h = window.MOCK.HISTORY;
  const [exIdx, setExIdx] = React.useState(0);
  const ex = p.exercises[exIdx];

  return (
    <div style={{ background: C.bg, height: '100%', overflow: 'auto', paddingBottom: 110 }} className="no-scrollbar">
      {/* Header */}
      <div style={{ padding: '18px 20px 4px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Progression</div>
      </div>

      {/* Toggle */}
      <div style={{ padding: '12px 20px 4px', display: 'flex', gap: 4,
                    background: 'transparent' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: C.bg1, borderRadius: 12,
                      border: `1px solid ${C.line}` }}>
          {[['progress', 'Stats'], ['history', 'Historique']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '7px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              background: tab === k ? C.bg3 : 'transparent', color: tab === k ? C.ink : C.ink3,
              border: 'none', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'progress' && (
        <div style={{ padding: '14px 20px 0' }}>
          {/* Week volume */}
          <div style={{ background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <Eyebrow>Volume cette semaine</Eyebrow>
                <div className="mono" style={{ fontSize: 30, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em' }}>
                  {(p.weekVolume.reduce((a, b) => a + b, 0) / 1000).toFixed(1)}<span style={{ fontSize: 14, color: C.ink3, marginLeft: 3 }}>tonnes</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 700,
                            background: C.accentSoft, padding: '5px 10px', borderRadius: 999 }}>
                <I.Trend size={12} stroke={C.accent} /> +18%
              </div>
            </div>
            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100, marginTop: 18 }}>
              {p.weekVolume.map((v, i) => {
                const h = (v / Math.max(...p.weekVolume)) * 80;
                const isToday = i === p.weekVolume.length - 1;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{
                      width: '100%', height: `${h}px`,
                      background: isToday ? C.accent : C.bg3,
                      borderRadius: 6,
                    }} />
                    <span style={{ fontSize: 10, color: isToday ? C.ink2 : C.ink3, fontWeight: 600 }} className="mono">{p.weekDays[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exercise selector */}
          <div style={{ marginTop: 18, display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
            {p.exercises.map((e, i) => (
              <button key={i} onClick={() => setExIdx(i)} style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 12,
                background: exIdx === i ? C.bg3 : C.bg1,
                border: `1px solid ${exIdx === i ? C.line2 : C.line}`,
                color: exIdx === i ? C.ink : C.ink2, fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}>{e.name}</button>
            ))}
          </div>

          {/* Chart */}
          <div style={{ marginTop: 14, background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <Eyebrow>1RM estimé</Eyebrow>
                <div className="mono" style={{ fontSize: 30, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em' }}>
                  {ex.best}<span style={{ fontSize: 14, color: C.ink3, marginLeft: 3 }}>kg</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.accent, fontSize: 12, fontWeight: 700,
                            background: C.accentSoft, padding: '5px 10px', borderRadius: 999 }}>
                <I.Trend size={12} stroke={C.accent} /> {ex.delta}
              </div>
            </div>
            <Sparkline points={ex.points} />
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {h.map(s => (
            <button key={s.id} style={{
              background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 16,
              padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              color: C.ink, textAlign: 'left',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: C.accent, color: C.accentInk,
                display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0,
              }}>{s.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</span>
                  {s.prs > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
                      background: 'oklch(0.86 0.20 90 / 0.15)', color: C.pr,
                    }}>{s.prs} PR</span>
                  )}
                </div>
                <div className="mono" style={{ fontSize: 11, color: C.ink3, marginTop: 3 }}>
                  {s.date} · {s.dur}min · {s.sets} séries · {(s.vol / 1000).toFixed(1)}t
                </div>
              </div>
              <I.Right size={16} stroke={C.ink4} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Sparkline({ points }) {
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const w = 320, h = 90;
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  const area = path + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h + 6}`} style={{ width: '100%', height: 100, marginTop: 14 }}>
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.86 0.20 130)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.86 0.20 130)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grad)" />
      <path d={path} fill="none" stroke="oklch(0.86 0.20 130)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={h - ((points[points.length - 1] - min) / range) * h} r="4" fill="oklch(0.86 0.20 130)" />
    </svg>
  );
}

// ─────────────── NUTRITION ───────────────
function ScreenNutrition({ openMeal, openAdd }) {
  const n = window.MOCK.NUTRITION;
  const [tab, setTab] = React.useState('today'); // today | week | insights
  const remaining = Math.max(0, n.target - n.current + n.burned);
  const pct = Math.min(100, Math.round((n.current / n.target) * 100));
  const ringR = 56, ringC = 2 * Math.PI * ringR;
  const ringOff = ringC - (pct / 100) * ringC;

  return (
    <div style={{ background: C.bg, height: '100%', overflow: 'auto', paddingBottom: 110 }} className="no-scrollbar">
      {/* Header */}
      <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>Nutrition</div>
          <div style={{ fontSize: 13, color: C.ink3, marginTop: 2 }}>
            {n.context.day} · <span style={{ color: C.accent }}>{n.context.activity}</span>
          </div>
        </div>
        <button onClick={openAdd} style={{
          width: 38, height: 38, borderRadius: 12, background: C.accent, color: C.accentInk,
          border: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer',
          boxShadow: '0 6px 16px -6px oklch(0.86 0.20 130 / 0.6)',
        }}><I.Plus size={18} /></button>
      </div>

      {/* Tab toggle */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: C.bg1, borderRadius: 12,
                      border: `1px solid ${C.line}` }}>
          {[['today','Aujourd\'hui'], ['week','Semaine'], ['insights','Conseils']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              flex: 1, padding: '7px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600,
              background: tab === k ? C.bg3 : 'transparent', color: tab === k ? C.ink : C.ink3,
              border: 'none', cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'today' && (
        <>
          {/* Hero card: ring + balance */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 22, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <svg width="128" height="128" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
                  <circle cx="80" cy="80" r={ringR} fill="none" stroke={C.bg3} strokeWidth="11" />
                  <circle cx="80" cy="80" r={ringR} fill="none" stroke={C.accent} strokeWidth="11"
                          strokeLinecap="round" strokeDasharray={ringC} strokeDashoffset={ringOff}
                          transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 0.6s' }} />
                  <text x="80" y="74" textAnchor="middle" fill={C.ink3} fontSize="10" fontWeight="700"
                        letterSpacing="2">RESTE</text>
                  <text x="80" y="100" textAnchor="middle" fill={C.ink} fontSize="28" fontWeight="800"
                        fontFamily="JetBrains Mono" letterSpacing="-1">{remaining}</text>
                </svg>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <BalanceRow label="Objectif" value={n.target} hue={null} muted />
                  <BalanceRow label="Mangé"    value={n.current} hue={130} sign="−" />
                  <BalanceRow label="Brûlé"    value={n.burned}  hue={40}  sign="+" />
                </div>
              </div>
              {/* Macros */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}`,
                            display: 'flex', flexDirection: 'column', gap: 10 }}>
                <MacroBar label="Protéines" hue={130} cur={n.protein.current} tgt={n.protein.target} />
                <MacroBar label="Glucides"  hue={75}  cur={n.carbs.current}   tgt={n.carbs.target} />
                <MacroBar label="Lipides"   hue={40}  cur={n.fats.current}    tgt={n.fats.target} />
                <MacroBar label="Fibres"    hue={170} cur={n.fiber.current}   tgt={n.fiber.target} />
              </div>
            </div>
          </div>

          {/* Hydration tracker */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <I.Drop size={16} stroke="oklch(0.78 0.14 230)" />
                  <Eyebrow style={{ color: C.ink2 }}>Hydratation</Eyebrow>
                </div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>
                  {n.water.current.toFixed(1)}<span style={{ color: C.ink3, fontSize: 11 }}>/{n.water.target}L</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, marginTop: 12 }}>
                {Array.from({length: 12}).map((_, i) => {
                  const filled = (i + 1) * 0.25 <= n.water.current;
                  return (
                    <div key={i} style={{
                      flex: 1, height: 28, borderRadius: 5,
                      background: filled ? 'oklch(0.78 0.14 230)' : C.bg3,
                      opacity: filled ? 1 : 0.5,
                    }} />
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                {[0.25, 0.5].map(v => (
                  <button key={v} style={{
                    flex: 1, padding: '8px', borderRadius: 10, background: C.bg2,
                    border: `1px solid ${C.line2}`, color: C.ink2, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>+{v * 1000}ml</button>
                ))}
              </div>
            </div>
          </div>

          {/* Meals */}
          <div style={{ padding: '18px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Eyebrow>Repas du jour</Eyebrow>
              <span className="mono" style={{ fontSize: 11, color: C.ink3 }}>{n.meals.filter(m=>m.done).length}/{n.meals.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {n.meals.map(m => (
                <button key={m.id} onClick={() => openMeal(m)} style={{
                  background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
                  color: C.ink, opacity: m.done ? 0.6 : 1,
                }}>
                  <div className="mono" style={{
                    fontSize: 11, color: C.ink3, fontWeight: 600, width: 38, flexShrink: 0,
                  }}>{m.time}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</span>
                      {m.done && <I.Check size={12} stroke={C.accent} />}
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: C.ink3, marginTop: 3, display: 'flex', gap: 8 }}>
                      <span><span style={{ color: 'oklch(0.78 0.16 130)' }}>P</span> {m.macros.p}g</span>
                      <span><span style={{ color: 'oklch(0.78 0.16 75)' }}>G</span> {m.macros.c}g</span>
                      <span><span style={{ color: 'oklch(0.78 0.16 40)' }}>L</span> {m.macros.f}g</span>
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: C.ink2, flexShrink: 0, textAlign: 'right' }}>
                    {m.kcal}<div style={{ fontSize: 9, color: C.ink3, fontWeight: 500 }}>kcal</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'week' && (
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: 18 }}>
            <Eyebrow>Calories — 7 derniers jours</Eyebrow>
            <div className="mono" style={{ fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: '-0.02em' }}>
              {Math.round(n.weekKcal.reduce((a,b)=>a+b,0) / 7)}<span style={{ fontSize: 13, color: C.ink3, marginLeft: 4 }}>kcal/j moy.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, marginTop: 18 }}>
              {n.weekKcal.map((v, i) => {
                const h = (v / Math.max(...n.weekKcal, n.target)) * 100;
                const tgtH = (n.target / Math.max(...n.weekKcal, n.target)) * 100;
                const isToday = i === n.weekKcal.length - 1;
                const reached = v >= n.target * 0.9;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                    {/* target line */}
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${tgtH * 0.85 + 22}px`, borderTop: `1px dashed ${C.line2}`, opacity: 0.5 }} />
                    <div style={{
                      width: '100%', height: `${h * 0.85}%`,
                      background: isToday ? C.accent : (reached ? 'oklch(0.78 0.14 130 / 0.5)' : C.bg3),
                      borderRadius: 6,
                    }} />
                    <span className="mono" style={{ fontSize: 9, color: C.ink3 }}>{(v/1000).toFixed(1)}k</span>
                    <span style={{ fontSize: 10, color: isToday ? C.ink2 : C.ink3, fontWeight: 600 }} className="mono">{n.weekDays[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avg macros */}
          <div style={{ marginTop: 12, background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16 }}>
            <Eyebrow>Moyennes hebdo</Eyebrow>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {[
                { l: 'Protéines', v: 178, u: 'g', hue: 130 },
                { l: 'Glucides',  v: 372, u: 'g', hue: 75 },
                { l: 'Lipides',   v: 92,  u: 'g', hue: 40 },
              ].map(x => (
                <div key={x.l} style={{ flex: 1, padding: 12, background: C.bg2, borderRadius: 12 }}>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: `oklch(0.82 0.16 ${x.hue})` }}>
                    {x.v}<span style={{ fontSize: 10, color: C.ink3, marginLeft: 1 }}>{x.u}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.ink3, marginTop: 4, fontWeight: 500 }}>{x.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak */}
          <div style={{ marginTop: 12, background: 'linear-gradient(180deg, rgba(180,255,80,0.08), rgba(180,255,80,0.01))',
                        border: '1px solid rgba(180,255,80,0.15)', borderRadius: 18, padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 12 }}>
            <I.Flame size={22} stroke={C.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>5 jours d'affilée</div>
              <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>au-dessus de tes objectifs protéine</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'insights' && (
        <div style={{ padding: '14px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {n.insights.map((ins, i) => {
            const tone = ins.kind === 'good' ? C.accent : (ins.kind === 'warn' ? C.warn : 'oklch(0.78 0.14 230)');
            const Ic = ins.icon === 'check' ? I.Check : (ins.icon === 'flame' ? I.Flame : I.Drop);
            return (
              <div key={i} style={{
                background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14,
                display: 'flex', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${tone.replace(')', ' / 0.14)').replace('oklch(', 'oklch(')}`,
                  display: 'grid', placeItems: 'center',
                }}>
                  <Ic size={16} stroke={tone} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{ins.title}</div>
                  <div style={{ fontSize: 12, color: C.ink2, marginTop: 4, lineHeight: 1.4 }}>{ins.text}</div>
                </div>
              </div>
            );
          })}

          {/* Goals card */}
          <div style={{ background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginTop: 4 }}>
            <Eyebrow>Tes objectifs</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {[
                { l: 'Calories', v: '3 400 kcal/j' },
                { l: 'Protéines', v: '2.0 g/kg poids corporel' },
                { l: 'Phase', v: 'Prise de masse contrôlée' },
                { l: 'Calcul auto.', v: 'Activé · ajuste selon poids' },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: 13,
                  paddingBottom: i < arr.length - 1 ? 10 : 0,
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : 'none',
                }}>
                  <span style={{ color: C.ink3 }}>{row.l}</span>
                  <span style={{ color: C.ink, fontWeight: 600 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BalanceRow({ label, value, hue, sign, muted }) {
  const color = muted ? C.ink2 : (hue ? `oklch(0.82 0.16 ${hue})` : C.ink);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 11, color: C.ink3, fontWeight: 500 }}>{label}</span>
      <span className="mono" style={{ fontSize: 14, fontWeight: 700, color }}>
        {sign}{value}
      </span>
    </div>
  );
}

// ─────────────── MEAL DETAIL ───────────────
function ScreenMealDetail({ meal, close }) {
  return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${C.line}` }}>
        <button onClick={close} style={{
          width: 36, height: 36, borderRadius: 10, background: C.bg2, border: `1px solid ${C.line}`,
          display: 'grid', placeItems: 'center', color: C.ink2, cursor: 'pointer',
        }}><I.Left size={16} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{meal.name}</div>
          <div style={{ fontSize: 11, color: C.ink3 }}>{meal.time} · {meal.items.length} aliments</div>
        </div>
        <button style={{
          background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 10,
          width: 36, height: 36, display: 'grid', placeItems: 'center', color: C.ink2, cursor: 'pointer',
        }}><I.Trash size={15} /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 80 }} className="no-scrollbar">
        {/* Summary */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 18, padding: 16,
          }}>
            <div className="mono" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {meal.kcal}<span style={{ fontSize: 13, color: C.ink3, marginLeft: 4 }}>kcal</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {[
                { l: 'P', v: meal.macros.p, hue: 130 },
                { l: 'G', v: meal.macros.c, hue: 75 },
                { l: 'L', v: meal.macros.f, hue: 40 },
              ].map(m => (
                <div key={m.l} style={{ flex: 1, padding: '8px 10px', background: C.bg2, borderRadius: 10 }}>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: `oklch(0.82 0.16 ${m.hue})` }}>
                    {m.v}<span style={{ fontSize: 10, color: C.ink3, marginLeft: 1 }}>g</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.ink3, marginTop: 2 }}>
                    {m.l === 'P' ? 'Protéines' : m.l === 'G' ? 'Glucides' : 'Lipides'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Eyebrow>Aliments</Eyebrow>
            <button style={{
              background: 'none', border: 'none', color: C.accent, fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
            }}><I.Plus size={12} stroke={C.accent} /> Ajouter</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meal.items.map((it, i) => (
              <div key={i} style={{
                background: C.bg1, border: `1px solid ${C.line}`, borderRadius: 12,
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: C.ink3, marginTop: 2, display: 'flex', gap: 8 }}>
                    <span>{it.qty}</span>
                    <span>·</span>
                    <span><span style={{ color: 'oklch(0.78 0.16 130)' }}>P</span>{it.p}</span>
                    <span><span style={{ color: 'oklch(0.78 0.16 75)' }}>G</span>{it.c}</span>
                    <span><span style={{ color: 'oklch(0.78 0.16 40)' }}>L</span>{it.f}</span>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: C.ink2 }}>
                  {it.kcal}<span style={{ fontSize: 9, color: C.ink3, marginLeft: 2 }}>kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────── ADD FOOD ───────────────
function ScreenAddFood({ close }) {
  const n = window.MOCK.NUTRITION;
  const [q, setQ] = React.useState('');
  const filtered = n.foodSearch.filter(f => !q || f.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ background: C.bg, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${C.line}` }}>
        <button onClick={close} style={{
          width: 36, height: 36, borderRadius: 10, background: C.bg2, border: `1px solid ${C.line}`,
          display: 'grid', placeItems: 'center', color: C.ink2, cursor: 'pointer',
        }}><I.Close size={16} /></button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>Ajouter un aliment</div>
      </div>

      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ position: 'relative' }}>
          <I.Search size={15} stroke={C.ink3} style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Rechercher un aliment…"
            style={{
              width: '100%', background: C.bg1, border: `1px solid ${C.line}`,
              borderRadius: 12, padding: '10px 14px 10px 36px', color: C.ink, fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
            }} />
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', gap: 6 }}>
        {['Scanner', 'Recettes', 'Récents', 'Favoris'].map((l, i) => (
          <button key={l} style={{
            flex: 1, padding: '10px 6px', borderRadius: 12,
            background: i === 0 ? C.accentSoft : C.bg1,
            border: `1px solid ${i === 0 ? 'transparent' : C.line}`,
            color: i === 0 ? C.accent : C.ink2,
            fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: '12px 20px 4px' }}>
        <Eyebrow>Aliments — par 100g</Eyebrow>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }} className="no-scrollbar">
        {filtered.map((f, i) => (
          <button key={i} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 20px', background: 'transparent', border: 'none',
            borderBottom: `1px solid ${C.line}`, color: C.ink, cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
              <div className="mono" style={{ fontSize: 11, color: C.ink3, marginTop: 3, display: 'flex', gap: 8 }}>
                <span style={{ color: C.ink2 }}>{f.kcal}<span style={{ color: C.ink3 }}>kcal</span></span>
                <span><span style={{ color: 'oklch(0.78 0.16 130)' }}>P</span>{f.p}</span>
                <span><span style={{ color: 'oklch(0.78 0.16 75)' }}>G</span>{f.c}</span>
                <span><span style={{ color: 'oklch(0.78 0.16 40)' }}>L</span>{f.f}</span>
              </div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: C.accentSoft,
              display: 'grid', placeItems: 'center',
            }}><I.Plus size={16} stroke={C.accent} /></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MacroBar({ label, cur, tgt, hue }) {
  const pct = Math.min(100, Math.round((cur / tgt) * 100));
  const color = `oklch(0.78 0.16 ${hue})`;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.ink2 }}>{label}</span>
        <span className="mono" style={{ fontSize: 11, color: C.ink3 }}>
          <span style={{ color: C.ink, fontWeight: 600 }}>{cur}</span>/{tgt}<span style={{ color: C.ink4 }}>g</span>
        </span>
      </div>
      <div style={{ height: 6, background: C.bg3, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

// ─────────────── BOTTOM NAV ───────────────
function BottomNav({ screen, setScreen }) {
  const items = [
    { id: 'home', label: 'Accueil', icon: I.Home },
    { id: 'session', label: 'Séance', icon: I.Bolt },
    { id: 'progress', label: 'Progression', icon: I.Chart },
    { id: 'nutrition', label: 'Nutrition', icon: I.Apple },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 24,
      padding: '0 16px', pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'rgba(15,15,18,0.85)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${C.line}`, borderRadius: 20, padding: '10px 8px',
        pointerEvents: 'auto',
      }}>
        {items.map(it => {
          const active = screen === it.id;
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '6px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              color: active ? C.accent : C.ink3,
            }}>
              <it.icon size={20} stroke={active ? C.accent : C.ink3} strokeWidth={active ? 2 : 1.6} />
              <span style={{ fontSize: 10, fontWeight: 600 }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, {
  C, ScreenHome, ScreenSession, ScreenPicker, ScreenExerciseDetail, ScreenProgress,
  ScreenNutrition, ScreenMealDetail, ScreenAddFood, BottomNav,
});
