import {
  Bell, Search, ChevronDown, LogOut, Settings,
  Menu, PanelLeftClose, PanelLeftOpen, Shield,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useStoreState } from "../hooks/useStoreState";
import { VAI_TRO_LABELS } from "../lib/constants";
import { getGreeting } from "../lib/utils";

const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Tổng quan",
  "/dashboard-thong-ke": "Dashboard Thống kê",
  "/ho-so": "Hồ sơ vụ việc",
  "/tang-vat": "Quản lý tang vật",
  "/niem-phong": "Niêm phong tang vật",
  "/kho-bai": "Kho bãi",
  "/kiem-ke": "Kiểm kê kho",
  "/luan-chuyen": "Luân chuyển tang vật",
  "/xu-ly": "Xử lý tang vật",
  "/giao-tu-giu": "Giao phương tiện tự giữ",
  "/tien-bao-lanh": "Tiền bảo lãnh",
  "/ky-so": "Ký duyệt văn bản",
  "/tra-cuu": "Tra cứu tang vật",
  "/thong-ke": "Thống kê & Báo cáo",
  "/canh-bao": "Cảnh báo",
  "/thong-bao": "Thông báo",
  "/nhat-ky": "Nhật ký hoạt động",
  "/cai-dat": "Cài đặt hệ thống",
};

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onMobileMenuOpen: () => void;
}

