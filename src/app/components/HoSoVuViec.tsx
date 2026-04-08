import { useState, useMemo } from "react";
import {
  FolderOpen, Plus, Search, Eye, ChevronRight,
  ChevronLeft, X, FileText, AlertTriangle,
  User, MapPin, Package, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_HO_SO, TRANG_THAI_TANG_VAT, MOCK_USERS } from "../lib/constants";
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
  const { hoSo, tangVat, donVi, store } = useStoreState();
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

  // Form state
  const [form, setForm] = useState({
    maBienBan: "",
    ngayLap: new Date().toISOString().slice(0, 10),
    donViLapId: "dv1",
    canBoLapId: "u4",
    doiTuongViPham: "",
    diaChiDoiTuong: "",
    cccdDoiTuong: "",
    soDienThoaiDoiTuong: "",
    emailDoiTuong: "",
    loaiGiayToDoiTuong: "cccd" as "cccd" | "cmnd" | "ho_chieu" | "khac",
    hanhViViPham: "",
    canCuPhapLy: "",
    diaDiemViPham: "",
    ghiChu: "",
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
    const canBo = MOCK_USERS.find((u) => u.id === form.canBoLapId);
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
      tongGiaTriUocTinh: 0,
      ghiChu: form.ghiChu,
      taiLieu: [],
      lichSu: [],
    });
    setShowCreate(false);
    setForm({ maBienBan: "", ngayLap: new Date().toISOString().slice(0, 10), donViLapId: "dv1", canBoLapId: "u4", doiTuongViPham: "", diaChiDoiTuong: "", cccdDoiTuong: "", soDienThoaiDoiTuong: "", emailDoiTuong: "", loaiGiayToDoiTuong: "cccd", hanhViViPham: "", canCuPhapLy: "", diaDiemViPham: "", ghiChu: "" });
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Tổng hồ sơ", value: stats.total, color: "#0d3b66" },
              { label: "Chờ duyệt", value: stats.choDuyet, color: "#f57f17" },
              { label: "Đang xử lý", value: stats.dangXuLy, color: "#1565c0" },
              { label: "Đã duyệt", value: stats.daDuyet, color: "#7b1fa2" },
              { label: "Hoàn thành", value: stats.hoanThanh, color: "#2e7d32" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
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
                              <Eye className="w-4 h-4 text-gray-300 ml-1" />
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

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0d3b66]">Tạo hồ sơ vụ việc mới</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                    {MOCK_USERS.filter((u) => ["admin", "lanhdao", "canbonv", "thukho"].includes(u.vaiTro)).map((u) => (
                      <option key={u.id} value={u.id}>{u.hoTen}</option>
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
                    <option value="cmnd">CMND</option>
                    <option value="ho_chieu">Hộ chiếu</option>
                    <option value="khac">Khác</option>
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
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="Điều khoản, văn bản áp dụng"
                    value={form.canCuPhapLy}
                    onChange={(e) => setForm({ ...form, canCuPhapLy: e.target.value })}
                  />
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

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]"
              >
                Tạo hồ sơ
              </button>
            </div>
          </div>
        </div>
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
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={editForm.canCuPhapLy}
                    onChange={(e) => setEditForm({ ...editForm, canCuPhapLy: e.target.value })}
                  />
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

