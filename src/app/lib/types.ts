// ============================================================
// TYPES — He thong Quan ly Tang Vat Vi Pham Hanh Chinh
// ============================================================

// ========================
// ENUMS / UNION TYPES
// ========================

export type VaiTroTangVat = "admin" | "lanhdao" | "thukho" | "canbonv" | "viewer";

export type TrangThaiTangVat =
  | "cho_nhap_kho"      // Chờ nhập kho
  | "dang_luu_kho"      // Đang lưu kho
  | "dang_xu_ly"        // Đang xử lý
  | "cho_xu_ly"         // Chờ xử lý
  | "da_tra_lai"        // Đã trả lại
  | "da_tieu_huy"       // Đã tiêu hủy
  | "da_tich_thu"       // Đã tịch thu
  | "da_ban";           // Đã bán sung công

export type LoaiTangVat =
  | "phuong_tien_co_gioi"   // Phương tiện cơ giới (ô tô, xe máy)
  | "phuong_tien_khac"      // Phương tiện khác (xe đạp, xuồng...)
  | "hang_hoa"              // Hàng hóa
  | "thuc_pham"             // Thực phẩm, nông sản
  | "tien_te"               // Tiền mặt, ngoại tệ
  | "tai_san_co_gia_tri"    // Tài sản có giá trị (vàng, trang sức...)
  | "vu_khi_cong_cu"        // Vũ khí, công cụ hỗ trợ
  | "thiet_bi_dien_tu"      // Thiết bị điện tử
  | "giay_phep_chung_chi"   // Giấy phép, chứng chỉ hành nghề
  | "thuoc"                 // Thuốc chữa bệnh, thú y, BVTV
  | "khac";                 // Khác

export type TrangThaiHoSo =
  | "cho_duyet"    // Chờ duyệt
  | "dang_xu_ly"   // Đang xử lý
  | "da_duyet"     // Đã duyệt
  | "tu_choi"      // Từ chối
  | "hoan_thanh";  // Hoàn thành

export type TrangThaiNiemPhong =
  | "dang_niem_phong"    // Đang niêm phong
  | "da_mo"              // Đã mở niêm phong
  | "da_niem_phong_lai"; // Đã niêm phong lại

export type HinhThucXuLy =
  | "tra_lai"       // Trả lại chủ sở hữu
  | "tich_thu"      // Tịch thu sung công
  | "tieu_huy"      // Tiêu hủy
  | "ban_sung_cong"; // Bán sung công quỹ

export type TrangThaiXuLy =
  | "cho_phe_duyet"    // Chờ phê duyệt
  | "da_phe_duyet"     // Đã phê duyệt
  | "dang_thuc_hien"   // Đang thực hiện
  | "hoan_thanh"       // Hoàn thành
  | "tu_choi";         // Từ chối

export type TrangThaiLuanChuyen =
  | "cho_phe_duyet"   // Chờ phê duyệt
  | "da_phe_duyet"    // Đã phê duyệt
  | "dang_van_chuyen" // Đang vận chuyển
  | "da_ban_giao"     // Đã bàn giao
  | "tu_choi";        // Từ chối

export type KetQuaKiemKe =
  | "khop"      // Khớp với sổ sách
  | "thieu"     // Thiếu so với sổ sách
  | "hu_hong"   // Hư hỏng, xuống cấp
  | "du";       // Dư so với sổ sách

export type LoaiCanhBao = "critical" | "warning" | "info" | "ban_truc_tiep";

// Loại luân chuyển (Điều 7, 16 NĐ138 + NĐ47)
export type LoaiLuanChuyen =
  | "luan_chuyen_kho"           // Đổi kho nội bộ
  | "chuyen_co_quan_to_tung"    // Chuyển cơ quan điều tra/VKS/Tòa
  | "ban_giao_co_quan_khac";    // Bàn giao cơ quan chức năng khác

// Trạng thái giao phương tiện tự giữ (Điều 14 NĐ138)
export type TrangThaiGiaoTuGiu =
  | "cho_xet_duyet"   // Chờ xét duyệt (2-3 ngày làm việc)
  | "da_duyet"        // Đã duyệt
  | "dang_tu_giu"     // Đang tự giữ
  | "da_thu_hoi"      // Đã thu hồi lại
  | "tu_choi";        // Từ chối

