// ============================================================
// UTILITIES — Cac ham tien ich dung chung
// ============================================================

import * as XLSX from "xlsx";
import type { ThuTuc, CoQuan } from "./types";

// --- ID Generation ---
let seqCounter = 500;
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMaHS(): string {
  seqCounter++;
  const year = new Date().getFullYear();
  return `HS-${year}-${String(seqCounter).padStart(4, "0")}`;
}

export function generateMaVB(): string {
  seqCounter++;
  const year = new Date().getFullYear();
  return `VB-${year}-${String(seqCounter).padStart(4, "0")}`;
}

export function generateMaGD(): string {
  seqCounter++;
  const year = new Date().getFullYear();
  return `GD-${year}-${String(seqCounter).padStart(4, "0")}`;
}

export function generateSerialNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// --- Date Utils ---
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

export function parseVNDate(dateStr: string): Date | null {
  // Parse DD/MM/YYYY or DD/MM/YYYY HH:mm
  const parts = dateStr.split(" ");
  const dateParts = parts[0].split("/");
  if (dateParts.length !== 3) return null;
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const year = parseInt(dateParts[2], 10);
  if (parts.length > 1) {
    const timeParts = parts[1].split(":");
    return new Date(year, month, day, parseInt(timeParts[0], 10), parseInt(timeParts[1], 10));
  }
  return new Date(year, month, day);
}

export function addWorkingDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }
  return result;
}

export function getDaysRemaining(deadlineStr: string): number {
  const deadline = parseVNDate(deadlineStr);
  if (!deadline) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDeadlineStatus(deadlineStr: string): "overdue" | "urgent" | "warning" | "safe" {
  const days = getDaysRemaining(deadlineStr);
  if (days < 0) return "overdue";
  if (days === 0) return "urgent";
  if (days <= 3) return "warning";
  return "safe";
}

export function getDeadlineColor(deadlineStr: string): string {
  const status = getDeadlineStatus(deadlineStr);
  switch (status) {
    case "overdue": return "#c62828";
    case "urgent": return "#e65100";
    case "warning": return "#f9a825";
    default: return "#5a6a7e";
  }
}

export function getDeadlineText(deadlineStr: string): string {
  const days = getDaysRemaining(deadlineStr);
  if (days < 0) return `Qua han ${Math.abs(days)} ngay`;
  if (days === 0) return "Het han hom nay";
  if (days === 1) return "Con 1 ngay";
  return `Con ${days} ngay`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Chao buoi sang";
  if (hour < 18) return "Chao buoi chieu";
  return "Chao buoi toi";
}

export function getRelativeTime(dateStr: string): string {
  const date = parseVNDate(dateStr);
  if (!date) return dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Vua xong";
  if (diffMins < 60) return `${diffMins} phut truoc`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} gio truoc`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngay truoc`;
  return dateStr;
}

// --- Format ---
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " d";
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// --- Validation ---
export function validatePhone(phone: string): boolean {
  return /^(0[3-9])[0-9]{8}$/.test(phone);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCCCD(cccd: string): boolean {
  return /^[0-9]{12}$/.test(cccd);
}

// --- Hash (simple for mock) ---
export function generateHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0").toUpperCase();
}

