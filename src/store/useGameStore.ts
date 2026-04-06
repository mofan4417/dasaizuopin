import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import { api } from '../api';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  type: 'visit' | 'action' | 'level';
}

export interface Mission {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  type: 'daily' | 'once';
}

export interface LevelInfo {
  level: number;
  title: string;
  color: string;
  badge: string;
  effect?: string;
}

export const LEVEL_HIERARCHY: Record<number, LevelInfo> = {
  1: { level: 1, title: '萤火初现', color: 'from-[#722F37] to-[#8B0000]', badge: '🕯️' },
  2: { level: 2, title: '溪涧微光', color: 'from-[#8B0000] to-[#722F37]', badge: '💧' },
  3: { level: 3, title: '晨曦之愿', color: 'from-[#722F37] via-[#8B0000] to-[#D4AF37]', badge: '🌅' },
  4: { level: 4, title: '星河守护', color: 'from-[#8B0000] via-[#722F37] to-[#D4AF37]', badge: '🌌' },
  5: { level: 5, title: '月辉信使', color: 'from-[#8B0000] to-[#D4AF37]', badge: '🌙' },
  6: { level: 6, title: '暖阳先驱', color: 'from-[#722F37] via-[#D4AF37] to-[#8B0000]', badge: '☀️' },
  7: { level: 7, title: '炽焰导师', color: 'from-[#8B0000] via-[#722F37] to-[#8B0000]', badge: '🔥' },
  8: { level: 8, title: '极光统领', color: 'from-[#722F37] via-[#8B0000] to-[#D4AF37]', badge: '🌈', effect: 'animate-pulse' },
  9: { level: 9, title: '永恒光冕', color: 'from-[#D4AF37] via-[#8B0000] to-[#722F37]', badge: '👑', effect: 'animate-bounce shadow-[0_0_20px_rgba(212,175,55,0.6)]' },
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_visit', title: '初来乍到', description: '第一次访问乡助桥', icon: '🎉', unlocked: false, type: 'visit' },
  { id: 'reader', title: '博学多闻', description: '查看了服务成果', icon: '📉', unlocked: false, type: 'action' },
  { id: 'helper', title: '热心肠', description: '提交了志愿者申请', icon: '❤️', unlocked: false, type: 'action' },
  { id: 'level_5', title: '进阶志愿者', description: '达到 5 级', icon: '🏆', unlocked: false, type: 'level' },
];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'daily_login', title: '每日签到', points: 10, completed: false, type: 'daily' },
  { id: 'explore_objects', title: '浏览服务对象', points: 20, completed: false, type: 'daily' },
  { id: 'read_results', title: '了解服务成果', points: 15, completed: false, type: 'daily' },
];

interface ProgressSnapshot {
  points: number;
  level: number;
  isAdmin: boolean;
  xp: number;
  totalXp: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  missions: Mission[];
}

interface GameState extends ProgressSnapshot {
  hasLoadedRemote: boolean;
  addPoints: (amount: number) => void;
  setAdminStatus: (status: boolean) => void;
  unlockAchievement: (id: string) => void;
  completeMission: (id: string) => void;
  resetDailyMissions: () => void;
  hydrateFromRemote: () => Promise<void>;
  syncToRemote: () => Promise<void>;
  heartbeatPresence: () => Promise<void>;
}

const getDefaultSnapshot = (): ProgressSnapshot => ({
  points: 0,
  level: 1,
  isAdmin: false,
  xp: 0,
  totalXp: 0,
  xpToNextLevel: 100,
  achievements: INITIAL_ACHIEVEMENTS,
  missions: INITIAL_MISSIONS,
});

const sanitizeAchievements = (value: unknown): Achievement[] => {
  if (!Array.isArray(value) || value.length === 0) return INITIAL_ACHIEVEMENTS;
  return value as Achievement[];
};

const sanitizeMissions = (value: unknown): Mission[] => {
  if (!Array.isArray(value) || value.length === 0) return INITIAL_MISSIONS;
  return value as Mission[];
};

const buildLevelState = (totalXp: number, isAdmin: boolean) => {
  let level = 1;
  let remainingXp = totalXp;
  let xpToNextLevel = 100;

  while (remainingXp >= xpToNextLevel && level < 9) {
    remainingXp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
  }

  return {
    level: isAdmin ? 9 : level,
    xp: remainingXp,
    xpToNextLevel,
    totalXp,
  };
};

