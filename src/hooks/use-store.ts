import { create } from "zustand";

// Global App Store
interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Quick Add Modal
  quickAddOpen: boolean;
  quickAddType: "habit" | "task" | "goal" | "journal" | "mood" | "workout" | null;
  openQuickAdd: (type: AppState["quickAddType"]) => void;
  closeQuickAdd: () => void;

  // Command Center (⌘K)
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  timestamp: Date;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Quick Add
  quickAddOpen: false,
  quickAddType: null,
  openQuickAdd: (type) => set({ quickAddOpen: true, quickAddType: type }),
  closeQuickAdd: () => set({ quickAddOpen: false, quickAddType: null }),

  // Command Center
  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
  toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Math.random().toString(36).substring(2),
          timestamp: new Date(),
          isRead: false,
        },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

// Dashboard Data Store
interface DashboardState {
  isLoading: boolean;
  lifeScore: number;
  habitProgress: { completed: number; total: number };
  taskProgress: { completed: number; total: number };
  currentMood: number | null;
  streaks: { habits: number; journal: number; workout: number; mood: number };
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isLoading: false,
  lifeScore: 87,
  habitProgress: { completed: 5, total: 7 },
  taskProgress: { completed: 2, total: 5 },
  currentMood: 8,
  streaks: { habits: 12, journal: 8, workout: 5, mood: 22 },
  setLoading: (loading) => set({ isLoading: loading }),
}));
