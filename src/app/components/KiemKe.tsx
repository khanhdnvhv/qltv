import { useState, useMemo } from "react";
import {
  ClipboardCheck, Plus, Search, CheckCircle2, Clock,
  X, Warehouse, Calendar, User, ChevronRight, AlertTriangle,
  TrendingDown, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { KET_QUA_KIEM_KE } from "../lib/constants";
import type { KiemKe as KiemKeType } from "../lib/types";

const TRANG_THAI_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  dang_kiem_ke: { label: "Đang kiểm kê", color: "#f57f17", bg: "#fff8e1", icon: Clock },
  hoan_thanh: { label: "Hoàn thành", color: "#1565c0", bg: "#e3f2fd", icon: CheckCircle2 },
  phe_duyet: { label: "Đã phê duyệt", color: "#2e7d32", bg: "#e8f5e9", icon: Shield },
};

type CreateForm = {
  khoId: string;
  khoTen: string;
  ketLuan: string;
  ghiChu: string;
  tongTangVatKiemKe: number;
  soKhop: number;
  soThieu: number;
  soHuHong: number;
  soDu: number;
};

type ChiTietRow = {
  tangVatId: string;
  tenTangVat: string;
  soLuongSoSach: number;
  donViTinh: string;
  soLuongThucTe: number;
  tinhTrangThucTe: string;
  ketQua: "khop" | "thieu" | "hu_hong" | "du";
  ghiChu: string;
};

