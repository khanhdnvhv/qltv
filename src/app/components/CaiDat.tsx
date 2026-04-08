import {
  Settings, User, Shield, Bell, Globe,
  Database, Key, Monitor, Save, Lock, Unlock, RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { VAI_TRO_LABELS } from "../lib/constants";
import type { CauHinh } from "../lib/types";

const sections = [
  { id: "general", label: "Cấu hình chung", icon: Settings },
  { id: "users", label: "Người dùng", icon: User },
  { id: "security", label: "Bảo mật", icon: Shield },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "integration", label: "Tích hợp", icon: Globe },
];

export function CaiDat() {
  const { cauHinh, users, currentUser, store } = useStoreState();
  const [activeSection, setActiveSection] = useState("general");
  const [localConfig, setLocalConfig] = useState<CauHinh>({ ...cauHinh });
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const updateConfig = (key: keyof CauHinh, value: any) => {
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
          {/* General config */}
          {activeSection === "general" && (
            <div className="space-y-6">
              <h3 className="text-[#0d3b66] font-semibold">Cấu hình chung</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Tên hệ thống</label>
                  <input
                    type="text"
                    value={localConfig.tenHeThong}
                    onChange={e => updateConfig("tenHeThong", e.target.value)}
                    className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Tên đơn vị Công an</label>
                  <input
                    type="text"
                    value={localConfig.tenCongAn}
                    onChange={e => updateConfig("tenCongAn", e.target.value)}
                    className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Mô tả</label>
                  <textarea
                    rows={3}
                    value={localConfig.moTa}
                    onChange={e => updateConfig("moTa", e.target.value)}
                    className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Cảnh báo trước hạn (ngày)
                    </label>
                    <input
                      type="number"
                      value={localConfig.soNgayCanhBaoTruocHan}
                      onChange={e => updateConfig("soNgayCanhBaoTruocHan", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                      min={1}
                      max={90}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Số ngày lưu kho tối đa
                    </label>
                    <input
                      type="number"
                      value={localConfig.soNgayLuuKhoToiDa}
                      onChange={e => updateConfig("soNgayLuuKhoToiDa", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                      min={30}
                      max={3650}
                    />
                  </div>
                </div>
                <ToggleItem
                  label="Tự động cảnh báo"
                  desc="Tự động tạo cảnh báo khi tang vật sắp quá hạn"
                  enabled={localConfig.tuDongCanhBao}
                  onToggle={v => updateConfig("tuDongCanhBao", v)}
                />
                <ToggleItem
                  label="Bắt buộc niêm phong"
                  desc="Yêu cầu niêm phong trước khi nhập kho"
                  enabled={localConfig.yeuCauNiemPhong}
                  onToggle={v => updateConfig("yeuCauNiemPhong", v)}
                />
                <ToggleItem
                  label="Bắt buộc hình ảnh"
                  desc={`Yêu cầu tối thiểu ${localConfig.soAnhToiThieu} ảnh khi nhập tang vật`}
                  enabled={localConfig.batBuocHinhAnh}
                  onToggle={v => updateConfig("batBuocHinhAnh", v)}
                />
              </div>
            </div>
          )}

          {/* Users */}
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
                      <div className="w-10 h-10 rounded-full bg-[#0d3b66] text-white flex items-center justify-center text-sm font-semibold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.hoTen}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.chucVu} · {user.donViTen}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-[#e8eef5] text-[#0d3b66] rounded text-xs font-medium">
                        {VAI_TRO_LABELS[user.vaiTro]}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${user.trangThai === "active" ? "bg-[#2e7d32]" : "bg-[#c62828]"}`} />
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleToggleUser(user.id, user.trangThai)}
                          className="p-1.5 rounded-lg hover:bg-white transition-colors"
                          title={user.trangThai === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {user.trangThai === "active"
                            ? <Lock className="w-4 h-4 text-muted-foreground" />
                            : <Unlock className="w-4 h-4 text-[#c62828]" />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <h3 className="text-[#0d3b66] font-semibold">Cấu hình bảo mật</h3>
              <div className="space-y-4">
                <ToggleItem
                  label="Ghi nhật ký hoạt động"
                  desc="Ghi nhận mọi thao tác của người dùng (Audit Trail)"
                  enabled={localConfig.logHoatDong}
                  onToggle={v => updateConfig("logHoatDong", v)}
                />
                <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Session timeout</p>
                    <p className="text-xs text-muted-foreground">
                      Tự động đăng xuất sau {localConfig.sessionTimeout} phút không hoạt động
                    </p>
                  </div>
                  <input
                    type="number"
                    value={localConfig.sessionTimeout}
                    onChange={e => updateConfig("sessionTimeout", Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-white border border-border rounded text-sm text-center"
                    min={5}
                    max={480}
                  />
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-lg">
                  <p className="text-sm font-medium mb-1">Số ảnh tối thiểu khi nhập tang vật</p>
                  <p className="text-xs text-muted-foreground mb-2">Áp dụng khi bật "Bắt buộc hình ảnh"</p>
                  <input
                    type="number"
                    value={localConfig.soAnhToiThieu}
                    onChange={e => updateConfig("soAnhToiThieu", Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-white border border-border rounded-lg text-sm"
                    min={1}
                    max={10}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-[#0d3b66] font-semibold">Cấu hình thông báo</h3>
              <div className="space-y-4">
                <ToggleItem
                  label="Email cảnh báo tang vật"
                  desc="Gửi email khi tang vật sắp quá hạn hoặc có vấn đề"
                  enabled={localConfig.emailCanhBao}
                  onToggle={v => updateConfig("emailCanhBao", v)}
                />
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Email nhận cảnh báo</label>
                  <input
                    type="email"
                    value={localConfig.emailNhan}
                    onChange={e => updateConfig("emailNhan", e.target.value)}
                    className="w-full px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="p-4 bg-[#fff8e1] rounded-lg border border-[#ffc107]/30">
                  <p className="text-sm font-medium text-[#f57f17]">Lưu ý</p>
                  <p className="text-xs text-[#f57f17]/80 mt-1">
                    Email thông báo sẽ được gửi tự động khi tang vật còn {localConfig.soNgayCanhBaoTruocHan} ngày đến hạn lưu kho.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Integration */}
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
                    <button
                      onClick={() => toast.info("Chức năng đang phát triển")}
                      className={`w-full py-2 rounded-lg text-sm transition-colors ${
                        item.status === "connected"
                          ? "border border-border text-[#5a6a7e] hover:bg-[#f8fafc]"
                          : "bg-[#0d3b66] text-white hover:bg-[#0a2f52]"
                      }`}
                    >
                      {item.status === "connected" ? "Cấu hình" : "Kết nối"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 border border-border text-muted-foreground rounded-lg text-sm hover:bg-[#f8fafc] flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục mặc định
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-5 py-2.5 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirm Dialog */}
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
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setLocalConfig({ ...cauHinh });
                  setHasChanges(false);
                  setShowResetConfirm(false);
                  toast.success("Đã khôi phục cấu hình mặc định");
                }}
                className="flex-1 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700"
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleItem({
  label,
  desc,
  enabled,
  onToggle,
}: {
  label: string;
  desc?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-lg">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? "bg-[#0d3b66]" : "bg-[#e2e8f0]"}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${enabled ? "right-0.5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}
