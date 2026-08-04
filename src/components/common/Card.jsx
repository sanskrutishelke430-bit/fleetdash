import React from 'react';

const Card = ({ children, title, subtitle, action, className = '' }) => {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl transition-all duration-200 hover:border-slate-750 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
