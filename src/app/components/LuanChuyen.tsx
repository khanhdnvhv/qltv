import { useState, useMemo } from "react";
import {
  ArrowLeftRight, Plus, X, CheckCircle2, XCircle, Truck,
  ChevronLeft, ChevronRight, Clock, Search,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_LUAN_CHUYEN, LOAI_LUAN_CHUYEN } from "../lib/constants";
import type { TrangThaiLuanChuyen, LoaiLuanChuyen } from "../lib/types";

const FILTER_OPTIONS: { value: TrangThaiLuanChuyen | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "cho_phe_duyet", label: "Chờ phê duyệt" },
  { value: "da_phe_duyet", label: "Đã phê duyệt" },
  { value: "dang_van_chuyen", label: "Đang vận chuyển" },
  { value: "da_ban_giao", label: "Đã bàn giao" },
  { value: "tu_choi", label: "Từ chối" },
];

export function LuanChuyen() {
  const { luanChuyen, tangVat, kho, donVi, store } = useStoreState();
  const [filterTT, setFilterTT] = useState<TrangThaiLuanChuyen | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showCreate, setShowCreate] = useState(false);
  const [showApprove, setShowApprove] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState("");
  const [showBanGiao, setShowBanGiao] = useState<string | null>(null);

  const [form, setForm] = useState({
    tangVatId: tangVat[0]?.id ?? "",
    loaiLuanChuyen: "luan_chuyen_kho" as LoaiLuanChuyen,
    donViNhanId: "dv2",
    khoNhanId: "kho4",
    coQuanNhanTen: "",
    soVanBanYeuCau: "",
    lyDo: "",
    canCuPhapLy: "Điều 27 NĐ 31/2023/NĐ-CP",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return luanChuyen.filter((lc) => {
      const matchTT = !filterTT || lc.trangThai === filterTT;
      const matchQ = !q || lc.tenTangVat.toLowerCase().includes(q) || lc.maLuanChuyen.toLowerCase().includes(q) || lc.maBienBan.toLowerCase().includes(q);
      return matchTT && matchQ;
    });
  }, [luanChuyen, filterTT, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleCreate() {
    if (!form.tangVatId || !form.lyDo || !form.donViNhanId) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (*)", { description: "Tang vật, đơn vị nhận và lý do luân chuyển là bắt buộc." });
      return;
    }
    const tv = tangVat.find((t) => t.id === form.tangVatId);
    const dv = donVi.find((d) => d.id === form.donViNhanId);
    const khoNguon = tv?.khoId ? kho.find((k) => k.id === tv.khoId) : null;
    const khoNhan = kho.find((k) => k.id === form.khoNhanId);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const isTotung = form.loaiLuanChuyen === "chuyen_co_quan_to_tung";
    store.addLuanChuyen({
      tangVatId: form.tangVatId,
      tenTangVat: tv?.ten ?? "",
      maBienBan: tv?.maBienBan ?? "",
      loaiLuanChuyen: form.loaiLuanChuyen,
      khoNguonId: tv?.khoId ?? "",
      khoNguonTen: khoNguon?.ten ?? "",
      donViNhanId: isTotung ? "" : form.donViNhanId,
      donViNhanTen: isTotung ? (form.coQuanNhanTen || (dv?.ten ?? "")) : (dv?.ten ?? ""),
      coQuanNhanTen: isTotung ? form.coQuanNhanTen : undefined,
      soVanBanYeuCau: isTotung ? form.soVanBanYeuCau : undefined,
      khoNhanId: isTotung ? undefined : form.khoNhanId,
      khoNhanTen: isTotung ? undefined : khoNhan?.ten,
      nguoiDeNghiId: store.currentUser.id,
      nguoiDeNghiTen: store.currentUser.hoTen,
      lyDo: form.lyDo,
      canCuPhapLy: form.canCuPhapLy,
      trangThai: "cho_phe_duyet",
      ngayDeNghi: dateStr,
      ghiChu: "",
    });
    setShowCreate(false);
    setForm({ tangVatId: tangVat[0]?.id ?? "", loaiLuanChuyen: "luan_chuyen_kho", donViNhanId: "dv2", khoNhanId: "kho4", coQuanNhanTen: "", soVanBanYeuCau: "", lyDo: "", canCuPhapLy: "Điều 27 NĐ 31/2023/NĐ-CP" });
  }

  function handleApprove() {
    if (!showApprove) return;
    if (showApprove.type === "approve") {
      store.pheChuyenLuanChuyen(showApprove.id, true);
    } else {
      if (!lyDoTuChoi.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
      store.pheChuyenLuanChuyen(showApprove.id, false, lyDoTuChoi);
    }
    setShowApprove(null);
    setLyDoTuChoi("");
  }

  function handleBanGiao(id: string) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    store.updateLuanChuyen(id, { trangThai: "da_ban_giao", ngayBanGiao: dateStr });
    toast.success("Đã xác nhận bàn giao tang vật thành công");
    setShowBanGiao(null);
  }

  const isLeader = ["admin", "lanhdao"].includes(store.currentUser.vaiTro);

  const stats = {
    total: luanChuyen.length,
    choDuyet: luanChuyen.filter((l) => l.trangThai === "cho_phe_duyet").length,
    daPhe: luanChuyen.filter((l) => l.trangThai === "da_phe_duyet").length,
    dangVanChuyen: luanChuyen.filter((l) => l.trangThai === "dang_van_chuyen").length,
    daBanGiao: luanChuyen.filter((l) => l.trangThai === "da_ban_giao").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6" />
            Luân chuyển tang vật
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý đề nghị luân chuyển giữa các đơn vị</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]"
        >
          <Plus className="w-4 h-4" />
          Tạo đề nghị
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Tổng", value: stats.total, color: "#0d3b66" },
          { label: "Chờ duyệt", value: stats.choDuyet, color: "#f57f17" },
          { label: "Đã phê duyệt", value: stats.daPhe, color: "#1565c0" },
          { label: "Đang vận chuyển", value: stats.dangVanChuyen, color: "#7b1fa2" },
          { label: "Đã bàn giao", value: stats.daBanGiao, color: "#2e7d32" },
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
            placeholder="Tìm theo tên, mã luân chuyển, biên bản..."
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
                <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Mã LC</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Tang vật</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Từ kho</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Đến đơn vị</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Lý do</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Ngày đề nghị</th>
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
                pageData.map((lc) => {
                  const ttCfg = TRANG_THAI_LUAN_CHUYEN[lc.trangThai];
                  const Icon = ttCfg.icon;
                  return (
                    <tr key={lc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#0d3b66] text-xs">{lc.maLuanChuyen}</span>
                        <p className="text-xs text-gray-400">{lc.maBienBan}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800 text-xs truncate max-w-36">{lc.tenTangVat}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 truncate max-w-28">{lc.khoNguonTen}</td>
                      <td className="py-3 px-4">
                        <p className="text-xs text-gray-700 truncate max-w-32">{lc.coQuanNhanTen ?? lc.donViNhanTen}</p>
                        {lc.khoNhanTen && <p className="text-xs text-gray-400">{lc.khoNhanTen}</p>}
                        {lc.loaiLuanChuyen && lc.loaiLuanChuyen !== "luan_chuyen_kho" && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block">
                            {LOAI_LUAN_CHUYEN[lc.loaiLuanChuyen]?.label ?? lc.loaiLuanChuyen}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs text-gray-600 line-clamp-2 max-w-36">{lc.lyDo}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-500">{lc.ngayDeNghi}</td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ background: ttCfg.bg, color: ttCfg.color }}
                        >
                          <Icon className="w-3 h-3" />
                          {ttCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {lc.trangThai === "cho_phe_duyet" && isLeader && (
                            <>
                              <button
                                onClick={() => setShowApprove({ id: lc.id, type: "approve" })}
                                className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                                title="Phê duyệt"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setShowApprove({ id: lc.id, type: "reject" })}
                                className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                title="Từ chối"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {(lc.trangThai === "da_phe_duyet" || lc.trangThai === "dang_van_chuyen") && (
                            <button
                              onClick={() => setShowBanGiao(lc.id)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              title="Xác nhận bàn giao"
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {lc.trangThai === "tu_choi" && lc.lyDoTuChoi && (
                            <span className="text-xs text-red-500 italic truncate max-w-24" title={lc.lyDoTuChoi}>
                              {lc.lyDoTuChoi.substring(0, 20)}...
                            </span>
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
          <p className="text-sm text-gray-500">{Math.min((safePage - 1) * pageSize + 1, filtered.length)}–{Math.min(safePage * pageSize, filtered.length)} / {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm px-2">{safePage}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded border border-gray-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-[#0d3b66]">Tạo đề nghị luân chuyển</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Tang vật <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.tangVatId}
                  onChange={(e) => setForm({ ...form, tangVatId: e.target.value })}
                >
                  {tangVat.filter((tv) => ["dang_luu_kho", "cho_xu_ly"].includes(tv.trangThai)).map((tv) => (
                    <option key={tv.id} value={tv.id}>{tv.maTangVat} - {tv.ten}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Loại luân chuyển <span className="text-red-500">*</span></label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.loaiLuanChuyen}
                  onChange={(e) => setForm({ ...form, loaiLuanChuyen: e.target.value as LoaiLuanChuyen })}
                >
                  {Object.entries(LOAI_LUAN_CHUYEN).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              {form.loaiLuanChuyen === "chuyen_co_quan_to_tung" ? (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tên cơ quan tố tụng <span className="text-red-500">*</span></label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                      placeholder="Viện Kiểm sát, Tòa án, Cơ quan điều tra..."
                      value={form.coQuanNhanTen}
                      onChange={(e) => setForm({ ...form, coQuanNhanTen: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số văn bản yêu cầu</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                      placeholder="VB-VKSND-2026-XXX"
                      value={form.soVanBanYeuCau}
                      onChange={(e) => setForm({ ...form, soVanBanYeuCau: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      {form.loaiLuanChuyen === "ban_giao_co_quan_khac" ? "Cơ quan nhận" : "Đơn vị nhận"} <span className="text-red-500">*</span>
                    </label>
                    {form.loaiLuanChuyen === "ban_giao_co_quan_khac" ? (
                      <input
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                        placeholder="Tên cơ quan nhận bàn giao..."
                        value={form.coQuanNhanTen}
                        onChange={(e) => setForm({ ...form, coQuanNhanTen: e.target.value })}
                      />
                    ) : (
                      <select
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                        value={form.donViNhanId}
                        onChange={(e) => setForm({ ...form, donViNhanId: e.target.value })}
                      >
                        {donVi.map((d) => (
                          <option key={d.id} value={d.id}>{d.ten}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Kho nhận (tùy chọn)</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                      value={form.khoNhanId}
                      onChange={(e) => setForm({ ...form, khoNhanId: e.target.value })}
                    >
                      <option value="">-- Chưa xác định --</option>
                      {kho.map((k) => (
                        <option key={k.id} value={k.id}>{k.ten}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Lý do luân chuyển <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  rows={3}
                  placeholder="Nêu rõ lý do cần luân chuyển tang vật..."
                  value={form.lyDo}
                  onChange={(e) => setForm({ ...form, lyDo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Căn cứ pháp lý</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.canCuPhapLy}
                  onChange={(e) => setForm({ ...form, canCuPhapLy: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={handleCreate} className="flex-1 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]">Gửi đề nghị</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm BanGiao modal */}
      {showBanGiao && (() => {
        const lc = luanChuyen.find((l) => l.id === showBanGiao);
        if (!lc) return null;
        return (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Xác nhận bàn giao</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">Xác nhận đã bàn giao tang vật cho đơn vị nhận?</p>
              <div className="bg-blue-50 rounded-xl p-4 space-y-2 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã luân chuyển</span>
                  <span className="font-semibold text-[#0d3b66]">{lc.maLuanChuyen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tang vật</span>
                  <span className="font-semibold text-gray-800 text-right max-w-48 truncate">{lc.tenTangVat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Biên bản</span>
                  <span className="font-medium text-gray-700">{lc.maBienBan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Đơn vị nhận</span>
                  <span className="font-semibold text-gray-800 text-right max-w-48">{lc.coQuanNhanTen ?? lc.donViNhanTen}</span>
                </div>
                {lc.khoNhanTen && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kho nhận</span>
                    <span className="font-medium text-gray-700">{lc.khoNhanTen}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBanGiao(null)}
                  className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleBanGiao(showBanGiao)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  Xác nhận bàn giao
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Approve/Reject modal */}
      {showApprove && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {showApprove.type === "approve" ? "Phê duyệt luân chuyển" : "Từ chối luân chuyển"}
            </h3>
            {showApprove.type === "reject" && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  rows={3}
                  placeholder="Nhập lý do từ chối..."
                  value={lyDoTuChoi}
                  onChange={(e) => setLyDoTuChoi(e.target.value)}
                />
              </div>
            )}
            <p className="text-sm text-gray-600 mb-5">
              {showApprove.type === "approve"
                ? "Bạn có chắc chắn muốn phê duyệt đề nghị luân chuyển này?"
                : "Xác nhận từ chối đề nghị luân chuyển?"}
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
