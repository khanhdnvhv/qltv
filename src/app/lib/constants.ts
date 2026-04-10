// ============================================================
// CONSTANTS — Tang Vat Vi Pham Hanh Chinh
// ============================================================

import {
  AlertTriangle,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Warehouse,
  ArrowLeftRight,
  Gavel,
  FileCheck,
  RefreshCw,
  Ban,
  ShieldCheck,
  Truck,
  Building2,
  Banknote,
  CarFront,
  FileText,
  Pill,
  ShoppingCart,
} from "lucide-react";
import type {
  TrangThaiTangVat,
  LoaiTangVat,
  TrangThaiHoSo,
  TrangThaiNiemPhong,
  HinhThucXuLy,
  TrangThaiXuLy,
  TrangThaiLuanChuyen,
  KetQuaKiemKe,
  LoaiCanhBao,
  TrangThaiVanBan,
  VaiTroTangVat,
  LoaiLuanChuyen,
  TrangThaiGiaoTuGiu,
  TrangThaiBaoLanh,
} from "./types";

// ========================
// TRANG THAI TANG VAT
// ========================
export const TRANG_THAI_TANG_VAT: Record<
  TrangThaiTangVat,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  cho_nhap_kho: {
    label: "Chờ nhập kho",
    color: "#f57f17",
    bg: "#fff8e1",
    border: "#ffc107",
    icon: Clock,
  },
  dang_luu_kho: {
    label: "Đang lưu kho",
    color: "#1565c0",
    bg: "#e3f2fd",
    border: "#42a5f5",
    icon: Warehouse,
  },
  dang_xu_ly: {
    label: "Đang xử lý",
    color: "#7b1fa2",
    bg: "#f3e5f5",
    border: "#ab47bc",
    icon: RefreshCw,
  },
  cho_xu_ly: {
    label: "Chờ xử lý",
    color: "#e65100",
    bg: "#fff3e0",
    border: "#ffa726",
    icon: Clock,
  },
  da_tra_lai: {
    label: "Đã trả lại",
    color: "#2e7d32",
    bg: "#e8f5e9",
    border: "#66bb6a",
    icon: CheckCircle2,
  },
  da_tieu_huy: {
    label: "Đã tiêu hủy",
    color: "#546e7a",
    bg: "#eceff1",
    border: "#90a4ae",
    icon: Ban,
  },
  da_tich_thu: {
    label: "Đã tịch thu",
    color: "#c62828",
    bg: "#ffebee",
    border: "#ef9a9a",
    icon: Gavel,
  },
  da_ban: {
    label: "Đã bán sung công",
    color: "#00695c",
    bg: "#e0f2f1",
    border: "#4db6ac",
    icon: CheckCircle2,
  },
};

// ========================
// LOAI TANG VAT
// ========================
export const LOAI_TANG_VAT: Record<
  LoaiTangVat,
  { label: string; color: string; bg: string; icon: any }
> = {
  phuong_tien_co_gioi: {
    label: "Phương tiện cơ giới",
    color: "#1565c0",
    bg: "#e3f2fd",
    icon: Truck,
  },
  phuong_tien_khac: {
    label: "Phương tiện khác",
    color: "#0277bd",
    bg: "#e1f5fe",
    icon: Truck,
  },
  hang_hoa: {
    label: "Hàng hóa",
    color: "#e65100",
    bg: "#fff3e0",
    icon: Package,
  },
  thuc_pham: {
    label: "Thực phẩm",
    color: "#2e7d32",
    bg: "#e8f5e9",
    icon: Package,
  },
  tien_te: {
    label: "Tiền tệ",
    color: "#f57f17",
    bg: "#fff8e1",
    icon: Package,
  },
  tai_san_co_gia_tri: {
    label: "Tài sản có giá trị",
    color: "#c62828",
    bg: "#ffebee",
    icon: ShieldCheck,
  },
  vu_khi_cong_cu: {
    label: "Vũ khí, công cụ hỗ trợ",
    color: "#b71c1c",
    bg: "#ffcdd2",
    icon: ShieldCheck,
  },
  thiet_bi_dien_tu: {
    label: "Thiết bị điện tử",
    color: "#6a1b9a",
    bg: "#f3e5f5",
    icon: Package,
  },
  giay_phep_chung_chi: {
    label: "Giấy phép, CCHNN",
    color: "#01579b",
    bg: "#e1f5fe",
    icon: FileText,
  },
  thuoc: {
    label: "Thuốc / BVTV",
    color: "#1b5e20",
    bg: "#f1f8e9",
    icon: Pill,
  },
  khac: {
    label: "Khác",
    color: "#546e7a",
    bg: "#eceff1",
    icon: Package,
  },
};

