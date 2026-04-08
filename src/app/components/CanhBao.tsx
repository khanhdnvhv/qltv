import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Package, Warehouse, ShoppingCart,
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
        <h1 className="text-[#0d3b66]">Cảnh báo tang vật</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Theo dõi và xử lý các cảnh báo tang vật quá hạn, sắp đến hạn và các vấn đề cần xử lý
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffebee] flex items-center justify-center">
              <XCircle className="w-5 h-5 text-[#c62828]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c62828]">{counts.critical}</p>
              <p className="text-xs text-muted-foreground">Quá hạn</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff3e0] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#e65100]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e65100]">{counts.warning}</p>
              <p className="text-xs text-muted-foreground">Sắp đến hạn</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e3f2fd] flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#1565c0]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1565c0]">{counts.info}</p>
              <p className="text-xs text-muted-foreground">Thông tin</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#2e7d32]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#2e7d32]">{counts.resolved}</p>
              <p className="text-xs text-muted-foreground">Đã xử lý</p>
            </div>
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
