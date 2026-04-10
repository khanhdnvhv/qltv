import { useState } from "react";
import { toast } from "sonner";
import {
  CarFront, Plus, Eye, CheckCircle, XCircle, RotateCcw, ChevronLeft, ChevronRight,
  AlertTriangle, Clock, CheckCheck, UserCheck, TrendingUp, CheckCircle2,
} from "lucide-react";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_GIAO_TU_GIU } from "../lib/constants";
import type { GiaoTuGiu as TGiaoTuGiu, TrangThaiGiaoTuGiu } from "../lib/types";

const PAGE_SIZE = 8;

function addBusinessDays(dateStr: string, days: number): string {
  // dateStr có thể là "YYYY-MM-DD" (từ input date) hoặc "DD/MM/YYYY"
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

const STATUS_STYLES: Record<TrangThaiGiaoTuGiu, { cls: string; label: string }> = {
  cho_xet_duyet: { cls: "bg-yellow-100 text-yellow-800", label: "Chờ xét duyệt" },
  da_duyet: { cls: "bg-blue-100 text-blue-800", label: "Đã duyệt" },
  dang_tu_giu: { cls: "bg-indigo-100 text-indigo-800", label: "Đang tự giữ" },
  da_thu_hoi: { cls: "bg-green-100 text-green-800", label: "Đã thu hồi" },
  tu_choi: { cls: "bg-gray-100 text-gray-700", label: "Từ chối" },
};

export function GiaoTuGiu() {
  const { store, currentUser } = useStoreState();
  const canApprove = ["admin", "lanhdao"].includes(currentUser.vaiTro);
  const canCreate = ["admin", "canbonv", "thukho"].includes(currentUser.vaiTro);

  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<TrangThaiGiaoTuGiu | "">("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<TGiaoTuGiu | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<TGiaoTuGiu | null>(null);
  const [showThuHoiModal, setShowThuHoiModal] = useState<TGiaoTuGiu | null>(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState("");
  const [lyDoThuHoi, setLyDoThuHoi] = useState("");

  const [form, setForm] = useState({
    tangVatId: "", tenTangVat: "", maBienBan: "", hoSoId: "",
    doiTuongTen: "", doiTuongCccd: "", doiTuongDiaChi: "", doiTuongSdt: "",
    lyDoGiao: "", canCuPhapLy: "Điều 14 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    dieuKienGiu: "", ghiChu: "",
    ngayNopDon: "", hanXetDuyet: "",
  });

  const list = store.giaoTuGiu.filter((g) => !filterStatus || g.trangThai === filterStatus);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paged = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tangVatOptions = store.tangVat.filter((t) => ["dang_luu_kho", "cho_xu_ly"].includes(t.trangThai));

  function handleCreate() {
    if (!form.tangVatId || !form.doiTuongTen || !form.doiTuongCccd || !form.lyDoGiao || !form.dieuKienGiu) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    const tv = store.tangVat.find((t) => t.id === form.tangVatId);
    store.addGiaoTuGiu({
      ...form,
      tenTangVat: tv?.ten ?? form.tenTangVat,
      maBienBan: tv?.maBienBan ?? form.maBienBan,
      nguoiDeXuatId: currentUser.id,
      nguoiDeXuatTen: currentUser.hoTen,
      trangThai: "cho_xet_duyet" as TrangThaiGiaoTuGiu,
    });
    toast.success("Đã tạo đề xuất giao tự giữ");
    setShowCreateModal(false);
    setForm({ tangVatId: "", tenTangVat: "", maBienBan: "", hoSoId: "", doiTuongTen: "", doiTuongCccd: "", doiTuongDiaChi: "", doiTuongSdt: "", lyDoGiao: "", canCuPhapLy: "Điều 14 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)", dieuKienGiu: "", ghiChu: "", ngayNopDon: "", hanXetDuyet: "" });
  }

  function handleApprove(approved: boolean) {
    if (!showApproveModal) return;
    if (!approved && !lyDoTuChoi.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    store.xetDuyetGiaoTuGiu(showApproveModal.id, approved, lyDoTuChoi);
    toast.success(approved ? "Đã phê duyệt giao tự giữ" : "Đã từ chối đề xuất");
    setShowApproveModal(null);
    setLyDoTuChoi("");
  }

  function handleThuHoi() {
    if (!showThuHoiModal) return;
    if (!lyDoThuHoi.trim()) { toast.error("Vui lòng nhập lý do thu hồi"); return; }
    store.thuHoiTuGiu(showThuHoiModal.id, lyDoThuHoi);
    toast.success("Đã thu hồi tang vật tự giữ");
    setShowThuHoiModal(null);
    setLyDoThuHoi("");
  }

  const stats = {
    choPD: store.giaoTuGiu.filter((g) => g.trangThai === "cho_xet_duyet").length,
    dangTG: store.giaoTuGiu.filter((g) => g.trangThai === "dang_tu_giu").length,
    daHT: store.giaoTuGiu.filter((g) => g.trangThai === "da_thu_hoi").length,
    thuHoi: store.giaoTuGiu.filter((g) => g.trangThai === "tu_choi").length,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giao Tự Giữ Tang Vật</h1>
            <p className="text-sm text-gray-500 mt-1">Điều 14 NĐ 47/2026/NĐ-CP — Cho phép đối tượng tự giữ tang vật</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <Plus className="w-4 h-4" /> Tạo đề xuất
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
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Chờ xét duyệt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.choPD}</p>
              <p className="text-xs text-gray-600 mt-1">đang chờ xét duyệt</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CarFront className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Đang tự giữ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.dangTG}</p>
              <p className="text-xs text-gray-600 mt-1">phương tiện tự giữ</p>
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
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Đã hoàn tất</p>
              <p className="text-2xl font-bold text-gray-900">{stats.daHT}</p>
              <p className="text-xs text-gray-600 mt-1">đã thu hồi</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Từ chối</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thuHoi}</p>
              <p className="text-xs text-gray-600 mt-1">bị từ chối</p>
            </div>
          </div>
        </div>

        {/* Legal info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Quy định giao tự giữ (Điều 14 NĐ 47/2026)</p>
            <p className="mt-1">Người vi phạm có thể được giao tự giữ tang vật khi: có nơi cư trú ổn định, tang vật không có nguy cơ tẩu tán/phá hủy, và đáp ứng điều kiện bảo quản. Thời hạn tối đa 90 ngày, kiểm tra định kỳ 30 ngày/lần.</p>
          </div>
        </div>

        {/* Filter + Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex gap-3 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value as TrangThaiGiaoTuGiu | ""); setPage(1); }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(TRANG_THAI_GIAO_TU_GIU).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <span className="ml-auto text-sm text-gray-500 self-center">{list.length} bản ghi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Mã</th>
                  <th className="px-4 py-3 text-left">Tang vật</th>
                  <th className="px-4 py-3 text-left">Đối tượng</th>
                  <th className="px-4 py-3 text-left">Ngày giao</th>
                  <th className="px-4 py-3 text-left">Hạn tự giữ</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paged.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có dữ liệu</td></tr>
                ) : paged.map((g) => {
                  const st = STATUS_STYLES[g.trangThai];
                  const isOverdue = g.hanTuGiu && g.trangThai === "dang_tu_giu" && (() => {
                    const [d, m, y] = g.hanTuGiu!.split("/").map(Number);
                    return new Date(y, m - 1, d) < new Date();
                  })();
                  return (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{g.maGiaoTuGiu}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">{g.tenTangVat}</p>
                        <p className="text-xs text-gray-500">{g.maBienBan}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{g.doiTuongTen}</p>
                        <p className="text-xs text-gray-500">{g.doiTuongCccd}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{g.ngayGiao ?? "—"}</td>
                      <td className="px-4 py-3">
                        {g.hanTuGiu ? (
                          <span className={isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}>
                            {g.hanTuGiu} {isOverdue && "⚠️"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setShowDetailModal(g)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                          {canApprove && g.trangThai === "cho_xet_duyet" && (
                            <button onClick={() => setShowApproveModal(g)} className="p-1.5 text-gray-400 hover:text-green-600 rounded" title="Xét duyệt"><UserCheck className="w-4 h-4" /></button>
                          )}
                          {g.trangThai === "dang_tu_giu" && (
                            <button onClick={() => setShowThuHoiModal(g)} className="p-1.5 text-gray-400 hover:text-red-600 rounded" title="Thu hồi"><RotateCcw className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Tạo đề xuất giao tự giữ</h2>
              <p className="text-blue-200 text-sm mt-0.5">Điều 14 NĐ 47/2026/NĐ-CP</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">CCCD/CMND <span className="text-red-500">*</span></label>
                  <input value={form.doiTuongCccd} onChange={(e) => setForm({ ...form, doiTuongCccd: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="012345678901" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input value={form.doiTuongSdt} onChange={(e) => setForm({ ...form, doiTuongSdt: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0912345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input value={form.doiTuongDiaChi} onChange={(e) => setForm({ ...form, doiTuongDiaChi: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Địa chỉ cư trú" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do giao tự giữ <span className="text-red-500">*</span></label>
                <textarea value={form.lyDoGiao} onChange={(e) => setForm({ ...form, lyDoGiao: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Đối tượng có nơi cư trú ổn định..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điều kiện tự giữ <span className="text-red-500">*</span></label>
                <textarea value={form.dieuKienGiu} onChange={(e) => setForm({ ...form, dieuKienGiu: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Không được sử dụng, không rời địa phương..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nộp đơn</label>
                <input
                  type="date"
                  value={form.ngayNopDon}
                  onChange={e => {
                    const val = e.target.value;
                    const han = val ? addBusinessDays(val, 3) : "";
                    setForm(prev => ({ ...prev, ngayNopDon: val, hanXetDuyet: han }));
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                {form.hanXetDuyet && (
                  <p className="text-xs text-[#e65100] mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Hạn xét duyệt: <strong>{form.hanXetDuyet}</strong> (3 ngày làm việc)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Căn cứ pháp lý</label>
                <input value={form.canCuPhapLy} onChange={(e) => setForm({ ...form, canCuPhapLy: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tạo đề xuất</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 rounded-t-2xl flex justify-between items-start">
              <div>
                <h2 className="text-white font-bold text-lg">{showDetailModal.maGiaoTuGiu}</h2>
                <p className="text-indigo-200 text-sm mt-0.5">{showDetailModal.tenTangVat}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[showDetailModal.trangThai].cls}`}>
                {STATUS_STYLES[showDetailModal.trangThai].label}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">Tang vật</p><p className="font-medium">{showDetailModal.tenTangVat}</p></div>
                <div><p className="text-gray-500">Biên bản</p><p className="font-medium">{showDetailModal.maBienBan}</p></div>
                <div><p className="text-gray-500">Đối tượng</p><p className="font-medium">{showDetailModal.doiTuongTen}</p></div>
                <div><p className="text-gray-500">CCCD</p><p className="font-medium">{showDetailModal.doiTuongCccd}</p></div>
                <div><p className="text-gray-500">SĐT</p><p className="font-medium">{showDetailModal.doiTuongSdt ?? "—"}</p></div>
                <div><p className="text-gray-500">Địa chỉ</p><p className="font-medium">{showDetailModal.doiTuongDiaChi ?? "—"}</p></div>
                <div><p className="text-gray-500">Ngày giao</p><p className="font-medium">{showDetailModal.ngayGiao ?? "—"}</p></div>
                <div><p className="text-gray-500">Hạn tự giữ</p><p className="font-medium">{showDetailModal.hanTuGiu ?? "—"}</p></div>
                <div><p className="text-gray-500">Người đề xuất</p><p className="font-medium">{showDetailModal.nguoiDeXuatTen}</p></div>
                <div><p className="text-gray-500">Người phê duyệt</p><p className="font-medium">{showDetailModal.nguoiPheDuyetTen ?? "—"}</p></div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Lý do giao</p>
                <p className="mt-1 text-sm">{showDetailModal.lyDoGiao}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Điều kiện tự giữ</p>
                <p className="mt-1 text-sm">{showDetailModal.dieuKienGiu}</p>
              </div>
              {showDetailModal.ketQuaKiemTra && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Kết quả kiểm tra ({showDetailModal.ngayKiemTra})</p>
                  <p className="text-sm text-green-700 mt-1">{showDetailModal.ketQuaKiemTra}</p>
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

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Xét duyệt giao tự giữ</h2>
              <p className="text-green-200 text-sm">{showApproveModal.tenTangVat} — {showApproveModal.doiTuongTen}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-gray-500">Lý do đề xuất:</span> {showApproveModal.lyDoGiao}</p>
                <p><span className="text-gray-500">Điều kiện:</span> {showApproveModal.dieuKienGiu}</p>
                <p><span className="text-gray-500">Căn cứ:</span> {showApproveModal.canCuPhapLy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối (nếu từ chối)</label>
                <textarea value={lyDoTuChoi} onChange={(e) => setLyDoTuChoi(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nhập lý do từ chối..." />
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { setShowApproveModal(null); setLyDoTuChoi(""); }} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={() => handleApprove(false)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Từ chối
              </button>
              <button onClick={() => handleApprove(true)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THU HOI MODAL */}
      {showThuHoiModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Thu hồi tang vật tự giữ</h2>
              <p className="text-red-200 text-sm">{showThuHoiModal.tenTangVat}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <p className="font-medium">Lưu ý:</p>
                <p>Thu hồi tang vật sẽ chấm dứt quyền tự giữ của đối tượng. Hành động này không thể hoàn tác.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do thu hồi <span className="text-red-500">*</span></label>
                <textarea value={lyDoThuHoi} onChange={(e) => setLyDoThuHoi(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Vi phạm điều kiện tự giữ..." />
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-2">
              <button onClick={() => { setShowThuHoiModal(null); setLyDoThuHoi(""); }} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleThuHoi} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Xác nhận thu hồi</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