// ========================
// TRANG THAI HO SO VU VIEC
// ========================
export const TRANG_THAI_HO_SO: Record<
  TrangThaiHoSo,
  { label: string; color: string; bg: string; icon: any }
> = {
  cho_duyet: {
    label: "Chờ duyệt",
    color: "#f57f17",
    bg: "#fff8e1",
    icon: Clock,
  },
  dang_xu_ly: {
    label: "Đang xử lý",
    color: "#1565c0",
    bg: "#e3f2fd",
    icon: RefreshCw,
  },
  da_duyet: {
    label: "Đã duyệt",
    color: "#2e7d32",
    bg: "#e8f5e9",
    icon: CheckCircle2,
  },
  tu_choi: {
    label: "Từ chối",
    color: "#c62828",
    bg: "#ffebee",
    icon: XCircle,
  },
  hoan_thanh: {
    label: "Hoàn thành",
    color: "#00695c",
    bg: "#e0f2f1",
    icon: CheckCircle2,
  },
};

// ========================
// TRANG THAI NIEM PHONG
// ========================
export const TRANG_THAI_NIEM_PHONG: Record<
  TrangThaiNiemPhong,
  { label: string; color: string; bg: string }
> = {
  dang_niem_phong: { label: "Đang niêm phong", color: "#1565c0", bg: "#e3f2fd" },
  da_mo: { label: "Đã mở niêm phong", color: "#c62828", bg: "#ffebee" },
  da_niem_phong_lai: { label: "Đã niêm phong lại", color: "#7b1fa2", bg: "#f3e5f5" },
};

// ========================
// HINH THUC XU LY
// ========================
export const HINH_THUC_XU_LY: Record<
  HinhThucXuLy,
  { label: string; color: string; bg: string; icon: any }
> = {
  tra_lai: {
    label: "Trả lại chủ sở hữu",
    color: "#2e7d32",
    bg: "#e8f5e9",
    icon: ArrowLeftRight,
  },
  tich_thu: {
    label: "Tịch thu sung công",
    color: "#c62828",
    bg: "#ffebee",
    icon: Gavel,
  },
  tieu_huy: {
    label: "Tiêu hủy",
    color: "#546e7a",
    bg: "#eceff1",
    icon: Ban,
  },
  ban_sung_cong: {
    label: "Bán sung công quỹ",
    color: "#e65100",
    bg: "#fff3e0",
    icon: Package,
  },
};

// ========================
// TRANG THAI XU LY
// ========================
export const TRANG_THAI_XU_LY: Record<
  TrangThaiXuLy,
  { label: string; color: string; bg: string; icon: any }
> = {
  cho_phe_duyet: { label: "Chờ phê duyệt", color: "#f57f17", bg: "#fff8e1", icon: Clock },
  da_phe_duyet: { label: "Đã phê duyệt", color: "#1565c0", bg: "#e3f2fd", icon: CheckCircle2 },
  dang_thuc_hien: { label: "Đang thực hiện", color: "#7b1fa2", bg: "#f3e5f5", icon: RefreshCw },
  hoan_thanh: { label: "Hoàn thành", color: "#2e7d32", bg: "#e8f5e9", icon: CheckCircle2 },
  tu_choi: { label: "Từ chối", color: "#c62828", bg: "#ffebee", icon: XCircle },
};

