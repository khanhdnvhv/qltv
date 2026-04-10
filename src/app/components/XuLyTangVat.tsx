import { useState, useMemo } from "react";
import {
  Gavel, Plus, X, CheckCircle2, XCircle, Search,
  ChevronLeft, ChevronRight, FileText, Clock, RefreshCw, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { HINH_THUC_XU_LY, TRANG_THAI_XU_LY } from "../lib/constants";
import type { TrangThaiXuLy, HinhThucXuLy } from "../lib/types";

const FILTER_OPTIONS: { value: TrangThaiXuLy | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "cho_phe_duyet", label: "Chờ phê duyệt" },
  { value: "da_phe_duyet", label: "Đã phê duyệt" },
  { value: "dang_thuc_hien", label: "Đang thực hiện" },
  { value: "hoan_thanh", label: "Hoàn thành" },
  { value: "tu_choi", label: "Từ chối" },
];

const HINH_THUC_OPTIONS: { value: HinhThucXuLy; label: string }[] = [
  { value: "tra_lai", label: "Trả lại chủ sở hữu" },
  { value: "tich_thu", label: "Tịch thu sung công" },
  { value: "tieu_huy", label: "Tiêu hủy" },
  { value: "ban_sung_cong", label: "Bán sung công quỹ" },
];

