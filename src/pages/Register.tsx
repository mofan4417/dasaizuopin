import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Heart, Lock, Sparkles, Trophy, User, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../api';
import { useGameStore } from '../store/useGameStore';

const getFriendlyError = (err: unknown) => {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err || '').toLowerCase();
  if (message.includes('already')) return '这个账号已经存在了，请换一个。';
  if (message.includes('password')) return '密码至少需要 6 位。';
  if (message.includes('invalid login credentials')) return '账号或密码不正确。';
  return err instanceof Error ? err.message : '注册失败，请稍后重试。';
};

const Register = () => {
  const navigate = useNavigate();
  const { addPoints, unlockAchievement, syncToRemote } = useGameStore();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setLoading(false);
      setError('两次输入的密码不一致。');
      return;
    }

    try {
      await api.registerWithAccountPassword({ account, password });
      addPoints(50);
      unlockAchievement('first_visit');
      await syncToRemote();
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
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute right-0 top-0 h-[800px] w-[800px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B0000]/12 blur-[120px]"
        />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#722F37]/8 blur-[100px]" />
      </div>

      <main className="relative z-10 flex flex-grow items-center justify-center p-4">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hidden space-y-12 lg:block">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#8B0000]/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                <Sparkles className="h-4 w-4" /> 加入乡助桥
              </div>
              <h1 className="text-6xl font-black leading-tight text-white">
                账号密码注册
                <br />
                <span className="bg-gradient-to-r from-[#8B0000] to-[#D4AF37] bg-clip-text text-transparent">
                  注册后直接进入系统
                </span>
              </h1>
              <p className="max-w-md text-xl font-medium leading-relaxed text-[#F3DDE4]/60">
                现在改成自定义账号和密码注册，资料和等级都会直接保存到 Supabase，下次登录不会丢。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5">
                  <Heart className="h-6 w-6 text-[#8B0000]" />
                </div>
                <h3 className="font-black text-white">注册后直接登录</h3>
                <p className="text-sm leading-relaxed text-[#F3DDE4]/40">不再额外跳转验证码流程，注册完成后自动进入志愿者中心。</p>
              </div>
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5">
                  <Trophy className="h-6 w-6 text-[#FFD700]" />
                </div>
                <h3 className="font-black text-white">等级云端保存</h3>
                <p className="text-sm leading-relaxed text-[#F3DDE4]/40">注册成功后会同步等级、积分和任务进度到 Supabase。</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="group relative overflow-hidden rounded-[48px] border border-white/10 bg-[#1A0707]/60 p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] backdrop-blur-[40px] md:p-16"
          >
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#8B0000] via-[#D4AF37] to-[#722F37] group-hover:animate-shimmer" />

            <div className="mb-10 text-center lg:text-left">
              <h2 className="mb-2 text-3xl font-black text-white">创建账号</h2>
              <p className="text-sm font-medium text-[#F3DDE4]/40">输入自定义账号和密码，注册完成后直接进入志愿者中心。</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F3DDE4]/40">
                  <User className="h-3 w-3" /> 账号
                </label>
                <input
                  required
                  type="text"
                  placeholder="请输入自定义账号"
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

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F3DDE4]/40">
                  <Lock className="h-3 w-3" /> 确认密码
                </label>
                <input
                  required
                  type="password"
                  placeholder="请再次输入密码"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-medium text-white transition-all placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/40"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-400"
                  >
                    <X className="h-4 w-4" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                disabled={loading}
                type="submit"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#8B0000] to-[#722F37] py-5 font-black text-white transition-all hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '正在注册...' : '立即注册并登录'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs font-bold text-[#F3DDE4]/30">
                已经有账号了？
                <Link to="/login" className="ml-2 text-[#D4AF37] transition-colors hover:text-white">
                  账号密码登录
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Register;
