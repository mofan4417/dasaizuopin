import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [language, setLanguage] = useState<'zh' | 'en' | 'ar'>('zh');
  const [hasSession, setHasSession] = useState(false);

  const languages = [
    { code: 'zh' as const, name: '简体中文' },
    { code: 'en' as const, name: 'English' },
    { code: 'ar' as const, name: 'العربية' },
  ];

  useEffect(() => {
    const syncSession = async () => {
      const session = await supabase.auth.getSession();
      setHasSession(Boolean(session.data.session));
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = useMemo(
    () => [
      { name: '首页', path: '/' },
      { name: '服务对象', path: '/service-objects' },
      { name: '数据看板', path: '/data-dashboard' },
      { name: '服务成果', path: '/service-results' },
      { name: '报名', path: '/join-us' },
      { name: hasSession ? '个人中心' : '用户登录', path: hasSession ? '/volunteer-center' : '/login' },
      { name: '管理者登录', path: '/admin/login' },
    ],
    [hasSession],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const nearTop = currentScrollY < 24;

      if (nearTop || scrollingUp) {
        setIsNavVisible(true);
      } else if (currentScrollY > 80) {
        setIsNavVisible(false);
        setLangOpen(false);
      }

      lastScrollY = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLanguage = (code: 'zh' | 'en' | 'ar') => {
    setLanguage(code);
    setLangOpen(false);
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-4 py-8 transition-all duration-500 md:px-24 ${
        isHome ? 'bg-transparent' : 'border-b border-white/5 bg-[#0A0505]/80 backdrop-blur-xl shadow-2xl'
      }`}
      style={{
        transform: isNavVisible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isNavVisible ? 1 : 0,
        pointerEvents: isNavVisible ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="group flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#8B0000] to-[#722F37] text-xs font-black text-white shadow-lg transition-transform duration-500 group-hover:scale-110">
            XZQ
          </div>
          <span className="text-2xl font-black tracking-tighter text-white transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-[#8B0000] group-hover:to-[#D4AF37] group-hover:bg-clip-text group-hover:text-transparent">
            乡助桥
          </span>
        </Link>
      </div>

      <div className="hidden items-center gap-12 lg:flex">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`border-b-2 pb-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#D4AF37] ${
              location.pathname === link.path ? 'border-[#8B0000] text-[#D4AF37]' : 'border-transparent text-white/40'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <button
            onClick={() => setLangOpen((value) => !value)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 transition-colors hover:text-white"
          >
            <Globe className="h-4 w-4" />
            {languages.find((item) => item.code === language)?.name || 'ZH'}
            <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-4 w-40 rounded-2xl border border-white/10 bg-[#1A0707]/90 p-2 shadow-2xl backdrop-blur-2xl"
              >
                {languages.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => changeLanguage(item.code)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${
                      language === item.code ? 'bg-[#8B0000] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          to={hasSession ? '/volunteer-center' : '/register'}
          className="rounded-full border border-white/10 bg-gradient-to-r from-[#8B0000] to-[#722F37] px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:shadow-[0_0_20px_rgba(139,0,0,0.45)]"
        >
          {hasSession ? '个人中心' : '一键开启志愿之旅'}
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[200] flex flex-col bg-[#0A0505] p-8 lg:hidden"
          >
            <div className="mb-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8B0000] text-xs font-black text-white">XZQ</div>
                <span className="text-2xl font-black tracking-tighter text-white">乡助桥</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-3xl font-black transition-colors ${
                    location.pathname === link.path ? 'text-[#D4AF37]' : 'text-white/40'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