function formatNum(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function XuLyTangVat() {
  const { xuLy, tangVat, donVi, store } = useStoreState();
  const [filterTT, setFilterTT] = useState<TrangThaiXuLy | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showCreate, setShowCreate] = useState(false);
  const [showApprove, setShowApprove] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState("");
  const [showDetail, setShowDetail] = useState<typeof xuLy[0] | null>(null);

  const [form, setForm] = useState({
    tangVatId: tangVat.find((t) => ["dang_luu_kho", "cho_xu_ly"].includes(t.trangThai))?.id ?? "",
    hinhThuc: "tra_lai" as HinhThucXuLy,
    canCuPhapLy: "",
    quyetDinhSo: "",
    doiTuongTraLai: "",
    cccdNguoiNhan: "",
    soTienBan: 0,
    moTa: "",
    hinhThucTieuHuy: "co_hoc" as "hoa_chat" | "co_hoc" | "dot" | "chon" | "khac",
    hoiDong: [] as Array<{ hoTen: string; chucVu: string; donVi: string; vaiTro: "chu_tich" | "thu_ky" | "thanh_vien" }>,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return xuLy.filter((x) => {
      const matchTT = !filterTT || x.trangThai === filterTT;
      const matchQ = !q || x.tenTangVat.toLowerCase().includes(q) || x.maXuLy.toLowerCase().includes(q) || x.maBienBan.toLowerCase().includes(q);
      return matchTT && matchQ;
    });
  }, [xuLy, filterTT, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = {
    total: xuLy.length,
    choDuyet: xuLy.filter((x) => x.trangThai === "cho_phe_duyet").length,
    daPhe: xuLy.filter((x) => x.trangThai === "da_phe_duyet").length,
    dangTH: xuLy.filter((x) => x.trangThai === "dang_thuc_hien").length,
    hoanThanh: xuLy.filter((x) => x.trangThai === "hoan_thanh").length,
  };

  function handleCreate() {
    if (!form.tangVatId || !form.canCuPhapLy || !form.moTa) {
      toast.error("Vui lòng điền đủ thông tin bắt buộc (*)", { description: "Tang vật, căn cứ pháp lý và mô tả xử lý là bắt buộc." });
      return;
    }
    const tv = tangVat.find((t) => t.id === form.tangVatId);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const chiPhi = form.hinhThuc === "tra_lai" ? store.tinhChiPhiLuuKho(form.tangVatId) : null;
    store.addXuLy({
      tangVatId: form.tangVatId,
      tenTangVat: tv?.ten ?? "",
      maBienBan: tv?.maBienBan ?? "",
      hinhThuc: form.hinhThuc,
      canCuPhapLy: form.canCuPhapLy,
      quyetDinhSo: form.quyetDinhSo || undefined,
      doiTuongTraLai: form.doiTuongTraLai || undefined,
      cccdNguoiNhan: form.cccdNguoiNhan || undefined,
      soTienBan: form.soTienBan || undefined,
      soNgayLuuKho: chiPhi?.soNgay,
      donGiaLuuKho: chiPhi?.donGia,
      chiPhiLuuKho: chiPhi?.tongChi,
      hinhThucTieuHuy: form.hinhThuc === "tieu_huy" ? form.hinhThucTieuHuy : undefined,
      hoiDongTieuHuy: form.hinhThuc === "tieu_huy" && form.hoiDong.length > 0 ? form.hoiDong.map((m, i) => ({ id: `hd-${i}`, ...m })) : undefined,
      nguoiDeXuatId: store.currentUser.id,
      nguoiDeXuatTen: store.currentUser.hoTen,
      trangThai: "cho_phe_duyet",
      ngayDeXuat: dateStr,
      moTa: form.moTa,
      ghiChu: "",
    });
    setShowCreate(false);
  }

  function handleApprove() {
    if (!showApprove) return;
    if (showApprove.type === "approve") {
      store.pheXuLy(showApprove.id, true);
    } else {
      if (!lyDoTuChoi.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
      store.pheXuLy(showApprove.id, false, lyDoTuChoi);
    }
    setShowApprove(null);
    setLyDoTuChoi("");
  }

  const isLeader = ["admin", "lanhdao"].includes(store.currentUser.vaiTro);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
            <Gavel className="w-6 h-6" />
            Xử lý tang vật
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý đề xuất và quyết định xử lý tang vật</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]"
        >
          <Plus className="w-4 h-4" />
          Tạo đề xuất xử lý
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Tổng</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600 mt-1">quyết định xử lý</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Chờ phê duyệt</p>
            <p className="text-2xl font-bold text-gray-900">{stats.choDuyet}</p>
            <p className="text-xs text-gray-600 mt-1">chờ xét duyệt</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-cyan-50 border border-cyan-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">Đã phê duyệt</p>
            <p className="text-2xl font-bold text-gray-900">{stats.daPhe}</p>
            <p className="text-xs text-gray-600 mt-1">đã được duyệt</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Đang thực hiện</p>
            <p className="text-2xl font-bold text-gray-900">{stats.dangTH}</p>
            <p className="text-xs text-gray-600 mt-1">đang xử lý</p>
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
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Hoàn thành</p>
            <p className="text-2xl font-bold text-gray-900">{stats.hoanThanh}</p>
            <p className="text-xs text-gray-600 mt-1">đã hoàn tất</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
            placeholder="Tìm theo tên tang vật, mã, biên bản..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
          value={filterTT}
          onChange={(e) => { setFilterTT(e.target.value as any); setPage(1); }}
        >
          {FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Mã XL</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Tang vật</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Hình thức</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Căn cứ PL</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Người đề xuất</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Ngày đề xuất</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400 text-sm">Không có dữ liệu</td>
                </tr>
              ) : (
                pageData.map((xl) => {
                  const ttCfg = TRANG_THAI_XU_LY[xl.trangThai];
                  const htCfg = HINH_THUC_XU_LY[xl.hinhThuc];
                  const HtIcon = htCfg.icon;
                  return (
                    <tr key={xl.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#0d3b66] text-xs">{xl.maXuLy}</span>
                        <p className="text-xs text-gray-400">{xl.maBienBan}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800 text-xs truncate max-w-36">{xl.tenTangVat}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                          style={{ background: htCfg.bg, color: htCfg.color }}
                        >
                          <HtIcon className="w-3 h-3" />
                          {htCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs text-gray-600 line-clamp-2 max-w-36">{xl.canCuPhapLy}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-600">{xl.nguoiDeXuatTen}</td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-500">{xl.ngayDeXuat}</td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ background: ttCfg.bg, color: ttCfg.color }}
                        >
                          {ttCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setShowDetail(xl)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                            title="Chi tiết"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {xl.trangThai === "cho_phe_duyet" && isLeader && (
                            <>
                              <button
                                onClick={() => setShowApprove({ id: xl.id, type: "approve" })}
                                className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                                title="Phê duyệt"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setShowApprove({ id: xl.id, type: "reject" })}
                                className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                                title="Từ chối"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">{Math.min((safePage-1)*pageSize+1, filtered.length)}–{Math.min(safePage*pageSize, filtered.length)} / {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={safePage===1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm px-2">{safePage}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={safePage===totalPages} className="p-1.5 rounded border border-gray-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-[#0d3b66]">Chi tiết xử lý {showDetail.maXuLy}</h2>
              <button onClick={() => setShowDetail(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Tang vật", value: showDetail.tenTangVat },
                  { label: "Biên bản", value: showDetail.maBienBan },
                  { label: "Hình thức", value: HINH_THUC_XU_LY[showDetail.hinhThuc].label },
                  { label: "Người đề xuất", value: showDetail.nguoiDeXuatTen },
                  { label: "Ngày đề xuất", value: showDetail.ngayDeXuat },
                  { label: "Quyết định số", value: showDetail.quyetDinhSo || "—" },
                  { label: "Ngày quyết định", value: showDetail.ngayQuyetDinh || "—" },
                  { label: "Người phê duyệt", value: showDetail.nguoiPheDuyetTen || "—" },
                  { label: "Ngày phê duyệt", value: showDetail.ngayPheDuyet || "—" },
                  { label: "Trạng thái", value: TRANG_THAI_XU_LY[showDetail.trangThai].label },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              {showDetail.hinhThuc === "tra_lai" && showDetail.doiTuongTraLai && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-800 mb-2">Thông tin trả lại</p>
                  <p className="text-sm text-green-700">Người nhận: {showDetail.doiTuongTraLai}</p>
                  {showDetail.cccdNguoiNhan && <p className="text-sm text-green-700">CCCD: {showDetail.cccdNguoiNhan}</p>}
                </div>
              )}
              {showDetail.hinhThuc === "ban_sung_cong" && showDetail.soTienBan && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800">Số tiền bán: {formatNum(showDetail.soTienBan)} đ</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Căn cứ pháp lý</p>
                <p className="text-sm text-gray-700">{showDetail.canCuPhapLy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Mô tả</p>
                <p className="text-sm text-gray-700">{showDetail.moTa}</p>
              </div>
              {showDetail.lyDoTuChoi && (
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 mb-1">Lý do từ chối</p>
                  <p className="text-sm text-red-600">{showDetail.lyDoTuChoi}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Side Panel */}
      {showCreate && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowCreate(false)} />
          {/* Side panel */}
          <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-2xl flex flex-col z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0d3b66]">Tạo đề xuất xử lý tang vật</h2>
                <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin để tạo đề xuất</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Tang vật <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.tangVatId}
                  onChange={(e) => setForm({ ...form, tangVatId: e.target.value })}
                >
                  {tangVat.filter((tv) => ["dang_luu_kho", "cho_xu_ly", "dang_xu_ly"].includes(tv.trangThai)).map((tv) => (
                    <option key={tv.id} value={tv.id}>{tv.maTangVat} - {tv.ten}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Hình thức xử lý <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.hinhThuc}
                  onChange={(e) => setForm({ ...form, hinhThuc: e.target.value as HinhThucXuLy })}
                >
                  {HINH_THUC_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Căn cứ pháp lý <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  placeholder="Điều khoản, văn bản pháp luật áp dụng..."
                  value={form.canCuPhapLy}
                  onChange={(e) => setForm({ ...form, canCuPhapLy: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số quyết định (nếu có)</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  placeholder="VD: QĐ-2026-016"
                  value={form.quyetDinhSo}
                  onChange={(e) => setForm({ ...form, quyetDinhSo: e.target.value })}
                />
              </div>

              {form.hinhThuc === "tra_lai" && (
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <p className="text-sm font-semibold text-green-800">Thông tin trả lại</p>
                  {form.tangVatId && (() => {
                    const cp = store.tinhChiPhiLuuKho(form.tangVatId);
                    return cp.soNgay > 0 ? (
                      <div className="bg-white border border-green-200 rounded-lg p-3 text-sm">
                        <p className="font-medium text-green-800 mb-1">Chi phí lưu kho (Điều 16 NĐ 47/2026)</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><p className="text-gray-500">Số ngày lưu kho</p><p className="font-semibold">{cp.soNgay} ngày</p></div>
                          <div><p className="text-gray-500">Đơn giá/ngày</p><p className="font-semibold">{cp.donGia.toLocaleString("vi-VN")}đ</p></div>
                          <div><p className="text-gray-500">Tổng chi phí</p><p className="font-semibold text-red-600">{cp.tongChi.toLocaleString("vi-VN")}đ</p></div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Người nhận</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                      placeholder="Họ tên người nhận lại tang vật"
                      value={form.doiTuongTraLai}
                      onChange={(e) => setForm({ ...form, doiTuongTraLai: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">CCCD người nhận</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                      placeholder="12 số CCCD"
                      value={form.cccdNguoiNhan}
                      onChange={(e) => setForm({ ...form, cccdNguoiNhan: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {form.hinhThuc === "tieu_huy" && (
                <div className="bg-red-50 p-4 rounded-lg space-y-3">
                  <p className="text-sm font-semibold text-red-800">Hội đồng tiêu hủy (Điều 17a NĐ 47/2026)</p>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hình thức tiêu hủy</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                      value={form.hinhThucTieuHuy}
                      onChange={(e) => setForm({ ...form, hinhThucTieuHuy: e.target.value as typeof form.hinhThucTieuHuy })}
                    >
                      <option value="co_hoc">Cơ học (nghiền, phá hủy)</option>
                      <option value="hoa_chat">Hóa chất</option>
                      <option value="dot">Đốt</option>
                      <option value="chon">Chôn lấp</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Thành viên hội đồng (tối thiểu 3 người)</p>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, hoiDong: [...form.hoiDong, { hoTen: "", chucVu: "", donVi: "", vaiTro: "thanh_vien" }] })}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded"
                      >+ Thêm</button>
                    </div>
                    {form.hoiDong.length === 0 && (
                      <p className="text-xs text-gray-400 italic">Chưa có thành viên. Nhấn "+ Thêm" để bổ sung.</p>
                    )}
                    {form.hoiDong.map((tv, i) => (
                      <div key={i} className="bg-white rounded-lg p-2 border mb-2 grid grid-cols-4 gap-2 text-xs">
                        <input className="border rounded px-2 py-1 col-span-1" placeholder="Họ tên" value={tv.hoTen} onChange={(e) => { const h = [...form.hoiDong]; h[i] = { ...h[i], hoTen: e.target.value }; setForm({ ...form, hoiDong: h }); }} />
                        <input className="border rounded px-2 py-1" placeholder="Chức vụ" value={tv.chucVu} onChange={(e) => { const h = [...form.hoiDong]; h[i] = { ...h[i], chucVu: e.target.value }; setForm({ ...form, hoiDong: h }); }} />
                        <select className="border rounded px-2 py-1" value={tv.vaiTro} onChange={(e) => { const h = [...form.hoiDong]; h[i] = { ...h[i], vaiTro: e.target.value as "chu_tich" | "thu_ky" | "thanh_vien" }; setForm({ ...form, hoiDong: h }); }}>
                          <option value="chu_tich">Chủ tịch</option>
                          <option value="thu_ky">Thư ký</option>
                          <option value="thanh_vien">Thành viên</option>
                        </select>
                        <button type="button" onClick={() => setForm({ ...form, hoiDong: form.hoiDong.filter((_, j) => j !== i) })} className="text-red-500 hover:text-red-700 text-xs">Xóa</button>
                      </div>
                    ))}
                    {form.hoiDong.length > 0 && form.hoiDong.length < 3 && (
                      <p className="text-xs text-orange-600 mt-1">⚠ Cần ít nhất 3 thành viên hội đồng</p>
                    )}
                  </div>
                </div>
              )}

              {form.hinhThuc === "ban_sung_cong" && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Giá bán (VND)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                    placeholder="0"
                    value={form.soTienBan}
                    onChange={(e) => setForm({ ...form, soTienBan: Number(e.target.value) })}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Mô tả đề xuất <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  rows={3}
                  placeholder="Nêu rõ lý do và mô tả đề xuất xử lý..."
                  value={form.moTa}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
              <button onClick={() => setShowCreate(false)} className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={handleCreate} className="bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]">Gửi đề xuất</button>
            </div>
          </div>
        </>
      )}

      {/* Approve/Reject Modal */}
      {showApprove && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {showApprove.type === "approve" ? "Phê duyệt đề xuất xử lý" : "Từ chối đề xuất xử lý"}
            </h3>
            {showApprove.type === "reject" && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  rows={3}
                  value={lyDoTuChoi}
                  onChange={(e) => setLyDoTuChoi(e.target.value)}
                />
              </div>
            )}
            <p className="text-sm text-gray-600 mb-5">
              {showApprove.type === "approve"
                ? "Xác nhận phê duyệt đề xuất xử lý tang vật này?"
                : "Xác nhận từ chối đề xuất xử lý?"}
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowApprove(null); setLyDoTuChoi(""); }} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Hủy</button>
              <button
                onClick={handleApprove}
                className={`flex-1 text-white px-4 py-2.5 rounded-lg text-sm font-semibold ${showApprove.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {showApprove.type === "approve" ? "Phê duyệt" : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