export function Header({ sidebarCollapsed, onToggleSidebar, onMobileMenuOpen }: HeaderProps) {
  const [showNotif, setShowNotif]     = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentUser, thongBao, store, users } = useStoreState();
  const navigate  = useNavigate();
  const location  = useLocation();
  const notifRef  = useRef<HTMLDivElement>(null);
  const userRef   = useRef<HTMLDivElement>(null);

  const unreadNotifs = thongBao
    .filter((t) => !t.daDoc && (t.nguoiNhanId === currentUser.id || currentUser.vaiTro === "admin"))
    .slice(0, 5);
  const unreadCount = unreadNotifs.length;
  const pageTitle   = BREADCRUMB_MAP[location.pathname] || "Trang chủ";

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setShowUserMenu(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header
      className="h-14 shrink-0 flex items-center z-30"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid rgba(13,59,102,0.1)",
        boxShadow: "0 1px 4px rgba(13,59,102,0.06)",
      }}
    >
      {/* ── Logo zone — synced width with sidebar ────────────── */}
      <div
        className="hidden lg:flex items-center gap-3 px-4 shrink-0 h-full transition-all duration-300"
        style={{
          width: sidebarCollapsed ? 72 : 260,
          borderRight: "1px solid rgba(13,59,102,0.08)",
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          style={{ color: "#5a6a7e" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(13,59,102,0.06)"; e.currentTarget.style.color = "#0d3b66"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent";           e.currentTarget.style.color = "#5a6a7e"; }}
        >
          {sidebarCollapsed
            ? <PanelLeftOpen  className="w-[18px] h-[18px]" />
            : <PanelLeftClose className="w-[18px] h-[18px]" />}
        </button>

        {/* Logo + system name */}
        <div
          className="flex items-center gap-2.5 overflow-hidden transition-all duration-300 cursor-pointer"
          style={{ opacity: sidebarCollapsed ? 0 : 1, width: sidebarCollapsed ? 0 : "auto", pointerEvents: sidebarCollapsed ? "none" : "auto" }}
          onClick={() => navigate("/")}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #0d3b66, #1565c0)", boxShadow: "0 2px 6px rgba(13,59,102,0.25)" }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold leading-tight truncate whitespace-nowrap" style={{ color: "#0d3b66" }}>
              Công an tỉnh XX
            </p>
            <p className="text-[10px] leading-tight truncate whitespace-nowrap" style={{ color: "#5a6a7e" }}>
              Quản lý Tang Vật
            </p>
          </div>
        </div>
      </div>

      {/* Mobile: hamburger + logo */}
      <div className="lg:hidden flex items-center gap-3 px-4">
        <button
          onClick={onMobileMenuOpen}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "#5a6a7e" }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0d3b66,#1565c0)" }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold truncate" style={{ color: "#0d3b66" }}>Công an tỉnh XX</span>
        </div>
      </div>

      {/* ── Page title ───────────────────────────────────────── */}
      <div className="flex-1 px-5 min-w-0 hidden lg:block">
        <div className="flex items-center gap-1.5 text-xs mb-0.5">
          <span
            className="cursor-pointer transition-colors"
            style={{ color: "#5a6a7e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0d3b66")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5a6a7e")}
            onClick={() => navigate("/")}
          >
            Trang chủ
          </span>
          {location.pathname !== "/" && (
            <>
              <span style={{ color: "#c0cdd8" }}>/</span>
              <span className="font-medium truncate" style={{ color: "#0d3b66" }}>{pageTitle}</span>
            </>
          )}
        </div>
        <h2 className="text-[15px] font-semibold leading-tight truncate" style={{ color: "#0d3b66" }}>
          {location.pathname === "/"
            ? `${getGreeting()}, ${currentUser.hoTen.split(" ").pop()} 👋`
            : pageTitle}
        </h2>
      </div>

      {/* ── Right controls ───────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4">

        {/* Quick search */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ background: "#f0f4f8", border: "1px solid rgba(13,59,102,0.1)", color: "#5a6a7e" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(13,59,102,0.25)"; e.currentTarget.style.color = "#0d3b66"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(13,59,102,0.1)";  e.currentTarget.style.color = "#5a6a7e"; }}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Tìm kiếm nhanh...</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] ml-1" style={{ background: "white", border: "1px solid rgba(13,59,102,0.12)", color: "#5a6a7e" }}>
            Ctrl+K
          </kbd>
        </button>

        {/* User switcher (demo) */}
        <select
          value={currentUser.id}
          onChange={(e) => store.switchUser(e.target.value)}
          className="px-2 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer transition-all"
          style={{ background: "#f0f4f8", border: "1px solid rgba(13,59,102,0.1)", color: "#3a5a78" }}
          title="Chuyển vai trò (demo)"
        >
          {users.filter((u) => u.trangThai === "active").map((u) => (
            <option key={u.id} value={u.id}>
              {u.hoTen} ({VAI_TRO_LABELS[u.vaiTro]})
            </option>
          ))}
        </select>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#5a6a7e" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(13,59,102,0.06)"; e.currentTarget.style.color = "#0d3b66"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent";           e.currentTarget.style.color = "#5a6a7e"; }}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-[14px] h-[14px] bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-96 bg-white border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-[#f8fafc] flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: "#0d3b66" }}>Thông báo ({unreadCount} chưa đọc)</p>
                {unreadCount > 0 && (
                  <button onClick={() => store.markAllThongBaoDaDoc()} className="text-xs text-[#0d3b66] hover:underline">
                    Đọc tất cả
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {unreadNotifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">Không có thông báo mới</div>
                ) : (
                  unreadNotifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { store.markThongBaoDaDoc(n.id); setShowNotif(false); navigate("/thong-bao"); }}
                      className={`px-4 py-3 border-b border-border/50 cursor-pointer transition-colors ${
                        !n.daDoc ? "bg-[#e8eef5]/30 hover:bg-[#e8eef5]/60" : "hover:bg-[#f8fafc]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.daDoc && <span className="w-2 h-2 bg-[#0d3b66] rounded-full mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate" style={{ fontWeight: n.daDoc ? 400 : 500 }}>{n.tieuDe}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{n.noiDung}</p>
                          <p className="text-xs text-muted-foreground mt-1">{n.ngayTao}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 text-center border-t border-border">
                <button onClick={() => { setShowNotif(false); navigate("/thong-bao"); }} className="text-sm text-[#0d3b66] hover:underline">
                  Xem tất cả
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: "rgba(13,59,102,0.1)" }} />

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(13,59,102,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #0d3b66, #1565c0)" }}
            >
              {currentUser.avatar}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[13px] font-semibold leading-tight" style={{ color: "#0d3b66" }}>{currentUser.hoTen}</p>
              <p className="text-[10px] leading-tight" style={{ color: "#5a6a7e" }}>{VAI_TRO_LABELS[currentUser.vaiTro]}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: "#5a6a7e" }} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 w-60 bg-white border border-border rounded-xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold" style={{ color: "#0d3b66" }}>{currentUser.hoTen}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{currentUser.email}</p>
                <p className="text-xs font-medium mt-1" style={{ color: "#0d3b66" }}>{currentUser.chucVu}</p>
                <p className="text-xs text-muted-foreground">{currentUser.donViTen}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); navigate("/cai-dat"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#5a6a7e] hover:bg-[#f8fafc] transition-colors"
              >
                <Settings className="w-4 h-4" />
                Cài đặt
              </button>
              <div className="border-t border-border">
                <button
                  onClick={() => { setShowUserMenu(false); store.logout(); navigate("/login", { replace: true }); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#c62828] hover:bg-[#ffebee] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
