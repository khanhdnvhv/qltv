// ============================================================
// DanhMuc — Quản lý danh mục hệ thống
// Chỉ dành cho role: admin
// ============================================================

import { useState } from "react";
import {
  Building2, Users, Scale, Package, ArrowLeftRight,
  Plus, Pencil, Trash2, X, Search, BookOpen,
  Ruler, Shield, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { LOAI_TANG_VAT, LOAI_LUAN_CHUYEN, VAI_TRO_LABELS } from "../lib/constants";
import { appStore } from "../lib/store";
import type { DonVi, User, CanCuPhapLyMau, DonViTinhDanhMuc, VaiTroTangVat } from "../lib/types";
import { SearchableSelect } from "./shared/SearchableSelect";

// ========================
// TYPES
// ========================
type TabId = "don-vi" | "can-bo" | "can-cu-phap-ly" | "don-vi-tinh" | "loai-tang-vat" | "loai-luan-chuyen";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TABS: Tab[] = [
  { id: "don-vi",          label: "Đơn vị",               icon: Building2,    color: "blue"   },
  { id: "can-bo",          label: "Cán bộ / Người dùng",  icon: Users,        color: "green"  },
  { id: "can-cu-phap-ly",  label: "Căn cứ pháp lý mẫu",   icon: BookOpen,     color: "purple" },
  { id: "don-vi-tinh",     label: "Đơn vị tính",           icon: Ruler,        color: "orange" },
  { id: "loai-tang-vat",   label: "Loại tang vật",          icon: Package,      color: "red"    },
  { id: "loai-luan-chuyen",label: "Loại luân chuyển",       icon: ArrowLeftRight, color: "gray" },
];

const CAP_DON_VI_LABELS: Record<DonVi["capDonVi"], string> = {
  tinh: "Cấp tỉnh",
  xa: "Cấp xã",
};

const TRANG_THAI_USER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "Hoạt động", color: "#2e7d32", bg: "#e8f5e9" },
  inactive: { label: "Không hoạt động", color: "#546e7a", bg: "#eceff1" },
  locked:   { label: "Bị khóa", color: "#c62828", bg: "#ffebee" },
};

// ========================
// FIELD COMPONENT
// ========================
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors";
const selectCls = `${inputCls} bg-white`;

// ========================
// SIDE PANEL
// ========================
interface PanelProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}

function SidePanel({ open, title, subtitle, onClose, onSubmit, children }: PanelProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-1/2 bg-white shadow-2xl flex flex-col z-50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0d3b66]">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {children}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2.5 bg-[#0d3b66] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </>
  );
}

// ========================
// EMPTY STATE
// ========================
function EmptyState({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={99} className="py-12 text-center text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <Package className="w-8 h-8 text-gray-300" />
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}

// ========================
// ACTION BUTTONS
// ========================
function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="p-1.5 hover:bg-amber-50 rounded-md transition-colors"
        title="Chỉnh sửa"
      >
        <Pencil className="w-3.5 h-3.5 text-gray-400 hover:text-amber-600" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
        title="Xóa"
      >
        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}

