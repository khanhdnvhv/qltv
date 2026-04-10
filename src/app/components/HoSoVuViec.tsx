import { useState, useMemo } from "react";
import {
  FolderOpen, Plus, Search, Eye, ChevronRight,
  ChevronLeft, X, FileText, AlertTriangle,
  User, MapPin, Package, Pencil, Trash2,
  TrendingUp, Clock, CheckCircle2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_HO_SO, TRANG_THAI_TANG_VAT } from "../lib/constants";
import type { HoSoVuViec as IHoSo, TrangThaiHoSo } from "../lib/types";

function formatNum(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

const STATUS_FILTER_OPTIONS: { value: TrangThaiHoSo | ""; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "cho_duyet", label: "Chờ duyệt" },
  { value: "dang_xu_ly", label: "Đang xử lý" },
  { value: "da_duyet", label: "Đã duyệt" },
  { value: "tu_choi", label: "Từ chối" },
  { value: "hoan_thanh", label: "Hoàn thành" },
];

export function HoSoVuViec() {
  const { hoSo, tangVat, donVi, users, canCuPhapLyMau, store } = useStoreState();
  const [search, setSearch] = useState("");
  const [filterTT, setFilterTT] = useState<TrangThaiHoSo | "">("");
  const [filterDV, setFilterDV] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedHoSo, setSelectedHoSo] = useState<IHoSo | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<IHoSo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<IHoSo | null>(null);
  const [editForm, setEditForm] = useState({ hanhViViPham: "", canCuPhapLy: "", diaDiemViPham: "", ghiChu: "" });

  const [taiLieuList, setTaiLieuList] = useState<{ tenTaiLieu: string; loaiTaiLieu: "bien_ban" | "quyet_dinh" | "hinh_anh" | "khac"; fileName: string; fileDataUrl?: string }[]>([]);
  const addTaiLieu = () => setTaiLieuList(prev => [...prev, { tenTaiLieu: "", loaiTaiLieu: "bien_ban", fileName: "" }]);
  const removeTaiLieu = (idx: number) => setTaiLieuList(prev => prev.filter((_, i) => i !== idx));
  const updateTaiLieu = (idx: number, field: string, val: string) =>
    setTaiLieuList(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));

  // Form state
  const [form, setForm] = useState({
    maBienBan: "",
    ngayLap: new Date().toISOString().slice(0, 10),
    donViLapId: "",
    canBoLapId: "",
    doiTuongViPham: "",
    diaChiDoiTuong: "",
    cccdDoiTuong: "",
    soDienThoaiDoiTuong: "",
    emailDoiTuong: "",
    loaiGiayToDoiTuong: "cccd" as "cccd" | "cccd_dien_tu" | "cmnd" | "ho_chieu" | "mst",
    hanhViViPham: "",
    canCuPhapLy: "",
    diaDiemViPham: "",
    ghiChu: "",
    tongGiaTriUocTinh: 0,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return hoSo.filter((h) => {
      const matchQ = !q || h.maBienBan.toLowerCase().includes(q) || h.doiTuongViPham.toLowerCase().includes(q) || h.hanhViViPham.toLowerCase().includes(q);
      const matchTT = !filterTT || h.trangThai === filterTT;
      const matchDV = !filterDV || h.donViLapId === filterDV;
      return matchQ && matchTT && matchDV;
    });
  }, [hoSo, search, filterTT, filterDV]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => store.getHoSoStats(), [store]);

  function handleCreate() {
    if (!form.maBienBan || !form.doiTuongViPham || !form.hanhViViPham) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (*)", { description: "Số biên bản, đối tượng vi phạm và hành vi vi phạm là bắt buộc." });
      return;
    }
    const dv = donVi.find((d) => d.id === form.donViLapId);
    const canBo = users.find((u) => u.id === form.canBoLapId);
    const [y, m, d] = form.ngayLap.split("-").map(Number);
    store.addHoSo({
      maBienBan: form.maBienBan,
      ngayLap: `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`,
      donViLapId: form.donViLapId,
      donViLapTen: dv?.ten ?? "",
      canBoLapId: form.canBoLapId,
      canBoLapTen: canBo?.hoTen ?? "",
      doiTuongViPham: form.doiTuongViPham,
      diaChiDoiTuong: form.diaChiDoiTuong,
      cccdDoiTuong: form.cccdDoiTuong,
      loaiGiayToDoiTuong: form.loaiGiayToDoiTuong,
      soDienThoaiDoiTuong: form.soDienThoaiDoiTuong || undefined,
      emailDoiTuong: form.emailDoiTuong || undefined,
      hanhViViPham: form.hanhViViPham,
      canCuPhapLy: form.canCuPhapLy,
      diaDiemViPham: form.diaDiemViPham,
      trangThai: "cho_duyet",
      soTangVat: 0,
      tongGiaTriUocTinh: form.tongGiaTriUocTinh,
      ghiChu: form.ghiChu,
      taiLieu: taiLieuList.filter(t => t.tenTaiLieu.trim()).map((t, i) => ({
          id: `tl-${Date.now()}-${i}`,
          hoSoId: "",
          tenTaiLieu: t.tenTaiLieu,
          loaiTaiLieu: t.loaiTaiLieu,
          fileName: t.fileName || t.tenTaiLieu,
          fileSize: 0,
          uploadedAt: new Date().toLocaleDateString("vi-VN"),
          uploadedBy: store.currentUser.hoTen,
          fileDataUrl: t.fileDataUrl,
        })),
      lichSu: [],
    });
    setShowCreate(false);
    setTaiLieuList([]);
    setForm({ maBienBan: "", ngayLap: new Date().toISOString().slice(0, 10), donViLapId: "", canBoLapId: "", doiTuongViPham: "", diaChiDoiTuong: "", cccdDoiTuong: "", soDienThoaiDoiTuong: "", emailDoiTuong: "", loaiGiayToDoiTuong: "cccd" as "cccd" | "cccd_dien_tu" | "cmnd" | "ho_chieu" | "mst", hanhViViPham: "", canCuPhapLy: "", diaDiemViPham: "", ghiChu: "", tongGiaTriUocTinh: 0 });
  }

  function handleSaveEdit() {
    if (!showEdit) return;
    if (!editForm.hanhViViPham) { toast.error("Hành vi vi phạm không được để trống"); return; }
    store.updateHoSo(showEdit.id, editForm);
    toast.success("Đã cập nhật hồ sơ");
    setShowEdit(null);
  }

  const tangVatOfHoSo = selectedHoSo
    ? tangVat.filter((t) => t.hoSoId === selectedHoSo.id)
    : [];

  return (
    <>
      <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
                <FolderOpen className="w-6 h-6" />
                Hồ sơ vụ việc
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Quản lý hồ sơ vi phạm hành chính</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo hồ sơ mới
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* 1. Tổng hồ sơ - blue */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">TỔNG HỒ SƠ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-600 mt-1">hồ sơ vụ việc</p>
              </div>
            </div>

            {/* 2. Chờ duyệt - amber */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">CHỜ DUYỆT</p>
                <p className="text-2xl font-bold text-gray-900">{stats.choDuyet}</p>
                <p className="text-xs text-gray-600 mt-1">hồ sơ chờ duyệt</p>
              </div>
            </div>

            {/* 3. Đang xử lý - sky */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white to-sky-50 border border-sky-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-sky-500" />
                </div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">ĐANG XỬ LÝ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dangXuLy}</p>
                <p className="text-xs text-gray-600 mt-1">hồ sơ đang xử lý</p>
              </div>
            </div>

            {/* 4. Đã duyệt - purple */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">ĐÃ DUYỆT</p>
                <p className="text-2xl font-bold text-gray-900">{stats.daDuyet}</p>
                <p className="text-xs text-gray-600 mt-1">hồ sơ đã duyệt</p>
              </div>
            </div>

            {/* 5. Hoàn thành - green */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">HOÀN THÀNH</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hoanThanh}</p>
                <p className="text-xs text-gray-600 mt-1">hồ sơ hoàn thành</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
                placeholder="Số biên bản, đối tượng, hành vi..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
              value={filterTT}
              onChange={(e) => { setFilterTT(e.target.value as any); setPage(1); }}
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
              value={filterDV}
              onChange={(e) => { setFilterDV(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả đơn vị</option>
              {donVi.map((d) => (
                <option key={d.id} value={d.id}>{d.ten}</option>
              ))}
            </select>
            <div className="text-sm text-gray-500 flex items-center px-2">
              {filtered.length} hồ sơ
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Số biên bản</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Đối tượng vi phạm</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Hành vi</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Đơn vị lập</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Tang vật</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Ngày lập</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-400 text-sm">
                        Không tìm thấy hồ sơ nào
                      </td>
                    </tr>
                  ) : (
                    pageData.map((hs) => {
                      const ttCfg = TRANG_THAI_HO_SO[hs.trangThai];
                      return (
                        <tr
                          key={hs.id}
                          className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                          onClick={() => setSelectedHoSo(hs)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#0d3b66]">{hs.maBienBan}</span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-800 truncate max-w-36">{hs.doiTuongViPham}</p>
                            <p className="text-xs text-gray-400 truncate max-w-36">{hs.diaChiDoiTuong}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-700 line-clamp-2 max-w-48 text-xs leading-relaxed">{hs.hanhViViPham}</p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-600 text-xs">{hs.donViLapTen}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                              <Package className="w-3 h-3" />
                              {hs.soTangVat}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-500 text-xs">{hs.ngayLap}</td>
                          <td className="py-3 px-4">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: ttCfg.bg, color: ttCfg.color }}
                            >
                              {ttCfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                title="Chỉnh sửa"
                                onClick={() => { setEditForm({ hanhViViPham: hs.hanhViViPham, canCuPhapLy: hs.canCuPhapLy || "", diaDiemViPham: hs.diaDiemViPham || "", ghiChu: hs.ghiChu || "" }); setShowEdit(hs); }}
                                className="p-1.5 hover:bg-amber-50 rounded-md transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-amber-600" />
                              </button>
                              <button
                                title="Xóa hồ sơ"
                                onClick={() => setConfirmDelete(hs)}
                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                              </button>
                              <button
                                title="Xem chi tiết"
                                onClick={() => setSelectedHoSo(hs)}
                                className="p-1.5 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Hiển thị {Math.min((safePage - 1) * pageSize + 1, filtered.length)}–{Math.min(safePage * pageSize, filtered.length)} / {filtered.length} hồ sơ
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm px-2">{safePage}/{totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Detail Modal */}
      {selectedHoSo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedHoSo(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0d3b66] to-[#1565c0] rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">{selectedHoSo.maBienBan}</span>
                  <span className="text-xs text-white/60">{selectedHoSo.ngayLap}</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug truncate max-w-md">{selectedHoSo.doiTuongViPham}</h2>
              </div>
              <button onClick={() => setSelectedHoSo(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Status + date */}
              <div className="flex items-center gap-3 flex-wrap">
                {(() => {
                  const ttCfg = TRANG_THAI_HO_SO[selectedHoSo.trangThai];
                  return (
                    <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: ttCfg.bg, color: ttCfg.color }}>
                      {ttCfg.label}
                    </span>
                  );
                })()}
                <span className="text-sm text-gray-500">Đơn vị: <span className="font-medium text-gray-700">{selectedHoSo.donViLapTen}</span></span>
                <span className="text-sm text-gray-500">Cán bộ: <span className="font-medium text-gray-700">{selectedHoSo.canBoLapTen}</span></span>
              </div>

              {/* CCCD / địa chỉ / liên hệ */}
              <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100 space-y-1">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Thông tin đối tượng vi phạm</p>
                {selectedHoSo.cccdDoiTuong && (
                  <p className="text-sm text-blue-900">{selectedHoSo.loaiGiayToDoiTuong?.toUpperCase() ?? "CCCD"}: <span className="font-semibold">{selectedHoSo.cccdDoiTuong}</span></p>
                )}
                {selectedHoSo.soDienThoaiDoiTuong && (
                  <p className="text-sm text-blue-800">SĐT: <span className="font-semibold">{selectedHoSo.soDienThoaiDoiTuong}</span></p>
                )}
                {selectedHoSo.emailDoiTuong && (
                  <p className="text-sm text-blue-800">Email: <span className="font-semibold">{selectedHoSo.emailDoiTuong}</span></p>
                )}
                {selectedHoSo.diaChiDoiTuong && (
                  <p className="text-sm text-blue-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />{selectedHoSo.diaChiDoiTuong}
                  </p>
                )}
              </div>

              {/* Hành vi + địa điểm + căn cứ */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Hành vi vi phạm</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{selectedHoSo.hanhViViPham}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Địa điểm vi phạm</p>
                    <p className="text-sm text-gray-800">{selectedHoSo.diaDiemViPham || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Căn cứ pháp lý</p>
                    <p className="text-sm text-gray-800">{selectedHoSo.canCuPhapLy || "—"}</p>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Tổng GT ước tính</p>
                  <p className="text-sm font-bold text-[#0d3b66] mt-0.5">{formatNum(selectedHoSo.tongGiaTriUocTinh)} đ</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Số tang vật</p>
                  <p className="text-sm font-bold text-[#0d3b66] mt-0.5">{selectedHoSo.soTangVat} loại</p>
                </div>
              </div>

              {/* Tang vat */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Tang vật trong hồ sơ ({tangVatOfHoSo.length})
                </h3>
                {tangVatOfHoSo.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Chưa có tang vật nào</p>
                ) : (
                  <div className="space-y-2">
                    {tangVatOfHoSo.map((tv) => {
                      const ttCfg = TRANG_THAI_TANG_VAT[tv.trangThai];
                      return (
                        <div key={tv.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{tv.ten}</p>
                            <p className="text-xs text-gray-400">{tv.maTangVat} · SL: {formatNum(tv.soLuong)} {tv.donViTinh}</p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: ttCfg?.bg, color: ttCfg?.color }}>
                            {ttCfg?.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              {selectedHoSo.ghiChu && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Ghi chú</p>
                  <p className="text-sm text-amber-800">{selectedHoSo.ghiChu}</p>
                </div>
              )}

              {/* Tài liệu đính kèm */}
                  {selectedHoSo.taiLieu && selectedHoSo.taiLieu.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        Tài liệu đính kèm ({selectedHoSo.taiLieu.length})
                      </p>
                      <div className="space-y-1.5">
                        {selectedHoSo.taiLieu.map(tl => (
                          <div key={tl.id} className="flex items-center gap-2 p-2 bg-[#f8fafc] rounded-lg">
                            <FileText className="w-3.5 h-3.5 text-[#0d3b66] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{tl.tenTaiLieu}</p>
                              <p className="text-xs text-muted-foreground">{tl.loaiTaiLieu} · {tl.uploadedAt}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

              {/* Cập nhật trạng thái */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Cập nhật trạng thái</p>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0d3b66]"
                  value={selectedHoSo.trangThai}
                  onChange={(e) => {
                    const tt = e.target.value as TrangThaiHoSo;
                    store.updateTrangThaiHoSo(selectedHoSo.id, tt);
                    setSelectedHoSo({ ...selectedHoSo, trangThai: tt });
                  }}
                >
                  {STATUS_FILTER_OPTIONS.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setSelectedHoSo(null)}
                className="w-full border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Side Panel */}
      {showCreate && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => { setShowCreate(false); setTaiLieuList([]); }} />
          {/* Side panel */}
          <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-2xl flex flex-col z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0d3b66]">Tạo hồ sơ vụ việc mới</h2>
                <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin để tạo hồ sơ</p>
              </div>
              <button onClick={() => { setShowCreate(false); setTaiLieuList([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Số biên bản vi phạm <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="VD: BB-2026-016"
                    value={form.maBienBan}
                    onChange={(e) => setForm({ ...form, maBienBan: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ngày lập biên bản</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={form.ngayLap}
                    onChange={(e) => setForm({ ...form, ngayLap: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Đơn vị lập</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={form.donViLapId}
                    onChange={(e) => setForm({ ...form, donViLapId: e.target.value })}
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {donVi.map((d) => (
                      <option key={d.id} value={d.id}>{d.ten}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Cán bộ lập</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={form.canBoLapId}
                    onChange={(e) => setForm({ ...form, canBoLapId: e.target.value })}
                  >
                    <option value="">-- Chọn cán bộ --</option>
                    {users.filter((u) => ["admin", "lanhdao", "canbonv", "thukho"].includes(u.vaiTro)).map((u) => (
                      <option key={u.id} value={u.id}>{u.hoTen} ({u.donViTen})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Đối tượng vi phạm <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  placeholder="Họ tên cá nhân hoặc tên tổ chức vi phạm"
                  value={form.doiTuongViPham}
                  onChange={(e) => setForm({ ...form, doiTuongViPham: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Loại giấy tờ</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={form.loaiGiayToDoiTuong}
                    onChange={(e) => setForm({ ...form, loaiGiayToDoiTuong: e.target.value as typeof form.loaiGiayToDoiTuong })}
                  >
                    <option value="cccd">CCCD</option>
                    <option value="cccd_dien_tu">CCCD điện tử</option>
                    <option value="cmnd">CMND</option>
                    <option value="ho_chieu">Hộ chiếu</option>
                    <option value="mst">Mã số thuế</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số CCCD / Mã số thuế</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="12 số CCCD hoặc MST"
                    value={form.cccdDoiTuong}
                    onChange={(e) => setForm({ ...form, cccdDoiTuong: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số điện thoại</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="0912345678"
                    value={form.soDienThoaiDoiTuong}
                    onChange={(e) => setForm({ ...form, soDienThoaiDoiTuong: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="example@email.com"
                    value={form.emailDoiTuong}
                    onChange={(e) => setForm({ ...form, emailDoiTuong: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Địa chỉ đối tượng</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  placeholder="Địa chỉ thường trú"
                  value={form.diaChiDoiTuong}
                  onChange={(e) => setForm({ ...form, diaChiDoiTuong: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Hành vi vi phạm <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={3}
                  placeholder="Mô tả chi tiết hành vi vi phạm..."
                  value={form.hanhViViPham}
                  onChange={(e) => setForm({ ...form, hanhViViPham: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Căn cứ pháp lý</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
                    value={form.canCuPhapLy}
                    onChange={(e) => setForm({ ...form, canCuPhapLy: e.target.value })}
                  >
                    <option value="">— Chọn căn cứ pháp lý —</option>
                    {canCuPhapLyMau.map((m) => (
                      <option key={m.id} value={m.noiDung}>{m.tieuDe} — {m.noiDung}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Địa điểm vi phạm</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="Địa điểm phát hiện vi phạm"
                    value={form.diaDiemViPham}
                    onChange={(e) => setForm({ ...form, diaDiemViPham: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tổng giá trị ước tính (VNĐ)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  placeholder="0"
                  value={form.tongGiaTriUocTinh}
                  onChange={(e) => setForm({ ...form, tongGiaTriUocTinh: Number(e.target.value) })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Tài liệu đính kèm
                  </label>
                  <button type="button" onClick={addTaiLieu} className="text-xs text-[#0d3b66] hover:underline flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Thêm tài liệu
                  </button>
                </div>
                {taiLieuList.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Chưa có tài liệu đính kèm</p>
                ) : (
                  <div className="space-y-2">
                    {taiLieuList.map((tl, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                        <select
                          value={tl.loaiTaiLieu}
                          onChange={e => updateTaiLieu(idx, "loaiTaiLieu", e.target.value)}
                          className="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs shrink-0"
                        >
                          <option value="bien_ban">Biên bản</option>
                          <option value="quyet_dinh">Quyết định</option>
                          <option value="hinh_anh">Hình ảnh</option>
                          <option value="khac">Khác</option>
                        </select>
                        <label className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 px-2 py-1.5 bg-white border border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-500 truncate">
                              {tl.fileName ? tl.fileName : "Chọn tệp..."}
                            </span>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setTaiLieuList(prev => prev.map((t, i) => i === idx ? {
                                  ...t,
                                  tenTaiLieu: file.name,
                                  fileName: file.name,
                                  fileDataUrl: ev.target?.result as string,
                                } : t));
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <button type="button" onClick={() => removeTaiLieu(idx)} className="p-1 text-red-400 hover:text-red-600 shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ghi chú</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  placeholder="Ghi chú thêm..."
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
              <button
                onClick={() => { setShowCreate(false); setTaiLieuList([]); }}
                className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]"
              >
                Tạo hồ sơ
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#0d3b66]">Chỉnh sửa hồ sơ</h2>
                <p className="text-xs text-gray-400 mt-0.5">{showEdit.maBienBan}</p>
              </div>
              <button onClick={() => setShowEdit(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Hành vi vi phạm <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={3}
                  value={editForm.hanhViViPham}
                  onChange={(e) => setEditForm({ ...editForm, hanhViViPham: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Căn cứ pháp lý</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
                    value={editForm.canCuPhapLy}
                    onChange={(e) => setEditForm({ ...editForm, canCuPhapLy: e.target.value })}
                  >
                    <option value="">— Chọn căn cứ pháp lý —</option>
                    {canCuPhapLyMau.map((m) => (
                      <option key={m.id} value={m.noiDung}>{m.tieuDe} — {m.noiDung}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Địa điểm vi phạm</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={editForm.diaDiemViPham}
                    onChange={(e) => setEditForm({ ...editForm, diaDiemViPham: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ghi chú</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  value={editForm.ghiChu}
                  onChange={(e) => setEditForm({ ...editForm, ghiChu: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowEdit(null)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSaveEdit} className="flex-1 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Xóa hồ sơ vụ việc?</h3>
                <p className="text-sm text-gray-500 mt-0.5">{confirmDelete.maBienBan} · {confirmDelete.doiTuongViPham}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              Hành động này sẽ xóa vĩnh viễn hồ sơ và không thể khôi phục. Các tang vật liên quan vẫn được giữ lại.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={() => {
                  store.deleteHoSo(confirmDelete.id);
                  toast.success(`Đã xóa hồ sơ ${confirmDelete.maBienBan}`);
                  if (selectedHoSo?.id === confirmDelete.id) setSelectedHoSo(null);
                  setConfirmDelete(null);
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Xóa hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

