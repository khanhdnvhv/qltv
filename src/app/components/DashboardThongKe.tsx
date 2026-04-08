import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from "recharts";
import { useStoreState } from "../hooks/useStoreState";
import { BarChart3, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { LOAI_TANG_VAT, TRANG_THAI_TANG_VAT } from "../lib/constants";

/* ── Tang vat nhap/xuat theo thang ── */
const nhapXuatData = [
  { month: "T10/25", nhap: 8, xuat: 3 },
  { month: "T11/25", nhap: 12, xuat: 5 },
  { month: "T12/25", nhap: 9, xuat: 4 },
  { month: "T1/26", nhap: 7, xuat: 6 },
  { month: "T2/26", nhap: 11, xuat: 4 },
  { month: "T3/26", nhap: 6, xuat: 8 },
];

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

const PieTooltipCustom = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-lg">
      <p className="text-sm" style={{ color: d.payload.fill }}>
        {d.name}: <span className="font-semibold">{d.value} tang vật</span>
      </p>
    </div>
  );
};

const renderPieLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 12, fontWeight: 600 }}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

export function DashboardThongKe() {
  const { tangVat, kho } = useStoreState();

  /* ── Pie: trạng thái tang vật ── */
  const trangThaiPie = useMemo(() => {
    const groups: Record<string, number> = {};
    tangVat.forEach(tv => {
      groups[tv.trangThai] = (groups[tv.trangThai] ?? 0) + 1;
    });
    const colorMap: Record<string, string> = {
      cho_nhap_kho: "#f57f17",
      dang_luu_kho: "#1565c0",
      dang_xu_ly: "#7b1fa2",
      cho_xu_ly: "#e65100",
      da_tra_lai: "#2e7d32",
      da_tieu_huy: "#546e7a",
      da_tich_thu: "#c62828",
      da_ban: "#00695c",
    };
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        name: TRANG_THAI_TANG_VAT[k as keyof typeof TRANG_THAI_TANG_VAT]?.label ?? k,
        value: v,
        fill: colorMap[k] ?? "#90a4ae",
      }));
  }, [tangVat]);

  /* ── Pie: loại tang vật ── */
  const loaiPie = useMemo(() => {
    const groups: Record<string, number> = {};
    tangVat.forEach(tv => {
      groups[tv.loai] = (groups[tv.loai] ?? 0) + 1;
    });
    const colorPalette = [
      "#0d3b66", "#1565c0", "#2e7d32", "#7b1fa2",
      "#c62828", "#e65100", "#f57f17", "#00695c", "#546e7a",
    ];
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([k, v], i) => ({
        name: LOAI_TANG_VAT[k as keyof typeof LOAI_TANG_VAT]?.label ?? k,
        value: v,
        fill: colorPalette[i % colorPalette.length],
      }));
  }, [tangVat]);

  /* ── Kho capacity bar data ── */
  const khoData = useMemo(() =>
    kho.map(k => ({
      ten: k.ma,
      sucChua: k.sucChua,
      dangLuu: k.dangLuu,
      tyLe: Math.round((k.dangLuu / k.sucChua) * 100),
    })),
    [kho]
  );

  const totalTangVat = tangVat.length;
  const dangLuuKho = tangVat.filter(tv => tv.trangThai === "dang_luu_kho").length;
  const choXuLy = tangVat.filter(tv => tv.trangThai === "cho_xu_ly").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#0d3b66]">Dashboard Thống kê</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tổng quan phân bổ tang vật theo trạng thái, loại và công suất kho bãi
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Tổng tang vật", value: totalTangVat, color: "#0d3b66", bg: "#e8eef5" },
          { label: "Đang lưu kho", value: dangLuuKho, color: "#1565c0", bg: "#e3f2fd" },
          { label: "Chờ xử lý", value: choXuLy, color: "#e65100", bg: "#fff3e0" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: item.bg }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold" style={{ color: item.color }}>
                {item.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie: trang thai */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#0d3b66]/10 flex items-center justify-center">
              <PieIcon className="w-5 h-5 text-[#0d3b66]" />
            </div>
            <div>
              <h3 className="text-[#0d3b66] font-semibold">Trạng thái tang vật</h3>
              <p className="text-xs text-gray-400">Tổng: {totalTangVat} tang vật</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={trangThaiPie}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={renderCustomLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {trangThaiPie.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltipCustom />} />
              <Legend content={renderPieLegend} />
            </PieChart>
          </ResponsiveContainer>
          {/* Breakdown list */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            {trangThaiPie.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{item.value}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ color: item.fill, backgroundColor: item.fill + "18" }}
                  >
                    {totalTangVat > 0 ? ((item.value / totalTangVat) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar: nhap/xuat theo thang */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#0d3b66]/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#0d3b66]" />
            </div>
            <div>
              <h3 className="text-[#0d3b66] font-semibold">Nhập/Xuất kho theo tháng</h3>
              <p className="text-xs text-gray-400">6 tháng gần nhất</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={nhapXuatData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="nhap" name="Nhập kho" fill="#0d3b66" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="xuat" name="Xuất kho" fill="#2e7d32" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#0d3b66]" />Nhập kho</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#2e7d32]" />Xuất kho</div>
          </div>
        </div>
      </div>

      {/* Kho capacity + Loai tang vat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kho capacity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-[#0d3b66] font-semibold mb-5">Công suất kho bãi</h3>
          <div className="space-y-4">
            {khoData.map((k) => (
              <div key={k.ten}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700 font-medium">{k.ten}</span>
                  <span className="text-sm font-semibold" style={{ color: k.tyLe >= 80 ? "#c62828" : k.tyLe >= 60 ? "#e65100" : "#2e7d32" }}>
                    {k.dangLuu}/{k.sucChua} ({k.tyLe}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${k.tyLe}%`,
                      backgroundColor: k.tyLe >= 80 ? "#c62828" : k.tyLe >= 60 ? "#e65100" : "#0d3b66",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loai tang vat pie */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#0d3b66]/10 flex items-center justify-center">
              <PieIcon className="w-5 h-5 text-[#0d3b66]" />
            </div>
            <h3 className="text-[#0d3b66] font-semibold">Phân loại tang vật</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={loaiPie}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                isAnimationActive={false}
              >
                {loaiPie.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltipCustom />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {loaiPie.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