// ========================
// TRANG THAI LUAN CHUYEN
// ========================
export const TRANG_THAI_LUAN_CHUYEN: Record<
  TrangThaiLuanChuyen,
  { label: string; color: string; bg: string; icon: any }
> = {
  cho_phe_duyet: { label: "Chờ phê duyệt", color: "#f57f17", bg: "#fff8e1", icon: Clock },
  da_phe_duyet: { label: "Đã phê duyệt", color: "#1565c0", bg: "#e3f2fd", icon: CheckCircle2 },
  dang_van_chuyen: { label: "Đang vận chuyển", color: "#7b1fa2", bg: "#f3e5f5", icon: Truck },
  da_ban_giao: { label: "Đã bàn giao", color: "#2e7d32", bg: "#e8f5e9", icon: CheckCircle2 },
  tu_choi: { label: "Từ chối", color: "#c62828", bg: "#ffebee", icon: XCircle },
};

// ========================
// KET QUA KIEM KE
// ========================
export const KET_QUA_KIEM_KE: Record<
  KetQuaKiemKe,
  { label: string; color: string; bg: string }
> = {
  khop: { label: "Khớp sổ sách", color: "#2e7d32", bg: "#e8f5e9" },
  thieu: { label: "Thiếu", color: "#c62828", bg: "#ffebee" },
  hu_hong: { label: "Hư hỏng", color: "#e65100", bg: "#fff3e0" },
  du: { label: "Dư", color: "#f57f17", bg: "#fff8e1" },
};

// ========================
// LOAI CANH BAO
// ========================
export const LOAI_CANH_BAO: Record<
  LoaiCanhBao,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  critical: {
    label: "Quá hạn",
    color: "#c62828",
    bg: "#ffebee",
    border: "#ef9a9a",
    icon: XCircle,
  },
  warning: {
    label: "Sắp đến hạn",
    color: "#e65100",
    bg: "#fff3e0",
    border: "#ffcc80",
    icon: AlertTriangle,
  },
  info: {
    label: "Thông tin",
    color: "#1565c0",
    bg: "#e3f2fd",
    border: "#90caf9",
    icon: AlertCircle,
  },
  ban_truc_tiep: {
    label: "Cần bán ngay",
    color: "#6a1b9a",
    bg: "#f3e5f5",
    border: "#ce93d8",
    icon: ShoppingCart,
  },
};

// ========================
// LOAI LUAN CHUYEN
// ========================
export const LOAI_LUAN_CHUYEN: Record<
  LoaiLuanChuyen,
  { label: string; color: string; bg: string; icon: any }
> = {
  luan_chuyen_kho: { label: "Luân chuyển kho", color: "#1565c0", bg: "#e3f2fd", icon: Warehouse },
  chuyen_co_quan_to_tung: { label: "Chuyển cơ quan tố tụng", color: "#c62828", bg: "#ffebee", icon: Building2 },
  ban_giao_co_quan_khac: { label: "Bàn giao cơ quan khác", color: "#e65100", bg: "#fff3e0", icon: ArrowLeftRight },
};

// ========================
// TRANG THAI GIAO TU GIU
// ========================
export const TRANG_THAI_GIAO_TU_GIU: Record<
  TrangThaiGiaoTuGiu,
  { label: string; color: string; bg: string; icon: any }
> = {
  cho_xet_duyet: { label: "Chờ xét duyệt", color: "#f57f17", bg: "#fff8e1", icon: Clock },
  da_duyet: { label: "Đã duyệt", color: "#1565c0", bg: "#e3f2fd", icon: CheckCircle2 },
  dang_tu_giu: { label: "Đang tự giữ", color: "#2e7d32", bg: "#e8f5e9", icon: CarFront },
  da_thu_hoi: { label: "Đã thu hồi", color: "#546e7a", bg: "#eceff1", icon: RefreshCw },
  tu_choi: { label: "Từ chối", color: "#c62828", bg: "#ffebee", icon: XCircle },
};

