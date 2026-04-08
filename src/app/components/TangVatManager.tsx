import { useState, useMemo } from "react";
import {
  Package, Plus, Search, X, ChevronLeft, ChevronRight,
  Warehouse, Calendar, Tag, FileText, Camera, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_TANG_VAT, LOAI_TANG_VAT } from "../lib/constants";
import type { TangVat, TrangThaiTangVat, LoaiTangVat } from "../lib/types";

function formatNum(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}

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

const TRANG_THAI_OPTIONS: { value: TrangThaiTangVat | ""; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "cho_nhap_kho", label: "Chờ nhập kho" },
  { value: "dang_luu_kho", label: "Đang lưu kho" },
  { value: "cho_xu_ly", label: "Chờ xử lý" },
  { value: "dang_xu_ly", label: "Đang xử lý" },
  { value: "da_tra_lai", label: "Đã trả lại" },
  { value: "da_tieu_huy", label: "Đã tiêu hủy" },
  { value: "da_tich_thu", label: "Đã tịch thu" },
  { value: "da_ban", label: "Đã bán sung công" },
];

export function TangVatManager() {
  const { tangVat, kho, donVi, hoSo, store } = useStoreState();
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState<LoaiTangVat | "">("");
  const [filterTT, setFilterTT] = useState<TrangThaiTangVat | "">("");
  const [filterKho, setFilterKho] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selected, setSelected] = useState<TangVat | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<TangVat | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TangVat | null>(null);
  const [editForm, setEditForm] = useState({ ten: "", dacDiemNhanDang: "", tinhTrangBanDau: "", giaTriUocTinh: 0, ghiChu: "" });

  const [form, setForm] = useState({
    hoSoId: "hs1",
    ten: "",
    loai: "phuong_tien_co_gioi" as LoaiTangVat,
    soLuong: 1,
    donViTinh: "chiếc",
    dacDiemNhanDang: "",
    bienSo: "",
    soKhung: "",
    soMay: "",
    hangSanXuat: "",
    namSanXuat: "",
    mauSac: "",
    tinhTrangBanDau: "",
    giaTriUocTinh: 0,
    khoId: "kho1",
    ghiChu: "",
    soGiayPhep: "",
    coQuanCapPhep: "",
    ngayHetHanGiayPhep: "",
    loaiGiayPhep: "",
    hanDungSanPham: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tangVat.filter((tv) => {
      const matchQ = !q ||
        tv.ten.toLowerCase().includes(q) ||
        tv.maTangVat.toLowerCase().includes(q) ||
        tv.maBienBan.toLowerCase().includes(q) ||
        (tv.bienSo && tv.bienSo.toLowerCase().includes(q)) ||
        tv.dacDiemNhanDang.toLowerCase().includes(q);
      const matchLoai = !filterLoai || tv.loai === filterLoai;
      const matchTT = !filterTT || tv.trangThai === filterTT;
      const matchKho = !filterKho || tv.khoId === filterKho;
      return matchQ && matchLoai && matchTT && matchKho;
    });
  }, [tangVat, search, filterLoai, filterTT, filterKho]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const isPhuongTien = ["phuong_tien_co_gioi", "phuong_tien_khac"].includes(form.loai);

  function handleCreate() {
    if (!form.ten || !form.dacDiemNhanDang) {
      toast.error("Vui lòng điền đủ thông tin bắt buộc (*)", { description: "Tên tang vật và đặc điểm nhận dạng là bắt buộc." });
      return;
    }
    const hs = hoSo.find((h) => h.id === form.hoSoId);
    const khoObj = kho.find((k) => k.id === form.khoId);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    store.addTangVat({
      hoSoId: form.hoSoId,
      maBienBan: hs?.maBienBan ?? "",
      ten: form.ten,
      loai: form.loai,
      soLuong: form.soLuong,
      donViTinh: form.donViTinh,
      dacDiemNhanDang: form.dacDiemNhanDang,
      bienSo: form.bienSo || undefined,
      soKhung: form.soKhung || undefined,
      soMay: form.soMay || undefined,
      hangSanXuat: form.hangSanXuat || undefined,
      namSanXuat: form.namSanXuat || undefined,
      mauSac: form.mauSac || undefined,
      tinhTrangBanDau: form.tinhTrangBanDau,
      giaTriUocTinh: form.giaTriUocTinh,
      khoId: form.khoId,
      khoTen: khoObj?.ten,
      trangThai: "cho_nhap_kho",
      ngayNhapKho: dateStr,
      canBoQuanLyId: store.currentUser.id,
      canBoQuanLyTen: store.currentUser.hoTen,
      hinhAnh: [],
      ghiChu: form.ghiChu,
      soGiayPhep: form.soGiayPhep || undefined,
      coQuanCapPhep: form.coQuanCapPhep || undefined,
      ngayHetHanGiayPhep: form.ngayHetHanGiayPhep || undefined,
      loaiGiayPhep: form.loaiGiayPhep || undefined,
      hanDungSanPham: form.hanDungSanPham || undefined,
    });
    setShowCreate(false);
  }

  function handleSaveEdit() {
    if (!showEdit) return;
    if (!editForm.ten) { toast.error("Tên tang vật không được để trống"); return; }
    store.updateTangVat(showEdit.id, {
      ten: editForm.ten,
      dacDiemNhanDang: editForm.dacDiemNhanDang,
      tinhTrangBanDau: editForm.tinhTrangBanDau,
      giaTriUocTinh: editForm.giaTriUocTinh,
      ghiChu: editForm.ghiChu,
    });
    toast.success("Đã cập nhật tang vật");
    setShowEdit(null);
  }

  return (
    <>
      <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
                <Package className="w-6 h-6" />
                Quản lý tang vật
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{tangVat.length} tang vật trong hệ thống</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52]"
            >
              <Plus className="w-4 h-4" />
              Thêm tang vật
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
                placeholder="Tên, mã, biển số, đặc điểm nhận dạng..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
              value={filterLoai}
              onChange={(e) => { setFilterLoai(e.target.value as any); setPage(1); }}
            >
              {LOAI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
              value={filterTT}
              onChange={(e) => { setFilterTT(e.target.value as any); setPage(1); }}
            >
              {TRANG_THAI_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
              value={filterKho}
              onChange={(e) => { setFilterKho(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả kho</option>
              {kho.map((k) => <option key={k.id} value={k.id}>{k.ten}</option>)}
            </select>
            <span className="text-sm text-gray-500 flex items-center px-2">{filtered.length} kết quả</span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Mã tang vật</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Tên tang vật</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Loại</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Số lượng</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Kho lưu trữ</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Hạn lưu kho</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600 whitespace-nowrap">Giá trị ước tính</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-gray-400 text-sm">
                        Không tìm thấy tang vật nào
                      </td>
                    </tr>
                  ) : (
                    pageData.map((tv) => {
                      const ttCfg = TRANG_THAI_TANG_VAT[tv.trangThai];
                      const loaiCfg = LOAI_TANG_VAT[tv.loai];
                      const now = new Date();
                      let hanDiffDays: number | null = null;
                      if (tv.hanLuuKho) {
                        const [d, m, y] = tv.hanLuuKho.split("/").map(Number);
                        const han = new Date(y, m - 1, d);
                        hanDiffDays = Math.ceil((han.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      }
                      return (
                        <tr
                          key={tv.id}
                          onClick={() => setSelected(tv)}
                          className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#0d3b66] text-xs">{tv.maTangVat}</span>
                            <p className="text-xs text-gray-400">{tv.maBienBan}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: loaiCfg?.bg }}
                              >
                                <Package className="w-4 h-4" style={{ color: loaiCfg?.color }} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 truncate max-w-40">{tv.ten}</p>
                                {tv.bienSo && (
                                  <p className="text-xs text-gray-400">BS: {tv.bienSo}</p>
                                )}
                                {tv.ngayHetHanGiayPhep && (() => {
                                  const [d2, m2, y2] = tv.ngayHetHanGiayPhep.split("/").map(Number);
                                  return new Date(y2, m2 - 1, d2) < new Date() ? (
                                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">Hết hạn GP</span>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: loaiCfg?.bg, color: loaiCfg?.color }}
                            >
                              {loaiCfg?.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-700">
                            {formatNum(tv.soLuong)} {tv.donViTinh}
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-xs text-gray-600 truncate max-w-32">{tv.khoTen || "—"}</p>
                            {tv.viTriKhoMoTa && (
                              <p className="text-xs text-gray-400 truncate max-w-32">{tv.viTriKhoMoTa}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {hanDiffDays !== null ? (
                              <span
                                className="text-xs font-semibold"
                                style={{
                                  color: hanDiffDays < 0 ? "#c62828" : hanDiffDays <= 7 ? "#e65100" : hanDiffDays <= 30 ? "#f57f17" : "#546e7a"
                                }}
                              >
                                {hanDiffDays < 0 ? `Quá ${Math.abs(hanDiffDays)} ngày` : `Còn ${hanDiffDays} ngày`}
                              </span>
                            ) : "—"}
                            {tv.hanLuuKho && <p className="text-xs text-gray-400">{tv.hanLuuKho}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                              style={{ background: ttCfg?.bg, color: ttCfg?.color }}
                            >
                              {ttCfg?.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-700">
                            {formatNum(tv.giaTriUocTinh * tv.soLuong)} đ
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                title="Chỉnh sửa"
                                onClick={() => { setEditForm({ ten: tv.ten, dacDiemNhanDang: tv.dacDiemNhanDang, tinhTrangBanDau: tv.tinhTrangBanDau || "", giaTriUocTinh: tv.giaTriUocTinh, ghiChu: tv.ghiChu || "" }); setShowEdit(tv); }}
                                className="p-1.5 hover:bg-amber-50 rounded-md transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-amber-600" />
                              </button>
                              <button
                                title="Xóa"
                                onClick={() => setConfirmDelete(tv)}
                                className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {Math.min((safePage - 1) * pageSize + 1, filtered.length)}–{Math.min(safePage * pageSize, filtered.length)} / {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm px-2">{safePage}/{totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#0d3b66] to-[#1565c0] rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-white/60 bg-white/10 px-2 py-0.5 rounded">{selected.maTangVat}</span>
                  <span className="text-xs text-white/60">{selected.maBienBan}</span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">{selected.ten}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const ttCfg = TRANG_THAI_TANG_VAT[selected.trangThai];
                  const loaiCfg = LOAI_TANG_VAT[selected.loai];
                  return (
                    <>
                      <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: ttCfg?.bg, color: ttCfg?.color }}>{ttCfg?.label}</span>
                      <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: loaiCfg?.bg, color: loaiCfg?.color }}>{loaiCfg?.label}</span>
                    </>
                  );
                })()}
              </div>

              {/* Thumbnail */}
              <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5">
                <Camera className="w-7 h-7 text-gray-400" />
                <p className="text-xs text-gray-400">Chưa có hình ảnh</p>
              </div>

              {/* Đặc điểm */}
              <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100">
                <p className="text-[11px] font-semibold text-blue-700 mb-1 uppercase tracking-wide">Đặc điểm nhận dạng</p>
                <p className="text-sm text-blue-900">{selected.dacDiemNhanDang}</p>
              </div>

              {/* 2-col grid info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Số lượng</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{formatNum(selected.soLuong)} {selected.donViTinh}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Giá trị ước tính</p>
                  <p className="text-sm font-bold text-[#0d3b66] mt-0.5">{formatNum(selected.giaTriUocTinh)} đ</p>
                </div>
                {selected.bienSo && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-[10px] text-blue-500 uppercase">Biển số xe</p>
                    <p className="text-sm font-bold text-blue-800 mt-0.5">{selected.bienSo}</p>
                  </div>
                )}
                {selected.hangSanXuat && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase">Hãng / Năm SX</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{selected.hangSanXuat} {selected.namSanXuat}</p>
                  </div>
                )}
                {selected.soKhung && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase">Số khung</p>
                    <p className="text-xs font-mono text-gray-700 mt-0.5">{selected.soKhung}</p>
                  </div>
                )}
                {selected.soMay && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase">Số máy</p>
                    <p className="text-xs font-mono text-gray-700 mt-0.5">{selected.soMay}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Kho lưu trữ</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{selected.khoTen || "—"}</p>
                  {selected.viTriKhoMoTa && <p className="text-xs text-gray-500">{selected.viTriKhoMoTa}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Ngày nhập kho</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{selected.ngayNhapKho || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Hạn lưu kho</p>
                  <p className="text-sm font-semibold text-amber-600 mt-0.5">{selected.hanLuuKho || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase">Tình trạng ban đầu</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{selected.tinhTrangBanDau || "—"}</p>
                </div>
              </div>

              {/* Ghi chú */}
              {selected.ghiChu && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Ghi chú</p>
                  <p className="text-sm text-amber-800">{selected.ghiChu}</p>
                </div>
              )}

              {/* Cập nhật trạng thái */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Cập nhật trạng thái</p>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0d3b66]"
                  value={selected.trangThai}
                  onChange={(e) => {
                    const tt = e.target.value as TrangThaiTangVat;
                    store.updateTrangThaiTangVat(selected.id, tt);
                    setSelected({ ...selected, trangThai: tt });
                  }}
                >
                  {TRANG_THAI_OPTIONS.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setSelected(null)}
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
              <h2 className="text-xl font-bold text-[#0d3b66]">Thêm tang vật mới</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hồ sơ vụ việc</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={form.hoSoId}
                    onChange={(e) => setForm({ ...form, hoSoId: e.target.value })}
                  >
                    {hoSo.map((h) => (
                      <option key={h.id} value={h.id}>{h.maBienBan} - {h.doiTuongViPham}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Loại tang vật</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={form.loai}
                    onChange={(e) => setForm({ ...form, loai: e.target.value as LoaiTangVat })}
                  >
                    {LOAI_OPTIONS.filter((o) => o.value).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Tên tang vật <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  placeholder="VD: Xe máy Honda Wave Alpha đời 2020"
                  value={form.ten}
                  onChange={(e) => setForm({ ...form, ten: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số lượng</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={form.soLuong}
                    onChange={(e) => setForm({ ...form, soLuong: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Đơn vị tính</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="chiếc, kg, lít..."
                    value={form.donViTinh}
                    onChange={(e) => setForm({ ...form, donViTinh: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Giá trị ước tính (đ)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="0"
                    value={form.giaTriUocTinh}
                    onChange={(e) => setForm({ ...form, giaTriUocTinh: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Đặc điểm nhận dạng <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  placeholder="Mô tả màu sắc, đặc điểm nổi bật, tình trạng..."
                  value={form.dacDiemNhanDang}
                  onChange={(e) => setForm({ ...form, dacDiemNhanDang: e.target.value })}
                />
              </div>

              {isPhuongTien && (
                <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Biển số xe</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      placeholder="VD: 88B1-123.45"
                      value={form.bienSo}
                      onChange={(e) => setForm({ ...form, bienSo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hãng sản xuất</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      placeholder="Honda, Toyota, Yamaha..."
                      value={form.hangSanXuat}
                      onChange={(e) => setForm({ ...form, hangSanXuat: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số khung</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      placeholder="Số khung xe"
                      value={form.soKhung}
                      onChange={(e) => setForm({ ...form, soKhung: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số máy</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      placeholder="Số máy xe"
                      value={form.soMay}
                      onChange={(e) => setForm({ ...form, soMay: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Năm sản xuất</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      placeholder="VD: 2022"
                      value={form.namSanXuat}
                      onChange={(e) => setForm({ ...form, namSanXuat: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Màu sắc</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      placeholder="VD: Đỏ đen"
                      value={form.mauSac}
                      onChange={(e) => setForm({ ...form, mauSac: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {form.loai === "giay_phep_chung_chi" && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-purple-800">Thông tin giấy phép / chứng chỉ</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Số giấy phép</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" placeholder="GP-2026-XXX" value={form.soGiayPhep} onChange={(e) => setForm({ ...form, soGiayPhep: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Loại giấy phép</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" placeholder="Giấy phép kinh doanh, GPXD..." value={form.loaiGiayPhep} onChange={(e) => setForm({ ...form, loaiGiayPhep: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Cơ quan cấp phép</label>
                      <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" placeholder="UBND tỉnh, Bộ..." value={form.coQuanCapPhep} onChange={(e) => setForm({ ...form, coQuanCapPhep: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ngày hết hạn</label>
                      <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" value={form.ngayHetHanGiayPhep} onChange={(e) => setForm({ ...form, ngayHetHanGiayPhep: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {["thuc_pham", "thuoc"].includes(form.loai) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-orange-800 mb-2">Hạn dùng sản phẩm</p>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hạn dùng / Hạn sử dụng</label>
                    <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400" value={form.hanDungSanPham} onChange={(e) => setForm({ ...form, hanDungSanPham: e.target.value })} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tình trạng ban đầu</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  placeholder="Mô tả tình trạng tại thời điểm tịch thu"
                  value={form.tinhTrangBanDau}
                  onChange={(e) => setForm({ ...form, tinhTrangBanDau: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Kho lưu trữ</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  value={form.khoId}
                  onChange={(e) => setForm({ ...form, khoId: e.target.value })}
                >
                  {kho.map((k) => (
                    <option key={k.id} value={k.id}>{k.ten}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Ghi chú</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={2}
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
                Thêm tang vật
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
                <h2 className="text-lg font-bold text-[#0d3b66]">Chỉnh sửa tang vật</h2>
                <p className="text-xs text-gray-400 mt-0.5">{showEdit.maTangVat}</p>
              </div>
              <button onClick={() => setShowEdit(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Tên tang vật <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  value={editForm.ten}
                  onChange={(e) => setEditForm({ ...editForm, ten: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Đặc điểm nhận dạng</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                  rows={2}
                  value={editForm.dacDiemNhanDang}
                  onChange={(e) => setEditForm({ ...editForm, dacDiemNhanDang: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tình trạng ban đầu</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={editForm.tinhTrangBanDau}
                    onChange={(e) => setEditForm({ ...editForm, tinhTrangBanDau: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Giá trị ước tính (đ)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    value={editForm.giaTriUocTinh}
                    onChange={(e) => setEditForm({ ...editForm, giaTriUocTinh: Number(e.target.value) })}
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
                <h3 className="text-base font-bold text-gray-900">Xóa tang vật?</h3>
                <p className="text-sm text-gray-500 mt-0.5">{confirmDelete.maTangVat} · {confirmDelete.ten}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              Hành động này sẽ xóa vĩnh viễn tang vật khỏi hệ thống và không thể khôi phục.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={() => {
                  store.deleteTangVat(confirmDelete.id);
                  toast.success(`Đã xóa tang vật ${confirmDelete.maTangVat}`);
                  if (selected?.id === confirmDelete.id) setSelected(null);
                  setConfirmDelete(null);
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Xóa tang vật
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
