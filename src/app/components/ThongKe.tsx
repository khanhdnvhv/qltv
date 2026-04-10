import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend,
} from "recharts";
import {
  Download, Package, Warehouse, Gavel, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, BarChart3,
} from "lucide-react";
import { useStoreState } from "../hooks/useStoreState";
import { toast } from "sonner";
import { exportToCSV } from "../lib/utils";
import { useState, useMemo } from "react";
import { LOAI_TANG_VAT, HINH_THUC_XU_LY } from "../lib/constants";

/* ── Dữ liệu lịch sử nhập/xuất kho 12 tháng ── */
const nhapXuatThang = [
  { month: "T1", nhap: 7, xuat: 5, tonKho: 82 },
  { month: "T2", nhap: 11, xuat: 4, tonKho: 89 },
  { month: "T3", nhap: 9, xuat: 6, tonKho: 92 },
  { month: "T4", nhap: 6, xuat: 8, tonKho: 90 },
  { month: "T5", nhap: 13, xuat: 5, tonKho: 98 },
  { month: "T6", nhap: 8, xuat: 7, tonKho: 99 },
  { month: "T7", nhap: 10, xuat: 9, tonKho: 100 },
  { month: "T8", nhap: 12, xuat: 6, tonKho: 106 },
  { month: "T9", nhap: 7, xuat: 10, tonKho: 103 },
  { month: "T10", nhap: 9, xuat: 5, tonKho: 107 },
  { month: "T11", nhap: 15, xuat: 8, tonKho: 114 },
  { month: "T12", nhap: 6, xuat: 7, tonKho: 113 },
];

/* ── Dữ liệu xử lý tang vật theo hình thức ── */
const xuLyData = [
  { name: "Trả lại", value: 24, fill: "#2e7d32" },
  { name: "Tịch thu", value: 18, fill: "#c62828" },
  { name: "Tiêu hủy", value: 12, fill: "#546e7a" },
  { name: "Bán sung công", value: 8, fill: "#e65100" },
];