// ========================
// TRANG THAI TIEN BAO LANH
// ========================
export const TRANG_THAI_BAO_LANH: Record<
  TrangThaiBaoLanh,
  { label: string; color: string; bg: string; icon: any }
> = {
  cho_chuyen_tai_vu: { label: "Chờ chuyển tài vụ", color: "#f57f17", bg: "#fff8e1", icon: Clock },
  da_chuyen_tai_vu: { label: "Đang tạm giữ", color: "#1565c0", bg: "#e3f2fd", icon: Banknote },
  cho_xu_ly: { label: "Chờ xử lý", color: "#c62828", bg: "#ffebee", icon: AlertTriangle },
  da_hoan_tra: { label: "Đã hoàn trả", color: "#2e7d32", bg: "#e8f5e9", icon: CheckCircle2 },
  da_khau_tru: { label: "Đã khấu trừ", color: "#546e7a", bg: "#eceff1", icon: Ban },
};

// ========================
// DON GIA LUU KHO
// ========================
export const DON_GIA_LUU_KHO_MAC_DINH = 50000; // VND/ngày

// ========================
// TRANG THAI VAN BAN
// ========================
export const TRANG_THAI_VAN_BAN: Record<
  TrangThaiVanBan,
  { label: string; color: string; bg: string }
> = {
  nhap: { label: "Nháp", color: "#546e7a", bg: "#eceff1" },
  cho_ky: { label: "Chờ ký", color: "#f57f17", bg: "#fff8e1" },
  da_ky: { label: "Đã ký số", color: "#2e7d32", bg: "#e8f5e9" },
  tu_choi: { label: "Từ chối", color: "#c62828", bg: "#ffebee" },
};

// ========================
// LOAI VAN BAN
// ========================
export const LOAI_VAN_BAN: Record<string, string> = {
  quyet_dinh_xu_ly: "Quyết định xử lý",
  bien_ban_niem_phong: "Biên bản niêm phong",
  bien_ban_ban_giao: "Biên bản bàn giao",
  bien_ban_tieu_huy: "Biên bản tiêu hủy",
  bien_ban_tra_lai: "Biên bản trả lại",
  cong_van: "Công văn",
  bao_cao: "Báo cáo",
};

// ========================
// VAI TRO
// ========================
export const VAI_TRO_LABELS: Record<VaiTroTangVat, string> = {
  admin: "Quản trị viên",
  lanhdao: "Lãnh đạo",
  thukho: "Thủ kho",
  canbonv: "Cán bộ nghiệp vụ",
  viewer: "Xem",
};

// ========================
// MENU BY ROLE
// ========================
export const MENU_BY_ROLE: Record<VaiTroTangVat, string[]> = {
  admin: [
    "/", "/danh-muc", "/ho-so", "/tang-vat",
    "/niem-phong", "/kho-bai", "/kiem-ke", "/luan-chuyen",
    "/xu-ly", "/giao-tu-giu", "/tien-bao-lanh",
    "/ky-so", "/tra-cuu", "/thong-ke",
    "/canh-bao", "/thong-bao", "/nhat-ky", "/cai-dat",
  ],
  lanhdao: [
    "/", "/ho-so", "/tang-vat",
    "/niem-phong", "/kho-bai", "/kiem-ke", "/luan-chuyen",
    "/xu-ly", "/giao-tu-giu", "/tien-bao-lanh",
    "/ky-so", "/tra-cuu", "/thong-ke",
    "/canh-bao", "/thong-bao", "/nhat-ky",
  ],
  thukho: [
    "/", "/tang-vat", "/niem-phong", "/kho-bai",
    "/kiem-ke", "/luan-chuyen", "/giao-tu-giu", "/tien-bao-lanh",
    "/tra-cuu", "/canh-bao", "/thong-bao",
  ],
  canbonv: [
    "/", "/ho-so", "/tang-vat", "/niem-phong",
    "/kho-bai", "/kiem-ke", "/luan-chuyen", "/xu-ly",
    "/giao-tu-giu", "/tien-bao-lanh",
    "/tra-cuu", "/canh-bao", "/thong-bao",
  ],
  viewer: [
    "/", "/tang-vat", "/tra-cuu", "/thong-ke", "/thong-bao",
  ],
};