export function KiemKe() {
  const { kiemKe, kho, tangVat, store, currentUser } = useStoreState();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKho, setFilterKho] = useState("all");
  const [selected, setSelected] = useState<KiemKeType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showComplete, setShowComplete] = useState<KiemKeType | null>(null);
  const [ketLuanText, setKetLuanText] = useState("");

  const [form, setForm] = useState<CreateForm>({
    khoId: "",
    khoTen: "",
    ketLuan: "",
    ghiChu: "",
    tongTangVatKiemKe: 0,
    soKhop: 0,
    soThieu: 0,
    soHuHong: 0,
    soDu: 0,
  });
  const [chiTietRows, setChiTietRows] = useState<ChiTietRow[]>([]);

  const filtered = useMemo(() =>
    kiemKe.filter(kk => {
      const matchSearch = !search ||
        kk.maKiemKe.toLowerCase().includes(search.toLowerCase()) ||
        kk.khoTen.toLowerCase().includes(search.toLowerCase()) ||
        kk.nguoiKiemKeTen.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || kk.trangThai === filterStatus;
      const matchKho = filterKho === "all" || kk.khoId === filterKho;
      return matchSearch && matchStatus && matchKho;
    }),
    [kiemKe, search, filterStatus, filterKho]
  );

  const stats = useMemo(() => ({
    dangKiemKe: kiemKe.filter(kk => kk.trangThai === "dang_kiem_ke").length,
    hoanThanh: kiemKe.filter(kk => kk.trangThai === "hoan_thanh").length,
    pheDuyet: kiemKe.filter(kk => kk.trangThai === "phe_duyet").length,
    coLechSoSach: kiemKe.filter(kk => kk.soThieu > 0 || kk.soHuHong > 0 || kk.soDu > 0).length,
  }), [kiemKe]);

  const handleKhoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const k = kho.find(k => k.id === e.target.value);
    if (k) {
      const tvTrongKho = tangVat.filter(tv =>
        tv.khoId === k.id && ["dang_luu_kho", "cho_xu_ly", "dang_xu_ly"].includes(tv.trangThai)
      );
      const rows: ChiTietRow[] = tvTrongKho.map(tv => ({
        tangVatId: tv.id,
        tenTangVat: tv.ten,
        soLuongSoSach: tv.soLuong,
        donViTinh: tv.donViTinh,
        soLuongThucTe: tv.soLuong,
        tinhTrangThucTe: tv.tinhTrangBanDau || "Bình thường",
        ketQua: "khop" as const,
        ghiChu: "",
      }));
      setChiTietRows(rows);
      setForm(prev => ({
        ...prev,
        khoId: k.id,
        khoTen: k.ten,
        tongTangVatKiemKe: tvTrongKho.length,
        soKhop: tvTrongKho.length,
        soThieu: 0,
        soHuHong: 0,
        soDu: 0,
      }));
    }
  };

  const updateChiTietRow = (idx: number, field: keyof ChiTietRow, value: string | number) => {
    setChiTietRows(prev => {
      const updated = prev.map((row, i) => {
        if (i !== idx) return row;
        const newRow = { ...row, [field]: value };
        // Tự tính kết quả
        if (field === "soLuongThucTe" || field === "tinhTrangThucTe") {
          const qty = field === "soLuongThucTe" ? Number(value) : newRow.soLuongThucTe;
          const tinh = field === "tinhTrangThucTe" ? String(value) : newRow.tinhTrangThucTe;
          if (tinh.toLowerCase().includes("hư") || tinh.toLowerCase().includes("hỏng") || tinh.toLowerCase().includes("hu hong")) {
            newRow.ketQua = "hu_hong";
          } else if (qty < newRow.soLuongSoSach) {
            newRow.ketQua = "thieu";
          } else if (qty > newRow.soLuongSoSach) {
            newRow.ketQua = "du";
          } else {
            newRow.ketQua = "khop";
          }
        }
        return newRow;
      });
      // Cập nhật tổng
      const soKhop = updated.filter(r => r.ketQua === "khop").length;
      const soThieu = updated.filter(r => r.ketQua === "thieu").length;
      const soHuHong = updated.filter(r => r.ketQua === "hu_hong").length;
      const soDu = updated.filter(r => r.ketQua === "du").length;
      setForm(p => ({ ...p, soKhop, soThieu, soHuHong, soDu, tongTangVatKiemKe: updated.length }));
      return updated;
    });
  };

  const handleCreate = () => {
    if (!form.khoId) {
      toast.error("Vui lòng chọn kho kiểm kê");
      return;
    }
    store.addKiemKe({
      khoId: form.khoId,
      khoTen: form.khoTen,
      ngayKiemKe: new Date().toLocaleDateString("vi-VN"),
      nguoiKiemKeId: currentUser.id,
      nguoiKiemKeTen: currentUser.hoTen,
      trangThai: "dang_kiem_ke",
      tongTangVatKiemKe: form.tongTangVatKiemKe,
      soKhop: form.soKhop,
      soThieu: form.soThieu,
      soHuHong: form.soHuHong,
      soDu: form.soDu,
      chiTiet: chiTietRows.map((r, i) => ({
        id: `ctkk-${i}`,
        kiemKeId: "",
        tangVatId: r.tangVatId,
        tenTangVat: r.tenTangVat,
        soLuongSoSach: r.soLuongSoSach,
        soLuongThucTe: r.soLuongThucTe,
        tinhTrangThucTe: r.tinhTrangThucTe,
        ketQua: r.ketQua,
        ghiChu: r.ghiChu,
      })),
      ketLuan: form.ketLuan,
      ghiChu: form.ghiChu,
    });
    toast.success("Đã tạo phiếu kiểm kê");
    setShowCreate(false);
    setForm({ khoId: "", khoTen: "", ketLuan: "", ghiChu: "", tongTangVatKiemKe: 0, soKhop: 0, soThieu: 0, soHuHong: 0, soDu: 0 });
    setChiTietRows([]);
  };

  const handleHoanThanh = () => {
    if (!showComplete) return;
    store.updateKiemKe(showComplete.id, {
      trangThai: "hoan_thanh",
      ketLuan: ketLuanText || showComplete.ketLuan,
    });
    toast.success("Đã hoàn thành kiểm kê");
    setShowComplete(null);
    setKetLuanText("");
    if (selected?.id === showComplete.id) setSelected(null);
  };

  const handlePheDuyet = (kk: KiemKeType) => {
    store.updateKiemKe(kk.id, {
      trangThai: "phe_duyet",
      lanhdaoPheDuyetId: currentUser.id,
      lanhdaoPheDuyetTen: currentUser.hoTen,
    });
    toast.success("Đã phê duyệt kết quả kiểm kê");
    if (selected?.id === kk.id) {
      setSelected({ ...kk, trangThai: "phe_duyet", lanhdaoPheDuyetTen: currentUser.hoTen });
    }
  };

  const getKetQuaColor = (kk: KiemKeType) => {
    if (kk.soThieu > 0) return { color: "#c62828", label: "Có thiếu" };
    if (kk.soHuHong > 0) return { color: "#e65100", label: "Có hư hỏng" };
    if (kk.soDu > 0) return { color: "#f57f17", label: "Có dư" };
    return { color: "#2e7d32", label: "Khớp hoàn toàn" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0d3b66]">Kiểm kê kho</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý phiếu kiểm kê định kỳ và đột xuất tang vật trong kho
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo phiếu kiểm kê
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Đang kiểm kê", value: stats.dangKiemKe, color: "#f57f17", bg: "#fff8e1", icon: Clock },
          { label: "Hoàn thành", value: stats.hoanThanh, color: "#1565c0", bg: "#e3f2fd", icon: CheckCircle2 },
          { label: "Đã phê duyệt", value: stats.pheDuyet, color: "#2e7d32", bg: "#e8f5e9", icon: Shield },
          { label: "Có lệch sổ sách", value: stats.coLechSoSach, color: "#c62828", bg: "#ffebee", icon: AlertTriangle },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm mã kiểm kê, kho, người kiểm kê..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="dang_kiem_ke">Đang kiểm kê</option>
          <option value="hoan_thanh">Hoàn thành</option>
          <option value="phe_duyet">Đã phê duyệt</option>
        </select>
        <select
          value={filterKho}
          onChange={e => setFilterKho(e.target.value)}
          className="px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
        >
          <option value="all">Tất cả kho</option>
          {kho.map(k => <option key={k.id} value={k.id}>{k.ten}</option>)}
        </select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} phiếu</span>
      </div>

      {/* Main layout */}
      <div className={`grid gap-4 ${selected ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
        {/* Table */}
        <div className={`bg-white rounded-xl border border-border shadow-sm overflow-hidden ${selected ? "lg:col-span-2" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {["Mã kiểm kê", "Kho", "Ngày kiểm kê", "Người kiểm kê", "Kết quả", "Trạng thái", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-[#e2e8f0]" />
                      <p className="text-sm">Không có phiếu kiểm kê nào</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(kk => {
                    const cfg = TRANG_THAI_CONFIG[kk.trangThai] ?? TRANG_THAI_CONFIG.dang_kiem_ke;
                    const ketQua = getKetQuaColor(kk);
                    return (
                      <tr
                        key={kk.id}
                        onClick={() => setSelected(selected?.id === kk.id ? null : kk)}
                        className={`hover:bg-[#f8fafc] cursor-pointer transition-colors ${selected?.id === kk.id ? "bg-[#e8eef5]" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[#0d3b66]">{kk.maKiemKe}</p>
                          <p className="text-xs text-muted-foreground">{kk.tongTangVatKiemKe} tang vật</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{kk.khoTen}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{kk.ngayKiemKe}</td>
                        <td className="px-4 py-3 text-sm">{kk.nguoiKiemKeTen}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium" style={{ color: ketQua.color }}>{ketQua.label}</span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Khớp: {kk.soKhop} · Thiếu: {kk.soThieu} · Hỏng: {kk.soHuHong}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ color: cfg.color, backgroundColor: cfg.bg }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[#0d3b66] font-semibold">Chi tiết kiểm kê</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-[#1a2332]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status */}
            {(() => {
              const cfg = TRANG_THAI_CONFIG[selected.trangThai] ?? TRANG_THAI_CONFIG.dang_kiem_ke;
              const Icon = cfg.icon;
              return (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ color: cfg.color, backgroundColor: cfg.bg }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
              );
            })()}

            {/* Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <ClipboardCheck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Mã kiểm kê</p>
                  <p className="font-semibold text-[#0d3b66]">{selected.maKiemKe}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Warehouse className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Kho kiểm kê</p>
                  <p className="font-medium">{selected.khoTen}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Ngày kiểm kê</p>
                  <p className="font-medium">{selected.ngayKiemKe}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Người kiểm kê</p>
                  <p className="font-medium">{selected.nguoiKiemKeTen}</p>
                  {selected.lanhdaoPheDuyetTen && (
                    <p className="text-xs text-muted-foreground">Lãnh đạo duyệt: {selected.lanhdaoPheDuyetTen}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Result summary */}
            <div className="p-4 bg-[#f8fafc] rounded-lg">
              <p className="text-xs text-muted-foreground mb-3 font-medium">Kết quả kiểm kê</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tổng kiểm kê", value: selected.tongTangVatKiemKe, color: "#0d3b66" },
                  { label: "Khớp sổ sách", value: selected.soKhop, color: "#2e7d32" },
                  { label: "Thiếu", value: selected.soThieu, color: "#c62828" },
                  { label: "Hư hỏng", value: selected.soHuHong, color: "#e65100" },
                  { label: "Dư", value: selected.soDu, color: "#f57f17" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              {selected.tongTangVatKiemKe > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Tỷ lệ khớp</span>
                    <span className="text-xs font-semibold text-[#2e7d32]">
                      {Math.round((selected.soKhop / selected.tongTangVatKiemKe) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2e7d32]"
                      style={{ width: `${(selected.soKhop / selected.tongTangVatKiemKe) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ket luan */}
            {selected.ketLuan && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Kết luận</p>
                <p className="text-sm p-3 bg-[#f8fafc] rounded-lg leading-relaxed">{selected.ketLuan}</p>
              </div>
            )}

            {selected.ghiChu && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                <p className="text-sm text-muted-foreground">{selected.ghiChu}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              {selected.trangThai === "dang_kiem_ke" && (
                <button
                  onClick={() => { setShowComplete(selected); setKetLuanText(selected.ketLuan); }}
                  className="w-full py-2.5 bg-[#1565c0] text-white rounded-lg text-sm hover:bg-[#0d47a1] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Hoàn thành kiểm kê
                </button>
              )}
              {selected.trangThai === "hoan_thanh" && (currentUser.vaiTro === "lanhdao" || currentUser.vaiTro === "admin") && (
                <button
                  onClick={() => handlePheDuyet(selected)}
                  className="w-full py-2.5 bg-[#2e7d32] text-white rounded-lg text-sm hover:bg-[#1b5e20] flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Phê duyệt kết quả
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[#0d3b66] font-bold">Tạo phiếu kiểm kê</h2>
              <button onClick={() => { setShowCreate(false); setChiTietRows([]); }} className="text-muted-foreground hover:text-[#1a2332]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Kho kiểm kê <span className="text-[#c62828]">*</span>
                </label>
                <select
                  value={form.khoId}
                  onChange={handleKhoSelect}
                  className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                >
                  <option value="">-- Chọn kho --</option>
                  {kho.filter(k => k.trangThai === "hoat_dong").map(k => (
                    <option key={k.id} value={k.id}>{k.ten} (đang lưu: {k.dangLuu}/{k.sucChua})</option>
                  ))}
                </select>
              </div>

              {form.khoId && (
                <div className="space-y-3">
                  {chiTietRows.length > 0 ? (
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block font-medium">
                        Chi tiết kiểm kê từng tang vật ({chiTietRows.length} mục)
                      </label>
                      <div className="border border-border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-[#f8fafc]">
                            <tr>
                              <th className="text-left px-2 py-1.5 text-muted-foreground font-medium">Tang vật</th>
                              <th className="text-center px-2 py-1.5 text-muted-foreground font-medium">Sổ sách</th>
                              <th className="text-center px-2 py-1.5 text-muted-foreground font-medium">Thực tế</th>
                              <th className="text-left px-2 py-1.5 text-muted-foreground font-medium">Tình trạng</th>
                              <th className="text-center px-2 py-1.5 text-muted-foreground font-medium">KQ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40">
                            {chiTietRows.map((row, idx) => {
                              const kqColor = row.ketQua === "khop" ? "#2e7d32" : row.ketQua === "thieu" ? "#c62828" : row.ketQua === "hu_hong" ? "#e65100" : "#f57f17";
                              const kqLabel = row.ketQua === "khop" ? "Khớp" : row.ketQua === "thieu" ? "Thiếu" : row.ketQua === "hu_hong" ? "Hỏng" : "Dư";
                              return (
                                <tr key={row.tangVatId} className="hover:bg-[#f8fafc]">
                                  <td className="px-2 py-1.5">
                                    <p className="font-medium truncate max-w-[100px]">{row.tenTangVat}</p>
                                  </td>
                                  <td className="px-2 py-1.5 text-center text-muted-foreground">{row.soLuongSoSach}</td>
                                  <td className="px-2 py-1.5 text-center">
                                    <input
                                      type="number"
                                      value={row.soLuongThucTe}
                                      onChange={e => updateChiTietRow(idx, "soLuongThucTe", Number(e.target.value))}
                                      min={0}
                                      className="w-16 px-1.5 py-0.5 border border-border rounded text-center bg-white"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <input
                                      type="text"
                                      value={row.tinhTrangThucTe}
                                      onChange={e => updateChiTietRow(idx, "tinhTrangThucTe", e.target.value)}
                                      className="w-full px-1.5 py-0.5 border border-border rounded bg-white text-xs"
                                      placeholder="Tình trạng..."
                                    />
                                  </td>
                                  <td className="px-2 py-1.5 text-center">
                                    <span className="font-medium text-xs" style={{ color: kqColor }}>{kqLabel}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {/* Summary */}
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {[
                          { label: "Khớp", value: form.soKhop, color: "#2e7d32" },
                          { label: "Thiếu", value: form.soThieu, color: "#c62828" },
                          { label: "Hư hỏng", value: form.soHuHong, color: "#e65100" },
                          { label: "Dư", value: form.soDu, color: "#f57f17" },
                        ].map(s => (
                          <div key={s.label} className="text-center p-2 bg-[#f8fafc] rounded-lg">
                            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#f8fafc] rounded-lg text-center text-sm text-muted-foreground">
                      Không có tang vật nào đang lưu trong kho này
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Kết luận sơ bộ</label>
                <textarea
                  rows={3}
                  value={form.ketLuan}
                  onChange={e => setForm(prev => ({ ...prev, ketLuan: e.target.value }))}
                  placeholder="Nhập kết luận kiểm kê..."
                  className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Ghi chú</label>
                <input
                  type="text"
                  value={form.ghiChu}
                  onChange={e => setForm(prev => ({ ...prev, ghiChu: e.target.value }))}
                  placeholder="Ghi chú thêm..."
                  className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowCreate(false); setChiTietRows([]); }}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm hover:bg-[#f8fafc]"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2.5 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center justify-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4" />
                Tạo phiếu kiểm kê
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete modal */}
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[#0d3b66] font-bold">Hoàn thành kiểm kê</h2>
              <button onClick={() => { setShowComplete(null); setKetLuanText(""); }} className="text-muted-foreground hover:text-[#1a2332]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#e8eef5] rounded-lg">
              <p className="text-sm font-medium text-[#0d3b66]">{showComplete.maKiemKe}</p>
              <p className="text-sm text-muted-foreground">{showComplete.khoTen}</p>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Kết luận kiểm kê <span className="text-[#c62828]">*</span>
              </label>
              <textarea
                rows={4}
                value={ketLuanText}
                onChange={e => setKetLuanText(e.target.value)}
                placeholder="Nhập kết luận kiểm kê..."
                className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowComplete(null); setKetLuanText(""); }}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm hover:bg-[#f8fafc]"
              >
                Hủy
              </button>
              <button
                onClick={handleHoanThanh}
                disabled={!ketLuanText}
                className="flex-1 py-2.5 bg-[#1565c0] text-white rounded-lg text-sm hover:bg-[#0d47a1] flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
