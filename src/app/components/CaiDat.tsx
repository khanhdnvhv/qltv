import {
  Settings, User, Shield, Bell, Globe,
  Database, Key, Monitor, Save, Lock, Unlock, RotateCcw,
  RefreshCw, HardDrive, ShieldCheck, Plus, Pencil, Trash2, X,
  Check, ChevronDown, ChevronUp, Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { VAI_TRO_LABELS } from "../lib/constants";
import type { CauHinh, NhomQuyen, QuyenModule } from "../lib/types";

// ========================
// MODULE DEFINITIONS
// ========================
const ALL_MODULES = [
  { id: "/",              label: "Dashboard",         group: "Tổng quan" },
  { id: "/ho-so",         label: "Hồ sơ vụ việc",    group: "Nghiệp vụ" },
  { id: "/tang-vat",      label: "Tang vật",          group: "Nghiệp vụ" },
  { id: "/niem-phong",    label: "Niêm phong",        group: "Nghiệp vụ" },
  { id: "/kho-bai",       label: "Kho bãi",           group: "Nghiệp vụ" },
  { id: "/kiem-ke",       label: "Kiểm kê",           group: "Nghiệp vụ" },
  { id: "/luan-chuyen",   label: "Luân chuyển",       group: "Nghiệp vụ" },
  { id: "/xu-ly",         label: "Xử lý tang vật",    group: "Nghiệp vụ" },
  { id: "/giao-tu-giu",   label: "Giao tự giữ",       group: "Nghiệp vụ" },
  { id: "/tien-bao-lanh", label: "Tiền bảo lãnh",     group: "Nghiệp vụ" },
  { id: "/ky-so",         label: "Ký số",             group: "Nghiệp vụ" },
  { id: "/tra-cuu",       label: "Tra cứu",           group: "Tiện ích" },
  { id: "/thong-ke",      label: "Thống kê",          group: "Tiện ích" },
  { id: "/canh-bao",      label: "Cảnh báo",          group: "Hệ thống" },
  { id: "/thong-bao",     label: "Thông báo",         group: "Hệ thống" },
  { id: "/nhat-ky",       label: "Nhật ký",           group: "Hệ thống" },
  { id: "/danh-muc",      label: "Danh mục",          group: "Quản trị" },
  { id: "/cai-dat",       label: "Cài đặt",           group: "Quản trị" },
];

const ACTIONS: { key: keyof Omit<QuyenModule, "moduleId">; label: string; color: string }[] = [
  { key: "xem",   label: "Xem",    color: "#1565c0" },
  { key: "them",  label: "Thêm",   color: "#2e7d32" },
  { key: "sua",   label: "Sửa",    color: "#e65100" },
  { key: "xoa",   label: "Xóa",    color: "#c62828" },
  { key: "duyet", label: "Duyệt",  color: "#6a1b9a" },
];

const PRESET_COLORS = [
  "#c62828","#1565c0","#2e7d32","#7b1fa2",
  "#e65100","#0277bd","#00695c","#4527a0",
  "#546e7a","#37474f",
];

const VAI_TRO_OPTIONS = Object.entries(VAI_TRO_LABELS).map(([v, l]) => ({ value: v, label: l }));

const sections = [
  { id: "general",      label: "Cấu hình chung",  icon: Settings },
  { id: "users",        label: "Người dùng",       icon: User },
  { id: "phanquyen",    label: "Phân quyền",       icon: ShieldCheck },
  { id: "security",     label: "Bảo mật",          icon: Shield },
  { id: "notifications",label: "Thông báo",        icon: Bell },
  { id: "integration",  label: "Tích hợp",         icon: Globe },
];

// ========================
// HELPER
// ========================
function getQuyen(nq: NhomQuyen, moduleId: string): QuyenModule {
  return nq.quyenModules.find(q => q.moduleId === moduleId) ?? {
    moduleId, xem: false, them: false, sua: false, xoa: false, duyet: false,
  };
}

function ActionBadge({ active, label, color }: { active: boolean; label: string; color: string }) {
  if (!active) return <span className="text-xs text-gray-300 px-1.5 py-0.5 rounded">{label}</span>;
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded font-medium"
      style={{ background: color + "18", color }}
    >
      {label}
    </span>
  );
}

