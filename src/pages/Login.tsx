import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { api } from '../api';

const getFriendlyError = (err: unknown) => {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err || '').toLowerCase();
  if (message.includes('invalid login credentials')) return '账号或密码不正确。';
  return err instanceof Error ? err.message : '登录失败，请稍后重试。';
};

const Login = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await api.getSession();
        if (session) navigate('/volunteer-center', { replace: true });
      } catch {
        // ignore
      }
    };
    void checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.loginWithAccountPassword({ account, password });
      navigate('/volunteer-center', { replace: true });
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent selection:bg-[#8B0000] selection:text-white">
      <Navbar />

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A0707] via-[#0A0505] to-black opacity-90" />
        <div className="absolute right-0 top-0 h-[760px] w-[760px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B0000]/12 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[520px] w-[520px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#722F37]/10 blur-[100px]" />
      </div>

      <main className="relative z-10 flex flex-grow items-center justify-center p-4">
        <div className="grid w-full max-w-[1200px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hidden space-y-10 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#8B0000]/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              志愿者账号
            </div>
            <div className="space-y-6">
              <h1 className="text-6xl font-black leading-[0.95] text-white">
                账号密码登录
                <br />
                继续你的公益旅程
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[#F3DDE4]/55">
                使用你注册的账号和密码直接登录，等级、积分和个人设置都会从 Supabase 恢复。
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[48px] border border-white/10 bg-[#1A0707]/60 p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-[40px] md:p-14"
          >
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#722F37]" />

            <div className="mb-10">
              <h2 className="mb-3 text-3xl font-black text-white">欢迎回来</h2>
              <p className="text-sm text-[#F3DDE4]/45">请输入账号和密码，登录后直接进入志愿者中心。</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F3DDE4]/40">
                  <User className="h-3 w-3" /> 账号
                </label>
                <input
                  required
                  type="text"
                  placeholder="请输入账号"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-medium text-white transition-all placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F3DDE4]/40">
                  <Lock className="h-3 w-3" /> 密码
                </label>
                <input
                  required
                  type="password"
                  placeholder="请输入密码"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-medium text-white transition-all placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400">
                  {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#8B0000] to-[#722F37] py-5 font-black text-white transition-all hover:shadow-[0_0_30px_rgba(139,0,0,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '正在登录...' : '立即登录'}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-[#F3DDE4]/35">
              还没有账号？
              <Link to="/register" className="ml-2 font-bold text-[#D4AF37] transition-colors hover:text-white">
                去注册
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Login;
