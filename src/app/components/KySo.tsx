import { useState, useMemo } from "react";
import {
  FileText, CheckCircle2, Clock, Pen, Download, Eye,
  Search, Shield, AlertTriangle, X, Lock, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_VAN_BAN, LOAI_VAN_BAN } from "../lib/constants";
import type { VanBan } from "../lib/types";

export function KySo() {
  const { vanBan, currentUser, store } = useStoreState();
  const [filter, setFilter] = useState("all");
  const [signModal, setSignModal] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<VanBan | null>(null);
  const [pin, setPin] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    vanBan.filter(d => {
      const matchFilter = filter === "all" || d.trangThai === filter;
      const matchSearch = !search ||
        d.maVanBan.toLowerCase().includes(search.toLowerCase()) ||
        d.tieuDe.toLowerCase().includes(search.toLowerCase()) ||
        (d.maBienBan ?? "").toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    }),
    [vanBan, filter, search]
  );

  const stats = useMemo(() => [
    { label: "Tổng văn bản", value: vanBan.length, icon: FileText, color: "#0d3b66" },
    { label: "Đã ký số", value: vanBan.filter(d => d.trangThai === "da_ky").length, icon: CheckCircle2, color: "#2e7d32" },
    { label: "Chờ ký", value: vanBan.filter(d => d.trangThai === "cho_ky").length, icon: Clock, color: "#f9a825" },
    { label: "Từ chối", value: vanBan.filter(d => d.trangThai === "tu_choi").length, icon: AlertTriangle, color: "#c62828" },
  ], [vanBan]);

  const handleSign = (id: string) => {
    if (pin.length < 4) {
      toast.error("Vui lòng nhập PIN (ít nhất 4 ký tự)");
      return;
    }
    store.kyVanBan(id);
    const vb = vanBan.find(v => v.id === id);
    toast.success(`Đã ký số văn bản ${vb?.maVanBan} thành công!`);
    setSignModal(null);
    setPin("");
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    store.tuChoiVanBan(id, rejectReason);
    toast.success("Đã từ chối ký văn bản");
    setRejectModal(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0d3b66]">Ký duyệt văn bản</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ký số điện tử quyết định xử lý, biên bản bàn giao và các văn bản tang vật
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "18" }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm mã văn bản, tiêu đề, hồ sơ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Tất cả" },
            { value: "cho_ky", label: "Chờ ký" },
            { value: "da_ky", label: "Đã ký" },
            { value: "nhap", label: "Nháp" },
            { value: "tu_choi", label: "Từ chối" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === f.value ? "bg-[#0d3b66] text-white" : "bg-white border border-border text-[#5a6a7e] hover:bg-[#f8fafc]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 text-[#e2e8f0]" />
            <p>Không có văn bản nào</p>
          </div>
        ) : (
          filtered.map((doc) => {
            const s = TRANG_THAI_VAN_BAN[doc.trangThai];
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#e8eef5] flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-[#0d3b66]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-[#0d3b66] font-semibold">{doc.maVanBan}</p>
                        <span className="text-xs px-2 py-0.5 bg-[#e8eef5] text-[#0d3b66] rounded">
                          {LOAI_VAN_BAN[doc.loaiVanBan] ?? doc.loaiVanBan}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-medium truncate">{doc.tieuDe}</h4>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {doc.maBienBan && <span>Hồ sơ: <span className="text-[#0d3b66] font-medium">{doc.maBienBan}</span></span>}
                        <span>Người tạo: {doc.nguoiTaoTen}</span>
                        {doc.nguoiKyTen && <span>Người ký: {doc.nguoiKyTen}</span>}
                        {doc.ngayTao && <span>Ngày tạo: {doc.ngayTao}</span>}
                        {doc.ngayKy && <span>Ngày ký: {doc.ngayKy}</span>}
                      </div>
                      {doc.trangThai === "da_ky" && (
                        <div className="flex items-center gap-2 mt-2">
                          <Shield className="w-3.5 h-3.5 text-[#2e7d32]" />
                          <span className="text-xs text-[#2e7d32] font-medium">Đã ký số điện tử</span>
                        </div>
                      )}
                      {doc.trangThai === "tu_choi" && doc.lyDoTuChoi && (
                        <div className="mt-2 p-2 bg-[#ffebee] rounded text-xs text-[#c62828]">
                          Lý do từ chối: {doc.lyDoTuChoi}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs flex items-center gap-1 shrink-0 font-medium"
                    style={{ color: s.color, backgroundColor: s.bg }}
                  >
                    {doc.trangThai === "da_ky" && <Shield className="w-3 h-3" />}
                    {s.label}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50 justify-end">
                  <button
                    onClick={() => setViewDoc(doc)}
                    className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-[#f8fafc] flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem
                  </button>
                  {doc.trangThai === "cho_ky" && (
                    <>
                      <button
                        onClick={() => setRejectModal(doc.id)}
                        className="px-3 py-1.5 text-sm border border-[#c62828] text-[#c62828] rounded-lg hover:bg-[#ffebee] flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Từ chối
                      </button>
                      <button
                        onClick={() => setSignModal(doc.id)}
                        className="px-3 py-1.5 text-sm bg-[#0d3b66] text-white rounded-lg hover:bg-[#0a2f52] flex items-center gap-1.5"
                      >
                        <Pen className="w-3.5 h-3.5" />
                        Ký số
                      </button>
                    </>
                  )}
                  {doc.trangThai === "da_ky" && (
                    <button
                      onClick={() => toast.success("Đã tải văn bản")}
                      className="px-3 py-1.5 text-sm border border-[#0d3b66] text-[#0d3b66] rounded-lg hover:bg-[#e8eef5] flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải về
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sign Modal */}
      {signModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setSignModal(null); setPin(""); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border text-center">
              <Lock className="w-10 h-10 text-[#0d3b66] mx-auto mb-2" />
              <h3 className="text-[#0d3b66] font-semibold">Xác nhận ký số</h3>
              <p className="text-xs text-muted-foreground mt-1">Nhập mã PIN để ký số văn bản</p>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSign(signModal)}
                placeholder="Nhập mã PIN..."
                maxLength={6}
                autoFocus
                className="w-full px-4 py-3 bg-[#f0f4f8] border border-border rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20"
              />
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => { setSignModal(null); setPin(""); }}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSign(signModal)}
                className="px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center gap-1.5"
              >
                <Pen className="w-3.5 h-3.5" />
                Ký số
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setRejectModal(null); setRejectReason(""); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-[#c62828] font-semibold">Từ chối ký văn bản</h3>
            </div>
            <div className="p-6">
              <label className="text-sm text-muted-foreground mb-1 block">
                Lý do từ chối <span className="text-[#c62828]">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm resize-none"
              />
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => handleReject(rejectModal)}
                className="px-4 py-2 bg-[#c62828] text-white rounded-lg text-sm hover:bg-[#b71c1c]"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doc Modal */}
      {viewDoc && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setViewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-[#0d3b66] font-semibold">{viewDoc.maVanBan} — {viewDoc.tieuDe}</h3>
              <button onClick={() => setViewDoc(null)} className="p-1.5 rounded-lg hover:bg-[#f0f4f8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Loại văn bản</p>
                  <p className="text-sm font-medium">{LOAI_VAN_BAN[viewDoc.loaiVanBan] ?? viewDoc.loaiVanBan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hồ sơ vụ việc</p>
                  <p className="text-sm font-medium text-[#0d3b66]">{viewDoc.maBienBan ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Người tạo</p>
                  <p className="text-sm font-medium">{viewDoc.nguoiTaoTen}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Người ký</p>
                  <p className="text-sm font-medium">{viewDoc.nguoiKyTen ?? "Chưa ký"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày tạo</p>
                  <p className="text-sm font-medium">{viewDoc.ngayTao}</p>
                </div>
                {viewDoc.ngayKy && (
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày ký</p>
                    <p className="text-sm font-medium">{viewDoc.ngayKy}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Nội dung văn bản</p>
                <div className="p-4 bg-[#f8fafc] rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                  {viewDoc.noiDung}
                </div>
              </div>
              {viewDoc.lyDoTuChoi && (
                <div className="p-3 bg-[#ffebee] rounded-lg text-sm text-[#c62828]">
                  <p className="font-medium mb-1">Lý do từ chối:</p>
                  <p>{viewDoc.lyDoTuChoi}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between">
              {viewDoc.trangThai === "cho_ky" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setViewDoc(null); setRejectModal(viewDoc.id); }}
                    className="px-4 py-2 border border-[#c62828] text-[#c62828] rounded-lg text-sm hover:bg-[#ffebee]"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => { setViewDoc(null); setSignModal(viewDoc.id); }}
                    className="px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center gap-1.5"
                  >
                    <Pen className="w-3.5 h-3.5" />
                    Ký số
                  </button>
                </div>
              )}
              <button
                onClick={() => setViewDoc(null)}
                className="px-4 py-2 border border-border rounded-lg text-sm ml-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