// ========================
// TAB 1: DON VI
// ========================
function TabDonVi({ donVi }: { donVi: DonVi[] }) {
  const [search, setSearch] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editItem, setEditItem] = useState<DonVi | null>(null);
  const [form, setForm] = useState<Omit<DonVi, "id">>({
    ten: "", ma: "", diaChi: "", dienThoai: "", email: "", truongDonVi: "", capDonVi: "xa",
  });

  const filtered = donVi.filter(dv =>
    dv.ten.toLowerCase().includes(search.toLowerCase()) ||
    dv.ma.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ ten: "", ma: "", diaChi: "", dienThoai: "", email: "", truongDonVi: "", capDonVi: "huyen" });
    setShowPanel(true);
  };
  const openEdit = (item: DonVi) => {
    setEditItem(item);
    setForm({ ten: item.ten, ma: item.ma, diaChi: item.diaChi, dienThoai: item.dienThoai, email: item.email, truongDonVi: item.truongDonVi, capDonVi: item.capDonVi });
    setShowPanel(true);
  };
  const handleSubmit = () => {
    if (!form.ten.trim() || !form.ma.trim()) {
      toast.error("Vui lòng nhập Tên và Mã đơn vị");
      return;
    }
    if (editItem) {
      appStore.updateDonVi(editItem.id, form);
      toast.success("Đã cập nhật đơn vị");
    } else {
      appStore.addDonVi(form);
      toast.success("Đã thêm đơn vị mới");
    }
    setShowPanel(false);
  };
  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn vị này?")) {
      appStore.deleteDonVi(id);
      toast.success("Đã xóa đơn vị");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 w-64"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm đơn vị
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0f4f8] border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Mã</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Tên đơn vị</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Cấp</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Địa chỉ</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Điện thoại</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Trưởng đơn vị</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <EmptyState message="Không có đơn vị nào" />
            ) : filtered.map(dv => (
              <tr key={dv.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs font-semibold text-[#0d3b66]">{dv.ma}</td>
                <td className="py-3 px-4 font-medium text-gray-800">{dv.ten}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    {CAP_DON_VI_LABELS[dv.capDonVi]}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate">{dv.diaChi}</td>
                <td className="py-3 px-4 text-gray-600">{dv.dienThoai}</td>
                <td className="py-3 px-4 text-gray-700">{dv.truongDonVi}</td>
                <td className="py-3 px-4">
                  <ActionButtons onEdit={() => openEdit(dv)} onDelete={() => handleDelete(dv.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidePanel
        open={showPanel}
        title={editItem ? "Chỉnh sửa đơn vị" : "Thêm đơn vị mới"}
        subtitle={editItem ? `Mã: ${editItem.ma}` : "Điền đầy đủ thông tin đơn vị"}
        onClose={() => setShowPanel(false)}
        onSubmit={handleSubmit}
      >
        <Field label="Tên đơn vị" required>
          <input value={form.ten} onChange={e => setForm(f => ({ ...f, ten: e.target.value }))} className={inputCls} placeholder="VD: CA xã Bình Xuyên" />
        </Field>
        <Field label="Mã đơn vị" required>
          <input value={form.ma} onChange={e => setForm(f => ({ ...f, ma: e.target.value }))} className={inputCls} placeholder="VD: CABX" />
        </Field>
        <Field label="Cấp đơn vị" required>
          <SearchableSelect
            value={form.capDonVi}
            onChange={(val) => setForm(f => ({ ...f, capDonVi: val as DonVi["capDonVi"] }))}
            options={[
              { value: "tinh", label: "Cấp tỉnh / thành phố" },
              { value: "xa", label: "Cấp xã / phường" },
            ]}
            placeholder="— Chọn cấp đơn vị —"
            clearable={false}
          />
        </Field>
        <Field label="Địa chỉ">
          <input value={form.diaChi} onChange={e => setForm(f => ({ ...f, diaChi: e.target.value }))} className={inputCls} placeholder="Địa chỉ trụ sở" />
        </Field>
        <Field label="Điện thoại">
          <input value={form.dienThoai} onChange={e => setForm(f => ({ ...f, dienThoai: e.target.value }))} className={inputCls} placeholder="0211.xxxxxxx" />
        </Field>
        <Field label="Email">
          <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="email@congantinhxx.gov.vn" />
        </Field>
        <Field label="Trưởng đơn vị">
          <input value={form.truongDonVi} onChange={e => setForm(f => ({ ...f, truongDonVi: e.target.value }))} className={inputCls} placeholder="Họ và tên trưởng đơn vị" />
        </Field>
      </SidePanel>
    </>
  );
}

// ========================
// TAB 2: CAN BO / NGUOI DUNG
// ========================
function TabCanBo({ users, donVi }: { users: User[]; donVi: DonVi[] }) {
  const [search, setSearch] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({
    hoTen: "", email: "", chucVu: "", vaiTro: "canbonv", donViId: "", donViTen: "", soDienThoai: "", avatar: "",
  });

  const filtered = users.filter(u =>
    u.hoTen.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.chucVu.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ hoTen: "", email: "", chucVu: "", vaiTro: "canbonv", donViId: donVi[0]?.id || "", donViTen: donVi[0]?.ten || "", soDienThoai: "", avatar: "" });
    setShowPanel(true);
  };
  const openEdit = (item: User) => {
    setEditItem(item);
    setForm({ ...item });
    setShowPanel(true);
  };
  const handleDonViChange = (id: string) => {
    const dv = donVi.find(d => d.id === id);
    setForm(f => ({ ...f, donViId: id, donViTen: dv?.ten || "" }));
  };
  const handleSubmit = () => {
    if (!form.hoTen?.trim() || !form.email?.trim()) {
      toast.error("Vui lòng nhập Họ tên và Email");
      return;
    }
    const avatar = (form.hoTen || "").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    if (editItem) {
      appStore.updateUser(editItem.id, { ...form, avatar });
      toast.success("Đã cập nhật thông tin cán bộ");
    } else {
      const { id: _id, createdAt: _c, trangThai: _t, ...rest } = form as User;
      appStore.addUser({ ...rest, avatar } as Omit<User, "id" | "createdAt" | "trangThai">);
      toast.success("Đã thêm cán bộ mới");
    }
    setShowPanel(false);
  };
  const handleDelete = (u: User) => {
    if (window.confirm(`Bạn có chắc muốn xóa cán bộ "${u.hoTen}"?`)) {
      appStore.deleteUser(u.id);
      toast.success("Đã xóa cán bộ");
    }
  };
  const handleToggleStatus = (u: User) => {
    const newStatus = u.trangThai === "active" ? "locked" : "active";
    appStore.updateUser(u.id, { trangThai: newStatus });
    toast.success(newStatus === "active" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 w-64"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm cán bộ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0f4f8] border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Cán bộ</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Email</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Vai trò</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Đơn vị</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Trạng thái</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <EmptyState message="Không có cán bộ nào" />
            ) : filtered.map(u => {
              const ts = TRANG_THAI_USER_LABELS[u.trangThai] || TRANG_THAI_USER_LABELS.inactive;
              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #0d3b66, #1565c0)" }}>
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.hoTen}</p>
                        <p className="text-xs text-gray-400">{u.chucVu}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {VAI_TRO_LABELS[u.vaiTro]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[160px] truncate">{u.donViTen}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer"
                      style={{ color: ts.color, background: ts.bg }}
                      onClick={() => handleToggleStatus(u)}
                      title="Click để thay đổi trạng thái"
                    >
                      {ts.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ActionButtons onEdit={() => openEdit(u)} onDelete={() => handleDelete(u)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SidePanel
        open={showPanel}
        title={editItem ? "Chỉnh sửa cán bộ" : "Thêm cán bộ mới"}
        subtitle={editItem ? `Email: ${editItem.email}` : "Điền đầy đủ thông tin cán bộ"}
        onClose={() => setShowPanel(false)}
        onSubmit={handleSubmit}
      >
        <Field label="Họ và tên" required>
          <input value={form.hoTen || ""} onChange={e => setForm(f => ({ ...f, hoTen: e.target.value }))} className={inputCls} placeholder="Nguyễn Văn A" />
        </Field>
        <Field label="Email" required>
          <input value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="canbo@congantinhxx.gov.vn" type="email" />
        </Field>
        <Field label="Chức vụ">
          <input value={form.chucVu || ""} onChange={e => setForm(f => ({ ...f, chucVu: e.target.value }))} className={inputCls} placeholder="VD: Cán bộ nghiệp vụ" />
        </Field>
        <Field label="Vai trò" required>
          <SearchableSelect
            value={form.vaiTro || "canbonv"}
            onChange={(val) => setForm(f => ({ ...f, vaiTro: val as VaiTroTangVat }))}
            options={Object.entries(VAI_TRO_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            placeholder="— Chọn vai trò —"
            clearable={false}
          />
        </Field>
        <Field label="Đơn vị" required>
          <SearchableSelect
            value={form.donViId || ""}
            onChange={(val) => handleDonViChange(val)}
            options={donVi.map(dv => ({ value: dv.id, label: dv.ten }))}
            placeholder="-- Chọn đơn vị --"
            clearable={false}
          />
        </Field>
        <Field label="Số điện thoại">
          <input value={form.soDienThoai || ""} onChange={e => setForm(f => ({ ...f, soDienThoai: e.target.value }))} className={inputCls} placeholder="09xxxxxxxx" />
        </Field>
      </SidePanel>
    </>
  );
}

// ========================
// TAB 3: CAN CU PHAP LY MAU
// ========================
function TabCanCuPhapLy({ items }: { items: CanCuPhapLyMau[] }) {
  const [search, setSearch] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editItem, setEditItem] = useState<CanCuPhapLyMau | null>(null);
  const [form, setForm] = useState({ tieuDe: "", noiDung: "", linhVuc: "" });

  const filtered = items.filter(i =>
    i.tieuDe.toLowerCase().includes(search.toLowerCase()) ||
    i.linhVuc.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditItem(null);
    setForm({ tieuDe: "", noiDung: "", linhVuc: "" });
    setShowPanel(true);
  };
  const openEdit = (item: CanCuPhapLyMau) => {
    setEditItem(item);
    setForm({ tieuDe: item.tieuDe, noiDung: item.noiDung, linhVuc: item.linhVuc });
    setShowPanel(true);
  };
  const handleSubmit = () => {
    if (!form.tieuDe.trim() || !form.noiDung.trim()) {
      toast.error("Vui lòng nhập Tiêu đề và Nội dung");
      return;
    }
    if (editItem) {
      appStore.updateCanCuPhapLyMau(editItem.id, form);
      toast.success("Đã cập nhật căn cứ pháp lý");
    } else {
      appStore.addCanCuPhapLyMau(form);
      toast.success("Đã thêm căn cứ pháp lý mới");
    }
    setShowPanel(false);
  };
  const handleDelete = (item: CanCuPhapLyMau) => {
    if (window.confirm(`Xóa căn cứ pháp lý "${item.tieuDe}"?`)) {
      appStore.deleteCanCuPhapLyMau(item.id);
      toast.success("Đã xóa căn cứ pháp lý");
    }
  };

  const LINH_VUC_OPTIONS = ["Giao thông", "Kinh doanh", "Thực phẩm", "An ninh", "Tài nguyên", "Môi trường", "Khác"];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, lĩnh vực..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 w-72"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm căn cứ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0f4f8] border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Tiêu đề</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Nội dung (điều khoản)</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Lĩnh vực</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Ngày tạo</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <EmptyState message="Không có căn cứ pháp lý nào" />
            ) : filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800 max-w-[200px]">{item.tieuDe}</td>
                <td className="py-3 px-4 text-gray-600 max-w-[240px] truncate" title={item.noiDung}>{item.noiDung}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                    {item.linhVuc}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{item.createdAt}</td>
                <td className="py-3 px-4">
                  <ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidePanel
        open={showPanel}
        title={editItem ? "Chỉnh sửa căn cứ pháp lý" : "Thêm căn cứ pháp lý mẫu"}
        subtitle="Dùng làm gợi ý khi lập biên bản vi phạm"
        onClose={() => setShowPanel(false)}
        onSubmit={handleSubmit}
      >
        <Field label="Tiêu đề" required>
          <input value={form.tieuDe} onChange={e => setForm(f => ({ ...f, tieuDe: e.target.value }))} className={inputCls} placeholder="VD: Vi phạm giao thông đường bộ" />
        </Field>
        <Field label="Nội dung (điều khoản)" required>
          <textarea
            value={form.noiDung}
            onChange={e => setForm(f => ({ ...f, noiDung: e.target.value }))}
            className={`${inputCls} h-24 resize-none`}
            placeholder="VD: Điều 30 NĐ 100/2019/NĐ-CP về xử phạt vi phạm hành chính..."
          />
        </Field>
        <Field label="Lĩnh vực">
          <SearchableSelect
            value={form.linhVuc}
            onChange={(val) => setForm(f => ({ ...f, linhVuc: val }))}
            options={LINH_VUC_OPTIONS.map(lv => ({ value: lv, label: lv }))}
            placeholder="-- Chọn lĩnh vực --"
          />
        </Field>
      </SidePanel>
    </>
  );
}

// ========================
// TAB 4: DON VI TINH
// ========================
function TabDonViTinh({ items }: { items: DonViTinhDanhMuc[] }) {
  const [showPanel, setShowPanel] = useState(false);
  const [editItem, setEditItem] = useState<DonViTinhDanhMuc | null>(null);
  const [form, setForm] = useState({ ten: "", kyHieu: "", moTa: "" });
  // Inline add form
  const [inlineForm, setInlineForm] = useState({ ten: "", kyHieu: "", moTa: "" });

  const openEdit = (item: DonViTinhDanhMuc) => {
    setEditItem(item);
    setForm({ ten: item.ten, kyHieu: item.kyHieu, moTa: item.moTa });
    setShowPanel(true);
  };
  const handleSubmit = () => {
    if (!form.ten.trim() || !form.kyHieu.trim()) {
      toast.error("Vui lòng nhập Tên và Ký hiệu");
      return;
    }
    if (editItem) {
      appStore.updateDonViTinh(editItem.id, form);
      toast.success("Đã cập nhật đơn vị tính");
    }
    setShowPanel(false);
  };
  const handleDelete = (item: DonViTinhDanhMuc) => {
    if (window.confirm(`Xóa đơn vị tính "${item.ten}"?`)) {
      appStore.deleteDonViTinh(item.id);
      toast.success("Đã xóa đơn vị tính");
    }
  };
  const handleInlineAdd = () => {
    if (!inlineForm.ten.trim() || !inlineForm.kyHieu.trim()) {
      toast.error("Vui lòng nhập Tên và Ký hiệu");
      return;
    }
    appStore.addDonViTinh(inlineForm);
    toast.success("Đã thêm đơn vị tính");
    setInlineForm({ ten: "", kyHieu: "", moTa: "" });
  };

  return (
    <>
      {/* Inline add row */}
      <div className="mb-4 bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#0d3b66] mb-3 uppercase tracking-wide">Thêm đơn vị tính mới</p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Tên <span className="text-red-500">*</span></label>
            <input value={inlineForm.ten} onChange={e => setInlineForm(f => ({ ...f, ten: e.target.value }))} className={inputCls} placeholder="VD: Chiếc" />
          </div>
          <div className="w-28">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Ký hiệu <span className="text-red-500">*</span></label>
            <input value={inlineForm.kyHieu} onChange={e => setInlineForm(f => ({ ...f, kyHieu: e.target.value }))} className={inputCls} placeholder="chiếc" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Mô tả</label>
            <input value={inlineForm.moTa} onChange={e => setInlineForm(f => ({ ...f, moTa: e.target.value }))} className={inputCls} placeholder="Mô tả đơn vị tính" />
          </div>
          <button
            onClick={handleInlineAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0d3b66] text-white rounded-lg text-sm font-semibold hover:bg-[#0a2f52] transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0f4f8] border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Tên</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Ký hiệu</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Mô tả</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.length === 0 ? (
              <EmptyState message="Chưa có đơn vị tính nào" />
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-semibold text-gray-800">{item.ten}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-orange-50 text-orange-700 border border-orange-100">
                    {item.kyHieu}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{item.moTa}</td>
                <td className="py-3 px-4">
                  <ActionButtons onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SidePanel
        open={showPanel}
        title="Chỉnh sửa đơn vị tính"
        onClose={() => setShowPanel(false)}
        onSubmit={handleSubmit}
      >
        <Field label="Tên đơn vị tính" required>
          <input value={form.ten} onChange={e => setForm(f => ({ ...f, ten: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Ký hiệu" required>
          <input value={form.kyHieu} onChange={e => setForm(f => ({ ...f, kyHieu: e.target.value }))} className={inputCls} />
        </Field>
        <Field label="Mô tả">
          <input value={form.moTa} onChange={e => setForm(f => ({ ...f, moTa: e.target.value }))} className={inputCls} />
        </Field>
      </SidePanel>
    </>
  );
}

// ========================
// TAB 5: LOAI TANG VAT (reference)
// ========================
function TabLoaiTangVat() {
  return (
    <>
      <div className="mb-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <Shield className="w-5 h-5 mt-0.5 shrink-0" />
        <span>Đây là danh mục hệ thống, cần liên hệ quản trị viên cấp cao để thay đổi.</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0f4f8] border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Mã</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Tên loại tang vật</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Màu sắc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Object.entries(LOAI_TANG_VAT).map(([key, val]) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{key}</td>
                <td className="py-3 px-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ color: val.color, background: val.bg }}
                  >
                    {val.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200" style={{ background: val.color }} />
                    <span className="font-mono text-xs text-gray-400">{val.color}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ========================
// TAB 6: LOAI LUAN CHUYEN (reference)
// ========================
function TabLoaiLuanChuyen() {
  return (
    <>
      <div className="mb-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <Shield className="w-5 h-5 mt-0.5 shrink-0" />
        <span>Đây là danh mục hệ thống, cần liên hệ quản trị viên cấp cao để thay đổi.</span>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0f4f8] border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Mã</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Tên loại luân chuyển</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#0d3b66] uppercase tracking-wide">Màu sắc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Object.entries(LOAI_LUAN_CHUYEN).map(([key, val]) => (
              <tr key={key} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{key}</td>
                <td className="py-3 px-4">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ color: val.color, background: val.bg }}
                  >
                    {val.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200" style={{ background: val.color }} />
                    <span className="font-mono text-xs text-gray-400">{val.color}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ========================
// STATS CARD
// ========================
interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

function StatsCard({ label, value, icon: Icon, gradientFrom, gradientTo, borderColor, iconBg, iconColor }: StatsCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-default"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold" style={{ color: "#0d3b66" }}>{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor } as React.CSSProperties} />
        </div>
      </div>
    </div>
  );
}

// ========================
// MAIN COMPONENT
// ========================
export function DanhMuc() {
  const { donVi, users, canCuPhapLyMau, donViTinhDM } = useStoreState();
  const [activeTab, setActiveTab] = useState<TabId>("don-vi");

  const tabColorMap: Record<string, { active: string; hover: string }> = {
    blue:   { active: "bg-blue-600 text-white shadow-md",   hover: "hover:bg-blue-50 hover:text-blue-700" },
    green:  { active: "bg-green-600 text-white shadow-md",  hover: "hover:bg-green-50 hover:text-green-700" },
    purple: { active: "bg-purple-600 text-white shadow-md", hover: "hover:bg-purple-50 hover:text-purple-700" },
    orange: { active: "bg-orange-500 text-white shadow-md", hover: "hover:bg-orange-50 hover:text-orange-700" },
    red:    { active: "bg-red-600 text-white shadow-md",    hover: "hover:bg-red-50 hover:text-red-700" },
    gray:   { active: "bg-gray-600 text-white shadow-md",   hover: "hover:bg-gray-50 hover:text-gray-700" },
  };

  return (
    <div className="p-6 space-y-6 min-h-full" style={{ background: "#f0f4f8" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Hệ thống</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0d3b66] font-semibold">Quản lý danh mục</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0d3b66]">Quản lý danh mục</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý các danh mục dùng chung trong hệ thống</p>
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #0d3b66, #1565c0)" }}
        >
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Đơn vị"
          value={donVi.length}
          icon={Building2}
          colorClass="blue"
          gradientFrom="#ffffff"
          gradientTo="#eff6ff"
          borderColor="#bfdbfe"
          iconBg="#dbeafe"
          iconColor="#1d4ed8"
        />
        <StatsCard
          label="Cán bộ"
          value={users.length}
          icon={Users}
          colorClass="green"
          gradientFrom="#ffffff"
          gradientTo="#f0fdf4"
          borderColor="#bbf7d0"
          iconBg="#dcfce7"
          iconColor="#16a34a"
        />
        <StatsCard
          label="Căn cứ PL mẫu"
          value={canCuPhapLyMau.length}
          icon={BookOpen}
          colorClass="purple"
          gradientFrom="#ffffff"
          gradientTo="#faf5ff"
          borderColor="#e9d5ff"
          iconBg="#f3e8ff"
          iconColor="#9333ea"
        />
        <StatsCard
          label="Đơn vị tính"
          value={donViTinhDM.length}
          icon={Scale}
          colorClass="orange"
          gradientFrom="#ffffff"
          gradientTo="#fff7ed"
          borderColor="#fed7aa"
          iconBg="#ffedd5"
          iconColor="#ea580c"
        />
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex flex-wrap gap-1">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const colors = tabColorMap[tab.color];
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive ? colors.active : `text-gray-500 ${colors.hover}`
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "don-vi" && <TabDonVi donVi={donVi} />}
        {activeTab === "can-bo" && <TabCanBo users={users} donVi={donVi} />}
        {activeTab === "can-cu-phap-ly" && <TabCanCuPhapLy items={canCuPhapLyMau} />}
        {activeTab === "don-vi-tinh" && <TabDonViTinh items={donViTinhDM} />}
        {activeTab === "loai-tang-vat" && <TabLoaiTangVat />}
        {activeTab === "loai-luan-chuyen" && <TabLoaiLuanChuyen />}
      </div>
    </div>
  );
}
