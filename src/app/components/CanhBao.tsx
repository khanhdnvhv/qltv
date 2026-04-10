import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Package, Warehouse, ShoppingCart, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useStoreState } from "../hooks/useStoreState";
import { LOAI_CANH_BAO } from "../lib/constants";
import type { CanhBao as CanhBaoType } from "../lib/types";

type TabId = "critical" | "warning" | "ban_ngay" | "resolved";

const TABS: { id: TabId; label: string; icon: any; activeColor: string; activeBg: string }[] = [
  { id: "critical", label: "Quá hạn", icon: XCircle, activeColor: "#c62828", activeBg: "#ffebee" },
  { id: "warning", label: "Sắp đến hạn", icon: AlertTriangle, activeColor: "#e65100", activeBg: "#fff3e0" },
  { id: "ban_ngay", label: "Hàng cần bán ngay", icon: ShoppingCart, activeColor: "#7b1fa2", activeBg: "#f3e5f5" },
  { id: "resolved", label: "Đã xử lý", icon: CheckCircle2, activeColor: "#2e7d32", activeBg: "#e8f5e9" },
];

export function CanhBao() {
  const { canhBao, store } = useStoreState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("critical");

  // Generate dynamic food/medicine alerts
  const thucPhamAlerts = useMemo(() => store.generateCanhBaoThucPham(), [store]);

  // Stats per tab
  const counts = useMemo(() => ({
    critical: canhBao.filter(a => a.loai === "critical" && !a.daXuLy).length,
    warning: canhBao.filter(a => a.loai === "warning" && !a.daXuLy).length,
    ban_ngay: thucPhamAlerts.length,
    info: canhBao.filter(a => a.loai === "info" && !a.daXuLy).length,
    resolved: canhBao.filter(a => a.daXuLy).length,
  }), [canhBao, thucPhamAlerts]);

  // Items per tab
  const items = useMemo((): CanhBaoType[] => {
    if (activeTab === "critical") return canhBao.filter(a => a.loai === "critical" && !a.daXuLy);
    if (activeTab === "warning") return canhBao.filter(a => a.loai === "warning" && !a.daXuLy);
    if (activeTab === "ban_ngay") return thucPhamAlerts;
    if (activeTab === "resolved") return canhBao.filter(a => a.daXuLy);
    return [];
  }, [canhBao, activeTab, thucPhamAlerts]);

  const handleResolve = (id: string) => {
    store.markCanhBaoDaXuLy(id);
    toast.success("Đã đánh dấu đã xử lý");
  };

  const handleNavigate = (alert: CanhBaoType) => {
    if (alert.tangVatId) navigate("/tang-vat");
    else if (alert.khoId) navigate("/kho-bai");
    else navigate("/ho-so");
  };

  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0d3b66] flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Cảnh báo tang vật
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Theo dõi và xử lý các cảnh báo tang vật quá hạn, sắp đến hạn và các vấn đề cần xử lý</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Quá hạn</p>
            <p className="text-2xl font-bold text-gray-900">{counts.critical}</p>
            <p className="text-xs text-gray-600 mt-1">cần xử lý ngay</p>
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
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Sắp đến hạn</p>
            <p className="text-2xl font-bold text-gray-900">{counts.warning}</p>
            <p className="text-xs text-gray-600 mt-1">cần chú ý</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Hàng cần bán ngay</p>
            <p className="text-2xl font-bold text-gray-900">{counts.ban_ngay}</p>
            <p className="text-xs text-gray-600 mt-1">thực phẩm/thuốc</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Đã xử lý</p>
            <p className="text-2xl font-bold text-gray-900">{counts.resolved}</p>
            <p className="text-xs text-gray-600 mt-1">hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-border rounded-xl p-1 shadow-sm w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = (counts as Record<string, number>)[tab.id] ?? 0;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all"
              style={{
                backgroundColor: isActive ? tab.activeBg : "transparent",
                color: isActive ? tab.activeColor : "#5a6a7e",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span
                className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center"
                style={{
                  backgroundColor: isActive ? tab.activeColor : "#e2e8f0",
                  color: isActive ? "white" : "#5a6a7e",
                  fontWeight: 600,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-[#e2e8f0]" />
            <p className="text-muted-foreground">
              {activeTab === "resolved" ? "Chưa có cảnh báo nào được xử lý" : activeTab === "ban_ngay" ? "Không có hàng thực phẩm/dược phẩm nào sắp hết hạn" : "Không có cảnh báo nào"}
            </p>
          </div>
        ) : (
          items.map((alert) => {
            const config = LOAI_CANH_BAO[alert.loai];
            const Icon = config.icon;
            const isOverdue = alert.soNgayConLai !== undefined && alert.soNgayConLai < 0;
            return (
              <div
                key={alert.id}
                className="bg-white rounded-xl border border-border border-l-4 p-5 shadow-sm transition-all hover:shadow-md"
                style={{ borderLeftColor: config.color }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: config.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Type + Date badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ color: config.color, backgroundColor: config.bg }}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{alert.ngayTao}</span>
                      {alert.daXuLy && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#2e7d32] font-medium">
                          Đã xử lý
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-[#1a2332] font-semibold">{alert.tieuDe}</h4>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{alert.moTa}</p>

                    {/* Detail fields */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {alert.tenTangVat && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Package className="w-3.5 h-3.5 text-[#0d3b66]" />
                          <span className="font-medium text-[#0d3b66]">{alert.tenTangVat}</span>
                        </div>
                      )}
                      {alert.maBienBan && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>Hồ sơ:</span>
                          <span className="font-medium text-[#0d3b66]">{alert.maBienBan}</span>
                        </div>
                      )}
                      {alert.khoTen && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Warehouse className="w-3.5 h-3.5" />
                          <span>{alert.khoTen}</span>
                        </div>
                      )}
                      {alert.canBoTen && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>Cán bộ PT:</span>
                          <span className="font-medium">{alert.canBoTen}</span>
                        </div>
                      )}
                      {alert.ngayHetHan && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Hết hạn:</span>
                          <span
                            className="font-medium"
                            style={{ color: isOverdue ? "#c62828" : alert.soNgayConLai !== undefined && alert.soNgayConLai <= 7 ? "#e65100" : "#1a2332" }}
                          >
                            {alert.ngayHetHan}
                          </span>
                          {alert.soNgayConLai !== undefined && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{
                                backgroundColor: isOverdue ? "#ffebee" : alert.soNgayConLai <= 7 ? "#fff3e0" : "#e8f5e9",
                                color: isOverdue ? "#c62828" : alert.soNgayConLai <= 7 ? "#e65100" : "#2e7d32",
                              }}
                            >
                              {isOverdue ? `Quá ${Math.abs(alert.soNgayConLai)} ngày` : `Còn ${alert.soNgayConLai} ngày`}
                            </span>
                          )}
                        </div>
                      )}
                      {alert.ngayXuLy && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>Ngày xử lý:</span>
                          <span className="font-medium text-[#2e7d32]">{alert.ngayXuLy}</span>
                        </div>
                      )}
                      {alert.nguoiXuLyTen && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>Người xử lý:</span>
                          <span className="font-medium">{alert.nguoiXuLyTen}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!alert.daXuLy && (
                    <div className="flex items-center gap-2 shrink-0">
                      {activeTab === "ban_ngay" ? (
                        <button
                          onClick={() => { navigate("/xu-ly"); toast.info("Chuyển đến trang xử lý — chọn hình thức Bán trực tiếp"); }}
                          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1.5 transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Xử lý bán ngay
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="px-3 py-1.5 text-sm border border-[#2e7d32] text-[#2e7d32] rounded-lg hover:bg-[#e8f5e9] flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã xử lý
                          </button>
                          <button
                            onClick={() => handleNavigate(alert)}
                            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-[#f8fafc] flex items-center gap-1 transition-colors"
                          >
                            Xử lý
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