// Trạng thái tiền bảo lãnh (Điều 15 NĐ138)
export type TrangThaiBaoLanh =
  | "cho_chuyen_tai_vu"   // Chờ chuyển tài vụ (2 ngày làm việc)
  | "da_chuyen_tai_vu"    // Đã chuyển, đang tạm giữ
  | "cho_xu_ly"           // Hết 10 ngày làm việc, chờ xử lý
  | "da_hoan_tra"         // Đã hoàn trả
  | "da_khau_tru";        // Đã khấu trừ vào tiền phạt

export type TrangThaiVanBan =
  | "nhap"      // Nháp
  | "cho_ky"    // Chờ ký
  | "da_ky"     // Đã ký
  | "tu_choi";  // Từ chối

export type TrangThaiUser = "active" | "inactive" | "locked";

// ========================
// ENTITIES
// ========================

// --- User ---
export interface User {
  id: string;
  email: string;
  hoTen: string;
  chucVu: string;
  donViId: string;
  donViTen: string;
  vaiTro: VaiTroTangVat;
  avatar: string; // initials
  trangThai: TrangThaiUser;
  soDienThoai: string;
  createdAt: string;
  lastLogin?: string;
}

// --- Don vi ---
export interface DonVi {
  id: string;
  ten: string;
  ma: string;
  diaChi: string;
  dienThoai: string;
  email: string;
  truongDonVi: string;
  capDonVi: "tinh" | "xa";
}

// --- Kho bai ---
export interface Kho {
  id: string;
  ten: string;
  ma: string;
  diaChi: string;
  donViId: string;
  donViTen: string;
  sucChua: number;       // tổng số lượng tối đa
  dangLuu: number;       // đang lưu trữ
  thuKhoId: string;
  thuKhoTen: string;
  loaiKho: "trong_nha" | "ngoai_troi" | "co_mai_che" | "kho_lanh";
  trangThai: "hoat_dong" | "bao_tri" | "dong_cua";
  dienTich: number;      // m2
  ghiChu: string;
  createdAt: string;
}

// --- Vi tri kho ---
export interface ViTriKho {
  id: string;
  khoId: string;
  khu: string;      // Khu A, B, C...
  hang: string;     // Hàng 1, 2...
  ke: string;       // Kệ 1, 2...
  o: string;        // Ô 1, 2...
  trangThai: "trong" | "co_tang_vat" | "bao_tri";
  tangVatId?: string;
}

