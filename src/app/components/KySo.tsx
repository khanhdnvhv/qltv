import { useState, useMemo } from "react";
import {
  FileText, CheckCircle2, Clock, Pen, Download, Eye,
  Search, Shield, AlertTriangle, X, Lock, Plus,
  ChevronRight, RotateCcw, Send, Loader2, FilePlus,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { LOAI_VAN_BAN } from "../lib/constants";
import type { VanBan } from "../lib/types";

const LOAI_OPTIONS: { value: VanBan["loaiVanBan"]; label: string }[] = [
  { value: "quyet_dinh_xu_ly", label: "Quyết định xử lý" },
  { value: "bien_ban_niem_phong", label: "Biên bản niêm phong" },
  { value: "bien_ban_ban_giao", label: "Biên bản bàn giao" },
  { value: "bien_ban_tieu_huy", label: "Biên bản tiêu hủy" },
  { value: "bien_ban_tra_lai", label: "Biên bản trả lại" },
  { value: "cong_van", label: "Công văn" },
  { value: "bao_cao", label: "Báo cáo" },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; step: number }> = {
  nhap:     { label: "Nháp",    bg: "#f1f5f9", color: "#64748b", step: 0 },
  cho_ky:   { label: "Chờ ký",  bg: "#fef9c3", color: "#a16207", step: 1 },
  da_ky:    { label: "Đã ký",   bg: "#dcfce7", color: "#15803d", step: 2 },
  tu_choi:  { label: "Từ chối", bg: "#fee2e2", color: "#b91c1c", step: -1 },
};

const FLOW_STEPS = ["Nháp", "Chờ ký", "Đã ký số"];

function FlowBadge({ trangThai }: { trangThai: string }) {
  const cfg = STATUS_CONFIG[trangThai] ?? STATUS_CONFIG.nhap;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {trangThai === "da_ky" && <Shield className="w-3 h-3" />}
      {trangThai === "cho_ky" && <Clock className="w-3 h-3" />}
      {trangThai === "tu_choi" && <AlertTriangle className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

function ProgressSteps({ trangThai }: { trangThai: string }) {
  const step = STATUS_CONFIG[trangThai]?.step ?? 0;
  if (trangThai === "tu_choi") {
    return (
      <div className="flex items-center gap-1 text-xs text-red-500">
        <AlertTriangle className="w-3 h-3" />
        Đã từ chối ký
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      {FLOW_STEPS.map((s, i) => (
        <span key={s} className="flex items-center gap-1">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              i < step ? "bg-green-100 text-green-700" :
              i === step ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-400"
            }`}
          >{s}</span>
          {i < FLOW_STEPS.length - 1 && (
            <ChevronRight className={`w-3 h-3 ${i < step ? "text-green-500" : "text-gray-300"}`} />
          )}
        </span>
      ))}
    </div>
  );
}

export function KySo() {
  const { vanBan, hoSo, currentUser, store } = useStoreState();
  const [filter, setFilter] = useState("all");
  const [signModal, setSignModal] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<VanBan | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pin, setPin] = useState("");
  const [pinDots, setPinDots] = useState<boolean[]>([false, false, false, false, false, false]);
  const [signing, setSigning] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch] = useState("");
  const [createForm, setCreateForm] = useState({
    tieuDe: "",
    loaiVanBan: "quyet_dinh_xu_ly" as VanBan["loaiVanBan"],
    hoSoId: "",
    noiDung: "",
  });

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

  const counts = useMemo(() => ({
    total: vanBan.length,
    daKy: vanBan.filter(d => d.trangThai === "da_ky").length,
    choKy: vanBan.filter(d => d.trangThai === "cho_ky").length,
    tuChoi: vanBan.filter(d => d.trangThai === "tu_choi").length,
    nhap: vanBan.filter(d => d.trangThai === "nhap").length,
  }), [vanBan]);

  function handlePinChange(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
    setPinDots(Array.from({ length: 6 }, (_, i) => i < digits.length));
  }

  function handleSign(id: string) {
    if (!/^\d{6}$/.test(pin)) {
      toast.error("Mã PIN phải là 6 chữ số");
      return;
    }
    setSigning(true);
    setTimeout(() => {
      store.kyVanBan(id);
      const vb = vanBan.find(v => v.id === id);
      toast.success(`Đã ký số thành công!`, {
        description: `${vb?.maVanBan} · Người ký: ${currentUser.hoTen}`,
      });
      setSignModal(null);
      setPin("");
      setPinDots([false, false, false, false, false, false]);
      setSigning(false);
    }, 1400);
  }

  function handleReject(id: string) {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    store.tuChoiVanBan(id, rejectReason);
    toast.success("Đã từ chối ký văn bản");
    setRejectModal(null);
    setRejectReason("");
  }

  function handleCreate() {
    if (!createForm.tieuDe.trim() || !createForm.noiDung.trim()) {
      toast.error("Vui lòng điền tiêu đề và nội dung văn bản");
      return;
    }
    const hs = hoSo.find(h => h.id === createForm.hoSoId);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    store.addVanBan({
      tieuDe: createForm.tieuDe,
      loaiVanBan: createForm.loaiVanBan,
      hoSoId: createForm.hoSoId || undefined,
      maBienBan: hs?.maBienBan,
      noiDung: createForm.noiDung,
      nguoiTaoId: currentUser.id,
      nguoiTaoTen: currentUser.hoTen,
      trangThai: "nhap",
      ngayTao: dateStr,
    });
    toast.success("Đã tạo văn bản nháp");
    setShowCreate(false);
    setCreateForm({ tieuDe: "", loaiVanBan: "quyet_dinh_xu_ly", hoSoId: "", noiDung: "" });
  }

  function handleGuiKy(id: string) {
    store.guiKyVanBan(id);
    toast.success("Đã gửi văn bản chờ ký duyệt");
  }

  function handleHoiPhuc(id: string) {
    store.hoiPhucVanBan(id);
    toast.success("Đã trả văn bản về nháp để chỉnh sửa");
  }

  const signDoc = vanBan.find(v => v.id === signModal);
  const viewDocLive = viewDoc ? vanBan.find(v => v.id === viewDoc.id) ?? viewDoc : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
            <Pen className="w-6 h-6" />
            Ký duyệt văn bản
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Soạn thảo, gửi ký và quản lý văn bản điện tử</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors"
        >
          <FilePlus className="w-4 h-4" />
          Soạn văn bản
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Tổng", value: counts.total, color: "#0d3b66", bg: "#e8eef5" },
          { label: "Nháp", value: counts.nhap, color: "#64748b", bg: "#f1f5f9" },
          { label: "Chờ ký", value: counts.choKy, color: "#a16207", bg: "#fef9c3" },
          { label: "Đã ký số", value: counts.daKy, color: "#15803d", bg: "#dcfce7" },
          { label: "Từ chối", value: counts.tuChoi, color: "#b91c1c", bg: "#fee2e2" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Tìm mã, tiêu đề, hồ sơ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Tất cả" },
            { value: "nhap", label: "Nháp" },
            { value: "cho_ky", label: "Chờ ký" },
            { value: "da_ky", label: "Đã ký" },
            { value: "tu_choi", label: "Từ chối" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-[#0d3b66] text-white"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
              {f.value !== "all" && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === f.value ? "bg-white/20" : "bg-gray-200 text-gray-500"}`}>
                  {f.value === "nhap" ? counts.nhap : f.value === "cho_ky" ? counts.choKy : f.value === "da_ky" ? counts.daKy : counts.tuChoi}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Documents list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 text-sm">Không có văn bản nào</p>
          </div>
        ) : (
          filtered.map((doc) => (
            <div
              key={doc.id}
              className={`bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
                doc.trangThai === "cho_ky" ? "border-amber-200" :
                doc.trangThai === "da_ky" ? "border-green-200" :
                doc.trangThai === "tu_choi" ? "border-red-200" : "border-gray-100"
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    doc.trangThai === "da_ky" ? "bg-green-100" :
                    doc.trangThai === "cho_ky" ? "bg-amber-100" :
                    doc.trangThai === "tu_choi" ? "bg-red-100" : "bg-gray-100"
                  }`}>
                    {doc.trangThai === "da_ky"
                      ? <Shield className="w-6 h-6 text-green-700" />
                      : <FileText className="w-6 h-6 text-gray-500" />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono font-semibold text-[#0d3b66]">{doc.maVanBan}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                            {LOAI_VAN_BAN[doc.loaiVanBan] ?? doc.loaiVanBan}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{doc.tieuDe}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                          {doc.maBienBan && <span>Hồ sơ: <span className="text-[#0d3b66] font-medium">{doc.maBienBan}</span></span>}
                          <span>Tạo bởi: {doc.nguoiTaoTen}</span>
                          <span>{doc.ngayTao}</span>
                          {doc.ngayKy && <span className="text-green-600 font-medium">Ký: {doc.ngayKy}</span>}
                        </div>
                      </div>
                      <FlowBadge trangThai={doc.trangThai} />
                    </div>

                    {/* Progress steps */}
                    <div className="mt-2">
                      <ProgressSteps trangThai={doc.trangThai} />
                    </div>

                    {/* Signed info */}
                    {doc.trangThai === "da_ky" && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span>Ký số bởi <strong>{doc.nguoiKyTen}</strong> · Cert: e-Sign-{doc.id.slice(-6).toUpperCase()}</span>
                      </div>
                    )}

                    {/* Reject reason */}
                    {doc.trangThai === "tu_choi" && doc.lyDoTuChoi && (
                      <div className="mt-2 px-3 py-1.5 bg-red-50 rounded-lg text-xs text-red-700">
                        <span className="font-medium">Lý do từ chối: </span>{doc.lyDoTuChoi}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 justify-end">
                  <button
                    onClick={() => setViewDoc(doc)}
                    className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem văn bản
                  </button>

                  {doc.trangThai === "nhap" && (
                    <button
                      onClick={() => handleGuiKy(doc.id)}
                      className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Gửi ký duyệt
                    </button>
                  )}

                  {doc.trangThai === "cho_ky" && (
                    <>
                      <button
                        onClick={() => setRejectModal(doc.id)}
                        className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Từ chối
                      </button>
                      <button
                        onClick={() => setSignModal(doc.id)}
                        className="px-3 py-1.5 text-xs bg-[#0d3b66] text-white rounded-lg hover:bg-[#0a2f52] flex items-center gap-1.5"
                      >
                        <Pen className="w-3.5 h-3.5" />
                        Ký số
                      </button>
                    </>
                  )}

                  {doc.trangThai === "da_ky" && (
                    <button
                      onClick={() => toast.success("Đã tải văn bản")}
                      className="px-3 py-1.5 text-xs border border-green-300 text-green-700 rounded-lg hover:bg-green-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải về
                    </button>
                  )}

                  {doc.trangThai === "tu_choi" && (
                    <button
                      onClick={() => handleHoiPhuc(doc.id)}
                      className="px-3 py-1.5 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Trả về nháp
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-[#0d3b66] flex items-center gap-2">
                  <FilePlus className="w-5 h-5" />
                  Soạn văn bản mới
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Văn bản sẽ được lưu ở trạng thái Nháp</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Loại văn bản <span className="text-red-500">*</span></label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                    value={createForm.loaiVanBan}
                    onChange={e => setCreateForm({ ...createForm, loaiVanBan: e.target.value as VanBan["loaiVanBan"] })}
                  >
                    {LOAI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Hồ sơ vụ việc</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                    value={createForm.hoSoId}
                    onChange={e => setCreateForm({ ...createForm, hoSoId: e.target.value })}
                  >
                    <option value="">— Không gắn hồ sơ —</option>
                    {hoSo.map(h => <option key={h.id} value={h.id}>{h.maBienBan} · {h.doiTuongViPham}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tiêu đề văn bản <span className="text-red-500">*</span></label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  placeholder="VD: Quyết định xử lý tang vật hồ sơ BB-2026-XXX"
                  value={createForm.tieuDe}
                  onChange={e => setCreateForm({ ...createForm, tieuDe: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nội dung văn bản <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none font-mono"
                  rows={8}
                  placeholder="Soạn nội dung văn bản tại đây..."
                  value={createForm.noiDung}
                  onChange={e => setCreateForm({ ...createForm, noiDung: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6 pt-4 border-t">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleCreate} className="flex-1 bg-[#0d3b66] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a2f52] flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo văn bản nháp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW DOC MODAL ── */}
      {viewDocLive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewDoc(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-[#0d3b66]">{viewDocLive.maVanBan}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <FlowBadge trangThai={viewDocLive.trangThai} />
                  <span className="text-xs text-gray-400">{LOAI_VAN_BAN[viewDocLive.loaiVanBan]}</span>
                </div>
              </div>
              <button onClick={() => setViewDoc(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Official document format */}
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                {/* Gov header */}
                <div className="bg-gray-50 border-b border-gray-200 py-4 px-6 text-center">
                  <p className="font-bold text-xs text-gray-800 tracking-wide">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="text-xs text-gray-600 mt-0.5">Độc lập - Tự do - Hạnh phúc</p>
                  <div className="flex justify-center mt-1"><div className="w-24 h-px bg-gray-400"></div></div>
                </div>

                <div className="p-6">
                  {/* Doc meta */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="text-xs text-gray-600">
                      <p className="font-semibold">CÔNG AN TỈNH NINH BÌNH</p>
                      <p>Phòng Cảnh sát Kinh tế</p>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <p>Ninh Bình, ngày {viewDocLive.ngayTao}</p>
                      <p className="font-mono font-semibold text-[#0d3b66]">Số: {viewDocLive.maVanBan}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-5">
                    <p className="font-bold text-sm uppercase text-gray-800">{LOAI_VAN_BAN[viewDocLive.loaiVanBan]}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{viewDocLive.tieuDe}</p>
                    {viewDocLive.maBienBan && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">Hồ sơ vụ việc: {viewDocLive.maBienBan}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 min-h-24 mb-6">
                    {viewDocLive.noiDung}
                  </div>

                  {/* Signature section */}
                  <div className="flex justify-end">
                    <div className="w-56 text-center">
                      <p className="text-xs font-bold text-gray-700 mb-1">TRƯỞNG PHÒNG</p>
                      <p className="text-xs text-gray-400 mb-4 italic">(Ký, ghi rõ họ tên, đóng dấu)</p>

                      {viewDocLive.trangThai === "da_ky" ? (
                        <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50 relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 rounded-full p-1">
                            <Shield className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-[11px] font-bold text-green-800 mb-1">ĐÃ KÝ SỐ ĐIỆN TỬ</p>
                          <p className="text-xs font-semibold text-gray-800">{viewDocLive.nguoiKyTen}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{viewDocLive.ngayKy}</p>
                          <p className="text-[10px] font-mono text-green-700 mt-1 bg-green-100 px-2 py-0.5 rounded">
                            e-Sign-{viewDocLive.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      ) : viewDocLive.trangThai === "cho_ky" ? (
                        <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 bg-amber-50">
                          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                          <p className="text-xs text-amber-700 font-medium">Chờ ký duyệt</p>
                        </div>
                      ) : (
                        <div className="border-b-2 border-gray-300 h-12 flex items-end justify-center pb-1">
                          <p className="text-xs text-gray-300 italic">Chưa ký</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection notice */}
                  {viewDocLive.trangThai === "tu_choi" && viewDocLive.lyDoTuChoi && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-700 mb-1">Lý do từ chối ký:</p>
                      <p className="text-sm text-red-800">{viewDocLive.lyDoTuChoi}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t bg-white flex items-center justify-between shrink-0 rounded-b-2xl">
              <div className="flex gap-2">
                {viewDocLive.trangThai === "nhap" && (
                  <button
                    onClick={() => { handleGuiKy(viewDocLive.id); setViewDoc(null); }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Gửi ký duyệt
                  </button>
                )}
                {viewDocLive.trangThai === "cho_ky" && (
                  <>
                    <button
                      onClick={() => { setViewDoc(null); setRejectModal(viewDocLive.id); }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Từ chối
                    </button>
                    <button
                      onClick={() => { setViewDoc(null); setSignModal(viewDocLive.id); }}
                      className="px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2f52] flex items-center gap-1.5"
                    >
                      <Pen className="w-3.5 h-3.5" />
                      Ký số ngay
                    </button>
                  </>
                )}
                {viewDocLive.trangThai === "da_ky" && (
                  <button
                    onClick={() => toast.success("Đã tải văn bản")}
                    className="px-4 py-2 border border-green-400 text-green-700 rounded-lg text-sm hover:bg-green-50 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải bản gốc
                  </button>
                )}
                {viewDocLive.trangThai === "tu_choi" && (
                  <button
                    onClick={() => { handleHoiPhuc(viewDocLive.id); setViewDoc(null); }}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Trả về nháp
                  </button>
                )}
              </div>
              <button onClick={() => setViewDoc(null)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIGN MODAL (PIN + Loading) ── */}
      {signModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => { if (!signing) { setSignModal(null); setPin(""); setPinDots([false,false,false,false,false,false]); } }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {signing ? (
              /* Loading state */
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-[#0d3b66] animate-spin" />
                </div>
                <p className="font-semibold text-gray-800 mb-1">Đang ký số...</p>
                <p className="text-sm text-gray-400">Đang xác thực chứng chỉ số và ký văn bản</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-br from-[#0d3b66] to-[#1565c0] px-6 py-5 text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Xác nhận ký số</h3>
                  <p className="text-white/70 text-xs mt-1">Nhập mã PIN để ký số văn bản</p>
                </div>

                {/* Doc info */}
                {signDoc && (
                  <div className="mx-6 mt-4 p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-0.5">Văn bản cần ký</p>
                    <p className="text-sm font-semibold text-[#0d3b66]">{signDoc.maVanBan}</p>
                    <p className="text-xs text-gray-600 truncate">{signDoc.tieuDe}</p>
                  </div>
                )}

                {/* PIN dots */}
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-3 text-center">Mã PIN (6 chữ số)</label>
                    {/* Visual dots */}
                    <div className="flex justify-center gap-3 mb-3">
                      {pinDots.map((filled, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full transition-all duration-150 ${filled ? "bg-[#0d3b66] scale-110" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    {/* Hidden actual input */}
                    <input
                      type="password"
                      value={pin}
                      onChange={e => handlePinChange(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && pin.length === 6 && handleSign(signModal)}
                      maxLength={6}
                      inputMode="numeric"
                      autoFocus
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none focus:border-[#0d3b66]/40 focus:ring-2 focus:ring-[#0d3b66]/10"
                    />
                    {pin && pin.length < 6 && (
                      <p className="text-xs text-amber-500 text-center mt-1">Còn {6 - pin.length} chữ số</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 text-center bg-gray-50 rounded-lg px-3 py-2">
                    Ký số sẽ được ghi nhận vào nhật ký hệ thống
                  </p>
                </div>

                <div className="flex gap-3 px-6 pb-6">
                  <button
                    onClick={() => { setSignModal(null); setPin(""); setPinDots([false,false,false,false,false,false]); }}
                    className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleSign(signModal)}
                    disabled={pin.length !== 6}
                    className="flex-1 bg-[#0d3b66] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0a2f52] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Pen className="w-4 h-4" />
                    Ký số
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setRejectModal(null); setRejectReason(""); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Từ chối ký văn bản</h3>
                <p className="text-xs text-gray-400">Vui lòng nêu rõ lý do từ chối</p>
              </div>
            </div>
            <div className="p-6">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                autoFocus
                placeholder="Nêu rõ lý do từ chối để người soạn thảo chỉnh sửa..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none outline-none focus:border-red-300"
              />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={() => handleReject(rejectModal)} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
