import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@fleetdash.com',
    password: 'admin123',
    remember: true,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (formData.email === 'admin@fleetdash.com' && formData.password === 'admin123') {
        navigate('/dashboard');
      } else {
        setError('Invalid Email or Password. Try demo credentials below.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <AuthLayout>
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-blue-600/20 border border-blue-500/40 p-4 rounded-2xl text-blue-400 mb-4 glow-blue">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">FleetDash Console</h1>
          <p className="text-xs text-slate-400 mt-1">High-Throughput Fleet Telemetry Control Center</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Operator Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="admin@fleetdash.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-200 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500/20"
              />
              Remember Session
            </label>
            <button type="button" className="text-blue-400 hover:underline">
              Forgot Access Key?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            icon={ArrowRight}
            className="w-full mt-2"
          >
            Authenticate & Launch
          </Button>
        </form>

        {/* Demo Hint */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-mono mb-2">
            Demo Credentials
          </p>
          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-between px-4">
            <span>admin@fleetdash.com</span>
            <span className="text-blue-400">admin123</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;