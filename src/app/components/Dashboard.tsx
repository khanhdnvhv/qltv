import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Package, Warehouse, AlertTriangle, XCircle, ArrowRight,
  TrendingUp, CheckCircle2, Clock,
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

const TRANG_THAI_COLOR: Record<string, string> = {
  cho_nhap_kho: "#f57f17",
  dang_luu_kho: "#1565c0",
  dang_xu_ly: "#7b1fa2",
  cho_xu_ly: "#e65100",
  da_tra_lai: "#2e7d32",
  da_tieu_huy: "#546e7a",
  da_tich_thu: "#c62828",
  da_ban: "#00695c",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-lg">
      <p className="text-sm mb-1 font-semibold text-[#0d3b66]">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export function Dashboard() {
  const { store, tangVat, kho } = useStoreState();
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

  /* Pie by loại */
  const pieLoai = useMemo(() =>
    tangVatByLoai.map((item, i) => ({
      name: LOAI_TANG_VAT[item.loai as keyof typeof LOAI_TANG_VAT]?.label || item.loai,
      value: item.soLuong,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })),
    [tangVatByLoai]
  );

  /* Pie by trạng thái */
  const pieTrangThai = useMemo(() => {
    const groups: Record<string, number> = {};
    tangVat.forEach(tv => {
      groups[tv.trangThai] = (groups[tv.trangThai] ?? 0) + 1;
    });
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        name: TRANG_THAI_TANG_VAT[k as keyof typeof TRANG_THAI_TANG_VAT]?.label ?? k,
        value: v,
        fill: TRANG_THAI_COLOR[k] ?? "#90a4ae",
      }));
  }, [tangVat]);

  const totalTangVat = tangVat.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0d3b66]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tổng quan hệ thống quản lý tang vật &nbsp;·&nbsp; Vĩnh Phúc
        </p>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Tổng tang vật */}
        <div onClick={() => navigate("/tang-vat")}
          className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Package className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">TỔNG TANG VẬT</p>
            <p className="text-2xl font-black text-blue-900">{formatNum(stats.tongTangVat)}</p>
            <p className="text-xs text-blue-600/60 mt-1">{formatVND(stats.tongGiaTri)} ước tính</p>
          </div>
        </div>

        {/* 2. Đang lưu kho */}
        <div onClick={() => navigate("/kho-bai")}
          className="group relative overflow-hidden bg-gradient-to-br from-white to-cyan-50 border border-cyan-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-200">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">ĐANG LƯU KHO</p>
            <p className="text-2xl font-black text-cyan-900">{formatNum(stats.dangLuuKho)}</p>
            <p className="text-xs text-cyan-600/60 mt-1">{stats.choNhapKho} chờ nhập kho</p>
          </div>
        </div>

        {/* 3. Sắp đến hạn */}
        <div onClick={() => navigate("/canh-bao")}
          className="group relative overflow-hidden bg-gradient-to-br from-white to-amber-50 border border-amber-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">SẮP ĐẾN HẠN</p>
            <p className="text-2xl font-black text-amber-900">{formatNum(stats.sapHanLuuKho)}</p>
            <p className="text-xs text-amber-600/60 mt-1">Trong vòng 30 ngày tới</p>
          </div>
        </div>

        {/* 4. Quá hạn lưu kho */}
        <div onClick={() => navigate("/canh-bao")}
          className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">QUÁ HẠN LƯU KHO</p>
            <p className="text-2xl font-black text-red-900">{formatNum(stats.quaHanLuuKho)}</p>
            <p className="text-xs text-red-600/60 mt-1">Cần xử lý gấp</p>
          </div>
        </div>

        {/* 5. Chờ xử lý */}
        <div onClick={() => navigate("/xu-ly")}
          className="group relative overflow-hidden bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">CHỜ XỬ LÝ</p>
            <p className="text-2xl font-black text-orange-900">{formatNum(stats.choXuLy)}</p>
            <p className="text-xs text-orange-600/60 mt-1">{stats.daTichThu} tịch thu · {stats.daTieuHuy} tiêu hủy</p>
          </div>
        </div>

        {/* 6. Đã xử lý xong */}
        <div onClick={() => navigate("/xu-ly")}
          className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">ĐÃ XỬ LÝ XONG</p>
            <p className="text-2xl font-black text-green-900">{formatNum(stats.daTra + stats.daTichThu + stats.daTieuHuy + stats.daBan)}</p>
            <p className="text-xs text-green-600/60 mt-1">{stats.daTra} trả lại · {stats.daBan} bán</p>
          </div>
        </div>
      </div>

      {/* Charts row 1: Trạng thái + Nhập/Xuất */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie: Trạng thái tang vật */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Trạng thái tang vật</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieTrangThai}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomPieLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {pieTrangThai.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [formatNum(v) + " tang vật", n]} />
              <Legend
                layout="vertical" align="right" verticalAlign="middle"
                iconType="circle" iconSize={8}
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Breakdown list */}
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            {pieTrangThai.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{item.value}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ color: item.fill, backgroundColor: item.fill + "18" }}>
                    {totalTangVat > 0 ? ((item.value / totalTangVat) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar: Nhập/Xuất kho */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Nhập / Xuất kho 6 tháng gần đây</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={nhapXuat} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
              <XAxis dataKey="thang" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltip />}
                formatter={(v: number, n: string) => [formatNum(v), n === "nhap" ? "Nhập kho" : "Xuất kho"]}
              />
              <Legend formatter={(v) => (
                <span className="text-xs text-gray-600">{v === "nhap" ? "Nhập kho" : "Xuất kho"}</span>
              )} />
              <Bar dataKey="nhap" fill="#1565c0" radius={[4, 4, 0, 0]} name="nhap" />
              <Bar dataKey="xuat" fill="#2e7d32" radius={[4, 4, 0, 0]} name="xuat" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2: Phân loại + Tồn kho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie: Loại tang vật */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Phân bố theo loại tang vật</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieLoai}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {pieLoai.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [formatNum(v) + " tang vật", n]} />
              <Legend
                layout="vertical" align="right" verticalAlign="middle"
                iconType="circle" iconSize={8}
                formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tồn kho theo kho bãi */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Công suất kho bãi</h2>
          <div className="space-y-3">
            {tangVatByKho.map((k) => {
              const pct = k.sucChua > 0 ? Math.round((k.dangLuu / k.sucChua) * 100) : 0;
              const barColor = pct > 80 ? "#c62828" : pct > 60 ? "#e65100" : "#1565c0";
              return (
                <div key={k.khoId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 truncate max-w-[180px]">{k.khoTen}</span>
                    <span className="text-sm font-semibold" style={{ color: barColor }}>
                      {formatNum(k.dangLuu)}/{formatNum(k.sucChua)} ({pct}%)
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cảnh báo mới nhất */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Cảnh báo mới nhất</h2>
            <button onClick={() => navigate("/canh-bao")}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1">
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
                  <div key={cb.id} className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: cfg.bg }}>
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: cfg.color }}>{cb.tieuDe}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{cb.moTa}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                      style={{ background: cfg.color + "20", color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tang vật sắp hết hạn */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Tang vật sắp hết hạn lưu kho</h2>
            <button onClick={() => navigate("/tang-vat")}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1">
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
                  <div key={tv.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate("/tang-vat")}>
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
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
          { label: "Hoàn thành hồ sơ", value: kpi.tiLeHoanThanhHoSo, sub: `${kpi.hoanThanh}/${kpi.tongHoSo} hồ sơ`, color: kpi.tiLeHoanThanhHoSo >= 70 ? "#2e7d32" : kpi.tiLeHoanThanhHoSo >= 40 ? "#e65100" : "#c62828" },
          { label: "Xử lý tang vật", value: kpi.tiLeXuLyTangVat, sub: `${kpi.daXuLy}/${kpi.tongTV} tang vật`, color: kpi.tiLeXuLyTangVat >= 60 ? "#2e7d32" : kpi.tiLeXuLyTangVat >= 30 ? "#e65100" : "#c62828" },
          { label: "Tang vật quá hạn", value: kpi.tiLeQuaHan, sub: `${kpi.quaHan}/${kpi.tongTV} tang vật`, color: kpi.tiLeQuaHan === 0 ? "#2e7d32" : kpi.tiLeQuaHan <= 10 ? "#e65100" : "#c62828" },
        ];
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">KPI Tiến độ xử lý</h2>
            <div className="grid grid-cols-3 gap-6">
              {gauges.map((g) => (
                <div key={g.label} className="text-center">
                  <div className="relative w-28 h-28 mx-auto mb-3">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle cx="50" cy="50" r="40" fill="none"
                        stroke={g.color} strokeWidth="10"
                        strokeDasharray={`${(g.value / 100) * 251.2} 251.2`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black" style={{ color: g.color }}>{g.value}%</span>
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