// ========================
// MOCK USERS
// ========================
import type { User } from "./types";

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    email: "admin@congantinhxx.gov.vn",
    hoTen: "Nguyễn Văn Hùng",
    chucVu: "Trưởng phòng PC06",
    donViId: "dv1",
    donViTen: "PC06 - Phòng CSQLHC về TTXH",
    vaiTro: "admin",
    avatar: "NH",
    trangThai: "active",
    soDienThoai: "0901234567",
    createdAt: "01/01/2025",
    lastLogin: "07/04/2026 08:15",
  },
  {
    id: "u2",
    email: "lanhdao@congantinhxx.gov.vn",
    hoTen: "Trần Thị Lan",
    chucVu: "Phó trưởng phòng PC06",
    donViId: "dv1",
    donViTen: "PC06 - Phòng CSQLHC về TTXH",
    vaiTro: "lanhdao",
    avatar: "TL",
    trangThai: "active",
    soDienThoai: "0912345678",
    createdAt: "15/01/2025",
    lastLogin: "07/04/2026 07:50",
  },
  {
    id: "u3",
    email: "thukho@congantinhxx.gov.vn",
    hoTen: "Phạm Văn Đức",
    chucVu: "Thủ kho",
    donViId: "dv1",
    donViTen: "PC06 - Phòng CSQLHC về TTXH",
    vaiTro: "thukho",
    avatar: "PD",
    trangThai: "active",
    soDienThoai: "0923456789",
    createdAt: "01/02/2025",
    lastLogin: "07/04/2026 08:00",
  },
  {
    id: "u4",
    email: "canbonv@congantinhxx.gov.vn",
    hoTen: "Lê Minh Tuấn",
    chucVu: "Cán bộ nghiệp vụ",
    donViId: "dv2",
    donViTen: "CA xã Bình Xuyên",
    vaiTro: "canbonv",
    avatar: "LT",
    trangThai: "active",
    soDienThoai: "0934567890",
    createdAt: "10/03/2025",
    lastLogin: "06/04/2026 16:30",
  },
  {
    id: "u5",
    email: "viewer@congantinhxx.gov.vn",
    hoTen: "Nguyễn Thị Hoa",
    chucVu: "Cán bộ kiểm tra",
    donViId: "dv3",
    donViTen: "Thanh tra Công an tỉnh",
    vaiTro: "viewer",
    avatar: "NH",
    trangThai: "active",
    soDienThoai: "0945678901",
    createdAt: "01/04/2025",
    lastLogin: "05/04/2026 14:00",
  },
];

// ========================
// COLORS THEME
// ========================
export const COLORS = {
  primary: "#0d3b66",
  primaryDark: "#0a2f52",
  primaryLight: "#e8eef5",
  accent: "#c62828",
  success: "#2e7d32",
  successBg: "#e8f5e9",
  warning: "#f57f17",
  warningBg: "#fff8e1",
  error: "#c62828",
  errorBg: "#ffebee",
  info: "#1565c0",
  infoBg: "#e3f2fd",
  purple: "#7b1fa2",
  purpleBg: "#f3e5f5",
  muted: "#5a6a7e",
  border: "rgba(13, 59, 102, 0.12)",
  bg: "#f0f4f8",
  surface: "#f8fafc",
};

// ========================
// PAGINATION
// ========================
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ========================
// LOAI KHO
// ========================
export const LOAI_KHO: Record<string, string> = {
  trong_nha: "Trong nhà",
  ngoai_troi: "Ngoài trời",
  co_mai_che: "Có mái che",
  kho_lanh: "Kho lạnh",
};

// ========================
// DON VI TINH
// ========================
export const DON_VI_TINH = ["chiếc", "bộ", "kg", "lít", "m", "m²", "thùng", "hộp", "cuộn", "tờ", "cái"];