/* ── Dữ liệu theo đơn vị ── */
const donViData = [
  { donVi: "PC06", nhap: 45, xuLy: 32, dangLuu: 87 },
  { donVi: "CA BX", nhap: 18, xuLy: 12, dangLuu: 28 },
  { donVi: "CA VY", nhap: 22, xuLy: 15, dangLuu: 31 },
  { donVi: "CA VT", nhap: 14, xuLy: 10, dangLuu: 18 },
  { donVi: "CA YL", nhap: 11, xuLy: 8, dangLuu: 14 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-lg">
      <p className="text-sm mb-1 font-semibold text-[#0d3b66]">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const PERIOD_OPTIONS = [
  { value: "q1", label: "Quý 1/2026" },
  { value: "q2", label: "Quý 2/2026" },
  { value: "year", label: "Cả năm 2026" },
  { value: "custom", label: "Tùy chọn" },
];

export function ThongKe() {
  const { tangVat, hoSo, xuLy, kho } = useStoreState();
  const [period, setPeriod] = useState("year");

  /* ── KPI ── */
  const kpi = useMemo(() => ({
    tongTangVat: tangVat.length,
    dangLuuKho: tangVat.filter(tv => tv.trangThai === "dang_luu_kho").length,
    daXuLy: tangVat.filter(tv => ["da_tra_lai", "da_tieu_huy", "da_tich_thu", "da_ban"].includes(tv.trangThai)).length,
    quaHan: tangVat.filter(tv => {
      if (!tv.hanLuuKho) return false;
      const [d, m, y] = tv.hanLuuKho.split("/").map(Number);
      return new Date(y, m - 1, d) < new Date();
    }).length,
    tongHoSo: hoSo.length,
    tongXuLy: xuLy.length,
    tongGiaTri: tangVat.reduce((s, tv) => s + (tv.giaTriUocTinh || 0), 0),
  }), [tangVat, hoSo, xuLy]);

  /* ── Loai tang vat pie ── */
  const loaiData = useMemo(() => {
    const groups: Record<string, number> = {};
    tangVat.forEach(tv => {
      groups[tv.loai] = (groups[tv.loai] ?? 0) + 1;
    });
    const palette = ["#0d3b66", "#1565c0", "#2e7d32", "#7b1fa2", "#c62828", "#e65100", "#f57f17", "#00695c", "#546e7a"];
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([k, v], i) => ({
        name: LOAI_TANG_VAT[k as keyof typeof LOAI_TANG_VAT]?.label ?? k,
        value: v,
        fill: palette[i % palette.length],
      }));
  }, [tangVat]);

  const handleExport = () => {
    const headers = ["Mã tang vật", "Tên", "Loại", "Trạng thái", "Kho", "Giá trị ước tính", "Hạn lưu kho"];
    const rows = tangVat.map(tv => [
      tv.maTangVat, tv.ten, tv.loai, tv.trangThai,
      tv.khoTen ?? "",
      tv.giaTriUocTinh?.toLocaleString("vi-VN") ?? "0",
      tv.hanLuuKho ?? "",
    ]);
    exportToCSV(headers, rows, `bao-cao-tang-vat-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Đã xuất báo cáo thành công");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0d3b66]">Thống kê & Báo cáo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tổng hợp dữ liệu quản lý tang vật vi phạm hành chính
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white border border-border rounded-lg text-sm"
          >
            {PERIOD_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tổng tang vật - blue */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#dbeafe" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="70 30" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-blue-900 mb-0.5">{kpi.tongTangVat}</p>
            <p className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Tổng tang vật</p>
          </div>
        </div>

        {/* Đang lưu kho - cyan */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-cyan-50 border border-cyan-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-200">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#cffafe" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="60 40" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-cyan-900 mb-0.5">{kpi.dangLuuKho}</p>
            <p className="text-xs font-semibold text-cyan-600/70 uppercase tracking-wider">Đang lưu kho</p>
          </div>
        </div>

        {/* Đã xử lý - green */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#dcfce7" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="55 45" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-green-900 mb-0.5">{kpi.daXuLy}</p>
            <p className="text-xs font-semibold text-green-600/70 uppercase tracking-wider">Đã xử lý</p>
          </div>
        </div>

        {/* Quá hạn - red */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-red-50 border border-red-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#fee2e2" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="20 80" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-red-900 mb-0.5">{kpi.quaHan}</p>
            <p className="text-xs font-semibold text-red-600/70 uppercase tracking-wider">Quá hạn</p>
          </div>
        </div>
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Đề xuất xử lý - orange */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-orange-900">{kpi.tongXuLy}</p>
              <p className="text-xs font-semibold text-orange-600/70 uppercase tracking-wider">Đề xuất xử lý</p>
            </div>
          </div>
        </div>

        {/* Hồ sơ vụ việc - purple */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-purple-900">{kpi.tongHoSo}</p>
              <p className="text-xs font-semibold text-purple-600/70 uppercase tracking-wider">Hồ sơ vụ việc</p>
            </div>
          </div>
        </div>

        {/* Tổng giá trị - blue */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-blue-900">{(kpi.tongGiaTri / 1_000_000).toFixed(0)}M</p>
              <p className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider">Tổng giá trị (VND)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nhap/xuat theo thang */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-[#0d3b66] font-semibold mb-5">Nhập/Xuất kho theo tháng</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={nhapXuatThang}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="nhap" name="Nhập kho" stroke="#0d3b66" strokeWidth={2} dot={{ fill: "#0d3b66", r: 3 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="xuat" name="Xuất kho" stroke="#2e7d32" strokeWidth={2} dot={{ fill: "#2e7d32", r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Xu ly theo hinh thuc pie */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-[#0d3b66] font-semibold mb-5">Hình thức xử lý tang vật</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={xuLyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {xuLyData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {xuLyData.map((item) => {
                const total = xuLyData.reduce((s, d) => s + d.value, 0);
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold">{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.fill }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Don vi bar chart */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-[#0d3b66] font-semibold mb-5">Thống kê theo đơn vị</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={donViData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="donVi" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
            <Legend />
            <Bar dataKey="nhap" name="Đã nhập kho" fill="#0d3b66" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="xuLy" name="Đã xử lý" fill="#2e7d32" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="dangLuu" name="Đang lưu kho" fill="#1565c0" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Kho table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-[#0d3b66] font-semibold">Tổng hợp kho bãi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8fafc]">
                {["Kho", "Đơn vị", "Sức chứa", "Đang lưu", "Tỷ lệ sử dụng"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {kho.map(k => {
                const pct = Math.round((k.dangLuu / k.sucChua) * 100);
                return (
                  <tr key={k.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium">{k.ten}</p>
                      <p className="text-xs text-muted-foreground">{k.ma}</p>
                    </td>
                    <td className="px-5 py-3 text-sm">{k.donViTen}</td>
                    <td className="px-5 py-3 text-sm">{k.sucChua}</td>
                    <td className="px-5 py-3 text-sm font-semibold">{k.dangLuu}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 80 ? "#c62828" : pct >= 60 ? "#e65100" : "#0d3b66",
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: pct >= 80 ? "#c62828" : pct >= 60 ? "#e65100" : "#2e7d32" }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
