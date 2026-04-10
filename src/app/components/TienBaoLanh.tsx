import { useState } from "react";
import { toast } from "sonner";
import {
  Banknote, Plus, Eye, ArrowRight, CheckCircle, XCircle, X,
  ChevronLeft, ChevronRight, Clock, AlertTriangle, TrendingUp, CheckCircle2,
} from "lucide-react";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_BAO_LANH } from "../lib/constants";
import type { TienBaoLanh as TTienBaoLanh, TrangThaiBaoLanh } from "../lib/types";

const PAGE_SIZE = 8;

function addBusinessDays(dateStr: string, days: number): string {
  let date: Date;
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-").map(Number);
    date = new Date(y, m - 1, d);
  } else {
    const [d, m, y] = dateStr.split("/").map(Number);
    date = new Date(y, m - 1, d);
  }
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
}

const STATUS_STYLES: Record<TrangThaiBaoLanh, { cls: string; label: string }> = {
  cho_chuyen_tai_vu: { cls: "bg-yellow-100 text-yellow-800", label: "Chờ chuyển tài vụ" },
  da_chuyen_tai_vu: { cls: "bg-blue-100 text-blue-800", label: "Đang tạm giữ" },
  cho_xu_ly: { cls: "bg-orange-100 text-orange-800", label: "Chờ xử lý" },
  da_hoan_tra: { cls: "bg-green-100 text-green-800", label: "Đã hoàn trả" },
  da_khau_tru: { cls: "bg-red-100 text-red-800", label: "Đã tịch thu" },
};

