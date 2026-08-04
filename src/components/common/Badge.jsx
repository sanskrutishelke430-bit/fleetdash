import React from 'react';

const Badge = ({ status }) => {
  const normalized = status?.toLowerCase() || 'offline';

  const styles = {
    running: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 glow-emerald',
    idle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    offline: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const dots = {
    running: 'bg-emerald-400 animate-pulse',
    idle: 'bg-amber-400',
    offline: 'bg-rose-400',
  };

  const currentStyle = styles[normalized] || styles.offline;
  const currentDot = dots[normalized] || dots.offline;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${currentStyle}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${currentDot}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};

export default Badge;
