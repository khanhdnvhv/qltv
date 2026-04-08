import { TRANG_THAI_HO_SO, TRANG_THAI_VAN_BAN, TRANG_THAI_GIAO_DICH, TRANG_THAI_THONG_BAO, LOAI_CANH_BAO, LOAI_THONG_BAO } from "../../lib/constants";
import type { TrangThaiHoSo, TrangThaiVanBan, TrangThaiGD, TrangThaiTB, LoaiCanhBao, LoaiThongBao } from "../../lib/types";

// Unified badge component
interface BadgeProps {
  children: React.ReactNode;
  color: string;
  bg: string;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function Badge({ children, color, bg, size = "sm", icon, dot, pulse, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${className}`}
      style={{ fontWeight: 500, color, backgroundColor: bg }}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />}
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
        </span>
      )}
      {icon}
      {children}
    </span>
  );
}

// Specialized badges
export function HoSoStatusBadge({ trangThai, size }: { trangThai: TrangThaiHoSo; size?: "sm" | "md" }) {
  const s = TRANG_THAI_HO_SO[trangThai];
  if (!s) return null;
  const Icon = s.icon;
  return (
    <Badge color={s.color} bg={s.bg} size={size} icon={<Icon className={size === "md" ? "w-3.5 h-3.5" : "w-3 h-3"} />}>
      {s.label}
    </Badge>
  );
}

export function VanBanStatusBadge({ trangThai }: { trangThai: TrangThaiVanBan }) {
  const s = TRANG_THAI_VAN_BAN[trangThai];
  if (!s) return null;
  return <Badge color={s.color} bg={s.bg}>{s.label}</Badge>;
}

export function GiaoDichStatusBadge({ trangThai }: { trangThai: TrangThaiGD }) {
  const s = TRANG_THAI_GIAO_DICH[trangThai];
  if (!s) return null;
  return <Badge color={s.color} bg={s.bg}>{s.label}</Badge>;
}

export function ThongBaoTypeBadge({ loai }: { loai: LoaiThongBao }) {
  const s = LOAI_THONG_BAO[loai];
  if (!s) return null;
  const Icon = s.icon;
  return <Badge color={s.color} bg={s.bg} icon={<Icon className="w-3 h-3" />}>{s.label}</Badge>;
}

export function CanhBaoTypeBadge({ loai }: { loai: LoaiCanhBao }) {
  const s = LOAI_CANH_BAO[loai];
  if (!s) return null;
  const Icon = s.icon;
  return <Badge color={s.color} bg={s.bg} icon={<Icon className="w-3 h-3" />}>{s.label}</Badge>;
}

export function MucDoBadge({ mucDo }: { mucDo: 2 | 3 | 4 }) {
  const config = {
    2: { color: "#546e7a", bg: "#eceff1" },
    3: { color: "#1565c0", bg: "#e3f2fd" },
    4: { color: "#0d3b66", bg: "#e8eef5" },
  };
  const c = config[mucDo];
  return <Badge color={c.color} bg={c.bg}>Muc {mucDo}</Badge>;
}

export function LinhVucBadge({ ten }: { ten: string }) {
  const COLORS: Record<string, { bg: string; color: string }> = {
    "Viễn thông": { bg: "#e3f2fd", color: "#1565c0" },
    "CNTT": { bg: "#e8f5e9", color: "#2e7d32" },
    "Báo chí": { bg: "#fff3e0", color: "#e65100" },
    "Truyền hình": { bg: "#f3e5f5", color: "#7b1fa2" },
    "An toàn thông tin": { bg: "#fce4ec", color: "#c62828" },
    "Bưu chính": { bg: "#e0f2f1", color: "#00695c" },
  };
  const c = COLORS[ten] || { bg: "#e8eef5", color: "#0d3b66" };
  return <Badge color={c.color} bg={c.bg}>{ten}</Badge>;
}