export function TienBaoLanh() {
  const { store, currentUser } = useStoreState();
  const canProcess = ["admin", "lanhdao"].includes(currentUser.vaiTro);
  const canCreate = ["admin", "canbonv", "thukho"].includes(currentUser.vaiTro);

  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<TrangThaiBaoLanh | "">("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<TTienBaoLanh | null>(null);
  const [showXuLyModal, setShowXuLyModal] = useState<TTienBaoLanh | null>(null);

  const [form, setForm] = useState({
    tangVatId: "", tenTangVat: "", maBienBan: "", hoSoId: "",
    doiTuongTen: "", doiTuongCccd: "",
    soTienBaoLanh: "",
    lyDoBaoLanh: "",
    canCuPhapLy: "Điều 15 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    ghiChu: "",
    ngayDatBaoLanh: "", hanChuyenTaiVu: "", ngayHetHanXuLy: "",
  });

  const [xuLyForm, setXuLyForm] = useState({
    ketQua: "tich_thu" as "tich_thu" | "hoan_tra",
    soQuyetDinh: "",
    ghiChu: "",
  });

  const list = store.tienBaoLanh.filter((t) => !filterStatus || t.trangThai === filterStatus);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paged = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tangVatOptions = store.tangVat.filter((t) => ["dang_luu_kho", "cho_xu_ly"].includes(t.trangThai));

  const stats = {
    choChuyen: store.tienBaoLanh.filter((t) => t.trangThai === "cho_chuyen_tai_vu").length,
    choXuLy: store.tienBaoLanh.filter((t) => t.trangThai === "cho_xu_ly").length,
    daXuLy: store.tienBaoLanh.filter((t) => ["da_hoan_tra", "da_khau_tru"].includes(t.trangThai)).length,
    tongTien: store.tienBaoLanh.reduce((s, t) => s + t.soTienBaoLanh, 0),
  };

  function isOverdue(t: TTienBaoLanh) {
    if (!t.hanXuLy || t.trangThai !== "cho_xu_ly") return false;
    const [d, m, y] = t.hanXuLy.split("/").map(Number);
    return new Date(y, m - 1, d) < new Date();
  }

  function handleCreate() {
    if (!form.tangVatId || !form.doiTuongTen || !form.doiTuongCccd || !form.soTienBaoLanh || !form.lyDoBaoLanh) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    const so = parseFloat(form.soTienBaoLanh.replace(/,/g, ""));
    if (isNaN(so) || so <= 0) { toast.error("Số tiền bảo lãnh không hợp lệ"); return; }
    const tv = store.tangVat.find((t) => t.id === form.tangVatId);
    store.addTienBaoLanh({
      ...form,
      tenTangVat: tv?.ten ?? form.tenTangVat,
      maBienBan: tv?.maBienBan ?? form.maBienBan,
      soTienBaoLanh: so,
      nguoiTiepNhanId: currentUser.id,
      nguoiTiepNhanTen: currentUser.hoTen,
      trangThai: "cho_chuyen_tai_vu" as TrangThaiBaoLanh,
    });
    toast.success("Đã tiếp nhận tiền bảo lãnh");
    setShowCreateModal(false);
    setForm({ tangVatId: "", tenTangVat: "", maBienBan: "", hoSoId: "", doiTuongTen: "", doiTuongCccd: "", soTienBaoLanh: "", lyDoBaoLanh: "", canCuPhapLy: "Điều 15 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)", ghiChu: "", ngayDatBaoLanh: "", hanChuyenTaiVu: "", ngayHetHanXuLy: "" });
  }

  function handleChuyenTaiVu(id: string) {
    store.chuyenTaiVu(id);
    toast.success("Đã chuyển tài vụ — hạn xử lý 10 ngày làm việc");
  }

  function handleXuLy() {
    if (!showXuLyModal) return;
    if (!xuLyForm.soQuyetDinh.trim()) { toast.error("Vui lòng nhập số quyết định"); return; }
    store.xuLyBaoLanh(showXuLyModal.id, xuLyForm.ketQua, xuLyForm.soQuyetDinh, xuLyForm.ghiChu);
    toast.success(xuLyForm.ketQua === "tich_thu" ? "Đã tịch thu tiền bảo lãnh sung công quỹ" : "Đã hoàn trả tiền bảo lãnh cho đối tượng");
    setShowXuLyModal(null);
    setXuLyForm({ ketQua: "tich_thu", soQuyetDinh: "", ghiChu: "" });
  }

  const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tiền Bảo Lãnh Tang Vật</h1>
            <p className="text-sm text-gray-500 mt-1">Điều 15 NĐ 47/2026/NĐ-CP — Nhận tiền bảo lãnh thay thế tạm giữ tang vật</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Tiếp nhận
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Chờ chuyển tài vụ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.choChuyen}</p>
              <p className="text-xs text-gray-600 mt-1">≤ 2 ngày làm việc</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">{stats.choXuLy}</p>
              <p className="text-xs text-gray-600 mt-1">≤ 10 ngày làm việc</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Đã xử lý</p>
              <p className="text-2xl font-bold text-gray-900">{stats.daXuLy}</p>
              <p className="text-xs text-gray-600 mt-1">hoàn tất</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-cyan-50 border border-cyan-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-cyan-500" />
              </div>
              <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">Tổng tiền</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(stats.tongTien)}</p>
              <p className="text-xs text-gray-600 mt-1">đang quản lý (VND)</p>
            </div>
          </div>
        </div>

        {/* Workflow info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-3">Quy trình xử lý tiền bảo lãnh (Điều 15 NĐ 47/2026)</p>
          <div className="flex items-center gap-2 text-sm text-amber-700">
            {[
              { n: "1", t: "Tiếp nhận tiền" },
              { n: "2", t: "Chuyển tài vụ (≤2 ngày LV)" },
              { n: "3", t: "Xử lý (≤10 ngày LV)" },
              { n: "4", t: "Tịch thu / Hoàn trả" },
            ].map((step, i, arr) => (
              <div key={step.n} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">{step.n}</span>
                  <span className="font-medium">{step.t}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex gap-3 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as TrangThaiBaoLanh | ""); setPage(1); }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(TRANG_THAI_BAO_LANH).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <span className="ml-auto text-sm text-gray-500 self-center">{list.length} bản ghi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Mã BL</th>
                  <th className="px-4 py-3 text-left">Tang vật</th>
                  <th className="px-4 py-3 text-left">Đối tượng</th>
                  <th className="px-4 py-3 text-right">Số tiền</th>
                  <th className="px-4 py-3 text-left">Ngày nộp</th>
                  <th className="px-4 py-3 text-left">Hạn XL</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paged.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                ) : paged.map((t) => {
                  const st = STATUS_STYLES[t.trangThai];
                  const overdue = isOverdue(t);
                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50" : ""}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{t.maBaoLanh}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[160px]">{t.tenTangVat}</p>
                        <p className="text-xs text-gray-500">{t.maBienBan}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.doiTuongTen}</p>
                        <p className="text-xs text-gray-500">{t.doiTuongCccd}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">{fmt(t.soTienBaoLanh)}</td>
                      <td className="px-4 py-3 text-gray-600">{t.ngayNop}</td>
                      <td className="px-4 py-3">
                        {t.hanXuLy ? (
                          <span className={overdue ? "text-red-600 font-semibold" : "text-gray-600"}>
                            {t.hanXuLy} {overdue && "⚠️"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setShowDetailModal(t)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                          {t.trangThai === "cho_chuyen_tai_vu" && (
                            <button onClick={() => handleChuyenTaiVu(t.id)} className="p-1.5 text-gray-400 hover:text-orange-600 rounded" title="Chuyển tài vụ"><ArrowRight className="w-4 h-4" /></button>
                          )}
                          {canProcess && t.trangThai === "cho_xu_ly" && (
                            <button onClick={() => setShowXuLyModal(t)} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Xử lý"><CheckCircle className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
              <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, list.length)} / {list.length} bản ghi</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded border disabled:opacity-40 hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE SIDE PANEL */}
      {showCreateModal && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateModal(false)} />
          {/* Side panel */}
          <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-2xl flex flex-col z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0d3b66]">Tiếp nhận tiền bảo lãnh</h2>
                <p className="text-xs text-gray-400 mt-0.5">Điều 15 NĐ 47/2026/NĐ-CP</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tang vật <span className="text-red-500">*</span></label>
                <select
                  value={form.tangVatId}
                  onChange={(e) => setForm({ ...form, tangVatId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— Chọn tang vật —</option>
                  {tangVatOptions.map((tv) => (
                    <option key={tv.id} value={tv.id}>{tv.ten} ({tv.maTangVat})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên đối tượng <span className="text-red-500">*</span></label>
                  <input value={form.doiTuongTen} onChange={(e) => setForm({ ...form, doiTuongTen: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CCCD <span className="text-red-500">*</span></label>
                  <input value={form.doiTuongCccd} onChange={(e) => setForm({ ...form, doiTuongCccd: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="012345678901" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền bảo lãnh (VNĐ) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={form.soTienBaoLanh}
                  onChange={(e) => setForm({ ...form, soTienBaoLanh: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="50000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do bảo lãnh <span className="text-red-500">*</span></label>
                <textarea value={form.lyDoBaoLanh} onChange={(e) => setForm({ ...form, lyDoBaoLanh: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nộp tiền bảo lãnh để nhận lại..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đặt bảo lãnh</label>
                <input
                  type="date"
                  value={form.ngayDatBaoLanh}
                  onChange={e => {
                    const val = e.target.value;
                    const hanCTV = val ? addBusinessDays(val, 2) : "";
                    const hanXL = val ? addBusinessDays(val, 10) : "";
                    setForm(prev => ({ ...prev, ngayDatBaoLanh: val, hanChuyenTaiVu: hanCTV, ngayHetHanXuLy: hanXL }));
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {(form.hanChuyenTaiVu || form.ngayHetHanXuLy) && (
                  <div className="mt-1 space-y-0.5">
                    {form.hanChuyenTaiVu && (
                      <p className="text-xs text-[#1565c0]">📅 Hạn chuyển tài vụ: <strong>{form.hanChuyenTaiVu}</strong> (2 ngày LV)</p>
                    )}
                    {form.ngayHetHanXuLy && (
                      <p className="text-xs text-[#e65100]">⏰ Hạn xử lý: <strong>{form.ngayHetHanXuLy}</strong> (10 ngày LV)</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Căn cứ pháp lý</label>
                <input value={form.canCuPhapLy} onChange={(e) => setForm({ ...form, canCuPhapLy: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
              <button onClick={() => setShowCreateModal(false)} className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={handleCreate} className="bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]">Tiếp nhận</button>
            </div>
          </div>
        </>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-t-2xl flex justify-between items-start">
              <div>
                <h2 className="text-white font-bold text-lg">{showDetailModal.maBaoLanh}</h2>
                <p className="text-blue-200 text-sm">{showDetailModal.tenTangVat}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[showDetailModal.trangThai].cls}`}>
                {STATUS_STYLES[showDetailModal.trangThai].label}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Đối tượng</p><p className="font-medium">{showDetailModal.doiTuongTen}</p></div>
                <div><p className="text-gray-500">CCCD</p><p className="font-medium">{showDetailModal.doiTuongCccd}</p></div>
                <div><p className="text-gray-500">Số tiền bảo lãnh</p><p className="font-semibold text-blue-700 text-base">{showDetailModal.soTienBaoLanh.toLocaleString("vi-VN")}đ</p></div>
                <div><p className="text-gray-500">Ngày nộp</p><p className="font-medium">{showDetailModal.ngayNop}</p></div>
                <div><p className="text-gray-500">Ngày chuyển tài vụ</p><p className="font-medium">{showDetailModal.ngayChuyenTaiVu ?? "—"}</p></div>
                <div><p className="text-gray-500">Hạn xử lý</p><p className="font-medium">{showDetailModal.hanXuLy ?? "—"}</p></div>
                <div><p className="text-gray-500">Người tiếp nhận</p><p className="font-medium">{showDetailModal.nguoiTiepNhanTen}</p></div>
                <div><p className="text-gray-500">Căn cứ pháp lý</p><p className="font-medium">{showDetailModal.canCuPhapLy}</p></div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Lý do bảo lãnh</p>
                <p className="text-sm mt-1">{showDetailModal.lyDoBaoLanh}</p>
              </div>
              {showDetailModal.ketQuaXuLy && (
                <div className={`rounded-lg p-3 border text-sm ${showDetailModal.ketQuaXuLy === "tich_thu" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                  <p className={`font-semibold ${showDetailModal.ketQuaXuLy === "tich_thu" ? "text-red-800" : "text-green-800"}`}>
                    Kết quả: {showDetailModal.ketQuaXuLy === "tich_thu" ? "Tịch thu sung công quỹ" : "Hoàn trả cho đối tượng"}
                  </p>
                  {showDetailModal.soQuyetDinhXuLy && <p className="text-gray-700 mt-0.5">QĐ: {showDetailModal.soQuyetDinhXuLy} — ngày {showDetailModal.ngayXuLy}</p>}
                  {showDetailModal.soTienNopNganSach && <p className="text-gray-700">Số tiền tịch thu: {showDetailModal.soTienNopNganSach.toLocaleString("vi-VN")}đ</p>}
                  {showDetailModal.soTienHoanTra && <p className="text-gray-700">Số tiền hoàn trả: {showDetailModal.soTienHoanTra.toLocaleString("vi-VN")}đ</p>}
                </div>
              )}
              {showDetailModal.ghiChu && <div><p className="text-gray-500 text-sm">Ghi chú</p><p className="text-sm mt-1">{showDetailModal.ghiChu}</p></div>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setShowDetailModal(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* XU LY MODAL */}
      {showXuLyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 rounded-t-2xl flex justify-between items-start">
              <div>
                <h2 className="text-white font-bold text-lg">Xử lý tiền bảo lãnh</h2>
                <p className="text-green-200 text-sm">{showXuLyModal.tenTangVat} — {showXuLyModal.soTienBaoLanh.toLocaleString("vi-VN")}đ</p>
              </div>
              <button onClick={() => setShowXuLyModal(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kết quả xử lý</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "tich_thu", label: "Tịch thu sung công quỹ", icon: XCircle, color: "border-red-300 bg-red-50 text-red-700" },
                    { value: "hoan_tra", label: "Hoàn trả cho đối tượng", icon: CheckCircle, color: "border-green-300 bg-green-50 text-green-700" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setXuLyForm({ ...xuLyForm, ketQua: opt.value as "tich_thu" | "hoan_tra" })}
                      className={`p-3 border-2 rounded-lg text-sm font-medium text-left transition-all ${xuLyForm.ketQua === opt.value ? opt.color + " border-current" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <opt.icon className="w-4 h-4 mb-1" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số quyết định <span className="text-red-500">*</span></label>
                <input value={xuLyForm.soQuyetDinh} onChange={(e) => setXuLyForm({ ...xuLyForm, soQuyetDinh: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="QĐ-2026-XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea value={xuLyForm.ghiChu} onChange={(e) => setXuLyForm({ ...xuLyForm, ghiChu: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => setShowXuLyModal(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleXuLy} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Xác nhận xử lý</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
