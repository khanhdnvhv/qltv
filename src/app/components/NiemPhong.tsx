import { useState, useMemo } from "react";
import {
  Stamp, Plus, Search, CheckCircle2, Lock, Unlock,
  X, Package, Calendar, User, ChevronRight, FileText,
  AlertTriangle, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_NIEM_PHONG } from "../lib/constants";
import type { NiemPhong as NiemPhongType } from "../lib/types";

const STATS_CONFIG = [
  { key: "dang_niem_phong", label: "Đang niêm phong", color: "#1565c0", bg: "#e3f2fd" },
  { key: "da_mo", label: "Đã mở niêm phong", color: "#c62828", bg: "#ffebee" },
  { key: "da_niem_phong_lai", label: "Đã niêm phong lại", color: "#7b1fa2", bg: "#f3e5f5" },
];

type FormData = {
  tangVatId: string;
  tenTangVat: string;
  maBienBan: string;
  moTaTinhTrang: string;
  soTem: string;
  ghiChu: string;
  ngoiChungKienTen: string;
};

export function NiemPhong() {
  const { niemPhong, tangVat, store, currentUser } = useStoreState();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<NiemPhongType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showMoModal, setShowMoModal] = useState<NiemPhongType | null>(null);
  const [lyDoMo, setLyDoMo] = useState("");

  const [form, setForm] = useState<FormData>({
    tangVatId: "",
    tenTangVat: "",
    maBienBan: "",
    moTaTinhTrang: "",
    soTem: "",
    ghiChu: "",
    ngoiChungKienTen: "",
  });

  const filtered = useMemo(() =>
    niemPhong.filter(np => {
      const matchSearch = !search ||
        np.maNiemPhong.toLowerCase().includes(search.toLowerCase()) ||
        np.tenTangVat.toLowerCase().includes(search.toLowerCase()) ||
        np.maBienBan.toLowerCase().includes(search.toLowerCase()) ||
        np.nguoiNiemPhongTen.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || np.trangThai === filterStatus;
      return matchSearch && matchStatus;
    }),
    [niemPhong, search, filterStatus]
  );

  const stats = useMemo(() =>
    STATS_CONFIG.map(s => ({
      ...s,
      value: niemPhong.filter(np => np.trangThai === s.key).length,
    })),
    [niemPhong]
  );

  // Tang vat available for niempphong (dang_luu_kho)
  const tangVatOptions = useMemo(() =>
    tangVat.filter(tv => tv.trangThai === "dang_luu_kho" || tv.trangThai === "cho_nhap_kho"),
    [tangVat]
  );

  const handleTangVatSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tv = tangVat.find(t => t.id === e.target.value);
    if (tv) {
      setForm(prev => ({
        ...prev,
        tangVatId: tv.id,
        tenTangVat: tv.ten,
        maBienBan: tv.maBienBan,
      }));
    }
  };

  const handleCreate = () => {
    if (!form.tangVatId || !form.moTaTinhTrang || !form.soTem) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    store.addNiemPhong({
      tangVatId: form.tangVatId,
      tenTangVat: form.tenTangVat,
      maBienBan: form.maBienBan,
      ngayNiemPhong: new Date().toLocaleDateString("vi-VN"),
      nguoiNiemPhongId: currentUser.id,
      nguoiNiemPhongTen: currentUser.hoTen,
      ngoiChungKienTen: form.ngoiChungKienTen || undefined,
      moTaTinhTrang: form.moTaTinhTrang,
      soTem: form.soTem,
      hinhAnhUrl: "",
      trangThai: "dang_niem_phong",
      ghiChu: form.ghiChu,
    });
    toast.success("Đã tạo biên bản niêm phong");
    setShowCreate(false);
    setForm({ tangVatId: "", tenTangVat: "", maBienBan: "", moTaTinhTrang: "", soTem: "", ghiChu: "", ngoiChungKienTen: "" });
  };

  const handleMoNiemPhong = () => {
    if (!showMoModal || !lyDoMo) {
      toast.error("Vui lòng nhập lý do mở niêm phong");
      return;
    }
    store.updateNiemPhong(showMoModal.id, {
      trangThai: "da_mo",
      ngayMo: new Date().toLocaleDateString("vi-VN"),
      nguoiMoId: currentUser.id,
      nguoiMoTen: currentUser.hoTen,
      lyDoMo,
    });
    toast.success("Đã mở niêm phong");
    setShowMoModal(null);
    setLyDoMo("");
    if (selected?.id === showMoModal.id) setSelected(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
              <Stamp className="w-6 h-6" />
              Quản lý niêm phong
            </h1>
          <p className="text-sm text-gray-500 mt-0.5">Theo dõi tình trạng niêm phong tang vật vi phạm</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo niêm phong
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stamp className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">ĐANG NIÊM PHONG</p>
            <p className="text-2xl font-bold text-gray-900">{stats.find(s => s.key === "dang_niem_phong")?.value ?? 0}</p>
            <p className="text-xs text-gray-600 mt-1">biên bản đang niêm phong</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Unlock className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">ĐÃ MỞ NIÊM PHONG</p>
            <p className="text-2xl font-bold text-gray-900">{stats.find(s => s.key === "da_mo")?.value ?? 0}</p>
            <p className="text-xs text-gray-600 mt-1">biên bản đã mở</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">ĐÃ NIÊM PHONG LẠI</p>
            <p className="text-2xl font-bold text-gray-900">{stats.find(s => s.key === "da_niem_phong_lai")?.value ?? 0}</p>
            <p className="text-xs text-gray-600 mt-1">biên bản niêm phong lại</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm mã niêm phong, tang vật, hồ sơ..."
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
          <option value="dang_niem_phong">Đang niêm phong</option>
          <option value="da_mo">Đã mở niêm phong</option>
          <option value="da_niem_phong_lai">Đã niêm phong lại</option>
        </select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} biên bản</span>
      </div>

      {/* Main layout */}
      <div className={`grid gap-4 ${selected ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
        {/* Table */}
        <div className={`bg-white rounded-xl border border-border shadow-sm overflow-hidden ${selected ? "lg:col-span-2" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {["Mã niêm phong", "Tang vật", "Hồ sơ", "Ngày niêm phong", "Người niêm phong", "Trạng thái", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      <Stamp className="w-10 h-10 mx-auto mb-2 text-[#e2e8f0]" />
                      <p className="text-sm">Không có biên bản niêm phong nào</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(np => {
                    const cfg = TRANG_THAI_NIEM_PHONG[np.trangThai];
                    return (
                      <tr
                        key={np.id}
                        onClick={() => setSelected(selected?.id === np.id ? null : np)}
                        className={`hover:bg-[#f8fafc] cursor-pointer transition-colors ${selected?.id === np.id ? "bg-[#e8eef5]" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[#0d3b66]">{np.maNiemPhong}</p>
                          <p className="text-xs text-muted-foreground">Tem: {np.soTem}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{np.tenTangVat}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-[#e8eef5] text-[#0d3b66] px-2 py-0.5 rounded font-medium">{np.maBienBan}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{np.ngayNiemPhong}</td>
                        <td className="px-4 py-3 text-sm">{np.nguoiNiemPhongTen}</td>
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
              <h3 className="text-[#0d3b66] font-semibold">Chi tiết niêm phong</h3>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-[#1a2332]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status badge */}
            {(() => {
              const cfg = TRANG_THAI_NIEM_PHONG[selected.trangThai];
              return (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ color: cfg.color, backgroundColor: cfg.bg }}
                >
                  <Stamp className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>
              );
            })()}

            {/* Info grid */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Mã niêm phong</p>
                  <p className="font-semibold text-[#0d3b66]">{selected.maNiemPhong}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tang vật</p>
                  <p className="font-medium">{selected.tenTangVat}</p>
                  <p className="text-xs text-[#0d3b66]">{selected.maBienBan}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Ngày niêm phong</p>
                  <p className="font-medium">{selected.ngayNiemPhong}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Người niêm phong</p>
                  <p className="font-medium">{selected.nguoiNiemPhongTen}</p>
                  {selected.ngoiChungKienTen && (
                    <p className="text-xs text-muted-foreground">Chứng kiến: {selected.ngoiChungKienTen}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tem info */}
            <div className="p-3 bg-[#f8fafc] rounded-lg">
              <p className="text-xs text-muted-foreground">Số sêri tem niêm phong</p>
              <p className="text-sm font-bold text-[#0d3b66] mt-0.5">{selected.soTem}</p>
            </div>

            {/* Tinh trang */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tình trạng khi niêm phong</p>
              <p className="text-sm p-3 bg-[#f8fafc] rounded-lg leading-relaxed">{selected.moTaTinhTrang}</p>
            </div>

            {/* Mo niem phong info */}
            {selected.trangThai === "da_mo" && (
              <div className="p-3 bg-[#ffebee] rounded-lg border border-[#ef9a9a]/30">
                <p className="text-xs font-medium text-[#c62828] mb-2">Thông tin mở niêm phong</p>
                <p className="text-xs text-muted-foreground">Ngày mở: <span className="font-medium">{selected.ngayMo}</span></p>
                <p className="text-xs text-muted-foreground">Người mở: <span className="font-medium">{selected.nguoiMoTen}</span></p>
                <p className="text-xs text-muted-foreground mt-1">Lý do: <span className="font-medium">{selected.lyDoMo}</span></p>
              </div>
            )}

            {selected.ghiChu && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                <p className="text-sm text-muted-foreground p-3 bg-[#f8fafc] rounded-lg">{selected.ghiChu}</p>
              </div>
            )}

            {/* Actions */}
            {selected.trangThai === "dang_niem_phong" && (
              <button
                onClick={() => setShowMoModal(selected)}
                className="w-full py-2.5 border border-[#c62828] text-[#c62828] rounded-lg text-sm hover:bg-[#ffebee] flex items-center justify-center gap-2 transition-colors"
              >
                <Unlock className="w-4 h-4" />
                Mở niêm phong
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-2xl flex flex-col z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#0d3b66]">Tạo biên bản niêm phong</h2>
                <p className="text-xs text-gray-400 mt-0.5">Niêm phong tang vật theo quy định</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Tang vật <span className="text-[#c62828]">*</span>
                </label>
                <select
                  value={form.tangVatId}
                  onChange={handleTangVatSelect}
                  className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                >
                  <option value="">-- Chọn tang vật --</option>
                  {tangVatOptions.map(tv => (
                    <option key={tv.id} value={tv.id}>{tv.maTangVat} - {tv.ten}</option>
                  ))}
                </select>
              </div>

              {form.maBienBan && (
                <div className="p-3 bg-[#e8eef5] rounded-lg">
                  <p className="text-xs text-muted-foreground">Hồ sơ vụ việc</p>
                  <p className="text-sm font-medium text-[#0d3b66]">{form.maBienBan}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Tình trạng khi niêm phong <span className="text-[#c62828]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.moTaTinhTrang}
                  onChange={e => setForm(prev => ({ ...prev, moTaTinhTrang: e.target.value }))}
                  placeholder="Mô tả tình trạng tang vật..."
                  className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Số sêri tem <span className="text-[#c62828]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.soTem}
                    onChange={e => setForm(prev => ({ ...prev, soTem: e.target.value }))}
                    placeholder="NP-XXX-2026"
                    className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Người chứng kiến</label>
                  <input
                    type="text"
                    value={form.ngoiChungKienTen}
                    onChange={e => setForm(prev => ({ ...prev, ngoiChungKienTen: e.target.value }))}
                    placeholder="Họ tên..."
                    className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                  />
                </div>
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

              {/* Warning */}
              <div className="p-3 bg-[#fff8e1] rounded-lg border border-[#ffc107]/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#f57f17] mt-0.5 shrink-0" />
                <p className="text-xs text-[#f57f17]">
                  Sau khi tạo, biên bản niêm phong sẽ được ghi vào nhật ký hệ thống.
                  Việc mở niêm phong cần có lý do và phải được ghi nhận.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-[#f8fafc]"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center gap-2"
              >
                <Stamp className="w-4 h-4" />
                Tạo niêm phong
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mo niem phong modal */}
      {showMoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="text-[#c62828] font-bold">Mở niêm phong</h2>
              <button onClick={() => { setShowMoModal(null); setLyDoMo(""); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="p-3 bg-[#ffebee] rounded-lg">
                <p className="text-sm font-medium text-[#c62828]">{showMoModal.maNiemPhong}</p>
                <p className="text-sm text-muted-foreground">{showMoModal.tenTangVat}</p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Lý do mở niêm phong <span className="text-[#c62828]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={lyDoMo}
                  onChange={e => setLyDoMo(e.target.value)}
                  placeholder="Nhập lý do mở niêm phong..."
                  className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
              <button
                onClick={() => { setShowMoModal(null); setLyDoMo(""); }}
                className="px-4 py-2.5 border border-border rounded-lg text-sm hover:bg-[#f8fafc]"
              >
                Hủy
              </button>
              <button
                onClick={handleMoNiemPhong}
                className="px-4 py-2.5 bg-[#c62828] text-white rounded-lg text-sm hover:bg-[#b71c1c] flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Xác nhận mở
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
