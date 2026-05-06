// Lightweight inline icons (lucide-style stroke, no deps)
function Icon({ children, size = 22, stroke = 'currentColor', strokeWidth = 1.75, fill = 'none', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}

const I = {
  Home:    (p) => <Icon {...p}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></Icon>,
  Bolt:    (p) => <Icon {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></Icon>,
  Chart:   (p) => <Icon {...p}><path d="M3 20h18"/><path d="M6 16v-5"/><path d="M11 16v-9"/><path d="M16 16v-3"/><path d="M21 16v-7"/></Icon>,
  Apple:   (p) => <Icon {...p}><path d="M12 6c-2-3 1-4 2-4 0 2-2 4-2 4z"/><path d="M12 6c-3-2-7 0-7 5 0 6 4 11 7 11s7-5 7-11c0-5-4-7-7-5z"/></Icon>,
  Plus:    (p) => <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>,
  Check:   (p) => <Icon {...p}><path d="M5 12l5 5 9-11"/></Icon>,
  Trash:   (p) => <Icon {...p}><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></Icon>,
  Search:  (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  Close:   (p) => <Icon {...p}><path d="M6 6l12 12"/><path d="M18 6L6 18"/></Icon>,
  Right:   (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  Left:    (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  Down:    (p) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  Up:      (p) => <Icon {...p}><path d="M6 15l6-6 6 6"/></Icon>,
  Clock:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Flame:   (p) => <Icon {...p}><path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4-1 4 3 4 3 1 0-2-1-4 0-7z"/></Icon>,
  Trend:   (p) => <Icon {...p}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></Icon>,
  Star:    (p) => <Icon {...p}><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14l-5-4.5L9.5 9z"/></Icon>,
  Pin:     (p) => <Icon {...p}><path d="M12 17v5"/><path d="M9 11l-3 3 4 1 1 4 3-3"/><path d="M9 11l5-5 4 4-5 5"/></Icon>,
  Filter:  (p) => <Icon {...p}><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></Icon>,
  Settings:(p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 00-2.1 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 002.1 1.2L10 21h4l.5-2.6a7 7 0 002.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></Icon>,
  Drop:    (p) => <Icon {...p}><path d="M12 3s6 7 6 12a6 6 0 01-12 0c0-5 6-12 6-12z"/></Icon>,
  Dumbbell:(p) => <Icon {...p}><path d="M2 12h2"/><path d="M20 12h2"/><path d="M5 8v8"/><path d="M19 8v8"/><path d="M8 6v12"/><path d="M16 6v12"/><path d="M8 12h8"/></Icon>,
  Pause:   (p) => <Icon {...p}><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></Icon>,
  Play:    (p) => <Icon {...p} fill="currentColor" stroke="none"><path d="M7 5l12 7-12 7z"/></Icon>,
  Calendar:(p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/></Icon>,
  Timer:   (p) => <Icon {...p}><circle cx="12" cy="13" r="8"/><path d="M9 2h6"/><path d="M12 9v4l2 2"/></Icon>,
  ArrowR:  (p) => <Icon {...p}><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></Icon>,
};

window.Icon = Icon;
window.I = I;
