import { useState, useMemo } from "react";
import {
  Warehouse, Package, Plus, X, Search, ChevronRight,
  Users, MapPin, Layers, ChevronLeft, Eye, Camera,
  AlertTriangle, FileText,
} from "lucide-react";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_TANG_VAT, LOAI_TANG_VAT, LOAI_KHO } from "../lib/constants";
import type { Kho, TangVat } from "../lib/types";

const PAGE_SIZE = 8;

function formatNum(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

export function KhoBai() {
  const { kho, tangVat, phieuNhapKho, hoSo, store } = useStoreState();
  const [selectedKho, setSelectedKho] = useState<Kho | null>(kho[0] ?? null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"tang-vat" | "phieu-nhap">("tang-vat");
  const [selectedTv, setSelectedTv] = useState<TangVat | null>(null);
  const [tvPage, setTvPage] = useState(1);
  const [phieuPage, setPhieuPage] = useState(1);

  const [form, setForm] = useState({
    hoSoId: "hs2",
    khoId: kho[0]?.id ?? "kho1",
    ngayNhap: new Date().toISOString().slice(0, 10),
    nguoiGiaoId: "u4",
    ghiChu: "",
  });

  const tangVatTrongKho = useMemo(() => {
    if (!selectedKho) return [];
    const q = search.toLowerCase();
    return tangVat.filter((tv) => {
      const matchKho = tv.khoId === selectedKho.id;
      const matchQ = !q || tv.ten.toLowerCase().includes(q) || tv.maTangVat.toLowerCase().includes(q);
      return matchKho && matchQ;
    });
  }, [tangVat, selectedKho, search]);

  const phieuTrongKho = useMemo(() =>
    phieuNhapKho.filter((p) => p.khoId === selectedKho?.id),
    [phieuNhapKho, selectedKho]
  );

  // Pagination
  const tvTotalPages = Math.max(1, Math.ceil(tangVatTrongKho.length / PAGE_SIZE));
  const tvSafePage = Math.min(tvPage, tvTotalPages);
  const tvPageData = tangVatTrongKho.slice((tvSafePage - 1) * PAGE_SIZE, tvSafePage * PAGE_SIZE);

  const phieuTotalPages = Math.max(1, Math.ceil(phieuTrongKho.length / PAGE_SIZE));
  const phieuSafePage = Math.min(phieuPage, phieuTotalPages);
  const phieuPageData = phieuTrongKho.slice((phieuSafePage - 1) * PAGE_SIZE, phieuSafePage * PAGE_SIZE);

  function handleCreatePhieu() {
    const hs = hoSo.find((h) => h.id === form.hoSoId);
    const khoObj = kho.find((k) => k.id === form.khoId);
    const [y, m, d] = form.ngayNhap.split("-").map(Number);
    const dateStr = `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
    store.addPhieuNhapKho({
      hoSoId: form.hoSoId,
      maBienBan: hs?.maBienBan ?? "",
      khoId: form.khoId,
      khoTen: khoObj?.ten ?? "",
      ngayNhap: dateStr,
      nguoiGiaoId: form.nguoiGiaoId,
      nguoiGiaoTen: "Lê Minh Tuấn",
      nguoiNhanId: store.currentUser.id,
      nguoiNhanTen: store.currentUser.hoTen,
      thuKhoId: khoObj?.thuKhoId ?? "",
      thuKhoTen: khoObj?.thuKhoTen ?? "",
      canBoKiemTraId: store.currentUser.id,
      canBoKiemTraTen: store.currentUser.hoTen,
      trangThai: "hoan_thanh",
      chiTiet: [],
      ghiChu: form.ghiChu,
    });
    setShowCreate(false);
  }

  const getKhoPercent = (k: Kho) => k.sucChua > 0 ? Math.round((k.dangLuu / k.sucChua) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
            <Warehouse className="w-6 h-6" />
            Kho bãi
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{kho.length} kho đang hoạt động</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]"
        >
          <Plus className="w-4 h-4" />
          Tạo phiếu nhập kho
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Danh sach kho */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider px-1">Danh sách kho bãi</h2>
          {kho.map((k) => {
            const pct = getKhoPercent(k);
            const barColor = pct > 80 ? "#c62828" : pct > 60 ? "#e65100" : "#1565c0";
            const isSelected = selectedKho?.id === k.id;
            const tvCount = tangVat.filter((tv) => tv.khoId === k.id).length;
            return (
              <div
                key={k.id}
                onClick={() => { setSelectedKho(k); setTvPage(1); setPhieuPage(1); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "border-[#0d3b66] bg-[#e8eef5]" : "border-gray-100 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isSelected ? "text-[#0d3b66]" : "text-gray-800"}`}>
                      {k.ten}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{k.ma} · {LOAI_KHO[k.loaiKho]}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? "text-[#0d3b66]" : "text-gray-300"}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Công suất sử dụng</span>
                    <span className="font-bold" style={{ color: barColor }}>{pct}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatNum(k.dangLuu)} / {formatNum(k.sucChua)} chỗ</span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" /> {tvCount} tang vật
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {k.thuKhoTen}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" /> {k.dienTich} m²
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chi tiet kho */}
        <div className="xl:col-span-2 space-y-4">
          {selectedKho ? (
            <>
              {/* Kho header */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#0d3b66]">{selectedKho.ten}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedKho.diaChi}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      selectedKho.trangThai === "hoat_dong"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedKho.trangThai === "hoat_dong" ? "Đang hoạt động" : "Bảo trì"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Sức chứa", value: formatNum(selectedKho.sucChua) + " chỗ" },
                    { label: "Đang lưu", value: formatNum(selectedKho.dangLuu) + " chỗ" },
                    { label: "Diện tích", value: formatNum(selectedKho.dienTich) + " m²" },
                    { label: "Thủ kho", value: selectedKho.thuKhoTen },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{s.value}</p>
                    </div>
                  ))}
                </div>

                {selectedKho.ghiChu && (
                  <p className="text-xs text-gray-500 mt-3 italic">{selectedKho.ghiChu}</p>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {[
                  { key: "tang-vat", label: `Tang vật (${tangVatTrongKho.length})` },
                  { key: "phieu-nhap", label: `Phiếu nhập (${phieuTrongKho.length})` },
                ] .map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key as any); setTvPage(1); setPhieuPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tab === t.key ? "bg-white text-[#0d3b66] shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "tang-vat" && (
                <>
                  {/* Search */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
                      placeholder="Tìm trong kho..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setTvPage(1); }}
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Tang vật</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Vị trí</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">SL</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Hạn kho</th>
                          <th className="py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {tangVatTrongKho.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">
                              Kho không có tang vật nào
                            </td>
                          </tr>
                        ) : (
                          tvPageData.map((tv) => {
                            const ttCfg = TRANG_THAI_TANG_VAT[tv.trangThai];
                            const loaiCfg = LOAI_TANG_VAT[tv.loai];
                            const now = new Date();
                            let hanDiff: number | null = null;
                            if (tv.hanLuuKho) {
                              const [d, m, y] = tv.hanLuuKho.split("/").map(Number);
                              hanDiff = Math.ceil((new Date(y, m - 1, d).getTime() - now.getTime()) / 86400000);
                            }
                            return (
                              <tr
                                key={tv.id}
                                className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                                onClick={() => setSelectedTv(tv)}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: loaiCfg?.bg }}>
                                      <Package className="w-3.5 h-3.5" style={{ color: loaiCfg?.color }} />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800 text-xs truncate max-w-36">{tv.ten}</p>
                                      <p className="text-xs text-gray-400">{tv.maTangVat}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-500">{tv.viTriKhoMoTa || "—"}</td>
                                <td className="py-3 px-4 text-xs font-medium whitespace-nowrap">{formatNum(tv.soLuong)} {tv.donViTinh}</td>
                                <td className="py-3 px-4">
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: ttCfg?.bg, color: ttCfg?.color }}>
                                    {ttCfg?.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {hanDiff !== null ? (
                                    <span className="text-xs font-semibold" style={{ color: hanDiff < 0 ? "#c62828" : hanDiff <= 7 ? "#e65100" : hanDiff <= 30 ? "#f57f17" : "#546e7a" }}>
                                      {hanDiff < 0 ? `Quá ${Math.abs(hanDiff)}n` : `Còn ${hanDiff}n`}
                                    </span>
                                  ) : <span className="text-xs text-gray-400">—</span>}
                                  {tv.hanLuuKho && <p className="text-[10px] text-gray-400">{tv.hanLuuKho}</p>}
                                </td>
                                <td className="py-3 px-4">
                                  <Eye className="w-4 h-4 text-gray-300 hover:text-blue-500 transition-colors" />
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                    {tangVatTrongKho.length > 0 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          {Math.min((tvSafePage - 1) * PAGE_SIZE + 1, tangVatTrongKho.length)}–{Math.min(tvSafePage * PAGE_SIZE, tangVatTrongKho.length)} / {tangVatTrongKho.length} tang vật
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setTvPage((p) => Math.max(1, p - 1))} disabled={tvSafePage === 1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs px-2 text-gray-600">{tvSafePage}/{tvTotalPages}</span>
                          <button onClick={() => setTvPage((p) => Math.min(tvTotalPages, p + 1))} disabled={tvSafePage === tvTotalPages} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === "phieu-nhap" && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Số phiếu</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Hồ sơ</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Ngày nhập</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Người giao</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Người nhận</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {phieuTrongKho.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">Chưa có phiếu nhập kho nào</td>
                        </tr>
                      ) : (
                        phieuPageData.map((p) => (
                          <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-3 px-4 font-semibold text-[#0d3b66] text-xs whitespace-nowrap">{p.maPhieu}</td>
                            <td className="py-3 px-4 text-xs text-gray-600">{p.maBienBan}</td>
                            <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{p.ngayNhap}</td>
                            <td className="py-3 px-4 text-xs text-gray-600">{p.nguoiGiaoTen}</td>
                            <td className="py-3 px-4 text-xs text-gray-600">{p.nguoiNhanTen}</td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                p.trangThai === "hoan_thanh" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {p.trangThai === "hoan_thanh" ? "Hoàn thành" : "Chờ duyệt"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {phieuTrongKho.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {Math.min((phieuSafePage - 1) * PAGE_SIZE + 1, phieuTrongKho.length)}–{Math.min(phieuSafePage * PAGE_SIZE, phieuTrongKho.length)} / {phieuTrongKho.length} phiếu
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setPhieuPage((p) => Math.max(1, p - 1))} disabled={phieuSafePage === 1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs px-2 text-gray-600">{phieuSafePage}/{phieuTotalPages}</span>
                        <button onClick={() => setPhieuPage((p) => Math.min(phieuTotalPages, p + 1))} disabled={phieuSafePage === phieuTotalPages} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
              <Warehouse className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chọn một kho để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Tang Vat Detail Modal */}
      {selectedTv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTv(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0d3b66] to-[#1565c0] rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">{selectedTv.maTangVat}</span>
                  <span className="text-xs text-white/60">{selectedTv.maBienBan}</span>
                </div>
                <h2 className="text-base font-bold text-white leading-snug">{selectedTv.ten}</h2>
              </div>
              <button onClick={() => setSelectedTv(null)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const ttCfg = TRANG_THAI_TANG_VAT[selectedTv.trangThai];
                  const loaiCfg = LOAI_TANG_VAT[selectedTv.loai];
                  return (
                    <>
                      <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: ttCfg?.bg, color: ttCfg?.color }}>{ttCfg?.label}</span>
                      <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: loaiCfg?.bg, color: loaiCfg?.color }}>{loaiCfg?.label}</span>
                    </>
                  );
                })()}
              </div>

              {/* Thumbnail */}
              <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center gap-1">
                <Camera className="w-6 h-6 text-gray-400" />
                <p className="text-xs text-gray-400">Chưa có hình ảnh</p>
              </div>

              {/* Đặc điểm */}
              <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
                <p className="text-[11px] font-semibold text-blue-700 mb-1 uppercase tracking-wide">Đặc điểm nhận dạng</p>
                <p className="text-sm text-blue-900">{selectedTv.dacDiemNhanDang}</p>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Số lượng</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{formatNum(selectedTv.soLuong)} {selectedTv.donViTinh}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Giá trị ước tính</p>
                  <p className="text-sm font-bold text-[#0d3b66] mt-0.5">{formatNum(selectedTv.giaTriUocTinh)} đ</p>
                </div>
                {selectedTv.bienSo && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-[10px] text-blue-500 uppercase">Biển số xe</p>
                    <p className="text-sm font-bold text-blue-800 mt-0.5">{selectedTv.bienSo}</p>
                  </div>
                )}
                {selectedTv.hangSanXuat && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase">Hãng / Năm SX</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedTv.hangSanXuat} {selectedTv.namSanXuat}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Vị trí trong kho</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedTv.viTriKhoMoTa || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Ngày nhập kho</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedTv.ngayNhapKho || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Hạn lưu kho</p>
                  <p className="text-sm font-semibold text-amber-600 mt-0.5">{selectedTv.hanLuuKho || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Tình trạng ban đầu</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedTv.tinhTrangBanDau || "—"}</p>
                </div>
              </div>

              {selectedTv.ghiChu && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Ghi chú</p>
                  <p className="text-sm text-amber-800">{selectedTv.ghiChu}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => setSelectedTv(null)} className="w-full border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Phieu Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-[#0d3b66]">Tạo phiếu nhập kho</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hồ sơ vụ việc</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.hoSoId}
                  onChange={(e) => setForm({ ...form, hoSoId: e.target.value })}
                >
                  {hoSo.map((h) => (
                    <option key={h.id} value={h.id}>{h.maBienBan} - {h.doiTuongViPham}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Kho nhập</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.khoId}
                  onChange={(e) => setForm({ ...form, khoId: e.target.value })}
                >
                  {kho.map((k) => (
                    <option key={k.id} value={k.id}>{k.ten}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ngày nhập</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                  value={form.ngayNhap}
                  onChange={(e) => setForm({ ...form, ngayNhap: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ghi chú</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  rows={2}
                  value={form.ghiChu}
                  onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleCreatePhieu} className="flex-1 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]">
                Tạo phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
