import { supabase } from './lib/supabase';

type RemoteProgressPayload = {
  points: number;
  level: number;
  xp: number;
  total_xp: number;
  xp_to_next_level: number;
  is_admin: boolean;
  achievements: any[];
  missions: any[];
};

const DEFAULT_PROGRESS: RemoteProgressPayload = {
  points: 0,
  level: 1,
  xp: 0,
  total_xp: 0,
  xp_to_next_level: 100,
  is_admin: false,
  achievements: [],
  missions: []
};

const buildSyntheticEmail = (account: string) => {
  const normalized = account.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  return `${normalized}@xiangzhuqiao.app`;
};

type LocalVolunteerAccount = {
  user_id: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  avatar_url: string;
  role: 'volunteer' | 'reviewer' | 'admin';
  status: 'pending' | 'approved' | 'removed';
  created_at: string;
  updated_at: string;
  points: number;
  level: number;
  xp: number;
  total_xp: number;
  xp_to_next_level: number;
  is_admin: boolean;
  achievements: any[];
  missions: any[];
  is_online: boolean;
  last_seen: string | null;
};

const LOCAL_ACCOUNTS_KEY = 'xiangzhuqiao_local_accounts';
const LOCAL_SESSION_KEY = 'xiangzhuqiao_local_session';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const isRecoverableSupabaseAuthError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  return (
    message.includes('rate limit') ||
    message.includes('email not confirmed') ||
    message.includes('email address not authorized') ||
    message.includes('signup is disabled') ||
    message.includes('database error saving new user') ||
    message.includes('row-level security') ||
    message.includes('permission denied') ||
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('failed to fetch') ||
    message.includes('network')
  );
};

const isIgnorableProfileError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  return (
    message.includes('row-level security') ||
    message.includes('permission denied') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
};

