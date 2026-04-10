import { useState, useMemo } from "react";
import {
  Bell, CheckCircle2, Clock, Inbox, MailOpen,
  AlertTriangle, Info, Settings, X, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import type { ThongBao as ThongBaoType } from "../lib/types";

const LOAI_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  he_thong: { label: "Hệ thống", color: "#1565c0", bg: "#e3f2fd", icon: Settings },
  canh_bao: { label: "Cảnh báo", color: "#c62828", bg: "#ffebee", icon: AlertTriangle },
  phe_duyet: { label: "Phê duyệt", color: "#7b1fa2", bg: "#f3e5f5", icon: CheckCircle2 },
  nhac_nho: { label: "Nhắc nhở", color: "#e65100", bg: "#fff3e0", icon: Clock },
};

export function ThongBao() {
  const { thongBao, currentUser, store } = useStoreState();
  const [filterType, setFilterType] = useState("all");
  const [selected, setSelected] = useState<ThongBaoType | null>(null);

  const myNotifs = useMemo(() =>
    thongBao.filter(n => n.nguoiNhanId === currentUser.id || currentUser.vaiTro === "admin"),
    [thongBao, currentUser]
  );

  const filtered = useMemo(() =>
    myNotifs.filter(n => filterType === "all" || n.loai === filterType),
    [myNotifs, filterType]
  );

  const stats = useMemo(() => [
    { label: "Tổng thông báo", value: myNotifs.length, icon: Inbox, color: "#0d3b66" },
    { label: "Chưa đọc", value: myNotifs.filter(n => !n.daDoc).length, icon: MailOpen, color: "#c62828" },
    { label: "Cảnh báo", value: myNotifs.filter(n => n.loai === "canh_bao").length, icon: AlertTriangle, color: "#e65100" },
    { label: "Phê duyệt", value: myNotifs.filter(n => n.loai === "phe_duyet").length, icon: CheckCircle2, color: "#7b1fa2" },
  ], [myNotifs]);

  const handleSelect = (notif: ThongBaoType) => {
    setSelected(notif);
    if (!notif.daDoc) store.markThongBaoDaDoc(notif.id);
  };

  const handleMarkAllRead = () => {
    store.markAllThongBaoDaDoc();
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  const unreadCount = myNotifs.filter(n => !n.daDoc).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0d3b66]">Thông báo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý thông báo hệ thống, cảnh báo và nhắc nhở
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-border bg-white rounded-lg text-sm hover:bg-[#f8fafc] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Đọc tất cả ({unreadCount})
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Inbox className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">TỔNG THÔNG BÁO</p>
            <p className="text-2xl font-bold text-gray-900">{myNotifs.length}</p>
            <p className="text-xs text-gray-600 mt-1">tổng số thông báo</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <MailOpen className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">CHƯA ĐỌC</p>
            <p className="text-2xl font-bold text-gray-900">{myNotifs.filter(n => !n.daDoc).length}</p>
            <p className="text-xs text-gray-600 mt-1">thông báo chưa đọc</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">CẢNH BÁO</p>
            <p className="text-2xl font-bold text-gray-900">{myNotifs.filter(n => n.loai === "canh_bao").length}</p>
            <p className="text-xs text-gray-600 mt-1">thông báo cảnh báo</p>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">PHÊ DUYỆT</p>
            <p className="text-2xl font-bold text-gray-900">{myNotifs.filter(n => n.loai === "phe_duyet").length}</p>
            <p className="text-xs text-gray-600 mt-1">thông báo phê duyệt</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "Tất cả" },
          { value: "canh_bao", label: "Cảnh báo" },
          { value: "phe_duyet", label: "Phê duyệt" },
          { value: "nhac_nho", label: "Nhắc nhở" },
          { value: "he_thong", label: "Hệ thống" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterType === f.value
                ? "bg-[#0d3b66] text-white"
                : "bg-white border border-border text-[#5a6a7e] hover:bg-[#f8fafc]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-[#e2e8f0]" />
                <p className="text-sm">Không có thông báo</p>
              </div>
            ) : (
              filtered.map((notif) => {
                const cfg = LOAI_CONFIG[notif.loai] ?? LOAI_CONFIG.he_thong;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleSelect(notif)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selected?.id === notif.id ? "bg-[#e8eef5]" : "hover:bg-[#f8fafc]"
                    } ${!notif.daDoc ? "border-l-4 border-l-[#0d3b66]" : "border-l-4 border-l-transparent"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ fontWeight: notif.daDoc ? 400 : 600 }}>
                          {notif.tieuDe}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.nguoiNhanTen}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ color: cfg.color, backgroundColor: cfg.bg }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{notif.ngayTao}</span>
                          {!notif.daDoc && (
                            <span className="w-2 h-2 rounded-full bg-[#0d3b66]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-border shadow-sm p-6">
          {selected ? (
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const cfg = LOAI_CONFIG[selected.loai] ?? LOAI_CONFIG.he_thong;
                    const Icon = cfg.icon;
                    return (
                      <span
                        className="px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}
                      >
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    );
                  })()}
                  <span className="text-xs text-muted-foreground">{selected.ngayTao}</span>
                  {selected.daDoc ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#f0f4f8] text-muted-foreground">Đã đọc</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-[#e3f2fd] text-[#1565c0] font-medium">Chưa đọc</span>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-[#1a2332]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title */}
              <h3 className="text-[#0d3b66] font-semibold mb-4">{selected.tieuDe}</h3>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-[#f8fafc] rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Người nhận</p>
                  <p className="text-sm font-medium">{selected.nguoiNhanTen}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Thời gian</p>
                  <p className="text-sm font-medium">{selected.ngayTao}</p>
                </div>
                {selected.tangVatId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Tang vật</p>
                    <p className="text-sm font-medium text-[#0d3b66]">{selected.tangVatId}</p>
                  </div>
                )}
                {selected.hoSoId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Hồ sơ</p>
                    <p className="text-sm font-medium text-[#0d3b66]">{selected.hoSoId}</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Nội dung</p>
                <p className="text-sm leading-relaxed p-4 bg-[#f8fafc] rounded-lg">{selected.noiDung}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-5 pt-4 border-t border-border">
                {selected.tangVatId && (
                  <button
                    onClick={() => { /* navigate to tang vat */ }}
                    className="px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center gap-1.5"
                  >
                    Xem tang vật
                  </button>
                )}
                {selected.hoSoId && (
                  <button
                    onClick={() => { /* navigate to ho so */ }}
                    className="px-4 py-2 border border-[#0d3b66] text-[#0d3b66] rounded-lg text-sm hover:bg-[#e8eef5] flex items-center gap-1.5"
                  >
                    Xem hồ sơ
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-[#e2e8f0]" />
                <p className="text-sm">Chọn một thông báo để xem chi tiết</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
