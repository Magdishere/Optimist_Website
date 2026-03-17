import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Coffee, Phone, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { login, clearError } from '../redux/slices/authSlice';

const Login = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (user) navigate(redirect);
    return () => dispatch(clearError());
  }, [user, navigate, dispatch, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-500" style={{ backgroundColor: theme.background }}>
      <div className="w-full max-w-md space-y-6 md:space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[32px] shadow-2xl transition-transform active:scale-90" style={{ backgroundColor: theme.primary }}>
            <Coffee size={32} md={40} style={{ color: theme.background }} />
          </Link>
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>Welcome Back</h1>
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-40">Login to your account</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {error && (
              <div 
                className="flex items-center space-x-2 p-3 md:p-4 rounded-xl md:rounded-2xl animate-in shake duration-300 border"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <AlertCircle size={16} md={18} />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
            )}

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-2">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Phone Number</label>
                <div className="flex items-center px-4 md:px-6 py-3.5 md:py-5 rounded-xl md:rounded-[24px] border transition-all focus-within:shadow-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <Phone size={16} md={18} className="opacity-40 mr-3 md:mr-4" />
                  <input 
                    type="tel" 
                    required
                    className="bg-transparent border-none outline-none w-full font-bold text-xs md:text-sm"
                    style={{ color: theme.text }}
                    placeholder="Enter your phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Password</label>
                  <button type="button" className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">Forgot?</button>
                </div>
                <div className="flex items-center px-4 md:px-6 py-3.5 md:py-5 rounded-xl md:rounded-[24px] border transition-all focus-within:shadow-lg" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <Lock size={16} md={18} className="opacity-40 mr-3 md:mr-4" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    className="bg-transparent border-none outline-none w-full font-bold text-xs md:text-sm"
                    style={{ color: theme.text }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="opacity-40 hover:opacity-100 transition-opacity"
                  >
                    {showPassword ? <EyeOff size={16} md={18} /> : <Eye size={16} md={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 md:py-5 rounded-xl md:rounded-[24px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-2 md:space-x-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: theme.primary, color: theme.background }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: theme.background }} />
              ) : (
                <>
                  <span className="text-xs md:text-base">Login</span>
                  <ArrowRight size={18} md={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 md:mt-10 text-center">
            <p className="text-[10px] md:text-xs font-bold opacity-40 uppercase tracking-widest">
              Don't have an account? {' '}
              <Link to="/register" className="transition-colors hover:opacity-100" style={{ color: theme.primary }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Back */}
        <div className="text-center">
          <Link to="/" className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