const snapshotForRemote = (state: ProgressSnapshot) => ({
  points: state.points,
  level: state.level,
  xp: state.xp,
  total_xp: state.totalXp,
  xp_to_next_level: state.xpToNextLevel,
  is_admin: state.isAdmin,
  achievements: state.achievements,
  missions: state.missions,
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...getDefaultSnapshot(),
      hasLoadedRemote: false,

      addPoints: (amount: number) => {
        const state = get();
        const nextTotalXp = Math.max(0, (state.totalXp || 0) + amount);
        const nextLevelState = buildLevelState(nextTotalXp, state.isAdmin);
        const levelUp = nextLevelState.level > state.level;

        if (levelUp) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8B0000', '#722F37', '#D4AF37'],
          });
        }

        let nextAchievements = [...state.achievements];
        if (nextLevelState.level >= 5) {
          nextAchievements = nextAchievements.map((achievement) =>
            achievement.id === 'level_5' ? { ...achievement, unlocked: true } : achievement
          );
        }

        set({
          points: state.points + amount,
          totalXp: nextLevelState.totalXp,
          xp: nextLevelState.xp,
          level: nextLevelState.level,
          xpToNextLevel: nextLevelState.xpToNextLevel,
          achievements: nextAchievements,
        });

        void get().syncToRemote();
      },

      setAdminStatus: (status: boolean) => {
        set((state) => ({
          isAdmin: status,
          level: status ? 9 : buildLevelState(state.totalXp, false).level,
        }));
        void get().syncToRemote();
      },

      unlockAchievement: (id: string) => {
        const state = get();
        const achievement = state.achievements.find((item) => item.id === id);
        if (!achievement || achievement.unlocked) return;

        set({
          achievements: state.achievements.map((item) =>
            item.id === id ? { ...item, unlocked: true } : item
          ),
        });

        confetti({
          particleCount: 100,
          spread: 160,
          colors: ['#F9D8C6', '#E84C4C'],
        });

        void get().syncToRemote();
      },

      completeMission: (id: string) => {
        const state = get();
        const mission = state.missions.find((item) => item.id === id);
        if (!mission || mission.completed) return;

        state.addPoints(mission.points);
        set({
          missions: state.missions.map((item) =>
            item.id === id ? { ...item, completed: true } : item
          ),
        });
        void get().syncToRemote();
      },

      resetDailyMissions: () => {
        set({ missions: INITIAL_MISSIONS });
        void get().syncToRemote();
      },

      hydrateFromRemote: async () => {
        try {
          await api.ensureVolunteerAccount();
          const remote = await api.getMyVolunteerProgress();
          if (!remote) {
            set({ hasLoadedRemote: true });
            return;
          }

          set((state) => ({
            points: typeof remote.points === 'number' ? remote.points : state.points,
            level: typeof remote.level === 'number' ? remote.level : state.level,
            isAdmin: typeof remote.is_admin === 'boolean' ? remote.is_admin : state.isAdmin,
            xp: typeof remote.xp === 'number' ? remote.xp : state.xp,
            totalXp: typeof remote.total_xp === 'number' ? remote.total_xp : state.totalXp,
            xpToNextLevel:
              typeof remote.xp_to_next_level === 'number' ? remote.xp_to_next_level : state.xpToNextLevel,
            achievements: sanitizeAchievements(remote.achievements),
            missions: sanitizeMissions(remote.missions),
            hasLoadedRemote: true,
          }));
        } catch (error) {
          console.error('Failed to hydrate volunteer progress:', error);
          set({ hasLoadedRemote: true });
        }
      },

      syncToRemote: async () => {
        try {
          const state = get();
          await api.saveMyVolunteerProgress(snapshotForRemote(state));
        } catch (error) {
          console.error('Failed to sync volunteer progress:', error);
        }
      },

      heartbeatPresence: async () => {
        try {
          await api.heartbeatVolunteerPresence();
        } catch (error) {
          console.error('Failed to update volunteer presence:', error);
        }
      },
    }),
    {
      name: 'xiangzhuqiao-game-storage',
    }
  )
);