// --- Ho so vu viec ---
export interface HoSoTaiLieu {
  id: string;
  hoSoId: string;
  tenTaiLieu: string;
  loaiTaiLieu: "bien_ban" | "quyet_dinh" | "hinh_anh" | "khac";
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface HoSoLichSu {
  id: string;
  hoSoId: string;
  hanhDong: string;
  nguoiThucHienId: string;
  nguoiThucHienTen: string;
  thoiGian: string;
  ghiChu: string;
  tuTrangThai?: TrangThaiHoSo;
  sangTrangThai?: TrangThaiHoSo;
}

export interface HoSoVuViec {
  id: string;
  maBienBan: string;       // Số biên bản vi phạm
  ngayLap: string;         // Ngày lập biên bản
  donViLapId: string;
  donViLapTen: string;
  canBoLapId: string;
  canBoLapTen: string;
  doiTuongViPham: string;  // Tên cá nhân/tổ chức vi phạm
  diaChiDoiTuong: string;
  cccdDoiTuong: string;
  loaiGiayToDoiTuong?: "cccd" | "cccd_dien_tu" | "cmnd" | "ho_chieu" | "mst"; // NĐ47: cập nhật loại giấy tờ
  soDienThoaiDoiTuong?: string;   // NĐ47: thêm kênh thông báo
  emailDoiTuong?: string;
  kenhThongBao?: ("app_dinh_danh" | "email" | "sdt")[]; // NĐ47: kênh gửi thông báo
  hanhViViPham: string;    // Mô tả hành vi vi phạm
  canCuPhapLy: string;     // Điều khoản, văn bản pháp luật áp dụng
  diaDiemViPham: string;
  trangThai: TrangThaiHoSo;
  soTangVat: number;       // Số lượng tang vật trong hồ sơ
  tongGiaTriUocTinh: number;
  ghiChu: string;
  taiLieu: HoSoTaiLieu[];
  lichSu: HoSoLichSu[];
  createdAt: string;
  updatedAt: string;
}

// --- Tang vat ---
export interface TangVatHinhAnh {
  id: string;
  tangVatId: string;
  url: string;             // URL hoặc placeholder
  moTa: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TangVat {
  id: string;
  maTangVat: string;       // Mã định danh tang vật
  hoSoId: string;
  maBienBan: string;
  ten: string;             // Tên tang vật
  loai: LoaiTangVat;
  soLuong: number;
  donViTinh: string;       // chiếc, kg, lít, bộ...
  dacDiemNhanDang: string; // Mô tả đặc điểm
  // Riêng cho phương tiện
  bienSo?: string;
  soKhung?: string;
  soMay?: string;
  hangSanXuat?: string;
  namSanXuat?: string;
  mauSac?: string;
  // Riêng cho giấy phép/chứng chỉ hành nghề (Điều 17 NĐ138)
  soGiayPhep?: string;
  coQuanCapPhep?: string;
  ngayCapPhep?: string;
  ngayHetHanGiayPhep?: string;   // Hết hạn → trigger chuyển cơ quan thu hồi
  loaiGiayPhep?: string;          // GPLX, chứng chỉ XD, ...
  // Riêng cho thực phẩm/thuốc (Điều 17a NĐ47)
  hanDungSanPham?: string;        // Hạn sử dụng sản phẩm
  // Chung
  tinhTrangBanDau: string; // Mô tả tình trạng khi tịch thu
  giaTriUocTinh: number;   // VND
  khoId?: string;
  khoTen?: string;
  viTriKhoId?: string;
  viTriKhoMoTa?: string;
  trangThai: TrangThaiTangVat;
  ngayNhapKho?: string;
  hanLuuKho?: string;      // Hạn lưu kho tối đa
  canBoQuanLyId: string;
  canBoQuanLyTen: string;
  hinhAnh: TangVatHinhAnh[];
  ghiChu: string;
  createdAt: string;
  updatedAt: string;
}

// --- Niem phong ---
export interface NiemPhong {
  id: string;
  maNiemPhong: string;
  tangVatId: string;
  tenTangVat: string;
  maBienBan: string;
  ngayNiemPhong: string;
  nguoiNiemPhongId: string;
  nguoiNiemPhongTen: string;
  ngoiChungKienId?: string;
  ngoiChungKienTen?: string;
  moTaTinhTrang: string;   // Tình trạng khi niêm phong
  soTem: string;           // Số sêri tem niêm phong
  hinhAnhUrl: string;
  trangThai: TrangThaiNiemPhong;
  ngayMo?: string;
  nguoiMoId?: string;
  nguoiMoTen?: string;
  lyDoMo?: string;
  ghiChu: string;
  createdAt: string;
}

// --- Phieu nhap kho ---
export interface PhieuNhapKhoChiTiet {
  id: string;
  phieuId: string;
  tangVatId: string;
  tenTangVat: string;
  soLuong: number;
  donViTinh: string;
  viTriKhoId?: string;
  viTriKhoMoTa?: string;
  tinhTrang: string;
  ghiChu: string;
}

export interface PhieuNhapKho {
  id: string;
  maPhieu: string;
  hoSoId: string;
  maBienBan: string;
  khoId: string;
  khoTen: string;
  ngayNhap: string;
  nguoiGiaoId: string;
  nguoiGiaoTen: string;
  nguoiNhanId: string;
  nguoiNhanTen: string;
  thuKhoId: string;
  thuKhoTen: string;
  canBoKiemTraId: string;
  canBoKiemTraTen: string;
  trangThai: "nhap" | "da_duyet" | "hoan_thanh";
  chiTiet: PhieuNhapKhoChiTiet[];
  ghiChu: string;
  createdAt: string;
}

// --- Phieu xuat kho ---
export interface PhieuXuatKhoChiTiet {
  id: string;
  phieuId: string;
  tangVatId: string;
  tenTangVat: string;
  soLuong: number;
  donViTinh: string;
  tinhTrang: string;
  ghiChu: string;
}

export interface PhieuXuatKho {
  id: string;
  maPhieu: string;
  hoSoId: string;
  maBienBan: string;
  khoId: string;
  khoTen: string;
  ngayXuat: string;
  lyDoXuat: "tra_lai" | "tieu_huy" | "ban_sung_cong" | "luan_chuyen" | "khac";
  nguoiNhanId: string;
  nguoiNhanTen: string;
  nguoiGiaoId: string;
  nguoiGiaoTen: string;
  thuKhoId: string;
  thuKhoTen: string;
  trangThai: "nhap" | "da_duyet" | "hoan_thanh";
  chiTiet: PhieuXuatKhoChiTiet[];
  ghiChu: string;
  createdAt: string;
}

// --- Kiem ke ---
export interface KiemKeChiTiet {
  id: string;
  kiemKeId: string;
  tangVatId: string;
  tenTangVat: string;
  soLuongSoSach: number;
  soLuongThucTe: number;
  tinhTrangThucTe: string;
  ketQua: KetQuaKiemKe;
  ghiChu: string;
}

export interface KiemKe {
  id: string;
  maKiemKe: string;
  khoId: string;
  khoTen: string;
  ngayKiemKe: string;
  nguoiKiemKeId: string;
  nguoiKiemKeTen: string;
  lanhdaoPheDuyetId?: string;
  lanhdaoPheDuyetTen?: string;
  trangThai: "dang_kiem_ke" | "hoan_thanh" | "phe_duyet";
  tongTangVatKiemKe: number;
  soKhop: number;
  soThieu: number;
  soHuHong: number;
  soDu: number;
  chiTiet: KiemKeChiTiet[];
  ketLuan: string;
  ghiChu: string;
  createdAt: string;
}

// --- Luan chuyen ---
export interface LuanChuyen {
  id: string;
  maLuanChuyen: string;
  loaiLuanChuyen: LoaiLuanChuyen;   // NĐ47: phân loại luân chuyển
  tangVatId: string;
  tenTangVat: string;
  maBienBan: string;
  khoNguonId: string;
  khoNguonTen: string;
  donViNhanId: string;
  donViNhanTen: string;
  khoNhanId?: string;
  khoNhanTen?: string;
  // Riêng cho chuyển cơ quan tố tụng
  coQuanNhanTen?: string;          // Tên CQĐT/VKS/Tòa án
  soVanBanYeuCau?: string;         // Số văn bản yêu cầu chuyển giao
  nguoiDeNghiId: string;
  nguoiDeNghiTen: string;
  nguoiPheDuyetId?: string;
  nguoiPheDuyetTen?: string;
  nguoiGiaoId?: string;
  nguoiGiaoTen?: string;
  nguoiNhanId?: string;
  nguoiNhanTen?: string;
  lyDo: string;
  canCuPhapLy: string;
  trangThai: TrangThaiLuanChuyen;
  ngayDeNghi: string;
  ngayPheDuyet?: string;
  ngayBanGiao?: string;
  lyDoTuChoi?: string;
  ghiChu: string;
  createdAt: string;
}

// --- Hoi dong tieu huy (Điều 17a NĐ47) ---
export interface HoiDongTieuHuyThanhVien {
  id: string;
  hoTen: string;
  chucVu: string;
  donVi: string;
  vaiTroHoiDong: "chu_tich" | "thu_ky" | "thanh_vien";
}

// --- Xu ly tang vat ---
export interface XuLyTangVat {
  id: string;
  maXuLy: string;
  tangVatId: string;
  tenTangVat: string;
  maBienBan: string;
  hinhThuc: HinhThucXuLy;
  canCuPhapLy: string;
  quyetDinhSo?: string;
  ngayQuyetDinh?: string;
  doiTuongTraLai?: string;    // Tên người nhận (khi trả lại)
  cccdNguoiNhan?: string;
  soTienBan?: number;         // Khi bán sung công
  donViThucHienId?: string;
  donViThucHienTen?: string;
  nguoiDeXuatId: string;
  nguoiDeXuatTen: string;
  nguoiPheDuyetId?: string;
  nguoiPheDuyetTen?: string;
  trangThai: TrangThaiXuLy;
  ngayDeXuat: string;
  ngayPheDuyet?: string;
  ngayHoanThanh?: string;
  lyDoTuChoi?: string;
  moTa: string;
  // Chi phí lưu kho khi trả lại (Điều 16 NĐ138)
  soNgayLuuKho?: number;
  donGiaLuuKho?: number;
  chiPhiLuuKho?: number;
  // Tiêu hủy: Hội đồng tiêu hủy (Điều 17a NĐ47)
  hinhThucTieuHuy?: "hoa_chat" | "co_hoc" | "dot" | "chon" | "khac";
  hoiDongTieuHuy?: HoiDongTieuHuyThanhVien[];
  ghiChu: string;
  createdAt: string;
}

// --- Canh bao ---
export interface CanhBao {
  id: string;
  loai: LoaiCanhBao;
  tieuDe: string;
  moTa: string;
  tangVatId?: string;
  tenTangVat?: string;
  maBienBan?: string;
  khoId?: string;
  khoTen?: string;
  canBoId?: string;
  canBoTen?: string;
  ngayHetHan?: string;
  soNgayConLai?: number;
  daXuLy: boolean;
  ngayTao: string;
  ngayXuLy?: string;
  nguoiXuLyId?: string;
  nguoiXuLyTen?: string;
  ghiChu?: string;
}

// --- Van ban (ky so) ---
export interface VanBan {
  id: string;
  maVanBan: string;
  tieuDe: string;
  loaiVanBan: "quyet_dinh_xu_ly" | "bien_ban_niem_phong" | "bien_ban_ban_giao" | "bien_ban_tieu_huy" | "bien_ban_tra_lai" | "cong_van" | "bao_cao";
  hoSoId?: string;
  maBienBan?: string;
  tangVatId?: string;
  noiDung: string;
  nguoiTaoId: string;
  nguoiTaoTen: string;
  nguoiKyId?: string;
  nguoiKyTen?: string;
  trangThai: TrangThaiVanBan;
  ngayTao: string;
  ngayKy?: string;
  lyDoTuChoi?: string;
  fileUrl?: string;
}

// --- Nhat ky hoat dong ---
export interface NhatKy {
  id: string;
  userId: string;
  userTen: string;
  hanhDong: string;
  doiTuong: string;       // HoSo, TangVat, KiemKe, LuanChuyen...
  doiTuongId: string;
  doiTuongMa: string;
  chiTiet: string;
  thoiGian: string;
  ipAddress?: string;
}

// --- Thong bao ---
export interface ThongBao {
  id: string;
  tieuDe: string;
  noiDung: string;
  loai: "he_thong" | "canh_bao" | "phe_duyet" | "nhac_nho";
  nguoiNhanId: string;
  nguoiNhanTen: string;
  tangVatId?: string;
  hoSoId?: string;
  daDoc: boolean;
  ngayTao: string;
  icon?: string;
}

// --- Cau hinh he thong ---
export interface CauHinh {
  tenHeThong: string;
  tenCongAn: string;
  moTa: string;
  soNgayCanhBaoTruocHan: number;   // Số ngày cảnh báo trước khi hết hạn
  soNgayLuuKhoToiDa: number;       // Mặc định số ngày lưu kho tối đa
  tuDongCanhBao: boolean;
  yeuCauNiemPhong: boolean;        // Bắt buộc niêm phong trước khi nhập kho
  batBuocHinhAnh: boolean;
  soAnhToiThieu: number;
  logHoatDong: boolean;
  sessionTimeout: number;          // phút
  emailCanhBao: boolean;
  emailNhan: string;
}

// --- Giao phuong tien tu giu (Điều 14 NĐ138) ---
export interface GiaoTuGiu {
  id: string;
  maGiaoTuGiu: string;              // GTG-2026-XXXX
  tangVatId: string;
  tenTangVat: string;
  maBienBan: string;
  hoSoId: string;
  // Thông tin người/tổ chức tự giữ
  hoTenNguoiTuGiu: string;
  loaiDoiTuong: "ca_nhan" | "to_chuc";
  diaChiNguoiTuGiu: string;
  soDienThoaiNguoiTuGiu: string;
  loaiGiayTo: "cccd" | "cccd_dien_tu" | "ho_chieu" | "mst";
  soGiayTo: string;
  noiTuGiu: string;                 // Địa điểm giữ phương tiện
  // Giấy đăng ký xe tạm giữ
  soGiayDangKyXe?: string;
  // Quy trình (thời hạn xét duyệt: 2-3 ngày làm việc)
  ngayNopDon: string;
  hanXetDuyet?: string;             // Hạn phải xét duyệt (2-3 ngày LV)
  ngayXetDuyet?: string;
  nguoiXetDuyetId?: string;
  nguoiXetDuyetTen?: string;
  ngayLapBienBan?: string;
  ngayBanGiao?: string;
  ngayThuHoi?: string;
  lyDoTuChoi?: string;
  lyDoThuHoi?: string;
  // Thông báo UBND xã/phường (trong 2 ngày làm việc)
  ubndDaThongBao: boolean;
  ngayThongBaoUBND?: string;
  ubndXaPhuong?: string;
  // Trạng thái
  trangThai: TrangThaiGiaoTuGiu;
  dieuKienBaoQuan: string;
  nguoiTiepNhanId: string;
  nguoiTiepNhanTen: string;
  ghiChu: string;
  createdAt: string;
}

// --- Tien bao lanh (Điều 15 NĐ138) ---
export interface TienBaoLanh {
  id: string;
  maBaoLanh: string;                // BL-2026-XXXX
  tangVatId: string;
  tenTangVat: string;
  maBienBan: string;
  hoSoId: string;
  // Người đặt bảo lãnh
  hoTenNguoiBaoLanh: string;
  soDienThoai: string;
  soGiayTo: string;
  quanHeVoiViPham: "chinh_chu" | "nguoi_than" | "to_chuc";
  // Tài chính
  soTienBaoLanh: number;            // Số tiền đặt bảo lãnh
  mucPhatToiDa: number;             // Mức phạt tối đa theo khung vi phạm
  soTienThucNhan: number;           // Sau khi kiểm đếm
  // Quy trình
  ngayDatBaoLanh: string;
  hanChuyenTaiVu?: string;          // Hạn chuyển tài vụ (2 ngày LV)
  ngayChuyenTaiVu?: string;
  maTaiVuKeToan?: string;
  ngayHetHanXuLy?: string;          // = ngayDatBaoLanh + 10 ngày LV
  ngayXuLy?: string;
  ketQuaXuLy?: "hoan_tra" | "khau_tru";
  soTienKhauTru?: number;
  soTienHoanTra?: number;
  lyDoKhauTru?: string;
  // Người thực hiện
  nguoiTiepNhanId: string;
  nguoiTiepNhanTen: string;
  nguoiChuyenTaiVuId?: string;
  nguoiChuyenTaiVuTen?: string;
  nguoiXuLyId?: string;
  nguoiXuLyTen?: string;
  // Trạng thái
  trangThai: TrangThaiBaoLanh;
  ghiChu: string;
  createdAt: string;
}

// --- Căn cứ pháp lý mẫu ---
export interface CanCuPhapLyMau {
  id: string;
  tieuDe: string;          // VD: "Vi phạm giao thông"
  noiDung: string;         // VD: "Điều 30 NĐ 100/2019/NĐ-CP"
  linhVuc: string;         // VD: "Giao thông", "Kinh doanh", "Môi trường"...
  createdAt: string;
}

// --- Đơn vị tính ---
export interface DonViTinhDanhMuc {
  id: string;
  ten: string;             // VD: "Chiếc"
  kyHieu: string;          // VD: "chiếc"
  moTa: string;
}

// --- Pagination & Filter ---
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterState {
  search: string;
  trangThai: string;
  loai: string;
  khoId: string;
  donViId: string;
  dateFrom: string;
  dateTo: string;
}