// --- localStorage helpers ---
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`dvc_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(`dvc_${key}`);
    if (stored) return JSON.parse(stored) as T;
  } catch (e) {
    console.warn("Failed to load from localStorage:", e);
  }
  return defaultValue;
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`dvc_${key}`);
  } catch (e) {
    console.warn("Failed to remove from localStorage:", e);
  }
}

// --- Misc ---
export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function downloadFile(content: string, fileName: string, mimeType: string = "text/csv"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(headers: string[], rows: string[][], fileName: string): void {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
  downloadFile("\uFEFF" + csvContent, fileName, "text/csv;charset=utf-8;");
}

// --- Phan loai thu tuc hanh chinh ---

/**
 * Thông tin một cơ quan xử lý duy nhất, dùng để hiển thị
 * trên thẻ thống kê "Cơ quan xử lý".
 */
export interface UniqueAgency {
  id: string;
  ten: string;
  ma: string;
  soThuTuc: number; // số thủ tục thuộc cơ quan này
}

/**
 * Kết quả phân loại danh sách thủ tục hành chính.
 * Map trực tiếp vào 4 thẻ thống kê trên đầu trang ThuTucList.
 */
export interface ThuTucClassification {
  /** Tổng số thủ tục (thẻ 1) */
  tongSo: number;
  /** Số thủ tục DVC Mức 3 (thẻ 2) */
  soDVCMuc3: number;
  /** Số thủ tục DVC Mức 4 (thẻ 3) */
  soDVCMuc4: number;
  /** Danh sách cơ quan xử lý duy nhất kèm số thủ tục (thẻ 4) */
  uniqueAgencies: UniqueAgency[];
  /** Tổng cơ quan (shortcut cho uniqueAgencies.length) */
  soCoQuan: number;
  /** Phân bổ theo lĩnh vực: linhVucId → số thủ tục */
  phanBoLinhVuc: Record<string, number>;
  /** Thời gian xử lý trung bình (ngày làm việc) */
  thoiGianTrungBinh: number;
  /** Đánh giá trung bình (chỉ tính thủ tục có rating) */
  danhGiaTrungBinh: number;
}

/**
 * Phân loại danh sách thủ tục hành chính.
 *
 * @param thuTucList  — Danh sách thủ tục (đã lọc active nếu cần)
 * @param coQuanList  — Danh sách cơ quan (dùng để resolve tên)
 * @returns Đối tượng ThuTucClassification cho 4 thẻ thống kê
 *
 * @example
 * ```ts
 * const result = classifyThuTuc(activeThuTuc, coQuan);
 * // result.tongSo        → 24        (Thẻ "Tổng thủ tục")
 * // result.soDVCMuc3     → 10        (Thẻ "DVC Mức 3")
 * // result.soDVCMuc4     → 14        (Thẻ "DVC Mức 4")
 * // result.uniqueAgencies→ [{id,ten,ma,soThuTuc},…] (Thẻ "Cơ quan xử lý")
 * ```
 */
export function classifyThuTuc(
  thuTucList: ThuTuc[],
  coQuanList: CoQuan[],
): ThuTucClassification {
  // --- Duyệt 1 lần duy nhất (O(n)) ---
  let soDVCMuc3 = 0;
  let soDVCMuc4 = 0;
  let tongThoiGian = 0;
  let tongRating = 0;
  let soCoRating = 0;

  const agencyCountMap = new Map<string, number>();
  const linhVucCountMap = new Map<string, number>();

  for (const tt of thuTucList) {
    // Đếm mức độ
    if (tt.mucDo === 3) soDVCMuc3++;
    else if (tt.mucDo === 4) soDVCMuc4++;

    // Tích lũy thời gian
    tongThoiGian += tt.thoiGianXuLy;

    // Tích lũy rating
    if (tt.rating != null && tt.rating > 0) {
      tongRating += tt.rating;
      soCoRating++;
    }

    // Đếm theo cơ quan
    agencyCountMap.set(tt.coQuanId, (agencyCountMap.get(tt.coQuanId) || 0) + 1);

    // Đếm theo lĩnh vực
    linhVucCountMap.set(tt.linhVucId, (linhVucCountMap.get(tt.linhVucId) || 0) + 1);
  }

  // --- Build uniqueAgencies ---
  const coQuanLookup = new Map(coQuanList.map((cq) => [cq.id, cq]));

  const uniqueAgencies: UniqueAgency[] = Array.from(agencyCountMap.entries())
    .map(([id, soThuTuc]) => {
      const cq = coQuanLookup.get(id);
      return {
        id,
        ten: cq?.ten ?? id,
        ma: cq?.ma ?? "",
        soThuTuc,
      };
    })
    .sort((a, b) => b.soThuTuc - a.soThuTuc); // Sắp theo số thủ tục giảm dần

  // --- Build phanBoLinhVuc ---
  const phanBoLinhVuc: Record<string, number> = {};
  for (const [lvId, count] of linhVucCountMap) {
    phanBoLinhVuc[lvId] = count;
  }

  const tongSo = thuTucList.length;

  return {
    tongSo,
    soDVCMuc3,
    soDVCMuc4,
    uniqueAgencies,
    soCoQuan: uniqueAgencies.length,
    phanBoLinhVuc,
    thoiGianTrungBinh: tongSo > 0 ? Math.round(tongThoiGian / tongSo) : 0,
    danhGiaTrungBinh: soCoRating > 0
      ? Math.round((tongRating / soCoRating) * 10) / 10
      : 0,
  };
}

// --- Excel Export (SheetJS) ---
/**
 * Cấu hình cho từng cột Excel
 */
export interface ExcelColumnConfig {
  header: string;       // Tên tiêu đề cột
  key: string;          // Key để lấy data từ object
  width?: number;       // Độ rộng cột (ký tự)
}

/**
 * Cấu hình metadata cho file Excel
 */
export interface ExcelExportConfig {
  sheetName?: string;         // Tên sheet (mặc định: "Danh sách")
  title?: string;             // Tiêu đề bảng (dòng 1 merged)
  subtitle?: string;          // Phụ đề (dòng 2 merged)
  exportedBy?: string;        // Người xuất
  columns: ExcelColumnConfig[];
  data: Record<string, any>[];
  fileName?: string;          // Tên file (tự sinh nếu bỏ trống)
}

/**
 * Sinh tên file theo định dạng: Danh_sach_ho_so_DD_MM_YYYY.xlsx
 */
function generateExcelFileName(prefix: string = "Danh_sach_ho_so"): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${prefix}_${dd}_${mm}_${yyyy}.xlsx`;
}

