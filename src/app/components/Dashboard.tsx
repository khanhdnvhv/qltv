import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Package, Warehouse, AlertTriangle, XCircle, ArrowRight,
  TrendingUp, CheckCircle2, Clock, Gavel,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useStoreState } from "../hooks/useStoreState";
import { TRANG_THAI_TANG_VAT, LOAI_TANG_VAT, LOAI_CANH_BAO } from "../lib/constants";

function formatNum(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n);
}
function formatVND(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`;
  return formatNum(n) + " đ";
}

const PIE_COLORS = ["#1565c0", "#e65100", "#2e7d32", "#c62828", "#7b1fa2", "#f57f17", "#00695c", "#546e7a", "#0277bd"];

export function Dashboard() {
  const { store } = useStoreState();
  const navigate = useNavigate();

  const stats = useMemo(() => store.getStatsOverview(), [store]);
  const tangVatByLoai = useMemo(() => store.getTangVatByLoai(), [store]);
  const tangVatByKho = useMemo(() => store.getTangVatByKho(), [store]);
  const nhapXuat = useMemo(() => store.getNhapXuatTheoThang(), [store]);
  const sapHan = useMemo(() => store.getTangVatSapHanLuuKho().slice(0, 5), [store]);
  const activeCB = useMemo(() =>
    store.canhBao.filter((c) => !c.daXuLy).slice(0, 5),
    [store]
  );

  const kpiCards = [
    {
      label: "Tổng tang vật",
      value: stats.tongTangVat,
      icon: Package,
      color: "#0d3b66",
      bg: "#e8eef5",
      sub: `${formatVND(stats.tongGiaTri)} ước tính`,
      to: "/tang-vat",
    },
    {
      label: "Đang lưu kho",
      value: stats.dangLuuKho,
      icon: Warehouse,
      color: "#1565c0",
      bg: "#e3f2fd",
      sub: `${stats.choNhapKho} chờ nhập kho`,
      to: "/kho-bai",
    },
    {
      label: "Sắp đến hạn",
      value: stats.sapHanLuuKho,
      icon: AlertTriangle,
      color: "#e65100",
      bg: "#fff3e0",
      sub: "Trong vòng 30 ngày tới",
      to: "/canh-bao",
    },
    {
      label: "Quá hạn lưu kho",
      value: stats.quaHanLuuKho,
      icon: XCircle,
      color: "#c62828",
      bg: "#ffebee",
      sub: "Cần xử lý gấp",
      to: "/canh-bao",
      alert: true,
    },
    {
      label: "Chờ xử lý",
      value: stats.choXuLy,
      icon: Clock,
      color: "#f57f17",
      bg: "#fff8e1",
      sub: `${stats.daTichThu} tịch thu · ${stats.daTieuHuy} tiêu hủy`,
      to: "/xu-ly",
    },
    {
      label: "Đã xử lý xong",
      value: stats.daTra + stats.daTichThu + stats.daTieuHuy + stats.daBan,
      icon: CheckCircle2,
      color: "#2e7d32",
      bg: "#e8f5e9",
      sub: `${stats.daTra} trả lại · ${stats.daBan} bán`,
      to: "/xu-ly",
    },
  ];

  const pieData = useMemo(() =>
    tangVatByLoai.map((item, i) => ({
      name: LOAI_TANG_VAT[item.loai as keyof typeof LOAI_TANG_VAT]?.label || item.loai,
      value: item.soLuong,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })),
    [tangVatByLoai]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0d3b66]">Tổng quan Tang Vật</h1>
        <p className="text-gray-500 text-sm mt-1">
          Cập nhật lần cuối: 07/04/2026 08:00 &nbsp;·&nbsp; Hệ thống đang hoạt động bình thường
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.to)}
            className={`rounded-xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 p-4 ${
              card.alert ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              {card.alert && card.value > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {formatNum(card.value)}
            </p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie chart - loai tang vat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Phân bố theo loại tang vật</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [formatNum(v) + " tang vật", n]}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - nhap/xuat */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Nhập / Xuất kho 6 tháng gần đây</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={nhapXuat} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="thang" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, n: string) => [formatNum(v), n === "nhap" ? "Nhập kho" : "Xuất kho"]}
              />
              <Legend
                formatter={(v) => (
                  <span className="text-xs text-gray-600">{v === "nhap" ? "Nhập kho" : "Xuất kho"}</span>
                )}
              />
              <Bar dataKey="nhap" fill="#1565c0" radius={[4, 4, 0, 0]} name="nhap" />
              <Bar dataKey="xuat" fill="#2e7d32" radius={[4, 4, 0, 0]} name="xuat" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart tong kho */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Tồn kho theo từng kho bãi</h2>
        <div className="space-y-3">
          {tangVatByKho.map((k) => {
            const pct = k.sucChua > 0 ? Math.round((k.dangLuu / k.sucChua) * 100) : 0;
            const barColor = pct > 80 ? "#c62828" : pct > 60 ? "#e65100" : "#1565c0";
            return (
              <div key={k.khoId} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 w-52 shrink-0 truncate">{k.khoTen}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                  />
                </div>
                <span className="text-sm font-semibold w-24 text-right" style={{ color: barColor }}>
                  {formatNum(k.dangLuu)}/{formatNum(k.sucChua)} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canh bao moi nhat */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Cảnh báo mới nhất</h2>
            <button
              onClick={() => navigate("/canh-bao")}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {activeCB.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Không có cảnh báo</p>
            ) : (
              activeCB.map((cb) => {
                const cfg = LOAI_CANH_BAO[cb.loai];
                const Icon = cfg.icon;
                return (
                  <div
                    key={cb.id}
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: cfg.bg }}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: cfg.color }}>
                        {cb.tieuDe}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{cb.moTa}</p>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                      style={{ background: cfg.color + "20", color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tang vat sap het han */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Tang vật sắp hết hạn lưu kho</h2>
            <button
              onClick={() => navigate("/tang-vat")}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {sapHan.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Không có tang vật sắp hết hạn</p>
            ) : (
              sapHan.map((tv) => {
                const now = new Date();
                const parts = (tv.hanLuuKho || "").split("/").map(Number);
                const han = new Date(parts[2], parts[1] - 1, parts[0]);
                const diffDays = Math.ceil((han.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;
                const color = isOverdue ? "#c62828" : diffDays <= 7 ? "#e65100" : "#f57f17";
                const ttCfg = TRANG_THAI_TANG_VAT[tv.trangThai];
                return (
                  <div
                    key={tv.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate("/tang-vat")}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tv.ten}</p>
                      <p className="text-xs text-gray-400">{tv.maTangVat} &nbsp;·&nbsp; {tv.khoTen}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold" style={{ color }}>
                        {isOverdue ? `Quá ${Math.abs(diffDays)} ngày` : `Còn ${diffDays} ngày`}
                      </p>
                      <p className="text-xs text-gray-400">{tv.hanLuuKho}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* KPI Tiến độ */}
      {(() => {
        const kpi = store.getKpiTienDo();
        const gauges = [
          { label: "Hoàn thành hồ sơ", value: kpi.tiLeHoanThanhHoSo, sub: `${kpi.hoanThanh}/${kpi.tongHoSo} hồ sơ`, color: kpi.tiLeHoanThanhHoSo >= 70 ? "#2e7d32" : kpi.tiLeHoanThanhHoSo >= 40 ? "#e65100" : "#c62828", bg: kpi.tiLeHoanThanhHoSo >= 70 ? "#e8f5e9" : kpi.tiLeHoanThanhHoSo >= 40 ? "#fff3e0" : "#ffebee" },
          { label: "Xử lý tang vật", value: kpi.tiLeXuLyTangVat, sub: `${kpi.daXuLy}/${kpi.tongTV} tang vật`, color: kpi.tiLeXuLyTangVat >= 60 ? "#2e7d32" : kpi.tiLeXuLyTangVat >= 30 ? "#e65100" : "#c62828", bg: kpi.tiLeXuLyTangVat >= 60 ? "#e8f5e9" : kpi.tiLeXuLyTangVat >= 30 ? "#fff3e0" : "#ffebee" },
          { label: "Tang vật quá hạn", value: kpi.tiLeQuaHan, sub: `${kpi.quaHan}/${kpi.tongTV} tang vật`, color: kpi.tiLeQuaHan === 0 ? "#2e7d32" : kpi.tiLeQuaHan <= 10 ? "#e65100" : "#c62828", bg: kpi.tiLeQuaHan === 0 ? "#e8f5e9" : kpi.tiLeQuaHan <= 10 ? "#fff3e0" : "#ffebee", inverse: true },
        ];
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">KPI Tiến độ xử lý</h2>
            <div className="grid grid-cols-3 gap-6">
              {gauges.map((g) => (
                <div key={g.label} className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={g.color} strokeWidth="10"
                        strokeDasharray={`${(g.value / 100) * 251.2} 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold" style={{ color: g.color }}>{g.value}%</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{g.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{g.sub}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