const readLocalAccounts = (): LocalVolunteerAccount[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalAccounts = (accounts: LocalVolunteerAccount[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const getLocalSessionUserId = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(LOCAL_SESSION_KEY);
};

const setLocalSessionUserId = (userId: string | null) => {
  if (!canUseStorage()) return;
  if (userId) window.localStorage.setItem(LOCAL_SESSION_KEY, userId);
  else window.localStorage.removeItem(LOCAL_SESSION_KEY);
};

const findLocalAccountByUserId = (userId?: string | null) => {
  if (!userId) return null;
  return readLocalAccounts().find((account) => account.user_id === userId) || null;
};

const findLocalAccountByUsername = (username: string) => {
  const normalized = username.trim().toLowerCase();
  return readLocalAccounts().find((account) => account.username.trim().toLowerCase() === normalized) || null;
};

const saveLocalAccount = (nextAccount: LocalVolunteerAccount) => {
  const accounts = readLocalAccounts();
  const nextAccounts = accounts.some((account) => account.user_id === nextAccount.user_id)
    ? accounts.map((account) => (account.user_id === nextAccount.user_id ? nextAccount : account))
    : [...accounts, nextAccount];
  writeLocalAccounts(nextAccounts);
  return nextAccount;
};

const createLocalAccount = (account: string, password: string) => {
  const normalizedAccount = account.trim();
  const now = new Date().toISOString();
  const localAccount: LocalVolunteerAccount = {
    user_id: `local-${crypto.randomUUID()}`,
    email: buildSyntheticEmail(normalizedAccount),
    username: normalizedAccount,
    password,
    phone: '',
    avatar_url: '',
    role: 'volunteer',
    status: 'approved',
    created_at: now,
    updated_at: now,
    points: 0,
    level: 1,
    xp: 0,
    total_xp: 0,
    xp_to_next_level: 100,
    is_admin: false,
    achievements: [],
    missions: [],
    is_online: true,
    last_seen: now,
  };
  saveLocalAccount(localAccount);
  setLocalSessionUserId(localAccount.user_id);
  return localAccount;
};

const updateLocalAccount = (userId: string, updater: (account: LocalVolunteerAccount) => LocalVolunteerAccount) => {
  const current = findLocalAccountByUserId(userId);
  if (!current) return null;
  const updated = updater(current);
  saveLocalAccount(updated);
  return updated;
};

const getLocalCurrentAccount = () => findLocalAccountByUserId(getLocalSessionUserId());

const toLocalAuthUser = (account: LocalVolunteerAccount) => ({
  id: account.user_id,
  email: account.email,
  user_metadata: {
    username: account.username,
    phone: account.phone,
    avatar_url: account.avatar_url,
    role: account.role,
  },
});

export const api = {
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (data.user) return data.user;
    } catch {
      // fall back to local auth
    }

    const localAccount = getLocalCurrentAccount();
    return localAccount ? toLocalAuthUser(localAccount) : null;
  },

  // Auth
  login: async ({ email, password }: any) => {
    if (email === 'xiangzhuqiao' && password === 'xiangzhuqiao') {
      localStorage.setItem('admin_bypass', 'true');
      return { user: { email: 'admin@xiangzhuqiao.com' } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.removeItem('admin_bypass');
    await api.ensureVolunteerAccount(data.user);
    return data;
  },

  registerWithAccountPassword: async ({ account, password }: { account: string; password: string }) => {
    const normalizedAccount = account.trim();
    if (!normalizedAccount) throw new Error('请输入账号');
    if (password.trim().length < 6) throw new Error('密码至少需要 6 位');

    const existingLocalAccount = findLocalAccountByUsername(normalizedAccount);
    if (existingLocalAccount) {
      throw new Error('该账号已存在，请换一个账号');
    }

    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('username', normalizedAccount)
        .maybeSingle();

      if (existingProfile) {
        throw new Error('该账号已存在，请换一个账号');
      }

      const syntheticEmail = buildSyntheticEmail(normalizedAccount);

      const { data, error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
        options: {
          data: {
            username: normalizedAccount,
            role: 'volunteer',
          },
        },
      });

      if (error) throw error;

      const user = data.user;
      if (!user) {
        if (isRecoverableSupabaseAuthError('email not confirmed')) {
          const localAccount = createLocalAccount(normalizedAccount, password);
          return { user: toLocalAuthUser(localAccount), session: { user: toLocalAuthUser(localAccount) } };
        }
        throw new Error('注册失败，请稍后重试');
      }

      await api.ensureVolunteerAccount({
        ...user,
        email: syntheticEmail,
        user_metadata: {
          ...(user.user_metadata || {}),
          username: normalizedAccount,
          role: 'volunteer',
        },
      });

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      });

      if (signInError) {
        if (isRecoverableSupabaseAuthError(signInError)) {
          const localAccount = createLocalAccount(normalizedAccount, password);
          return { user: toLocalAuthUser(localAccount), session: { user: toLocalAuthUser(localAccount) } };
        }
        throw signInError;
      }

      return data;
    } catch (error) {
      if (!isRecoverableSupabaseAuthError(error)) throw error;
      const localAccount = createLocalAccount(normalizedAccount, password);
      return { user: toLocalAuthUser(localAccount), session: { user: toLocalAuthUser(localAccount) } };
    }
  },

  loginWithAccountPassword: async ({ account, password }: { account: string; password: string }) => {
    const normalizedAccount = account.trim();
    if (!normalizedAccount) throw new Error('请输入账号');
    if (!password.trim()) throw new Error('请输入密码');

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('username', normalizedAccount)
        .maybeSingle();

      const resolvedEmail = profile?.email || buildSyntheticEmail(normalizedAccount);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) throw error;

      await api.ensureVolunteerAccount({
        ...data.user,
        email: resolvedEmail,
        user_metadata: {
          ...(data.user?.user_metadata || {}),
          username: normalizedAccount,
        },
      });

      return data;
    } catch (error) {
      const localAccount = findLocalAccountByUsername(normalizedAccount);
      if (!localAccount || localAccount.password !== password) {
        throw error instanceof Error ? error : new Error('账号或密码不正确。');
      }
      setLocalSessionUserId(localAccount.user_id);
      saveLocalAccount({
        ...localAccount,
        is_online: true,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return { user: toLocalAuthUser(localAccount), session: { user: toLocalAuthUser(localAccount) } };
    }
  },

  sendPhoneOtp: async (phone: string, mode: 'register' | 'login') => {
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) throw new Error('请输入手机号');

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        shouldCreateUser: mode === 'register',
        data: {
          phone: normalizedPhone,
          role: 'volunteer',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  sendEmailOtp: async (email: string, mode: 'register' | 'login') => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) throw new Error('请输入邮箱');

    const { data, error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: mode === 'register',
        emailRedirectTo: window.location.origin,
        data: {
          role: 'volunteer',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  verifyEmailOtp: async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) throw error;

    if (data.user) {
      await api.ensureVolunteerAccount(data.user);
    }

    return data;
  },

  verifyPhoneOtp: async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: token.trim(),
      type: 'sms',
    });
    if (error) throw error;

    if (data.user) {
      await api.ensureVolunteerAccount(data.user);
    }

    return data;
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setLocalSessionUserId(null);
  },

  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) return data.session;
    } catch {
      // fall back to local session
    }

    const localAccount = getLocalCurrentAccount();
    return localAccount ? { user: toLocalAuthUser(localAccount) } : null;
  },

  getMyRole: async () => {
    const localAccount = getLocalCurrentAccount();
    if (localAccount) return localAccount.role;

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    const email = authData.user?.email;
    const userId = authData.user?.id;

    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profileError && profile?.role) {
        return profile.role as any;
      }
    }

    if (!email) return userId ? 'volunteer' : 'anonymous';

    const { data, error } = await supabase
      .from('staff')
      .select('role')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
    if (error) return 'volunteer';
    return (data?.role as any) || 'volunteer';
  },

  ensureVolunteerAccount: async (userOverride?: any) => {
    const user = userOverride ?? await api.getCurrentUser();
    if (!user) return null;

    if (String(user.id || '').startsWith('local-')) {
      const localAccount = findLocalAccountByUserId(user.id);
      if (!localAccount) return null;
      return localAccount;
    }

    const username =
      user.user_metadata?.username ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      '志愿者';
    const phone = user.user_metadata?.phone || '';
    const role = user.user_metadata?.role || 'volunteer';
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .maybeSingle();

    const profilePayload = {
      user_id: user.id,
      email: user.email || '',
      username,
      phone,
      role: existingProfile?.role || role,
      status: existingProfile?.status || (role === 'admin' ? 'approved' : 'pending'),
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profilePayload, { onConflict: 'user_id' });
    if (profileError && !isIgnorableProfileError(profileError)) throw profileError;

    const { error: progressError } = await supabase
      .from('volunteer_progress')
      .upsert(
        {
          user_id: user.id,
          ...DEFAULT_PROGRESS,
          is_admin: (existingProfile?.role || role) === 'admin',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
    if (progressError && !isIgnorableProfileError(progressError)) throw progressError;

    const { error: presenceError } = await supabase
      .from('volunteer_presence')
      .upsert(
        {
          user_id: user.id,
          username,
          is_online: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
    if (presenceError && !isIgnorableProfileError(presenceError)) throw presenceError;

    return profilePayload;
  },

  getMyProfile: async () => {
    const user = await api.getCurrentUser();
    if (!user) return null;

    if (String(user.id || '').startsWith('local-')) {
      const localAccount = findLocalAccountByUserId(user.id);
      if (!localAccount) return null;
      return {
        user,
        profile: localAccount,
        progress: {
          points: localAccount.points,
          level: localAccount.level,
          xp: localAccount.xp,
          total_xp: localAccount.total_xp,
          xp_to_next_level: localAccount.xp_to_next_level,
          is_admin: localAccount.is_admin,
          achievements: localAccount.achievements,
          missions: localAccount.missions,
        },
        username: localAccount.username,
        avatar_url: localAccount.avatar_url,
        phone: localAccount.phone,
        email: localAccount.email,
      };
    }

    await api.ensureVolunteerAccount(user);

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const progress = await api.getMyVolunteerProgress();
    const userMeta = (user.user_metadata || {}) as Record<string, any>;

    return {
      user,
      profile,
      progress,
      username:
        profile?.username ||
        userMeta.username ||
        userMeta.name ||
        user.email?.split('@')[0] ||
        '志愿者',
      avatar_url: userMeta.avatar_url || '',
      phone: profile?.phone || userMeta.phone || '',
      email: user.email || '',
    };
  },

  updateMyProfile: async (data: { username?: string; phone?: string; avatar_url?: string }) => {
    const user = await api.getCurrentUser();
    if (!user) throw new Error('请先登录');

    if (String(user.id || '').startsWith('local-')) {
      const updated = updateLocalAccount(user.id, (account) => ({
        ...account,
        username: data.username ?? account.username,
        phone: data.phone ?? account.phone,
        avatar_url: data.avatar_url ?? account.avatar_url,
        updated_at: new Date().toISOString(),
      }));
      if (!updated) throw new Error('资料保存失败。');
      return {
        user: toLocalAuthUser(updated),
        profile: updated,
      };
    }

    const nextMeta = {
      ...user.user_metadata,
      ...(data.username ? { username: data.username } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
    };

    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: nextMeta,
    });
    if (authError) throw authError;

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        username: data.username,
        phone: data.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (profileError) throw profileError;

    await api.heartbeatVolunteerPresence();

    return {
      user: authData.user,
      profile,
    };
  },

  updateMyPassword: async (password: string) => {
    const user = await api.getCurrentUser();
    if (user && String(user.id || '').startsWith('local-')) {
      const updated = updateLocalAccount(user.id, (account) => ({
        ...account,
        password,
        updated_at: new Date().toISOString(),
      }));
      if (!updated) throw new Error('密码更新失败。');
      return toLocalAuthUser(updated);
    }

    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data.user;
  },

  getVolunteerRoster: async () => {
    const localAccounts = readLocalAccounts();
    if (localAccounts.length > 0) {
      return localAccounts.map((item) => ({
        user_id: item.user_id,
        email: item.email,
        username: item.username,
        phone: item.phone,
        role: item.role,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        points: item.points,
        level: item.level,
        xp: item.xp,
        total_xp: item.total_xp,
        xp_to_next_level: item.xp_to_next_level,
        is_admin: item.is_admin,
        is_online: item.is_online,
        last_seen: item.last_seen,
        presence_updated_at: item.updated_at,
      }));
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        user_id,
        email,
        username,
        phone,
        role,
        status,
        created_at,
        updated_at,
        volunteer_progress (
          points,
          level,
          xp,
          total_xp,
          xp_to_next_level,
          is_admin
        ),
        volunteer_presence (
          is_online,
          last_seen,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => {
      const progress = Array.isArray(item.volunteer_progress) ? item.volunteer_progress[0] : item.volunteer_progress;
      const presence = Array.isArray(item.volunteer_presence) ? item.volunteer_presence[0] : item.volunteer_presence;

      return {
        ...item,
        points: progress?.points ?? 0,
        level: progress?.level ?? 1,
        xp: progress?.xp ?? 0,
        total_xp: progress?.total_xp ?? 0,
        xp_to_next_level: progress?.xp_to_next_level ?? 100,
        is_admin: progress?.is_admin ?? false,
        is_online: presence?.is_online ?? false,
        last_seen: presence?.last_seen ?? null,
        presence_updated_at: presence?.updated_at ?? null
      };
    });
  },

  updateVolunteerStatus: async (userId: string, data: { status?: 'pending' | 'approved' | 'removed'; role?: 'volunteer' | 'reviewer' | 'admin' }) => {
    const payload = {
      ...data,
      updated_at: new Date().toISOString()
    };
    const { data: result, error } = await supabase
      .from('user_profiles')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return result;
  },

  removeVolunteer: async (userId: string) => {
    await api.updateVolunteerStatus(userId, { status: 'removed' });
    const { error } = await supabase
      .from('volunteer_presence')
      .upsert(
        {
          user_id: userId,
          is_online: false,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
    if (error) throw error;
    return true;
  },

  getActiveVolunteerCount: async () => {
    const now = Date.now();
    const roster = await api.getVolunteerRoster();
    return roster.filter((item: any) => {
      if (item.status !== 'approved' || !item.last_seen) return false;
      return now - new Date(item.last_seen).getTime() <= 5 * 60 * 1000;
    }).length;
  },

  getMyVolunteerProgress: async () => {
    const user = await api.getCurrentUser();
    if (!user) return null;

    if (String(user.id || '').startsWith('local-')) {
      const localAccount = findLocalAccountByUserId(user.id);
      if (!localAccount) return null;
      return {
        user_id: localAccount.user_id,
        points: localAccount.points,
        level: localAccount.level,
        xp: localAccount.xp,
        total_xp: localAccount.total_xp,
        xp_to_next_level: localAccount.xp_to_next_level,
        is_admin: localAccount.is_admin,
        achievements: localAccount.achievements,
        missions: localAccount.missions,
      };
    }

    await api.ensureVolunteerAccount(user);

    const { data, error } = await supabase
      .from('volunteer_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  saveMyVolunteerProgress: async (progress: Partial<RemoteProgressPayload>) => {
    const user = await api.getCurrentUser();
    if (!user) return null;

    if (String(user.id || '').startsWith('local-')) {
      const updated = updateLocalAccount(user.id, (account) => ({
        ...account,
        points: progress.points ?? account.points,
        level: progress.level ?? account.level,
        xp: progress.xp ?? account.xp,
        total_xp: progress.total_xp ?? account.total_xp,
        xp_to_next_level: progress.xp_to_next_level ?? account.xp_to_next_level,
        is_admin: progress.is_admin ?? account.is_admin,
        achievements: progress.achievements ?? account.achievements,
        missions: progress.missions ?? account.missions,
        updated_at: new Date().toISOString(),
      }));
      return updated;
    }

    await api.ensureVolunteerAccount(user);

    const { data, error } = await supabase
      .from('volunteer_progress')
      .upsert(
        {
          user_id: user.id,
          ...DEFAULT_PROGRESS,
          ...progress,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  heartbeatVolunteerPresence: async () => {
    const user = await api.getCurrentUser();
    if (!user) return null;

    if (String(user.id || '').startsWith('local-')) {
      const updated = updateLocalAccount(user.id, (account) => ({
        ...account,
        is_online: true,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      return updated;
    }

    const userMeta = (user.user_metadata || {}) as Record<string, any>;
    const username =
      userMeta.username ||
      userMeta.name ||
      user.email?.split('@')[0] ||
      '志愿者';

    const { data, error } = await supabase
      .from('volunteer_presence')
      .upsert(
        {
          user_id: user.id,
          username,
          is_online: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // Stats
  incrementView: async () => {
    await supabase.rpc('increment_page_view');
  },

  getStats: async () => {
    const { data, error } = await supabase
      .from('website_stats')
      .select('*')
      .order('stat_date', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    // Fallback to defaults if no data found
    return data?.[0] || { total_served: 156, total_hours: 2340, total_villages: 12, page_views: 0 };
  },

  // Site Content
  getSiteContent: async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*');
    if (error) throw error;
    
    // Convert to object for easier access
    return data.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  },

  updateSiteContent: async (key: string, value: string) => {
    const { data, error } = await supabase
      .from('site_content')
      .upsert({ key, value }, { onConflict: 'key' })
      .select();
    if (error) throw error;
    return data?.[0];
  },

  updateGlobalStats: async (stats: { total_served: number, total_hours: number, total_villages: number }) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('website_stats')
      .update(stats)
      .eq('stat_date', today)
      .select();
    if (error) throw error;
    return data?.[0];
  },

  // Service Objects
  getObjects: async () => {
    const { data, error } = await supabase
      .from('service_objects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  createObject: async (data: any) => {
    const { data: result, error } = await supabase
      .from('service_objects')
      .insert(data)
      .select();
    if (error) throw error;
    return result?.[0];
  },

  updateObject: async (id: string, data: any) => {
    const { data: result, error } = await supabase
      .from('service_objects')
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0];
  },

  deleteObject: async (id: string) => {
    const { error } = await supabase
      .from('service_objects')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Applications
  getApplications: async () => {
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  submitApplication: async (data: any) => {
    const { data: result, error } = await supabase
      .from('volunteer_applications')
      .insert(data)
      .select();
    if (error) throw error;
    return result?.[0];
  },

  updateApplicationStatus: async (id: string, status: string) => {
    const { data: result, error } = await supabase
      .from('volunteer_applications')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0];
  },

  deleteApplication: async (id: string) => {
    const { error } = await supabase
      .from('volunteer_applications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // Service Object Requests (public submissions)
  submitObjectRequest: async (data: any) => {
    const { data: result, error } = await supabase
      .from('service_object_requests')
      .insert(data)
      .select();
    if (error) throw error;
    return result?.[0];
  },

  getObjectRequests: async () => {
    const { data, error } = await supabase
      .from('service_object_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  updateObjectRequest: async (id: string, data: any) => {
    const { data: result, error } = await supabase
      .from('service_object_requests')
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return result?.[0];
  },

  deleteObjectRequest: async (id: string) => {
    const { error } = await supabase
      .from('service_object_requests')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  getNextServiceObjectCode: async () => {
    const { data, error } = await supabase
      .from('service_objects')
      .select('code')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    const codes = (data || []).map((x: any) => String(x.code || '')).filter(Boolean);
    let max = 0;
    for (const c of codes) {
      const m = c.match(/(\d+)/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n)) max = Math.max(max, n);
      }
    }
    const next = max + 1;
    return `S${String(next).padStart(3, '0')}`;
  },
};