/**
 * Tạo style cho cell (SheetJS community dùng `s` property nhưng hạn chế,
 * ta dùng !cols cho width và merge cells cho header)
 */
export function exportToExcel(config: ExcelExportConfig): void {
  const {
    sheetName = "Danh sách",
    title,
    subtitle,
    exportedBy,
    columns,
    data,
    fileName,
  } = config;

  // ═══ Xây dựng mảng dữ liệu AOA (Array of Arrays) ═══
  const aoa: any[][] = [];
  let headerRowIndex = 0;

  // ── Dòng tiêu đề chính (merged) ──
  if (title) {
    aoa.push([title]);
    headerRowIndex++;
  }

  // ── Dòng phụ đề (merged) ──
  if (subtitle) {
    aoa.push([subtitle]);
    headerRowIndex++;
  }

  // ── Dòng metadata: ngày xuất, người xuất ──
  const metaLine = `Ngày xuất: ${formatDate(new Date())}${exportedBy ? ` | Người xuất: ${exportedBy}` : ""} | Tổng số: ${data.length} bản ghi`;
  aoa.push([metaLine]);
  headerRowIndex++;

  // ── Dòng trống phân cách ──
  aoa.push([]);
  headerRowIndex++;

  // ── Dòng HEADER ──
  const headerRow = columns.map((col) => col.header);
  aoa.push(headerRow);

  // ── Dòng DATA ──
  data.forEach((item, rowIdx) => {
    const row = columns.map((col) => {
      const val = item[col.key];
      return val !== undefined && val !== null ? String(val) : "";
    });
    aoa.push(row);
  });

  // ── Dòng trống + footer ──
  aoa.push([]);
  aoa.push([`— Hết danh sách — Xuất từ Hệ thống DVC trực tuyến Bộ TT&TT —`]);

  // ═══ Tạo Workbook & Worksheet ═══
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── Merge cells cho tiêu đề & phụ đề ──
  const totalCols = columns.length;
  const merges: XLSX.Range[] = [];

  let mergeRow = 0;
  if (title) {
    merges.push({ s: { r: mergeRow, c: 0 }, e: { r: mergeRow, c: totalCols - 1 } });
    mergeRow++;
  }
  if (subtitle) {
    merges.push({ s: { r: mergeRow, c: 0 }, e: { r: mergeRow, c: totalCols - 1 } });
    mergeRow++;
  }
  // Meta line merge
  merges.push({ s: { r: mergeRow, c: 0 }, e: { r: mergeRow, c: totalCols - 1 } });
  // Footer merge
  const footerRow = aoa.length - 1;
  merges.push({ s: { r: footerRow, c: 0 }, e: { r: footerRow, c: totalCols - 1 } });

  ws["!merges"] = merges;

  // ── Đặt độ rộng cột ──
  ws["!cols"] = columns.map((col) => ({
    wch: col.width || 18,
  }));

  // ── Đặt chiều cao hàng header ──
  if (!ws["!rows"]) ws["!rows"] = [];
  // Title row height
  if (title) {
    ws["!rows"][0] = { hpt: 32 };
  }
  // Header row height
  ws["!rows"][headerRowIndex] = { hpt: 24 };

  // ═══ Thêm sheet vào workbook ═══
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // ═══ Xuất file ═══
  const outputFileName = fileName || generateExcelFileName();
  XLSX.writeFile(wb, outputFileName);
}

