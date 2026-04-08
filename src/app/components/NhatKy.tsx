import { useState, useMemo } from "react";
import {
  Search, Clock, User, FileText, Package, Warehouse,
  Gavel, ArrowLeftRight, ClipboardCheck, Stamp,
  Download, ChevronLeft, ChevronRight, Shield,
} from "lucide-react";
import { useStoreState, useDebounce, usePagination } from "../hooks/useStoreState";
import { exportToCSV } from "../lib/utils";
import { toast } from "sonner";

const ICON_MAP: Record<string, any> = {
  HoSo: FileText,
  TangVat: Package,
  KiemKe: ClipboardCheck,
  LuanChuyen: ArrowLeftRight,
  XuLy: Gavel,
  NiemPhong: Stamp,
  VanBan: FileText,
  PhieuNhapKho: Warehouse,
  User: User,
  auth: Shield,
};

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  HoSo: { bg: "#e3f2fd", color: "#1565c0" },
  TangVat: { bg: "#e8eef5", color: "#0d3b66" },
  KiemKe: { bg: "#e8f5e9", color: "#2e7d32" },
  LuanChuyen: { bg: "#fff3e0", color: "#e65100" },
  XuLy: { bg: "#ffebee", color: "#c62828" },
  NiemPhong: { bg: "#f3e5f5", color: "#7b1fa2" },
  VanBan: { bg: "#e0f2f1", color: "#00695c" },
  PhieuNhapKho: { bg: "#e3f2fd", color: "#0277bd" },
  User: { bg: "#e8eef5", color: "#0d3b66" },
  auth: { bg: "#f3e5f5", color: "#7b1fa2" },
};

const TYPE_LABELS: Record<string, string> = {
  HoSo: "Hồ sơ",
  TangVat: "Tang vật",
  KiemKe: "Kiểm kê",
  LuanChuyen: "Luân chuyển",
  XuLy: "Xử lý",
  NiemPhong: "Niêm phong",
  VanBan: "Văn bản",
  PhieuNhapKho: "Phiếu nhập kho",
};

export function NhatKy() {
  const { nhatKy } = useStoreState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filtered = useMemo(() =>
    nhatKy.filter(log => {
      const matchSearch = !debouncedSearch ||
        log.userTen.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        log.hanhDong.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        log.chiTiet.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        log.doiTuongMa.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchType = filterType === "all" || log.doiTuong === filterType;
      return matchSearch && matchType;
    }),
    [nhatKy, debouncedSearch, filterType]
  );

  const pagination = usePagination(filtered.length, 20);
  const pagedData = useMemo(
    () => filtered.slice(pagination.startIndex, pagination.endIndex),
    [filtered, pagination.startIndex, pagination.endIndex]
  );

  const handleExport = () => {
    const headers = ["Thời gian", "Người dùng", "Hành động", "Đối tượng", "Mã đối tượng", "Chi tiết"];
    const rows = filtered.map(l => [l.thoiGian, l.userTen, l.hanhDong, l.doiTuong, l.doiTuongMa, l.chiTiet]);
    exportToCSV(headers, rows, `nhat-ky-${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Đã xuất nhật ký");
  };

  const typeOptions = useMemo(() => {
    const types = [...new Set(nhatKy.map(l => l.doiTuong))];
    return types;
  }, [nhatKy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#0d3b66]">Nhật ký hoạt động</h1>
          <p className="text-muted-foreground text-sm mt-1">Lịch sử mọi thao tác trên hệ thống (Audit Trail)</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-[#0d3b66] text-white rounded-lg text-sm hover:bg-[#0a2f52] flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Xuất nhật ký
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo người dùng, hành động, mã đối tượng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b66]/20"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-[#f0f4f8] border border-border rounded-lg text-sm"
        >
          <option value="all">Tất cả loại</option>
          {typeOptions.map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium text-[#0d3b66]">{filtered.length}</span> bản ghi
        {filterType !== "all" && (
          <span>· Lọc theo: <span className="font-medium">{TYPE_LABELS[filterType] ?? filterType}</span></span>
        )}
      </div>

      {/* Log List */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {pagedData.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-2 text-[#e2e8f0]" />
              <p>Không có nhật ký nào</p>
            </div>
          ) : (
            pagedData.map((log) => {
              const Icon = ICON_MAP[log.doiTuong] ?? Clock;
              const c = COLOR_MAP[log.doiTuong] ?? { bg: "#f0f4f8", color: "#5a6a7e" };
              return (
                <div
                  key={log.id}
                  className="px-5 py-3.5 hover:bg-[#f8fafc] transition-colors flex items-start gap-4"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{log.hanhDong}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ backgroundColor: c.bg, color: c.color }}
                      >
                        {TYPE_LABELS[log.doiTuong] ?? log.doiTuong}
                      </span>
                      {log.doiTuongMa && (
                        <span className="text-[10px] text-[#0d3b66] bg-[#e8eef5] px-1.5 py-0.5 rounded font-medium">
                          {log.doiTuongMa}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.chiTiet}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{log.thoiGian}</p>
                    <p className="text-xs text-[#0d3b66] mt-0.5 font-medium">{log.userTen}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length > 0
              ? `${pagination.startIndex + 1}–${pagination.endIndex} / ${filtered.length}`
              : "0 bản ghi"
            }
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={pagination.prevPage}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg hover:bg-[#f0f4f8] text-muted-foreground disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm">{pagination.page} / {pagination.totalPages}</span>
            <button
              onClick={pagination.nextPage}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-[#f0f4f8] text-muted-foreground disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
