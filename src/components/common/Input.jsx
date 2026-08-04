import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl bg-slate-950 border ${
            error ? 'border-rose-500/80 focus:ring-rose-500/30' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
          } ${Icon ? 'pl-10' : 'px-4'} py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 transition-all`}
        />
      </div>
      {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
    </div>
  );
};

export default Input;
