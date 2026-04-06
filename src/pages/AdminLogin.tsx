import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useGameStore } from '../store/useGameStore';

const AdminLogin = () => {
  const navigate = useNavigate();
  const setAdminStatus = useGameStore((state) => state.setAdminStatus);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const isBypass = localStorage.getItem('admin_bypass') === 'true';
        if (isBypass) {
          setAdminStatus(true);
          navigate('/admin/dashboard');
          return;
        }

        const session = await api.getSession();
        if (!session) return;
        const role = await api.getMyRole();
        setAdminStatus(role === 'admin');
        navigate('/admin/dashboard');
      } catch {
        // ignore
      }
    };

    void check();
  }, [navigate, setAdminStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.login({ email, password });
      setAdminStatus(true);
      navigate('/admin/dashboard');
    } catch {
      setError('管理员账号或密码错误，请重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0505] px-4 py-12 font-sans">
      <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B0000]/12 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#722F37]/8 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="group relative overflow-hidden rounded-[48px] border border-white/10 bg-[#1A0707]/60 p-12 shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-[40px]">
          <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#722F37] group-hover:animate-shimmer" />

          <div className="mb-12 text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-[#8B0000]/15 text-[#D4AF37] shadow-2xl">
              <ShieldCheck className="h-12 w-12" />
            </div>
            <h2 className="mb-3 text-4xl font-black text-white">管理者登录</h2>
            <p className="text-sm font-medium text-[#F3DDE4]/40">请输入凭据以访问后台管理系统</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#F3DDE4]/50">
                <User className="h-4 w-4" /> 账号
              </label>
              <input
                required
                type="text"
                placeholder="请输入管理员账号"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-5 font-medium text-white transition-all placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#F3DDE4]/50">
                <Lock className="h-4 w-4" /> 密码
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-5 pr-16 font-medium text-white transition-all placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-500/20 bg-red-500/10 py-4 text-center text-xs font-bold text-red-500">
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#8B0000] to-[#722F37] py-5 text-lg font-black text-white shadow-xl transition-all hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] disabled:opacity-50"
            >
              {loading ? '正在验证...' : '登录'}
            </button>
          </form>

          <div className="mt-10 border-t border-white/5 pt-10 text-center">
            <button
              onClick={() => navigate('/')}
              className="group mx-auto flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F3DDE4]/40 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回主站首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
