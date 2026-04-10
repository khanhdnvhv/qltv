import { Outlet, useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { CommandPalette } from "./shared/CommandPalette";
import { useStoreState } from "../hooks/useStoreState";

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, cauHinh, store } = useStoreState();
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Thời gian timeout (phút → ms), tối thiểu 1 phút
  const timeoutMs = Math.max(1, cauHinh?.sessionTimeout ?? 30) * 60 * 1000;

  const resetTimer = useCallback(() => {
    store.touchSession();
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      store.logout();
    }, timeoutMs);
  }, [store, timeoutMs]);

  // Khởi động timer khi đã xác thực
  useEffect(() => {
    if (!isAuthenticated) return;
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // bắt đầu đếm ngay
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [isAuthenticated, resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <CommandPalette />

      {/* ── Full-width Header ───────────────────────── */}
      <Header
        sidebarCollapsed={collapsed}
        onToggleSidebar={() => setCollapsed((c) => !c)}
        onMobileMenuOpen={() => setMobileOpen(true)}
      />

      {/* ── Below header: sidebar + content ────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar collapsed={collapsed} />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="relative h-full">
                  <Sidebar collapsed={false} />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-4 right-[-44px] w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