// ========================
// NHOM QUYEN PANEL
// ========================
interface NhomQuyenFormState {
  ten: string;
  moTa: string;
  maMau: string;
  vaiTroId: string;
  quyenModules: QuyenModule[];
}

function emptyForm(): NhomQuyenFormState {
  return {
    ten: "", moTa: "", maMau: "#1565c0", vaiTroId: "canbonv",
    quyenModules: ALL_MODULES.map(m => ({
      moduleId: m.id, xem: false, them: false, sua: false, xoa: false, duyet: false,
    })),
  };
}

function NhomQuyenPanel({
  open, editItem, onClose, onSubmit,
}: {
  open: boolean;
  editItem: NhomQuyen | null;
  onClose: () => void;
  onSubmit: (data: NhomQuyenFormState) => void;
}) {
  const [form, setForm] = useState<NhomQuyenFormState>(emptyForm);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Tổng quan": true, "Nghiệp vụ": true, "Tiện ích": true, "Hệ thống": true, "Quản trị": true,
  });

  // Sync from editItem
  useState(() => {
    if (editItem) {
      setForm({
        ten: editItem.ten, moTa: editItem.moTa, maMau: editItem.maMau,
        vaiTroId: editItem.vaiTroId,
        quyenModules: ALL_MODULES.map(m => {
          const existing = editItem.quyenModules.find(q => q.moduleId === m.id);
          return existing ?? { moduleId: m.id, xem: false, them: false, sua: false, xoa: false, duyet: false };
        }),
      });
    } else {
      setForm(emptyForm());
    }
  });

  if (!open) return null;

  const toggleAction = (moduleId: string, action: keyof Omit<QuyenModule, "moduleId">) => {
    setForm(f => ({
      ...f,
      quyenModules: f.quyenModules.map(q =>
        q.moduleId === moduleId ? { ...q, [action]: !q[action] } : q
      ),
    }));
  };

  const toggleAllInGroup = (groupModuleIds: string[], enable: boolean) => {
    setForm(f => ({
      ...f,
      quyenModules: f.quyenModules.map(q =>
        groupModuleIds.includes(q.moduleId)
          ? { ...q, xem: enable, them: enable, sua: enable, xoa: enable, duyet: enable }
          : q
      ),
    }));
  };

  const toggleAllAction = (action: keyof Omit<QuyenModule, "moduleId">) => {
    const allEnabled = form.quyenModules.every(q => q[action]);
    setForm(f => ({
      ...f,
      quyenModules: f.quyenModules.map(q => ({ ...q, [action]: !allEnabled })),
    }));
  };

  const groups = Array.from(new Set(ALL_MODULES.map(m => m.group)));

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" style={{ top: 0, bottom: 0, left: 0, right: 0 }} onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-2xl flex flex-col z-[60]" style={{ top: 0, bottom: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: form.maMau + "20" }}>
              <ShieldCheck className="w-5 h-5" style={{ color: form.maMau }} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">
                {editItem ? "Chỉnh sửa nhóm quyền" : "Thêm nhóm quyền mới"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Thiết lập quyền truy cập cho từng chức năng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Tên nhóm quyền <span className="text-red-500">*</span></label>
              <input
                value={form.ten}
                onChange={e => setForm(f => ({ ...f, ten: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                placeholder="VD: Cán bộ kiểm tra nội bộ"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Vai trò hệ thống</label>
              <select
                value={form.vaiTroId}
                onChange={e => setForm(f => ({ ...f, vaiTroId: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
              >
                {VAI_TRO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Màu nhận diện</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, maMau: c }))}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: form.maMau === c ? c : "transparent", outlineOffset: 2, outline: form.maMau === c ? `2px solid ${c}` : "none" }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Mô tả</label>
              <textarea
                value={form.moTa}
                onChange={e => setForm(f => ({ ...f, moTa: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                placeholder="Mô tả chức năng và phạm vi của nhóm quyền này..."
              />
            </div>
          </div>

          {/* Permission matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-sm">Ma trận phân quyền</h4>
              <div className="flex gap-1">
                {ACTIONS.map(a => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleAllAction(a.key)}
                    className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-gray-400 transition-colors font-medium"
                    style={{ color: a.color }}
                    title={`Bật/tắt tất cả "${a.label}"`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_repeat(5,44px)] gap-x-1 mb-1 px-3">
              <div />
              {ACTIONS.map(a => (
                <div key={a.key} className="text-center text-xs font-semibold" style={{ color: a.color }}>{a.label}</div>
              ))}
            </div>

            <div className="space-y-3">
              {groups.map(group => {
                const groupModules = ALL_MODULES.filter(m => m.group === group);
                const groupModuleIds = groupModules.map(m => m.id);
                const allEnabled = groupModuleIds.every(id => {
                  const q = form.quyenModules.find(q => q.moduleId === id);
                  return q && ACTIONS.every(a => q[a.key]);
                });
                const isExpanded = expandedGroups[group] ?? true;

                return (
                  <div key={group} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => setExpandedGroups(e => ({ ...e, [group]: !isExpanded }))}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {group}
                        <span className="text-xs font-normal text-gray-400">({groupModules.length} chức năng)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllInGroup(groupModuleIds, !allEnabled)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          allEnabled
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {allEnabled ? "Bỏ tất cả" : "Chọn tất cả"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="divide-y divide-gray-50">
                        {groupModules.map(m => {
                          const q = form.quyenModules.find(q => q.moduleId === m.id) ?? {
                            moduleId: m.id, xem: false, them: false, sua: false, xoa: false, duyet: false,
                          };
                          return (
                            <div key={m.id} className="grid grid-cols-[1fr_repeat(5,44px)] gap-x-1 px-3 py-2 items-center hover:bg-gray-50">
                              <span className="text-sm text-gray-700">{m.label}</span>
                              {ACTIONS.map(a => (
                                <button
                                  key={a.key}
                                  type="button"
                                  onClick={() => toggleAction(m.id, a.key)}
                                  className={`w-7 h-7 mx-auto rounded-md border-2 flex items-center justify-center transition-all ${
                                    q[a.key]
                                      ? "border-transparent"
                                      : "border-gray-200 hover:border-gray-400"
                                  }`}
                                  style={q[a.key] ? { background: a.color + "20", borderColor: a.color } : {}}
                                  title={a.label}
                                >
                                  {q[a.key] && <Check className="w-3.5 h-3.5" style={{ color: a.color }} />}
                                </button>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 font-medium">
            Hủy
          </button>
          <button
            onClick={() => {
              if (!form.ten.trim()) { toast.error("Vui lòng nhập tên nhóm quyền"); return; }
              onSubmit(form);
            }}
            className="px-5 py-2.5 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: form.maMau }}
          >
            <Save className="w-4 h-4" />
            {editItem ? "Lưu thay đổi" : "Tạo nhóm quyền"}
          </button>
        </div>
      </div>
    </>
  );
}

// ========================
// MAIN COMPONENT
// ========================
export function CaiDat() {
  const { cauHinh, users, nhomQuyen, currentUser, store } = useStoreState();
  const [activeSection, setActiveSection] = useState("general");
  const [localConfig, setLocalConfig] = useState<CauHinh>({ ...cauHinh });
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ totalKB: number; details: Record<string, string> } | null>(null);
  const [showDemoResetConfirm, setShowDemoResetConfirm] = useState(false);

  // Phan quyen state
  const [showNhomQuyenPanel, setShowNhomQuyenPanel] = useState(false);
  const [editNhomQuyen, setEditNhomQuyen] = useState<NhomQuyen | null>(null);
  const [viewNhomQuyen, setViewNhomQuyen] = useState<NhomQuyen | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [matrixView, setMatrixView] = useState(false);

  const handleShowStorageInfo = () => { setStorageInfo(store.getStorageInfo()); };
  const handleReset = () => { store.resetToMockData(); };

  const updateConfig = (key: keyof CauHinh, value: unknown) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    store.updateCauHinh(localConfig);
    setHasChanges(false);
    toast.success("Đã lưu cài đặt thành công");
  };

  const handleToggleUser = (userId: string, currentStatus: string) => {
    store.toggleUserStatus(userId);
    toast.success(`Đã ${currentStatus === "active" ? "khóa" : "mở khóa"} tài khoản`);
  };

  const handleNhomQuyenSubmit = (data: { ten: string; moTa: string; maMau: string; vaiTroId: string; quyenModules: QuyenModule[] }) => {
    if (editNhomQuyen) {
      store.updateNhomQuyen(editNhomQuyen.id, data);
      toast.success("Đã cập nhật nhóm quyền");
    } else {
      store.addNhomQuyen(data);
      toast.success("Đã tạo nhóm quyền mới");
    }
    setShowNhomQuyenPanel(false);
    setEditNhomQuyen(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0d3b66]">Cài đặt hệ thống</h1>
        <p className="text-muted-foreground text-sm mt-1">Quản lý cấu hình và tham số hệ thống quản lý tang vật</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar nav */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border/50">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors ${
                  activeSection === s.id
                    ? "bg-[#e8eef5] text-[#0d3b66] font-medium"
                    : "text-[#5a6a7e] hover:bg-[#f8fafc]"
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-border shadow-sm p-6">
          {/* ── General ── */}
          {activeSection === "general" && (
            <div className="space-y-6">
              <h3 className="text-[#0d3b66] font-semibold">Cấu hình chung</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Tên hệ thống</label>
                  <input type="text" value={localConfig.tenHeThong} onChange={e => updateConfig("tenHeThong", e.target.value)} className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Tên đơn vị Công an</label>
                  <input type="text" value={localConfig.tenCongAn} onChange={e => updateConfig("tenCongAn", e.target.value)} className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Mô tả</label>
                  <textarea rows={3} value={localConfig.moTa} onChange={e => updateConfig("moTa", e.target.value)} className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Cảnh báo trước hạn (ngày)</label>
                    <input type="number" value={localConfig.soNgayCanhBaoTruocHan} onChange={e => updateConfig("soNgayCanhBaoTruocHan", Number(e.target.value))} className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm" min={1} max={90} />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Số ngày lưu kho tối đa</label>
                    <input type="number" value={localConfig.soNgayLuuKhoToiDa} onChange={e => updateConfig("soNgayLuuKhoToiDa", Number(e.target.value))} className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm" min={30} max={3650} />
                  </div>
                </div>
                <ToggleItem label="Tự động cảnh báo" desc="Tự động tạo cảnh báo khi tang vật sắp quá hạn" enabled={localConfig.tuDongCanhBao} onToggle={v => updateConfig("tuDongCanhBao", v)} />
                <ToggleItem label="Bắt buộc niêm phong" desc="Yêu cầu niêm phong trước khi nhập kho" enabled={localConfig.yeuCauNiemPhong} onToggle={v => updateConfig("yeuCauNiemPhong", v)} />
                <ToggleItem label="Bắt buộc hình ảnh" desc={`Yêu cầu tối thiểu ${localConfig.soAnhToiThieu} ảnh khi nhập tang vật`} enabled={localConfig.batBuocHinhAnh} onToggle={v => updateConfig("batBuocHinhAnh", v)} />
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {activeSection === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[#0d3b66] font-semibold">Quản lý người dùng</h3>
                <span className="text-sm text-muted-foreground">{users.length} người dùng</span>
              </div>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0d3b66] text-white flex items-center justify-center text-sm font-semibold">{user.avatar}</div>
                      <div>
                        <p className="text-sm font-medium">{user.hoTen}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.chucVu} · {user.donViTen}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-[#e8eef5] text-[#0d3b66] rounded text-xs font-medium">{VAI_TRO_LABELS[user.vaiTro]}</span>
                      <span className={`w-2 h-2 rounded-full ${user.trangThai === "active" ? "bg-[#2e7d32]" : "bg-[#c62828]"}`} />
                      {user.id !== currentUser.id && (
                        <button onClick={() => handleToggleUser(user.id, user.trangThai)} className="p-1.5 rounded-lg hover:bg-white transition-colors" title={user.trangThai === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}>
                          {user.trangThai === "active" ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Unlock className="w-4 h-4 text-[#c62828]" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PHAN QUYEN ── */}
          {activeSection === "phanquyen" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[#0d3b66] font-semibold">Phân quyền hệ thống</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Quản lý nhóm quyền và ma trận phân quyền theo chức năng</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMatrixView(v => !v)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5 ${
                      matrixView ? "bg-[#0d3b66] text-white border-[#0d3b66]" : "border-border text-muted-foreground hover:bg-[#f8fafc]"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Ma trận
                  </button>
                  <button
                    onClick={() => { setEditNhomQuyen(null); setShowNhomQuyenPanel(true); }}
                    className="px-3 py-1.5 bg-[#0d3b66] text-white text-sm rounded-lg flex items-center gap-1.5 hover:bg-[#0a2f52] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm nhóm
                  </button>
                </div>
              </div>

              {!matrixView ? (
                /* ── CARD VIEW ── */
                <div className="space-y-3">
                  {nhomQuyen.map(nq => {
                    const assignedUsers = users.filter(u => u.vaiTro === nq.vaiTroId);
                    const totalAccess = nq.quyenModules.filter(q => q.xem).length;
                    return (
                      <div key={nq.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: nq.maMau + "18" }}>
                              <ShieldCheck className="w-5 h-5" style={{ color: nq.maMau }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900 text-sm truncate">{nq.ten}</h4>
                                {nq.isSystem && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">Hệ thống</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">{nq.moTa}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {assignedUsers.length} người dùng
                                </span>
                                <span className="text-xs text-gray-500">
                                  {totalAccess}/{ALL_MODULES.length} chức năng
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: nq.maMau + "18", color: nq.maMau }}>
                                  {VAI_TRO_LABELS[nq.vaiTroId as keyof typeof VAI_TRO_LABELS] ?? nq.vaiTroId}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setViewNhomQuyen(viewNhomQuyen?.id === nq.id ? null : nq)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                              title="Xem chi tiết quyền"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditNhomQuyen(nq); setShowNhomQuyenPanel(true); }}
                              className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-600"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {!nq.isSystem && (
                              <button
                                onClick={() => setDeleteConfirmId(nq.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600"
                                title="Xóa nhóm quyền"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline detail */}
                        {viewNhomQuyen?.id === nq.id && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 gap-1.5">
                              {ALL_MODULES.map(m => {
                                const q = getQuyen(nq, m.id);
                                const hasAny = ACTIONS.some(a => q[a.key]);
                                if (!hasAny) return null;
                                return (
                                  <div key={m.id} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg">
                                    <span className="text-xs text-gray-600 font-medium">{m.label}</span>
                                    <div className="flex gap-1">
                                      {ACTIONS.map(a => <ActionBadge key={a.key} active={q[a.key]} label={a.label} color={a.color} />)}
                                    </div>
                                  </div>
                                );
                              })}
                              {ALL_MODULES.every(m => !ACTIONS.some(a => getQuyen(nq, m.id)[a.key])) && (
                                <p className="text-xs text-gray-400 text-center py-3">Chưa có quyền nào được cấp</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── MATRIX VIEW ── */
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-gray-100 w-44 sticky left-0 bg-gray-50">Chức năng</th>
                        {nhomQuyen.map(nq => (
                          <th key={nq.id} className="px-3 py-3 font-semibold border-b border-gray-100 text-center min-w-[100px]">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: nq.maMau + "20" }}>
                                <ShieldCheck className="w-3.5 h-3.5" style={{ color: nq.maMau }} />
                              </div>
                              <span style={{ color: nq.maMau }}>{nq.ten}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ALL_MODULES.map((m, i) => (
                        <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">{m.label}</td>
                          {nhomQuyen.map(nq => {
                            const q = getQuyen(nq, m.id);
                            return (
                              <td key={nq.id} className="px-2 py-2 text-center">
                                <div className="flex flex-wrap gap-0.5 justify-center">
                                  {ACTIONS.map(a => (
                                    q[a.key] && (
                                      <span key={a.key} className="w-4 h-4 rounded flex items-center justify-center" style={{ background: a.color + "20" }} title={a.label}>
                                        <Check className="w-2.5 h-2.5" style={{ color: a.color }} />
                                      </span>
                                    )
                                  ))}
                                  {!ACTIONS.some(a => q[a.key]) && <span className="text-gray-200">—</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Legend */}
                  <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50">
                    {ACTIONS.map(a => (
                      <div key={a.key} className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded flex items-center justify-center" style={{ background: a.color + "20" }}>
                          <Check className="w-2.5 h-2.5" style={{ color: a.color }} />
                        </span>
                        <span className="text-xs text-gray-500">{a.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete confirm */}
              {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Xóa nhóm quyền?</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Hành động này không thể hoàn tác</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setDeleteConfirmId(null)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Hủy</button>
                      <button
                        onClick={() => {
                          store.deleteNhomQuyen(deleteConfirmId);
                          setDeleteConfirmId(null);
                          toast.success("Đã xóa nhóm quyền");
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Security ── */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <h3 className="text-[#0d3b66] font-semibold">Cấu hình bảo mật</h3>
              <div className="space-y-4">
                <ToggleItem label="Ghi nhật ký hoạt động" desc="Ghi nhận mọi thao tác của người dùng (Audit Trail)" enabled={localConfig.logHoatDong} onToggle={v => updateConfig("logHoatDong", v)} />
                <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Session timeout</p>
                    <p className="text-xs text-muted-foreground">Tự động đăng xuất sau {localConfig.sessionTimeout} phút không hoạt động</p>
                  </div>
                  <input type="number" value={localConfig.sessionTimeout} onChange={e => updateConfig("sessionTimeout", Number(e.target.value))} className="w-20 px-2 py-1 bg-white border border-border rounded text-sm text-center" min={5} max={480} />
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-lg">
                  <p className="text-sm font-medium mb-1">Số ảnh tối thiểu khi nhập tang vật</p>
                  <p className="text-xs text-muted-foreground mb-2">Áp dụng khi bật "Bắt buộc hình ảnh"</p>
                  <input type="number" value={localConfig.soAnhToiThieu} onChange={e => updateConfig("soAnhToiThieu", Number(e.target.value))} className="w-24 px-3 py-2 bg-white border border-border rounded-lg text-sm" min={1} max={10} />
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-[#0d3b66] font-semibold">Cấu hình thông báo</h3>
              <div className="space-y-4">
                <ToggleItem label="Email cảnh báo tang vật" desc="Gửi email khi tang vật sắp quá hạn hoặc có vấn đề" enabled={localConfig.emailCanhBao} onToggle={v => updateConfig("emailCanhBao", v)} />
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email nhận cảnh báo</label>
                  <input type="email" value={localConfig.emailNhan} onChange={e => updateConfig("emailNhan", e.target.value)} className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm" placeholder="email@example.com" />
                </div>
                <div className="p-4 bg-[#fff8e1] rounded-lg border border-[#ffc107]/30">
                  <p className="text-sm font-medium text-[#f57f17]">Lưu ý</p>
                  <p className="text-xs text-[#f57f17]/80 mt-1">Email thông báo sẽ được gửi tự động khi tang vật còn {localConfig.soNgayCanhBaoTruocHan} ngày đến hạn lưu kho.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Integration ── */}
          {activeSection === "integration" && (
            <div className="space-y-6">
              <h3 className="text-[#0d3b66] font-semibold">Tích hợp hệ thống</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Cơ sở dữ liệu dân cư (CCCD)", status: "connected", icon: Database },
                  { name: "Hệ thống QLHC Công an", status: "connected", icon: Key },
                  { name: "Cổng thông tin VPHC", status: "disconnected", icon: Monitor },
                  { name: "Hệ thống Kho bạc Nhà nước", status: "disconnected", icon: Globe },
                ].map((item) => (
                  <div key={item.name} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#e8eef5] flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[#0d3b66]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <span className={`text-xs ${item.status === "connected" ? "text-[#2e7d32]" : "text-[#c62828]"}`}>
                          {item.status === "connected" ? "Đã kết nối" : "Chưa kết nối"}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => toast.info("Chức năng đang phát triển")} className={`w-full py-2 rounded-lg text-sm transition-colors ${item.status === "connected" ? "border border-border text-[#5a6a7e] hover:bg-[#f8fafc]" : "bg-[#0d3b66] text-white hover:bg-[#0a2f52]"}`}>
                      {item.status === "connected" ? "Cấu hình" : "Kết nối"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button — hide for phanquyen tab */}
          {activeSection !== "phanquyen" && (
            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
              <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm hover:bg-[#f8fafc] flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Khôi phục mặc định
              </button>
              <button onClick={handleSave} disabled={!hasChanges} className="px-5 py-2.5 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" />
                Lưu cài đặt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Demo Tools Panel */}
      {currentUser.vaiTro === "admin" && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Database className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1a2332] text-sm">Công cụ Demo & LocalStorage</h3>
              <p className="text-xs text-muted-foreground">Quản lý dữ liệu demo và bộ nhớ cục bộ</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={handleShowStorageInfo} className="px-4 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm hover:bg-[#e2e8f0] flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#0d3b66]" />
                Xem dung lượng localStorage
              </button>
              {storageInfo && <span className="text-sm text-[#0d3b66] font-semibold">Đang dùng: {storageInfo.totalKB} KB</span>}
            </div>
            {storageInfo && (
              <div className="p-3 bg-[#f8fafc] rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-medium mb-2">Chi tiết theo module:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  {Object.entries(storageInfo.details).map(([name, size]) => (
                    <div key={name} className="flex items-center justify-between px-2 py-1 bg-white rounded border border-border/50">
                      <span className="text-xs text-muted-foreground truncate">{name}</span>
                      <span className="text-xs font-medium text-[#0d3b66] ml-2 shrink-0">{size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3">Xóa toàn bộ dữ liệu trong localStorage và khôi phục về dữ liệu mẫu ban đầu. Trang sẽ tự reload.</p>
              {!showDemoResetConfirm ? (
                <button onClick={() => setShowDemoResetConfirm(true)} className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reset về dữ liệu mock ban đầu
                </button>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                  <p className="text-sm text-red-700 font-medium">⚠️ Xác nhận reset? Toàn bộ thay đổi sẽ mất và không thể khôi phục.</p>
                  <div className="flex gap-2">
                    <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Xác nhận Reset
                    </button>
                    <button onClick={() => setShowDemoResetConfirm(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-[#f8fafc]">Hủy</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Config Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Khôi phục cấu hình mặc định?</h3>
                <p className="text-sm text-gray-500 mt-0.5">Mọi thay đổi chưa lưu sẽ bị hủy</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              Hành động này sẽ đặt lại tất cả cài đặt về giá trị mặc định ban đầu của hệ thống.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50">Hủy</button>
              <button
                onClick={() => { setLocalConfig({ ...cauHinh }); setHasChanges(false); setShowResetConfirm(false); toast.success("Đã khôi phục cấu hình mặc định"); }}
                className="flex-1 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700"
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NhomQuyen Side Panel */}
      <NhomQuyenPanel
        open={showNhomQuyenPanel}
        editItem={editNhomQuyen}
        onClose={() => { setShowNhomQuyenPanel(false); setEditNhomQuyen(null); }}
        onSubmit={handleNhomQuyenSubmit}
      />
    </div>
  );
}

// ========================
// TOGGLE ITEM
// ========================
function ToggleItem({ label, desc, enabled, onToggle }: { label: string; desc?: string; enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-lg">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => onToggle(!enabled)} className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? "bg-[#0d3b66]" : "bg-[#e2e8f0]"}`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${enabled ? "right-0.5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
