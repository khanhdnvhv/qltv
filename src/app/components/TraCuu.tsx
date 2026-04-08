import { useState, useMemo, useCallback } from "react";
import {
  Search, Package, Warehouse, Tag, Calendar, X, Filter,
  ChevronDown, Camera, LayoutGrid, List, ArrowUpDown,
  Clock, MapPin, User2, FileText, History, Link2,
  AlertTriangle, CheckCircle2, Truck, Shield, Zap,
  ChevronRight, ChevronLeft, Building2, Hash, Phone,
  SlidersHorizontal, RefreshCw, Eye, Info, ArrowRight,
} from "lucide-react";
import { useStoreState, useDebounce, usePagination } from "../hooks/useStoreState";
import {
  TRANG_THAI_TANG_VAT, LOAI_TANG_VAT,
  TRANG_THAI_NIEM_PHONG, HINH_THUC_XU_LY,
  TRANG_THAI_LUAN_CHUYEN, TRANG_THAI_HO_SO,
} from "../lib/constants";
import type { TangVat, TrangThaiTangVat, LoaiTangVat } from "../lib/types";

// ─── helpers ────────────────────────────────────────────────
function fmtNum(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}
function fmtMoney(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} tr`;
  return `${fmtNum(n)} đ`;
}
function daysDiff(dateStr?: string): number | null {
  if (!dateStr) return null;
  const parts = dateStr.split("/").map(Number);
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  return Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / 86_400_000);
}

// ─── constants ──────────────────────────────────────────────
type ViewMode = "grid" | "table";
type SortKey = "default" | "newest" | "deadline" | "value_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Mặc định" },
  { value: "newest", label: "Nhập kho mới nhất" },
  { value: "deadline", label: "Hạn gần nhất" },
  { value: "value_desc", label: "Giá trị cao nhất" },
];

const QUICK_FILTERS: { value: TrangThaiTangVat | "qua_han" | ""; label: string; color: string; bg: string }[] = [
  { value: "", label: "Tất cả", color: "#374151", bg: "#f3f4f6" },
  { value: "cho_nhap_kho", label: "Chờ nhập kho", color: "#f57f17", bg: "#fff8e1" },
  { value: "dang_luu_kho", label: "Đang lưu kho", color: "#1565c0", bg: "#e3f2fd" },
  { value: "cho_xu_ly", label: "Chờ xử lý", color: "#e65100", bg: "#fff3e0" },
  { value: "dang_xu_ly", label: "Đang xử lý", color: "#7b1fa2", bg: "#f3e5f5" },
  { value: "qua_han", label: "Quá hạn", color: "#c62828", bg: "#ffebee" },
];

const LOAI_OPTIONS: { value: LoaiTangVat | ""; label: string }[] = [
  { value: "", label: "Tất cả loại" },
  { value: "phuong_tien_co_gioi", label: "Phương tiện cơ giới" },
  { value: "phuong_tien_khac", label: "Phương tiện khác" },
  { value: "hang_hoa", label: "Hàng hóa" },
  { value: "thuc_pham", label: "Thực phẩm" },
  { value: "tien_te", label: "Tiền tệ" },
  { value: "tai_san_co_gia_tri", label: "Tài sản có giá trị" },
  { value: "vu_khi_cong_cu", label: "Vũ khí, công cụ" },
  { value: "thiet_bi_dien_tu", label: "Thiết bị điện tử" },
  { value: "khac", label: "Khác" },
];

// ─── StatusBadge ────────────────────────────────────────────
function StatusBadge({ cfg, small }: { cfg: { label: string; color: string; bg: string }; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

// ─── DeadlineBadge ──────────────────────────────────────────
function DeadlineBadge({ days, small }: { days: number; small?: boolean }) {
  const cls = small ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1";
  if (days < 0)
    return <span className={`inline-flex items-center rounded-full font-bold bg-red-600 text-white ${cls}`}>Quá {Math.abs(days)}d</span>;
  if (days <= 7)
    return <span className={`inline-flex items-center rounded-full font-bold bg-red-500 text-white ${cls}`}>Còn {days}d</span>;
  if (days <= 30)
    return <span className={`inline-flex items-center rounded-full font-bold bg-amber-500 text-white ${cls}`}>Còn {days}d</span>;
  return null;
}

// ─── LoaiIcon ───────────────────────────────────────────────
function LoaiIcon({ loai, size = 28 }: { loai: LoaiTangVat; size?: number }) {
  const cfg = LOAI_TANG_VAT[loai];
  const Icon = loai.startsWith("phuong_tien") ? Truck
    : loai === "tai_san_co_gia_tri" || loai === "vu_khi_cong_cu" ? Shield
    : Package;
  const s = size;
  return (
    <div className="rounded-xl flex items-center justify-center" style={{ background: cfg.bg, width: s * 2, height: s * 2 }}>
      <Icon style={{ width: s, height: s, color: cfg.color }} />
    </div>
  );
}

// ─── GridCard ───────────────────────────────────────────────
function GridCard({ tv, hoSoMaBienBan, onClick }: {
  tv: TangVat;
  hoSoMaBienBan?: string;
  onClick: () => void;
}) {
  const ttCfg = TRANG_THAI_TANG_VAT[tv.trangThai];
  const loaiCfg = LOAI_TANG_VAT[tv.loai];
  const days = daysDiff(tv.hanLuuKho);
  const isVehicle = tv.loai === "phuong_tien_co_gioi" || tv.loai === "phuong_tien_khac";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden group"
    >
      {/* Thumbnail area */}
      <div className="relative h-[88px] flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${loaiCfg.bg} 0%, #f8fafc 100%)` }}>
        <LoaiIcon loai={tv.loai} size={28} />
        {/* Status top-left */}
        <div className="absolute top-2 left-2">
          <StatusBadge cfg={ttCfg} small />
        </div>
        {/* Deadline top-right */}
        {days !== null && (
          <div className="absolute top-2 right-2">
            <DeadlineBadge days={days} small />
          </div>
        )}
        {/* Eye on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 rounded-full p-1.5 shadow">
            <Eye className="w-3.5 h-3.5 text-[#0d3b66]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <p className="text-[10px] font-mono text-gray-400 leading-none">{tv.maTangVat}</p>
        <h3 className="font-bold text-gray-900 text-sm mt-1 leading-snug line-clamp-2">{tv.ten}</h3>

        <div className="mt-2.5 space-y-1.5">
          {isVehicle && tv.bienSo && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{tv.bienSo}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Warehouse className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 truncate">{tv.khoTen || "Chưa nhập kho"}</span>
          </div>
          {tv.hanLuuKho && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500">Hạn: {tv.hanLuuKho}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: loaiCfg.bg, color: loaiCfg.color }}>
            {loaiCfg.label}
          </span>
          <span className="text-xs font-bold text-gray-700">{fmtMoney(tv.giaTriUocTinh)}</span>
        </div>
        {hoSoMaBienBan && (
          <div className="mt-1.5 flex items-center gap-1">
            <FileText className="w-3 h-3 text-gray-300" />
            <span className="text-[10px] text-gray-400 truncate">{hoSoMaBienBan}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TableRow ───────────────────────────────────────────────
function TableRow({ tv, hoSoMaBienBan, onClick, idx }: {
  tv: TangVat;
  hoSoMaBienBan?: string;
  onClick: () => void;
  idx: number;
}) {
  const ttCfg = TRANG_THAI_TANG_VAT[tv.trangThai];
  const loaiCfg = LOAI_TANG_VAT[tv.loai];
  const days = daysDiff(tv.hanLuuKho);
  const isVehicle = tv.loai === "phuong_tien_co_gioi" || tv.loai === "phuong_tien_khac";

  return (
    <tr
      className="hover:bg-blue-50/40 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
      onClick={onClick}
    >
      <td className="px-4 py-3 text-xs text-gray-400 w-8">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <LoaiIcon loai={tv.loai} size={18} />
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-gray-400 leading-none">{tv.maTangVat}</p>
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">{tv.ten}</p>
            {isVehicle && tv.bienSo && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">{tv.bienSo}</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: loaiCfg.bg, color: loaiCfg.color }}>
          {loaiCfg.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge cfg={ttCfg} small />
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600">{tv.khoTen || <span className="text-gray-300">—</span>}</span>
      </td>
      <td className="px-4 py-3">
        {tv.hanLuuKho ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{tv.hanLuuKho}</span>
            {days !== null && <DeadlineBadge days={days} small />}
          </div>
        ) : <span className="text-gray-300 text-xs">—</span>}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs font-semibold text-gray-700">{fmtMoney(tv.giaTriUocTinh)}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-500 max-w-[120px] truncate block">{hoSoMaBienBan || "—"}</span>
      </td>
      <td className="px-4 py-3">
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </td>
    </tr>
  );
}

// ─── Timeline item ──────────────────────────────────────────
function TimelineItem({ icon, color, bg, title, sub, time, isLast }: {
  icon: any; color: string; bg: string;
  title: string; sub?: string; time: string; isLast?: boolean;
}) {
  const Icon = icon;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: bg }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 my-1" />}
      </div>
      <div className="pb-4 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        <p className="text-[11px] text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

// ─── Detail Panel ────────────────────────────────────────────
function DetailPanel({ tv, onClose }: { tv: TangVat; onClose: () => void }) {
  const { hoSo, niemPhong, luanChuyen, xuLy } = useStoreState();
  const [activeTab, setActiveTab] = useState<"info" | "history" | "related">("info");

  const ttCfg = TRANG_THAI_TANG_VAT[tv.trangThai];
  const loaiCfg = LOAI_TANG_VAT[tv.loai];
  const days = daysDiff(tv.hanLuuKho);
  const hs = hoSo.find((h) => h.id === tv.hoSoId);
  const isVehicle = tv.loai === "phuong_tien_co_gioi" || tv.loai === "phuong_tien_khac";

  // related data
  const tvNiemPhong = niemPhong.filter((n) => n.tangVatId === tv.id);
  const tvLuanChuyen = luanChuyen.filter((l) => l.tangVatId === tv.id);
  const tvXuLy = xuLy.filter((x) => x.tangVatId === tv.id);

  // build timeline events
  const timelineEvents: { icon: any; color: string; bg: string; title: string; sub?: string; time: string }[] = [];
  if (tv.createdAt) timelineEvents.push({ icon: FileText, color: "#1565c0", bg: "#e3f2fd", title: "Thêm vào hồ sơ", sub: tv.maBienBan, time: tv.createdAt });
  tvNiemPhong.forEach((n) => timelineEvents.push({ icon: Shield, color: "#7b1fa2", bg: "#f3e5f5", title: "Niêm phong", sub: `Số tem: ${n.soTem} — ${n.moTaTinhTrang}`, time: n.ngayNiemPhong }));
  if (tv.ngayNhapKho) timelineEvents.push({ icon: Warehouse, color: "#2e7d32", bg: "#e8f5e9", title: "Nhập kho", sub: tv.khoTen, time: tv.ngayNhapKho });
  tvLuanChuyen.forEach((l) => {
    const cfg = TRANG_THAI_LUAN_CHUYEN[l.trangThai];
    timelineEvents.push({ icon: ArrowRight, color: cfg.color, bg: cfg.bg, title: `Luân chuyển → ${l.khoNhanTen || l.donViNhanTen}`, sub: l.lyDo, time: l.ngayDeNghi });
  });
  tvXuLy.forEach((x) => {
    const hCfg = HINH_THUC_XU_LY[x.hinhThuc];
    timelineEvents.push({ icon: hCfg.icon, color: hCfg.color, bg: hCfg.bg, title: `Xử lý: ${hCfg.label}`, sub: x.moTa, time: x.ngayDeXuat });
  });
  timelineEvents.sort((a, b) => a.time.localeCompare(b.time));

  const tabs = [
    { id: "info" as const, label: "Thông tin", icon: Info },
    { id: "history" as const, label: "Lịch sử", icon: History },
    { id: "related" as const, label: "Liên quan", icon: Link2 },
  ];

  return (
    <div className="w-full lg:w-[480px] shrink-0 flex flex-col bg-white border-l border-gray-100 h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0d3b66] to-[#1565c0]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">{tv.maTangVat}</span>
              <StatusBadge cfg={ttCfg} small />
            </div>
            <h2 className="text-base font-bold text-white leading-snug">{tv.ten}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: loaiCfg.bg + "cc", color: "white" }}>
                {loaiCfg.label}
              </span>
              <span className="text-xs text-white/70 font-bold">{fmtMoney(tv.giaTriUocTinh)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
        {/* Deadline banner */}
        {days !== null && days < 30 && (
          <div className={`mt-3 rounded-lg px-3 py-2 flex items-center gap-2 ${days < 0 ? "bg-red-500/20" : "bg-amber-400/20"}`}>
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs text-white font-semibold">
              {days < 0 ? `Quá hạn ${Math.abs(days)} ngày — Cần xử lý ngay!` : `Còn ${days} ngày đến hạn xử lý`}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {tabs.map((t) => {
          const TIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                activeTab === t.id
                  ? "text-[#0d3b66] border-b-2 border-[#0d3b66] bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TIcon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* TAB: Thông tin */}
        {activeTab === "info" && (
          <div className="p-5 space-y-5">
            {/* Image placeholder */}
            <div className="w-full h-32 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${loaiCfg.bg} 0%, #f8fafc 100%)` }}>
              {tv.hinhAnh && tv.hinhAnh.length > 0 ? (
                <div className="flex items-center justify-center gap-2">
                  {tv.hinhAnh.slice(0, 3).map((img, i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <LoaiIcon loai={tv.loai} size={32} />
                  <span className="text-xs">Chưa có hình ảnh</span>
                </div>
              )}
            </div>

            {/* Đặc điểm nhận dạng */}
            <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
              <p className="text-[11px] font-semibold text-blue-700 mb-1 uppercase tracking-wide">Đặc điểm nhận dạng</p>
              <p className="text-sm text-blue-900">{tv.dacDiemNhanDang}</p>
            </div>

            {/* Thông tin cơ bản */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin cơ bản</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Số lượng", value: `${fmtNum(tv.soLuong)} ${tv.donViTinh}` },
                  { label: "Giá trị ước tính", value: `${fmtNum(tv.giaTriUocTinh)} đ` },
                  { label: "Tình trạng ban đầu", value: tv.tinhTrangBanDau || "—", full: true },
                ].map((item) => (
                  <div key={item.label} className={`bg-gray-50 rounded-lg p-3 ${item.full ? "col-span-2" : ""}`}>
                    <p className="text-[10px] text-gray-400 uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Thông tin phương tiện */}
            {isVehicle && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Thông tin phương tiện</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    tv.bienSo && { label: "Biển số xe", value: tv.bienSo, highlight: true },
                    tv.soKhung && { label: "Số khung", value: tv.soKhung },
                    tv.soMay && { label: "Số máy", value: tv.soMay },
                    tv.hangSanXuat && { label: "Hãng sản xuất", value: tv.hangSanXuat },
                    tv.namSanXuat && { label: "Năm sản xuất", value: tv.namSanXuat },
                    tv.mauSac && { label: "Màu sắc", value: tv.mauSac },
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className={`rounded-lg p-3 ${item.highlight ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
                      <p className="text-[10px] text-gray-400 uppercase">{item.label}</p>
                      <p className={`text-sm font-bold mt-0.5 ${item.highlight ? "text-blue-700" : "text-gray-800"}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vị trí lưu trữ */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vị trí lưu trữ</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Kho lưu trữ", value: tv.khoTen || "Chưa nhập kho" },
                  { label: "Vị trí cụ thể", value: tv.viTriKhoMoTa || "—" },
                  { label: "Ngày nhập kho", value: tv.ngayNhapKho || "—" },
                  { label: "Hạn lưu kho", value: tv.hanLuuKho || "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cán bộ & Biên bản */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quản lý</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Cán bộ quản lý</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <User2 className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-800">{tv.canBoQuanLyTen}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Biên bản vi phạm</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-800">{tv.maBienBan}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {tv.ghiChu && (
              <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-100">
                <p className="text-[11px] font-semibold text-amber-700 mb-1">Ghi chú</p>
                <p className="text-sm text-amber-800">{tv.ghiChu}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Lịch sử */}
        {activeTab === "history" && (
          <div className="p-5">
            {timelineEvents.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Chưa có lịch sử hoạt động</p>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">{timelineEvents.length} sự kiện</p>
                {timelineEvents.map((evt, i) => (
                  <TimelineItem key={i} {...evt} isLast={i === timelineEvents.length - 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Liên quan */}
        {activeTab === "related" && (
          <div className="p-5 space-y-5">
            {/* Hồ sơ vụ việc */}
            {hs ? (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hồ sơ vụ việc</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-500">{hs.maBienBan}</span>
                    <StatusBadge cfg={TRANG_THAI_HO_SO[hs.trangThai]} small />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{hs.hanhViViPham}</p>
                  <div className="flex items-start gap-1.5">
                    <User2 className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600">{hs.doiTuongViPham}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-600">{hs.donViLapTen}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{hs.ngayLap}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-400">Không tìm thấy hồ sơ liên quan</p>
              </div>
            )}

            {/* Niêm phong */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Niêm phong ({tvNiemPhong.length})
              </p>
              {tvNiemPhong.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Chưa có biên bản niêm phong</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tvNiemPhong.map((n) => {
                    const npCfg = TRANG_THAI_NIEM_PHONG[n.trangThai];
                    return (
                      <div key={n.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-gray-500">{n.maNiemPhong}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ color: npCfg.color, background: npCfg.bg }}>
                            {npCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">Số tem: <span className="font-semibold">{n.soTem}</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.ngayNiemPhong} · {n.nguoiNiemPhongTen}</p>
                        {n.lyDoMo && <p className="text-[11px] text-red-600 mt-1">Lý do mở: {n.lyDoMo}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Luân chuyển */}
            {tvLuanChuyen.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Luân chuyển ({tvLuanChuyen.length})
                </p>
                <div className="space-y-2">
                  {tvLuanChuyen.map((l) => {
                    const lcCfg = TRANG_THAI_LUAN_CHUYEN[l.trangThai];
                    return (
                      <div key={l.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-gray-500">{l.maLuanChuyen}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ color: lcCfg.color, background: lcCfg.bg }}>
                            {lcCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{l.khoNguonTen} → {l.khoNhanTen || l.donViNhanTen}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{l.ngayDeNghi} · {l.nguoiDeNghiTen}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Xử lý */}
            {tvXuLy.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Xử lý ({tvXuLy.length})
                </p>
                <div className="space-y-2">
                  {tvXuLy.map((x) => {
                    const hCfg = HINH_THUC_XU_LY[x.hinhThuc];
                    return (
                      <div key={x.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: hCfg.color }}>{hCfg.label}</span>
                          <span className="text-[10px] text-gray-400">{x.ngayDeXuat}</span>
                        </div>
                        <p className="text-xs text-gray-600">{x.moTa}</p>
                        {x.canCuPhapLy && <p className="text-[11px] text-gray-400 mt-0.5">{x.canCuPhapLy}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export function TraCuu() {
  const { tangVat, kho, hoSo } = useStoreState();

  // Search & filter state
  const [rawQuery, setRawQuery] = useState("");
  const query = useDebounce(rawQuery, 250);
  const [quickFilter, setQuickFilter] = useState<TrangThaiTangVat | "qua_han" | "">("");
  const [filterLoai, setFilterLoai] = useState<LoaiTangVat | "">("");
  const [filterKho, setFilterKho] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [selected, setSelected] = useState<TangVat | null>(null);

  const hasAdvancedFilter = !!(filterLoai || filterKho || filterDateFrom || filterDateTo);
  const advancedCount = [filterLoai, filterKho, filterDateFrom, filterDateTo].filter(Boolean).length;
  const hasAnyFilter = query.length >= 1 || !!quickFilter || hasAdvancedFilter;

  const clearAll = useCallback(() => {
    setRawQuery(""); setQuickFilter(""); setFilterLoai("");
    setFilterKho(""); setFilterDateFrom(""); setFilterDateTo("");
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return tangVat.filter((tv) => {
      // Quick filter
      if (quickFilter === "qua_han") {
        const d = daysDiff(tv.hanLuuKho);
        if (d === null || d >= 0) return false;
      } else if (quickFilter) {
        if (tv.trangThai !== quickFilter) return false;
      }
      // Loai
      if (filterLoai && tv.loai !== filterLoai) return false;
      // Kho
      if (filterKho && tv.khoId !== filterKho) return false;
      // Date range
      if (filterDateFrom && tv.ngayNhapKho && tv.ngayNhapKho < filterDateFrom) return false;
      if (filterDateTo && tv.ngayNhapKho && tv.ngayNhapKho > filterDateTo) return false;
      // Text search
      if (q) {
        const match =
          tv.ten.toLowerCase().includes(q) ||
          tv.maTangVat.toLowerCase().includes(q) ||
          tv.maBienBan.toLowerCase().includes(q) ||
          tv.dacDiemNhanDang.toLowerCase().includes(q) ||
          tv.canBoQuanLyTen.toLowerCase().includes(q) ||
          (tv.bienSo?.toLowerCase().includes(q) ?? false) ||
          (tv.soKhung?.toLowerCase().includes(q) ?? false) ||
          (tv.soMay?.toLowerCase().includes(q) ?? false) ||
          (tv.hangSanXuat?.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [tangVat, query, quickFilter, filterLoai, filterKho, filterDateFrom, filterDateTo]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortKey === "newest") arr.sort((a, b) => (b.ngayNhapKho || "").localeCompare(a.ngayNhapKho || ""));
    else if (sortKey === "deadline") arr.sort((a, b) => {
      const da = daysDiff(a.hanLuuKho) ?? 9999;
      const db = daysDiff(b.hanLuuKho) ?? 9999;
      return da - db;
    });
    else if (sortKey === "value_desc") arr.sort((a, b) => b.giaTriUocTinh - a.giaTriUocTinh);
    return arr;
  }, [filtered, sortKey]);

  // Pagination
  const PAGE_SIZE = viewMode === "grid" ? 12 : 15;
  const pag = usePagination(sorted.length, PAGE_SIZE);
  const paginated = sorted.slice(pag.startIndex, pag.endIndex);

  // Stats
  const stats = useMemo(() => {
    const quaHan = filtered.filter((tv) => { const d = daysDiff(tv.hanLuuKho); return d !== null && d < 0; }).length;
    const sapHan = filtered.filter((tv) => { const d = daysDiff(tv.hanLuuKho); return d !== null && d >= 0 && d <= 30; }).length;
    const tongGiaTri = filtered.reduce((s, tv) => s + tv.giaTriUocTinh, 0);
    return { quaHan, sapHan, tongGiaTri };
  }, [filtered]);

  return (
    <div className="flex h-full gap-0">
      {/* ── Left: Main content ── */}
      <div className={`flex-1 min-w-0 flex flex-col overflow-hidden transition-all ${selected ? "hidden lg:flex" : "flex"}`}>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0d3b66]/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-[#0d3b66]" />
                  </div>
                  Tra cứu tang vật
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 ml-11.5">
                  Tìm kiếm nhanh và chính xác theo nhiều tiêu chí
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Tổng {tangVat.length} tang vật trong hệ thống</span>
              </div>
            </div>

            {/* Search card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Main search bar */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 border-2 border-[#0d3b66]/25 rounded-xl px-4 py-3 focus-within:border-[#0d3b66] transition-colors bg-gray-50/50">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                      className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400 text-gray-800"
                      placeholder="Tên tang vật, mã TV, biển số xe, số khung, biên bản..."
                      value={rawQuery}
                      onChange={(e) => setRawQuery(e.target.value)}
                      autoFocus
                    />
                    {rawQuery && (
                      <button onClick={() => setRawQuery("")} className="p-0.5 hover:bg-gray-200 rounded transition-colors">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap ${
                      showAdvanced || hasAdvancedFilter
                        ? "bg-[#0d3b66] text-white border-[#0d3b66] shadow-sm"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Bộ lọc</span>
                    {advancedCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-white text-[#0d3b66] text-xs font-bold flex items-center justify-center">
                        {advancedCount}
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Quick filter chips */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {QUICK_FILTERS.map((qf) => (
                    <button
                      key={qf.value}
                      onClick={() => setQuickFilter(qf.value === quickFilter ? "" : qf.value as any)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                        quickFilter === qf.value
                          ? "shadow-sm scale-105"
                          : "border-transparent hover:border-gray-200"
                      }`}
                      style={
                        quickFilter === qf.value
                          ? { background: qf.bg, color: qf.color, borderColor: qf.color + "40" }
                          : { background: "#f9fafb", color: "#6b7280" }
                      }
                    >
                      {qf.label}
                    </button>
                  ))}
                  {hasAnyFilter && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 ml-auto"
                    >
                      <RefreshCw className="w-3 h-3" /> Xóa tất cả
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced filters */}
              {showAdvanced && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50/30">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-3 mb-2.5">Bộ lọc nâng cao</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Loại tang vật</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#0d3b66]"
                        value={filterLoai}
                        onChange={(e) => setFilterLoai(e.target.value as any)}
                      >
                        {LOAI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Kho lưu trữ</label>
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#0d3b66]"
                        value={filterKho}
                        onChange={(e) => setFilterKho(e.target.value)}
                      >
                        <option value="">Tất cả kho</option>
                        {kho.map((k) => <option key={k.id} value={k.id}>{k.ten}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nhập kho từ ngày</label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#0d3b66]"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Đến ngày</label>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-[#0d3b66]"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                      />
                    </div>
                  </div>
                  {hasAdvancedFilter && (
                    <button
                      onClick={() => { setFilterLoai(""); setFilterKho(""); setFilterDateFrom(""); setFilterDateTo(""); }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Xóa bộ lọc nâng cao
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Results area ── */}
            {filtered.length === 0 ? (
              /* No results */
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Không tìm thấy kết quả</h3>
                <p className="text-sm text-gray-400 mb-4">Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc</p>
                <button onClick={clearAll} className="text-sm text-[#0d3b66] font-semibold hover:underline flex items-center gap-1.5 mx-auto">
                  <RefreshCw className="w-4 h-4" /> Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                {/* Stats bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Kết quả", value: filtered.length.toString(), color: "#0d3b66", bg: "#e8eef5", icon: Package },
                    { label: "Quá hạn", value: stats.quaHan.toString(), color: "#c62828", bg: "#ffebee", icon: AlertTriangle },
                    { label: "Sắp đến hạn", value: stats.sapHan.toString(), color: "#e65100", bg: "#fff3e0", icon: Clock },
                    { label: "Tổng giá trị", value: fmtMoney(stats.tongGiaTri), color: "#2e7d32", bg: "#e8f5e9", icon: CheckCircle2 },
                  ].map((s) => {
                    const SIcon = s.icon;
                    return (
                      <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                          <SIcon className="w-4.5 h-4.5" style={{ color: s.color, width: 18, height: 18 }} />
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-500">{s.label}</p>
                          <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Hiển thị <span className="font-bold text-gray-800">{pag.startIndex + 1}–{pag.endIndex}</span> / <span className="font-bold text-[#0d3b66]">{filtered.length}</span> tang vật
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Sort */}
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                      <select
                        className="text-xs text-gray-600 font-medium outline-none bg-transparent"
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                      >
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    {/* View toggle */}
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1.5 transition-colors ${viewMode === "grid" ? "bg-[#0d3b66] text-white" : "text-gray-400 hover:bg-gray-50"}`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-1.5 transition-colors ${viewMode === "table" ? "bg-[#0d3b66] text-white" : "text-gray-400 hover:bg-gray-50"}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid view */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginated.map((tv) => {
                      const hs = hoSo.find((h) => h.id === tv.hoSoId);
                      return (
                        <GridCard
                          key={tv.id}
                          tv={tv}
                          hoSoMaBienBan={hs?.maBienBan}
                          onClick={() => setSelected(tv)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Table view */}
                {viewMode === "table" && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px]">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase w-8">#</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Tang vật</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Loại</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Kho</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Hạn lưu kho</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Giá trị</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Biên bản</th>
                            <th className="px-4 py-3 w-8" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {paginated.map((tv, i) => {
                            const hs = hoSo.find((h) => h.id === tv.hoSoId);
                            return (
                              <TableRow
                                key={tv.id}
                                tv={tv}
                                hoSoMaBienBan={hs?.maBienBan}
                                onClick={() => setSelected(tv)}
                                idx={pag.startIndex + i + 1}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {pag.totalPages > 1 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-400">Trang {pag.page}/{pag.totalPages}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={pag.prevPage}
                        disabled={pag.page === 1}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      {Array.from({ length: Math.min(5, pag.totalPages) }, (_, i) => {
                        const pg = i + 1;
                        return (
                          <button
                            key={pg}
                            onClick={() => pag.goToPage(pg)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              pg === pag.page ? "bg-[#0d3b66] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {pg}
                          </button>
                        );
                      })}
                      <button
                        onClick={pag.nextPage}
                        disabled={pag.page === pag.totalPages}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Detail panel ── */}
      {selected && (
        <>
          {/* Mobile: back button above */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-[#0d3b66] font-semibold">
              <ChevronLeft className="w-5 h-5" />
              Quay lại kết quả
            </button>
          </div>
          <div className="w-full lg:w-[480px] shrink-0 lg:ml-5 lg:border-l-0 h-full overflow-hidden mt-10 lg:mt-0">
            <DetailPanel tv={selected} onClose={() => setSelected(null)} />
          </div>
        </>
      )}
    </div>
  );
}