/**
 * Hàm tiện ích xuất danh sách Hồ sơ ra Excel
 * Giữ nguyên các cột như trên giao diện bảng
 */
export function exportHoSoToExcel(
  hoSoList: any[],
  trangThaiMap: Record<string, { label: string }>,
  exportedBy?: string,
): void {
  const columns: ExcelColumnConfig[] = [
    { header: "STT",              key: "stt",           width: 6 },
    { header: "Mã hồ sơ",        key: "maHS",          width: 18 },
    { header: "Tên thủ tục",      key: "tenThuTuc",     width: 45 },
    { header: "Mức độ",           key: "mucDo",         width: 10 },
    { header: "Người nộp",        key: "tenNguoiNop",   width: 24 },
    { header: "SĐT",             key: "soDienThoai",   width: 14 },
    { header: "Email",            key: "email",         width: 28 },
    { header: "Lĩnh vực",        key: "linhVucTen",    width: 18 },
    { header: "Cán bộ xử lý",    key: "canBoXuLyTen",  width: 22 },
    { header: "Trạng thái",      key: "trangThai",     width: 18 },
    { header: "Ngày nộp",        key: "ngayNop",       width: 14 },
    { header: "Hạn xử lý",       key: "hanXuLy",       width: 14 },
    { header: "Ngày tạo",        key: "createdAt",     width: 20 },
  ];

  const data = hoSoList.map((hs, idx) => ({
    stt: idx + 1,
    maHS: hs.maHS,
    tenThuTuc: hs.tenThuTuc,
    mucDo: `Mức ${hs.mucDo}`,
    tenNguoiNop: hs.tenNguoiNop,
    soDienThoai: hs.soDienThoai,
    email: hs.email || "",
    linhVucTen: hs.linhVucTen,
    canBoXuLyTen: hs.canBoXuLyTen || "Chưa phân công",
    trangThai: trangThaiMap[hs.trangThai]?.label || hs.trangThai,
    ngayNop: hs.ngayNop,
    hanXuLy: hs.hanXuLy,
    createdAt: hs.createdAt,
  }));

  exportToExcel({
    sheetName: "Danh sách hồ sơ",
    title: "DANH SÁCH HỒ SƠ THỦ TỤC HÀNH CHÍNH",
    subtitle: "Hệ thống Dịch vụ công trực tuyến — Bộ Thông tin và Truyền thông",
    exportedBy,
    columns,
    data,
    fileName: generateExcelFileName("Danh_sach_ho_so"),
  });
}