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

  // Novus AI panel (⌘J)
  novusOpen: boolean;
  setNovusOpen: (open: boolean) => void;
  toggleNovus: () => void;

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

  // Novus AI panel
  novusOpen: false,
  setNovusOpen: (open) => set({ novusOpen: open }),
  toggleNovus: () => set((state) => ({ novusOpen: !state.novusOpen })),

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
