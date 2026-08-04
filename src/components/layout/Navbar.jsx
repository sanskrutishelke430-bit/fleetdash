import React from 'react';
import { Activity, Bell, Radio, User } from 'lucide-react';

const Navbar = ({ onMobileMenuToggle }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & System Node Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
        >
          <Activity className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">
            Node: US-EAST-TELEMETRY-GATEWAY
          </span>
        </div>
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-750 text-xs font-mono text-emerald-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>STREAM ONLINE</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition">
          <Bell className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-xs">
            AD
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200">Fleet Operations</div>
            <div className="text-[10px] text-slate-400">admin@fleetdash.com</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
