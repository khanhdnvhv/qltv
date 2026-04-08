import { NavLink } from "react-router";
import {
  LayoutDashboard, FolderOpen, Package, Stamp, Warehouse,
  ClipboardCheck, ArrowLeftRight, Gavel, FileCheck, Search,
  BarChart3, PieChart, AlertTriangle, Bell, History, Settings,
  CarFront, Banknote,
} from "lucide-react";
import { useStoreState } from "../hooks/useStoreState";
import { MENU_BY_ROLE, VAI_TRO_LABELS } from "../lib/constants";

const allMenuItems = [
  { to: "/",                   icon: LayoutDashboard, label: "Trang chủ" },
  { to: "/dashboard-thong-ke", icon: PieChart,         label: "Dashboard thống kê" },
  { to: "/ho-so",              icon: FolderOpen,       label: "Hồ sơ vụ việc" },
  { to: "/tang-vat",           icon: Package,          label: "Quản lý tang vật" },
  { to: "/niem-phong",         icon: Stamp,            label: "Niêm phong" },
  { to: "/kho-bai",            icon: Warehouse,        label: "Kho bãi" },
  { to: "/kiem-ke",            icon: ClipboardCheck,   label: "Kiểm kê kho" },
  { to: "/luan-chuyen",        icon: ArrowLeftRight,   label: "Luân chuyển" },
  { to: "/xu-ly",              icon: Gavel,            label: "Xử lý tang vật" },
  { to: "/giao-tu-giu",        icon: CarFront,         label: "Giao tự giữ" },
  { to: "/tien-bao-lanh",      icon: Banknote,         label: "Tiền bảo lãnh" },
  { to: "/ky-so",              icon: FileCheck,        label: "Ký duyệt" },
  { to: "/tra-cuu",            icon: Search,           label: "Tra cứu" },
  { to: "/thong-ke",           icon: BarChart3,        label: "Thống kê báo cáo" },
];

const allBottomItems = [
  { to: "/canh-bao",  icon: AlertTriangle, label: "Cảnh báo",  badge: "alert"  as const },
  { to: "/thong-bao", icon: Bell,          label: "Thông báo", badge: "unread" as const },
  { to: "/nhat-ky",   icon: History,       label: "Nhật ký" },
  { to: "/cai-dat",   icon: Settings,      label: "Cài đặt" },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { currentUser, store } = useStoreState();
  const allowedPaths = MENU_BY_ROLE[currentUser.vaiTro] || [];

  const menuItems   = allMenuItems.filter((i) => allowedPaths.includes(i.to));
  const bottomItems = allBottomItems.filter((i) => allowedPaths.includes(i.to));

  const unreadCount = store.getUnreadCount();
  const alertCount  = store.getActiveCanhBaoCount();

  const getBadge = (item: (typeof allBottomItems)[0]) => {
    if ((item as any).badge === "alert")  return alertCount;
    if ((item as any).badge === "unread") return unreadCount;
    return 0;
  };

  const itemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-[#0d3b66] text-white shadow-sm"
        : "text-[#3a5a78] hover:bg-[rgba(13,59,102,0.07)] hover:text-[#0d3b66]"
    } ${collapsed ? "justify-center" : ""}`;

  return (
    <aside
      className="flex flex-col overflow-hidden transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? 72 : 260,
        height: "100%",
        background: "linear-gradient(180deg, #f4f8fd 0%, #e8f0fa 55%, #ddeaf8 100%)",
        borderRight: "1px solid rgba(13,59,102,0.1)",
      }}
    >
      {/* Main nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) => itemClass(isActive)}
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate font-medium">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="py-3 px-2 space-y-0.5" style={{ borderTop: "1px solid rgba(13,59,102,0.08)" }}>
        {bottomItems.map((item) => {
          const badgeCount = getBadge(item as any);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => itemClass(isActive)}
            >
              <div className="relative shrink-0">
                <item.icon className="w-5 h-5" />
                {badgeCount > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center font-bold ${
                      (item as any).badge === "alert" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </div>
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
              {!collapsed && badgeCount > 0 && (
                <span
                  className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    (item as any).badge === "alert"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* User info */}
        {!collapsed && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 mt-1 pt-3"
            style={{ borderTop: "1px solid rgba(13,59,102,0.08)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 font-bold"
              style={{ background: "linear-gradient(135deg, #0d3b66, #1565c0)" }}
            >
              {currentUser.avatar}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: "#0d3b66" }}>{currentUser.hoTen}</p>
              <p className="text-[10px] truncate" style={{ color: "#5a6a7e" }}>
                {VAI_TRO_LABELS[currentUser.vaiTro]} • {currentUser.chucVu}
              </p>
            </div>
          </div>
        )}

        {/* Collapsed: avatar only */}
        {collapsed && (
          <div className="flex justify-center py-2 pt-3" style={{ borderTop: "1px solid rgba(13,59,102,0.08)" }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #0d3b66, #1565c0)" }}
              title={currentUser.hoTen}
            >
              {currentUser.avatar}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
