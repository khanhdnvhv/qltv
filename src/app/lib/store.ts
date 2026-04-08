// ============================================================
// STORE — Tang Vat Vi Pham Hanh Chinh — MobX-like reactive store
// ============================================================

import { createContext, useContext } from "react";
import type {
  User, DonVi, Kho, ViTriKho,
  HoSoVuViec, TangVat, NiemPhong,
  PhieuNhapKho, KiemKe, LuanChuyen, XuLyTangVat,
  CanhBao, VanBan, NhatKy, ThongBao, CauHinh,
  TrangThaiTangVat, LoaiTangVat, TrangThaiHoSo,
  GiaoTuGiu, TienBaoLanh, TrangThaiGiaoTuGiu, TrangThaiBaoLanh,
} from "./types";
import { MOCK_USERS } from "./constants";

// ========================
// HELPERS
// ========================
let _seq = 1000;
function genId(): string {
  _seq++;
  return `id-${_seq}-${Math.random().toString(36).substr(2, 6)}`;
}
function genMa(prefix: string): string {
  _seq++;
  const y = new Date().getFullYear();
  return `${prefix}-${y}-${String(_seq).padStart(4, "0")}`;
}

// ========================
// MOCK DATA
// ========================

export const MOCK_DON_VI: DonVi[] = [
  { id: "dv1", ten: "PC06 - Phòng CSQLHC về TTXH", ma: "PC06", diaChi: "30 Đường Mê Linh, TP Vĩnh Yên", dienThoai: "0211.3862000", email: "pc06@congantinhvinhphuc.gov.vn", truongDonVi: "Nguyễn Văn Hùng", capDonVi: "tinh" },
  { id: "dv2", ten: "CA Huyện Bình Xuyên", ma: "CABX", diaChi: "Thị trấn Gia Khánh, Bình Xuyên", dienThoai: "0211.3862111", email: "cabinhxuyen@congantinhvinhphuc.gov.vn", truongDonVi: "Trần Văn Bình", capDonVi: "huyen" },
  { id: "dv3", ten: "CA TP Vĩnh Yên", ma: "CAVY", diaChi: "TP Vĩnh Yên", dienThoai: "0211.3862222", email: "cavinhyen@congantinhvinhphuc.gov.vn", truongDonVi: "Lê Văn Cường", capDonVi: "huyen" },
  { id: "dv4", ten: "CA Huyện Vĩnh Tường", ma: "CAVT", diaChi: "Huyện Vĩnh Tường", dienThoai: "0211.3862333", email: "cavinhtuong@congantinhvinhphuc.gov.vn", truongDonVi: "Phạm Văn Đạt", capDonVi: "huyen" },
  { id: "dv5", ten: "CA Huyện Yên Lạc", ma: "CAYL", diaChi: "Huyện Yên Lạc", dienThoai: "0211.3862444", email: "cayenlac@congantinhvinhphuc.gov.vn", truongDonVi: "Vũ Thị Lan", capDonVi: "huyen" },
];

export const MOCK_KHO: Kho[] = [
  {
    id: "kho1",
    ten: "Kho Tang Vật PC06",
    ma: "KTV-PC06",
    diaChi: "30 Đường Mê Linh, TP Vĩnh Yên",
    donViId: "dv1",
    donViTen: "PC06",
    sucChua: 200,
    dangLuu: 87,
    thuKhoId: "u3",
    thuKhoTen: "Phạm Văn Đức",
    loaiKho: "trong_nha",
    trangThai: "hoat_dong",
    dienTich: 500,
    ghiChu: "Kho chính lưu trữ phương tiện và hàng hóa",
    createdAt: "01/01/2025",
  },
  {
    id: "kho2",
    ten: "Bãi Phương Tiện PC06",
    ma: "BPT-PC06",
    diaChi: "30 Đường Mê Linh, TP Vĩnh Yên",
    donViId: "dv1",
    donViTen: "PC06",
    sucChua: 100,
    dangLuu: 43,
    thuKhoId: "u3",
    thuKhoTen: "Phạm Văn Đức",
    loaiKho: "ngoai_troi",
    trangThai: "hoat_dong",
    dienTich: 1200,
    ghiChu: "Bãi giữ xe ô tô, xe máy, phương tiện cơ giới",
    createdAt: "01/01/2025",
  },
  {
    id: "kho3",
    ten: "Kho Hàng Hóa Đặc Biệt",
    ma: "KHHDB-PC06",
    diaChi: "30 Đường Mê Linh, TP Vĩnh Yên",
    donViId: "dv1",
    donViTen: "PC06",
    sucChua: 50,
    dangLuu: 22,
    thuKhoId: "u3",
    thuKhoTen: "Phạm Văn Đức",
    loaiKho: "trong_nha",
    trangThai: "hoat_dong",
    dienTich: 120,
    ghiChu: "Lưu vũ khí, tiền tệ, tài sản giá trị cao",
    createdAt: "01/01/2025",
  },
  {
    id: "kho4",
    ten: "Kho CA Huyện Bình Xuyên",
    ma: "KTV-CABX",
    diaChi: "Thị trấn Gia Khánh, Bình Xuyên",
    donViId: "dv2",
    donViTen: "CA Huyện Bình Xuyên",
    sucChua: 80,
    dangLuu: 31,
    thuKhoId: "u4",
    thuKhoTen: "Lê Minh Tuấn",
    loaiKho: "trong_nha",
    trangThai: "hoat_dong",
    dienTich: 200,
    ghiChu: "",
    createdAt: "01/03/2025",
  },
  {
    id: "kho5",
    ten: "Kho CA TP Vĩnh Yên",
    ma: "KTV-CAVY",
    diaChi: "TP Vĩnh Yên",
    donViId: "dv3",
    donViTen: "CA TP Vĩnh Yên",
    sucChua: 60,
    dangLuu: 18,
    thuKhoId: "u5",
    thuKhoTen: "Nguyễn Thị Hoa",
    loaiKho: "trong_nha",
    trangThai: "hoat_dong",
    dienTich: 150,
    ghiChu: "",
    createdAt: "01/02/2025",
  },
];

export const MOCK_HO_SO: HoSoVuViec[] = [
  {
    id: "hs1", maBienBan: "BB-2026-001", ngayLap: "05/01/2026",
    donViLapId: "dv2", donViLapTen: "CA Huyện Bình Xuyên",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Nguyễn Văn Tám", diaChiDoiTuong: "Xã Bá Hiến, Bình Xuyên, Vĩnh Phúc",
    cccdDoiTuong: "027045001234", hanhViViPham: "Điều khiển xe máy không đăng ký, không GPLX",
    canCuPhapLy: "Điều 30 NĐ 100/2019/NĐ-CP", diaDiemViPham: "QL2, đoạn qua xã Bá Hiến",
    trangThai: "hoan_thanh", soTangVat: 1, tongGiaTriUocTinh: 15000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "05/01/2026", updatedAt: "10/01/2026",
  },
  {
    id: "hs2", maBienBan: "BB-2026-002", ngayLap: "08/01/2026",
    donViLapId: "dv3", donViLapTen: "CA TP Vĩnh Yên",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Công ty TNHH Xuất Nhập Khẩu Minh Anh", diaChiDoiTuong: "KCN Khai Quang, TP Vĩnh Yên",
    cccdDoiTuong: "MST:0101234567", hanhViViPham: "Vận chuyển hàng hóa nhập lậu không có hóa đơn chứng từ",
    canCuPhapLy: "Điều 15 NĐ 185/2013/NĐ-CP sửa đổi bởi NĐ 124/2015", diaDiemViPham: "Cửa khẩu nội địa KCN Khai Quang",
    trangThai: "dang_xu_ly", soTangVat: 3, tongGiaTriUocTinh: 85000000,
    ghiChu: "Đang chờ kết quả giám định hàng hóa", taiLieu: [], lichSu: [], createdAt: "08/01/2026", updatedAt: "15/01/2026",
  },
  {
    id: "hs3", maBienBan: "BB-2026-003", ngayLap: "12/01/2026",
    donViLapId: "dv1", donViLapTen: "PC06",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Trần Thị Bình", diaChiDoiTuong: "67 Đường Nguyễn Tất Thành, TP Vĩnh Yên",
    cccdDoiTuong: "027065002345", hanhViViPham: "Tàng trữ, mua bán hàng giả mạo nhãn hiệu",
    canCuPhapLy: "Điều 11 NĐ 185/2013/NĐ-CP", diaDiemViPham: "Chợ Vĩnh Yên",
    trangThai: "da_duyet", soTangVat: 2, tongGiaTriUocTinh: 32000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "12/01/2026", updatedAt: "20/01/2026",
  },
  {
    id: "hs4", maBienBan: "BB-2026-004", ngayLap: "15/01/2026",
    donViLapId: "dv4", donViLapTen: "CA Huyện Vĩnh Tường",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Phạm Văn Long", diaChiDoiTuong: "Xã Vĩnh Sơn, Vĩnh Tường",
    cccdDoiTuong: "027075003456", hanhViViPham: "Vận chuyển gia súc không giấy tờ kiểm dịch",
    canCuPhapLy: "Pháp lệnh Thú y 2004, NĐ 90/2017/NĐ-CP", diaDiemViPham: "QL2C, đoạn qua Vĩnh Tường",
    trangThai: "cho_duyet", soTangVat: 1, tongGiaTriUocTinh: 12000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "15/01/2026", updatedAt: "15/01/2026",
  },
  {
    id: "hs5", maBienBan: "BB-2026-005", ngayLap: "18/01/2026",
    donViLapId: "dv2", donViLapTen: "CA Huyện Bình Xuyên",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Hoàng Minh Sơn", diaChiDoiTuong: "Thị trấn Gia Khánh, Bình Xuyên",
    cccdDoiTuong: "027025004567", hanhViViPham: "Tàng trữ vũ khí thô sơ trái phép",
    canCuPhapLy: "Điều 3 Pháp lệnh Quản lý, sử dụng vũ khí", diaDiemViPham: "Nhà riêng",
    trangThai: "dang_xu_ly", soTangVat: 1, tongGiaTriUocTinh: 5000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "18/01/2026", updatedAt: "18/01/2026",
  },
  {
    id: "hs6", maBienBan: "BB-2026-006", ngayLap: "20/01/2026",
    donViLapId: "dv1", donViLapTen: "PC06",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Nguyễn Đức Thắng", diaChiDoiTuong: "Phường Đống Đa, TP Vĩnh Yên",
    cccdDoiTuong: "027035005678", hanhViViPham: "Kinh doanh rượu không nhãn mác, không rõ nguồn gốc",
    canCuPhapLy: "NĐ 17/2020/NĐ-CP, NĐ 24/2020/NĐ-CP", diaDiemViPham: "Cửa hàng tạp hóa 12 Phố Huế",
    trangThai: "hoan_thanh", soTangVat: 2, tongGiaTriUocTinh: 18000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "20/01/2026", updatedAt: "28/01/2026",
  },
  {
    id: "hs7", maBienBan: "BB-2026-007", ngayLap: "25/01/2026",
    donViLapId: "dv5", donViLapTen: "CA Huyện Yên Lạc",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Lê Thị Ngọc", diaChiDoiTuong: "Xã Liên Châu, Yên Lạc",
    cccdDoiTuong: "027085006789", hanhViViPham: "Buôn bán thực phẩm không an toàn, quá hạn sử dụng",
    canCuPhapLy: "Luật An toàn thực phẩm 2010, NĐ 115/2018/NĐ-CP", diaDiemViPham: "Chợ xã Liên Châu",
    trangThai: "da_duyet", soTangVat: 2, tongGiaTriUocTinh: 7500000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "25/01/2026", updatedAt: "01/02/2026",
  },
  {
    id: "hs8", maBienBan: "BB-2026-008", ngayLap: "01/02/2026",
    donViLapId: "dv1", donViLapTen: "PC06",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Vũ Văn Kiên", diaChiDoiTuong: "Xã Tam Hợp, Bình Xuyên",
    cccdDoiTuong: "027015007890", hanhViViPham: "Điều khiển ô tô không bằng lái, vi phạm nồng độ cồn",
    canCuPhapLy: "NĐ 100/2019/NĐ-CP Điều 5, Điều 6", diaDiemViPham: "Đường Ngô Quyền, TP Vĩnh Yên",
    trangThai: "dang_xu_ly", soTangVat: 1, tongGiaTriUocTinh: 350000000,
    ghiChu: "Chờ xác minh chủ xe", taiLieu: [], lichSu: [], createdAt: "01/02/2026", updatedAt: "05/02/2026",
  },
  {
    id: "hs9", maBienBan: "BB-2026-009", ngayLap: "05/02/2026",
    donViLapId: "dv3", donViLapTen: "CA TP Vĩnh Yên",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Công ty CP Phát triển Địa ốc Minh Đức", diaChiDoiTuong: "Phường Tích Sơn, TP Vĩnh Yên",
    cccdDoiTuong: "MST:0101345678", hanhViViPham: "Tàng trữ vật liệu nổ công nghiệp không phép",
    canCuPhapLy: "Luật Quản lý sử dụng vũ khí, vật liệu nổ 2017", diaDiemViPham: "Kho vật tư Công ty",
    trangThai: "cho_duyet", soTangVat: 1, tongGiaTriUocTinh: 25000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "05/02/2026", updatedAt: "05/02/2026",
  },
  {
    id: "hs10", maBienBan: "BB-2026-010", ngayLap: "10/02/2026",
    donViLapId: "dv2", donViLapTen: "CA Huyện Bình Xuyên",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Đinh Văn Hải", diaChiDoiTuong: "Thị trấn Hương Canh, Bình Xuyên",
    cccdDoiTuong: "027055008901", hanhViViPham: "Kinh doanh điện thoại nhập lậu, hàng giả",
    canCuPhapLy: "NĐ 185/2013/NĐ-CP Điều 12, Điều 13", diaDiemViPham: "Cửa hàng di động Hải Tech",
    trangThai: "dang_xu_ly", soTangVat: 3, tongGiaTriUocTinh: 95000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "10/02/2026", updatedAt: "15/02/2026",
  },
  {
    id: "hs11", maBienBan: "BB-2026-011", ngayLap: "14/02/2026",
    donViLapId: "dv1", donViLapTen: "PC06",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Trần Văn Khánh", diaChiDoiTuong: "Phường Khai Quang, TP Vĩnh Yên",
    cccdDoiTuong: "027065009012", hanhViViPham: "Tổ chức đánh bạc",
    canCuPhapLy: "Điều 322 BLHS 2015, NĐ 144/2021/NĐ-CP", diaDiemViPham: "Nhà riêng",
    trangThai: "da_duyet", soTangVat: 1, tongGiaTriUocTinh: 42000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "14/02/2026", updatedAt: "20/02/2026",
  },
  {
    id: "hs12", maBienBan: "BB-2026-012", ngayLap: "18/02/2026",
    donViLapId: "dv4", donViLapTen: "CA Huyện Vĩnh Tường",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Nguyễn Thị Thảo", diaChiDoiTuong: "Xã Chấn Hưng, Vĩnh Tường",
    cccdDoiTuong: "027085010123", hanhViViPham: "Khai thác cát trái phép trên sông Hồng",
    canCuPhapLy: "Luật Khoáng sản 2010, NĐ 158/2016/NĐ-CP", diaDiemViPham: "Bãi sông Hồng đoạn xã Lũng Hòa",
    trangThai: "hoan_thanh", soTangVat: 2, tongGiaTriUocTinh: 480000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "18/02/2026", updatedAt: "01/03/2026",
  },
  {
    id: "hs13", maBienBan: "BB-2026-013", ngayLap: "25/02/2026",
    donViLapId: "dv1", donViLapTen: "PC06",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Công ty TNHH Thiết bị Điện Toàn Cầu", diaChiDoiTuong: "KCN Bình Xuyên, Vĩnh Phúc",
    cccdDoiTuong: "MST:0201234567", hanhViViPham: "Sản xuất, kinh doanh hàng điện tử kém chất lượng",
    canCuPhapLy: "Luật Chất lượng sản phẩm hàng hóa 2007", diaDiemViPham: "Kho xưởng Công ty",
    trangThai: "dang_xu_ly", soTangVat: 2, tongGiaTriUocTinh: 150000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "25/02/2026", updatedAt: "01/03/2026",
  },
  {
    id: "hs14", maBienBan: "BB-2026-014", ngayLap: "05/03/2026",
    donViLapId: "dv5", donViLapTen: "CA Huyện Yên Lạc",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Bùi Văn Tứ", diaChiDoiTuong: "Xã Trung Nguyên, Yên Lạc",
    cccdDoiTuong: "027015011234", hanhViViPham: "Điều khiển xe mô tô phân khối lớn đua trái phép",
    canCuPhapLy: "NĐ 100/2019/NĐ-CP Điều 33", diaDiemViPham: "Đường tránh QL2",
    trangThai: "cho_duyet", soTangVat: 2, tongGiaTriUocTinh: 75000000,
    ghiChu: "", taiLieu: [], lichSu: [], createdAt: "05/03/2026", updatedAt: "05/03/2026",
  },
  {
    id: "hs15", maBienBan: "BB-2026-015", ngayLap: "10/03/2026",
    donViLapId: "dv1", donViLapTen: "PC06",
    canBoLapId: "u4", canBoLapTen: "Lê Minh Tuấn",
    doiTuongViPham: "Đào Văn Thành", diaChiDoiTuong: "Phường Liên Bảo, TP Vĩnh Yên",
    cccdDoiTuong: "027025012345", hanhViViPham: "Mua bán, vận chuyển pháo nổ trái phép",
    canCuPhapLy: "NĐ 137/2020/NĐ-CP Điều 11", diaDiemViPham: "Nhà kho Đào Văn Thành",
    trangThai: "dang_xu_ly", soTangVat: 1, tongGiaTriUocTinh: 38000000,
    ghiChu: "Đang điều tra thêm", taiLieu: [], lichSu: [], createdAt: "10/03/2026", updatedAt: "12/03/2026",
  },
];

export const MOCK_TANG_VAT: TangVat[] = [
  // --- Phương tiện cơ giới ---
  {
    id: "tv1", maTangVat: "TV-2026-001", hoSoId: "hs1", maBienBan: "BB-2026-001",
    ten: "Xe máy Honda Wave Alpha", loai: "phuong_tien_co_gioi",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Xe máy màu đỏ đen, đời 2020",
    bienSo: "86B1-234.56", soKhung: "RLHJ...0001", soMay: "WA20...0001",
    hangSanXuat: "Honda", namSanXuat: "2020", mauSac: "Đỏ đen",
    tinhTrangBanDau: "Còn hoạt động, có một số xước nhỏ",
    giaTriUocTinh: 15000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu A - Hàng 1 - Ô 5",
    trangThai: "da_tra_lai", ngayNhapKho: "06/01/2026", hanLuuKho: "06/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đã trả lại chủ xe ngày 10/01/2026",
    createdAt: "06/01/2026", updatedAt: "10/01/2026",
  },
  {
    id: "tv2", maTangVat: "TV-2026-002", hoSoId: "hs8", maBienBan: "BB-2026-008",
    ten: "Ô tô Toyota Camry 2.5Q", loai: "phuong_tien_co_gioi",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Ô tô sedan 4 chỗ màu đen, đời 2022",
    bienSo: "88A-123.45", soKhung: "MR0SS...2022", soMay: "2AR...2022",
    hangSanXuat: "Toyota", namSanXuat: "2022", mauSac: "Đen",
    tinhTrangBanDau: "Mới 90%, còn nguyên vẹn, đủ các giấy tờ",
    giaTriUocTinh: 950000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu C - Hàng 1 - Ô 1",
    trangThai: "dang_luu_kho", ngayNhapKho: "02/02/2026", hanLuuKho: "02/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Chờ xác minh chủ xe",
    createdAt: "02/02/2026", updatedAt: "02/02/2026",
  },
  {
    id: "tv3", maTangVat: "TV-2026-003", hoSoId: "hs14", maBienBan: "BB-2026-014",
    ten: "Xe mô tô Yamaha R15 V3", loai: "phuong_tien_co_gioi",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Xe mô tô thể thao màu xanh trắng, 155cc",
    bienSo: "99B3-456.78", soKhung: "ME1...R15", soMay: "G3E...001",
    hangSanXuat: "Yamaha", namSanXuat: "2023", mauSac: "Xanh trắng",
    tinhTrangBanDau: "Mới 85%, tem đua dán trên thân xe",
    giaTriUocTinh: 55000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu A - Hàng 2 - Ô 8",
    trangThai: "cho_xu_ly", ngayNhapKho: "06/03/2026", hanLuuKho: "06/09/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "06/03/2026", updatedAt: "06/03/2026",
  },
  {
    id: "tv4", maTangVat: "TV-2026-004", hoSoId: "hs14", maBienBan: "BB-2026-014",
    ten: "Xe mô tô Kawasaki Z650", loai: "phuong_tien_co_gioi",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Xe phân khối lớn màu xanh lá, 649cc",
    bienSo: "88B2-789.01", soKhung: "JKAZX4...001", soMay: "ER650E...001",
    hangSanXuat: "Kawasaki", namSanXuat: "2022", mauSac: "Xanh lá",
    tinhTrangBanDau: "Còn tốt, mới 80%",
    giaTriUocTinh: 185000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu B - Hàng 1 - Ô 3",
    trangThai: "cho_xu_ly", ngayNhapKho: "06/03/2026", hanLuuKho: "06/09/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "06/03/2026", updatedAt: "06/03/2026",
  },
  {
    id: "tv5", maTangVat: "TV-2026-005", hoSoId: "hs12", maBienBan: "BB-2026-012",
    ten: "Tàu hút cát công suất lớn", loai: "phuong_tien_khac",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Tàu hút cát sà lan loại lớn, màu xám gỉ",
    bienSo: "VP-0042", soKhung: "", soMay: "CAT...3512", hangSanXuat: "Đóng trong nước", namSanXuat: "2018", mauSac: "Xám",
    tinhTrangBanDau: "Đang vận hành, còn máy",
    giaTriUocTinh: 450000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu D - Neo đậu bến sông",
    trangThai: "da_tich_thu", ngayNhapKho: "20/02/2026", hanLuuKho: "20/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đã ra quyết định tịch thu",
    createdAt: "20/02/2026", updatedAt: "01/03/2026",
  },
  // --- Hang hoa ---
  {
    id: "tv6", maTangVat: "TV-2026-006", hoSoId: "hs2", maBienBan: "BB-2026-002",
    ten: "Hàng vải nhập lậu các loại", loai: "hang_hoa",
    soLuong: 350, donViTinh: "kg",
    dacDiemNhanDang: "Vải các màu, không nhãn mác, đóng trong bao tải",
    tinhTrangBanDau: "Còn nguyên, chưa sử dụng",
    giaTriUocTinh: 35000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu A - Kệ 3 - Ô 12",
    trangThai: "dang_luu_kho", ngayNhapKho: "09/01/2026", hanLuuKho: "09/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "09/01/2026", updatedAt: "09/01/2026",
  },
  {
    id: "tv7", maTangVat: "TV-2026-007", hoSoId: "hs2", maBienBan: "BB-2026-002",
    ten: "Quần áo giả nhãn hiệu nổi tiếng", loai: "hang_hoa",
    soLuong: 200, donViTinh: "bộ",
    dacDiemNhanDang: "Quần áo giả nhãn hiệu Gucci, LV, Chanel, đóng trong túi nilon",
    tinhTrangBanDau: "Còn mới, chưa qua sử dụng",
    giaTriUocTinh: 25000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu A - Kệ 4 - Ô 5",
    trangThai: "dang_luu_kho", ngayNhapKho: "09/01/2026", hanLuuKho: "09/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "09/01/2026", updatedAt: "09/01/2026",
  },
  {
    id: "tv8", maTangVat: "TV-2026-008", hoSoId: "hs3", maBienBan: "BB-2026-003",
    ten: "Túi xách giả mạo nhãn hiệu Coach", loai: "hang_hoa",
    soLuong: 45, donViTinh: "chiếc",
    dacDiemNhanDang: "Túi xách da PU giả Coach, màu nâu và đen",
    tinhTrangBanDau: "Còn mới 95%",
    giaTriUocTinh: 18000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu B - Kệ 1 - Ô 8",
    trangThai: "da_tieu_huy", ngayNhapKho: "13/01/2026", hanLuuKho: "13/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đã tiêu hủy theo quyết định số QĐ-2026-003",
    createdAt: "13/01/2026", updatedAt: "20/01/2026",
  },
  {
    id: "tv9", maTangVat: "TV-2026-009", hoSoId: "hs3", maBienBan: "BB-2026-003",
    ten: "Đồng hồ giả nhãn hiệu Rolex, Omega", loai: "tai_san_co_gia_tri",
    soLuong: 28, donViTinh: "chiếc",
    dacDiemNhanDang: "Đồng hồ giả cao cấp, vỏ mạ vàng giả",
    tinhTrangBanDau: "Còn mới, còn trong hộp",
    giaTriUocTinh: 14000000, khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt",
    viTriKhoMoTa: "Khu A - Tủ 1 - Ngăn 3",
    trangThai: "da_tieu_huy", ngayNhapKho: "13/01/2026", hanLuuKho: "13/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đã tiêu hủy",
    createdAt: "13/01/2026", updatedAt: "20/01/2026",
  },
  // --- Thuc pham ---
  {
    id: "tv10", maTangVat: "TV-2026-010", hoSoId: "hs7", maBienBan: "BB-2026-007",
    ten: "Thực phẩm chức năng hết hạn sử dụng", loai: "thuc_pham",
    soLuong: 120, donViTinh: "hộp",
    dacDiemNhanDang: "Các loại thực phẩm chức năng nhãn nước ngoài, hết hạn 2025",
    tinhTrangBanDau: "Hộp nguyên nhưng đã quá hạn dùng",
    giaTriUocTinh: 4500000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu C - Kệ 2 - Ô 4",
    trangThai: "da_tieu_huy", ngayNhapKho: "26/01/2026", hanLuuKho: "26/04/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đã tiêu hủy, lập biên bản",
    createdAt: "26/01/2026", updatedAt: "01/02/2026",
  },
  {
    id: "tv11", maTangVat: "TV-2026-011", hoSoId: "hs7", maBienBan: "BB-2026-007",
    ten: "Rượu không rõ nguồn gốc", loai: "thuc_pham",
    soLuong: 85, donViTinh: "lít",
    dacDiemNhanDang: "Rượu đựng trong can nhựa, không nhãn mác",
    tinhTrangBanDau: "Còn nguyên chưa mở",
    giaTriUocTinh: 3000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu C - Kệ 2 - Ô 5",
    trangThai: "da_tieu_huy", ngayNhapKho: "26/01/2026", hanLuuKho: "26/04/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đã tiêu hủy",
    createdAt: "26/01/2026", updatedAt: "01/02/2026",
  },
  // --- Tien te ---
  {
    id: "tv12", maTangVat: "TV-2026-012", hoSoId: "hs11", maBienBan: "BB-2026-011",
    ten: "Tiền mặt thu được từ đánh bạc", loai: "tien_te",
    soLuong: 42000000, donViTinh: "VND",
    dacDiemNhanDang: "Tiền VND mệnh giá 500k và 200k, đóng thành từng xấp",
    tinhTrangBanDau: "Tiền thật, còn nguyên",
    giaTriUocTinh: 42000000, khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt",
    viTriKhoMoTa: "Két sắt - Ngăn 1",
    trangThai: "cho_xu_ly", ngayNhapKho: "15/02/2026", hanLuuKho: "15/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Chờ quyết định sung công",
    createdAt: "15/02/2026", updatedAt: "15/02/2026",
  },
  // --- Vu khi ---
  {
    id: "tv13", maTangVat: "TV-2026-013", hoSoId: "hs5", maBienBan: "BB-2026-005",
    ten: "Kiếm tự chế, dao nhọn các loại", loai: "vu_khi_cong_cu",
    soLuong: 5, donViTinh: "cái",
    dacDiemNhanDang: "02 kiếm tự chế dài 80cm, 03 dao nhọn loại lớn",
    tinhTrangBanDau: "Còn sắc bén, chưa qua sử dụng",
    giaTriUocTinh: 5000000, khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt",
    viTriKhoMoTa: "Tủ Vũ khí - Ngăn 2",
    trangThai: "dang_luu_kho", ngayNhapKho: "19/01/2026", hanLuuKho: "19/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "19/01/2026", updatedAt: "19/01/2026",
  },
  // --- Thiet bi dien tu ---
  {
    id: "tv14", maTangVat: "TV-2026-014", hoSoId: "hs10", maBienBan: "BB-2026-010",
    ten: "Điện thoại iPhone 14 Pro nhập lậu", loai: "thiet_bi_dien_tu",
    soLuong: 35, donViTinh: "chiếc",
    dacDiemNhanDang: "iPhone 14 Pro 256GB, chưa active, đóng hộp kín",
    tinhTrangBanDau: "Mới 100%, còn hộp đầy đủ phụ kiện",
    giaTriUocTinh: 70000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu B - Kệ 5 - Ô 1",
    trangThai: "dang_luu_kho", ngayNhapKho: "11/02/2026", hanLuuKho: "11/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đang chờ giám định",
    createdAt: "11/02/2026", updatedAt: "11/02/2026",
  },
  {
    id: "tv15", maTangVat: "TV-2026-015", hoSoId: "hs10", maBienBan: "BB-2026-010",
    ten: "Tablet Samsung Galaxy Tab S8 nhập lậu", loai: "thiet_bi_dien_tu",
    soLuong: 20, donViTinh: "chiếc",
    dacDiemNhanDang: "Samsung Galaxy Tab S8 11inch, chưa active",
    tinhTrangBanDau: "Mới 100%, còn hộp",
    giaTriUocTinh: 18000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu B - Kệ 5 - Ô 2",
    trangThai: "dang_luu_kho", ngayNhapKho: "11/02/2026", hanLuuKho: "11/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "11/02/2026", updatedAt: "11/02/2026",
  },
  {
    id: "tv16", maTangVat: "TV-2026-016", hoSoId: "hs13", maBienBan: "BB-2026-013",
    ten: "Thiết bị điện kém chất lượng các loại", loai: "thiet_bi_dien_tu",
    soLuong: 500, donViTinh: "cái",
    dacDiemNhanDang: "Thiết bị điện: ổ cắm, cầu dao, đèn LED lỗi",
    tinhTrangBanDau: "Mới nhưng kém chất lượng, không đạt tiêu chuẩn",
    giaTriUocTinh: 75000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu C - Kệ 4 - Ô 1-5",
    trangThai: "dang_xu_ly", ngayNhapKho: "26/02/2026", hanLuuKho: "26/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "26/02/2026", updatedAt: "26/02/2026",
  },
  {
    id: "tv17", maTangVat: "TV-2026-017", hoSoId: "hs13", maBienBan: "BB-2026-013",
    ten: "Laptop nhái nhãn hiệu Dell, HP", loai: "thiet_bi_dien_tu",
    soLuong: 15, donViTinh: "chiếc",
    dacDiemNhanDang: "Laptop giả mạo nhãn hiệu Dell và HP, cấu hình kém",
    tinhTrangBanDau: "Mới 70%, một số chiếc không khởi động được",
    giaTriUocTinh: 75000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu B - Kệ 3 - Ô 7",
    trangThai: "dang_xu_ly", ngayNhapKho: "26/02/2026", hanLuuKho: "26/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "26/02/2026", updatedAt: "26/02/2026",
  },
  // --- Phuong tien ---
  {
    id: "tv18", maTangVat: "TV-2026-018", hoSoId: "hs4", maBienBan: "BB-2026-004",
    ten: "Xe tải chở gia súc không giấy tờ", loai: "phuong_tien_co_gioi",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Xe tải loại nhỏ tải trọng 1.5 tấn, biển số Vĩnh Phúc",
    bienSo: "88C-654.32", soKhung: "AAAA...0001", soMay: "BBBB...0001",
    hangSanXuat: "Hyundai", namSanXuat: "2019", mauSac: "Trắng",
    tinhTrangBanDau: "Còn hoạt động tốt",
    giaTriUocTinh: 280000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu C - Hàng 2 - Ô 5",
    trangThai: "cho_xu_ly", ngayNhapKho: "16/01/2026", hanLuuKho: "16/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "16/01/2026", updatedAt: "16/01/2026",
  },
  {
    id: "tv19", maTangVat: "TV-2026-019", hoSoId: "hs6", maBienBan: "BB-2026-006",
    ten: "Rượu lậu đóng chai, nhãn giả", loai: "thuc_pham",
    soLuong: 240, donViTinh: "chai",
    dacDiemNhanDang: "Rượu 40 độ đóng chai thủy tinh 0.7L, nhãn giả Hennessy",
    tinhTrangBanDau: "Còn nguyên, chưa mở nắp",
    giaTriUocTinh: 12000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu C - Kệ 1 - Ô 8",
    trangThai: "da_tieu_huy", ngayNhapKho: "21/01/2026", hanLuuKho: "21/04/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Đã tiêu hủy",
    createdAt: "21/01/2026", updatedAt: "28/01/2026",
  },
  {
    id: "tv20", maTangVat: "TV-2026-020", hoSoId: "hs9", maBienBan: "BB-2026-009",
    ten: "Vật liệu nổ công nghiệp TNT", loai: "vu_khi_cong_cu",
    soLuong: 25, donViTinh: "kg",
    dacDiemNhanDang: "Thuốc nổ TNT dạng khối, đóng hộp gỗ",
    tinhTrangBanDau: "Còn nguyên vẹn, chưa sử dụng",
    giaTriUocTinh: 25000000, khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt",
    viTriKhoMoTa: "Khu An Toàn - Két 1",
    trangThai: "cho_xu_ly", ngayNhapKho: "06/02/2026", hanLuuKho: "06/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Chờ bàn giao Quân đội tiêu hủy",
    createdAt: "06/02/2026", updatedAt: "06/02/2026",
  },
  {
    id: "tv21", maTangVat: "TV-2026-021", hoSoId: "hs15", maBienBan: "BB-2026-015",
    ten: "Pháo hoa, pháo nổ các loại", loai: "vu_khi_cong_cu",
    soLuong: 180, donViTinh: "kg",
    dacDiemNhanDang: "Pháo hoa và pháo nổ các loại, một số đã mở hộp",
    tinhTrangBanDau: "Khoảng 70% còn nguyên vẹn",
    giaTriUocTinh: 38000000, khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt",
    viTriKhoMoTa: "Khu An Toàn - Két 2",
    trangThai: "dang_luu_kho", ngayNhapKho: "11/03/2026", hanLuuKho: "11/09/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Chờ quyết định xử lý",
    createdAt: "11/03/2026", updatedAt: "11/03/2026",
  },
  {
    id: "tv22", maTangVat: "TV-2026-022", hoSoId: "hs12", maBienBan: "BB-2026-012",
    ten: "Máy hút cát mini không giấy tờ", loai: "phuong_tien_khac",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Máy hút cát loại nhỏ, động cơ diesel 50HP",
    tinhTrangBanDau: "Còn vận hành được",
    giaTriUocTinh: 30000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu D - Bãi ngoài",
    trangThai: "da_tich_thu", ngayNhapKho: "20/02/2026", hanLuuKho: "20/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "20/02/2026", updatedAt: "01/03/2026",
  },
  // Them hang hoa kho 4, kho 5
  {
    id: "tv23", maTangVat: "TV-2026-023", hoSoId: "hs4", maBienBan: "BB-2026-004",
    ten: "Lợn vận chuyển không kiểm dịch", loai: "thuc_pham",
    soLuong: 12, donViTinh: "con",
    dacDiemNhanDang: "Lợn thịt trọng lượng 80-100kg/con",
    tinhTrangBanDau: "Còn sống, khỏe mạnh",
    giaTriUocTinh: 12000000, khoId: "kho4", khoTen: "Kho CA Huyện Bình Xuyên",
    viTriKhoMoTa: "Khu B - Chuồng tạm",
    trangThai: "da_tra_lai", ngayNhapKho: "16/01/2026", hanLuuKho: "16/02/2026",
    canBoQuanLyId: "u4", canBoQuanLyTen: "Lê Minh Tuấn",
    hinhAnh: [], ghiChu: "Đã trả lại sau khi xử phạt và cấp giấy kiểm dịch",
    createdAt: "16/01/2026", updatedAt: "25/01/2026",
  },
  {
    id: "tv24", maTangVat: "TV-2026-024", hoSoId: "hs6", maBienBan: "BB-2026-006",
    ten: "Bia hơi không tem nhãn", loai: "thuc_pham",
    soLuong: 15, donViTinh: "thùng",
    dacDiemNhanDang: "Bia hơi đóng trong can 30 lít, không nhãn mác",
    tinhTrangBanDau: "Còn nguyên",
    giaTriUocTinh: 6000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu D - Kệ 1",
    trangThai: "da_tieu_huy", ngayNhapKho: "21/01/2026", hanLuuKho: "21/02/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "21/01/2026", updatedAt: "28/01/2026",
  },
  {
    id: "tv25", maTangVat: "TV-2026-025", hoSoId: "hs2", maBienBan: "BB-2026-002",
    ten: "Giày dép nhập lậu", loai: "hang_hoa",
    soLuong: 300, donViTinh: "đôi",
    dacDiemNhanDang: "Giày thể thao các loại nhãn hiệu Nike, Adidas giả",
    tinhTrangBanDau: "Còn mới, chưa qua sử dụng",
    giaTriUocTinh: 25000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu A - Kệ 5 - Ô 1-8",
    trangThai: "dang_luu_kho", ngayNhapKho: "09/01/2026", hanLuuKho: "09/07/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "09/01/2026", updatedAt: "09/01/2026",
  },
  {
    id: "tv26", maTangVat: "TV-2026-026", hoSoId: "hs11", maBienBan: "BB-2026-011",
    ten: "Máy tính bảng, điện thoại tang vật đánh bạc", loai: "thiet_bi_dien_tu",
    soLuong: 8, donViTinh: "chiếc",
    dacDiemNhanDang: "Các thiết bị điện tử dùng chơi cờ bạc online",
    tinhTrangBanDau: "Còn sử dụng được",
    giaTriUocTinh: 12000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu B - Kệ 2 - Ô 9",
    trangThai: "cho_xu_ly", ngayNhapKho: "15/02/2026", hanLuuKho: "15/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "",
    createdAt: "15/02/2026", updatedAt: "15/02/2026",
  },
  {
    id: "tv27", maTangVat: "TV-2026-027", hoSoId: "hs4", maBienBan: "BB-2026-004",
    ten: "Giấy chứng nhận thú y giả mạo", loai: "khac",
    soLuong: 15, donViTinh: "tờ",
    dacDiemNhanDang: "Giấy chứng nhận kiểm dịch thú y giả mạo dấu, chữ ký",
    tinhTrangBanDau: "Còn nguyên",
    giaTriUocTinh: 500000, khoId: "kho4", khoTen: "Kho CA Huyện Bình Xuyên",
    viTriKhoMoTa: "Tủ hồ sơ - Ngăn 2",
    trangThai: "da_tra_lai", ngayNhapKho: "16/01/2026", hanLuuKho: "16/07/2026",
    canBoQuanLyId: "u4", canBoQuanLyTen: "Lê Minh Tuấn",
    hinhAnh: [], ghiChu: "Tài liệu chứng cứ, chuyển hồ sơ xử lý",
    createdAt: "16/01/2026", updatedAt: "16/01/2026",
  },
  {
    id: "tv28", maTangVat: "TV-2026-028", hoSoId: "hs8", maBienBan: "BB-2026-008",
    ten: "Điện thoại iPhone 15 Pro Max của lái xe", loai: "thiet_bi_dien_tu",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "iPhone 15 Pro Max 512GB màu titanium tự nhiên",
    tinhTrangBanDau: "Mới 95%",
    giaTriUocTinh: 38000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu B - Kệ 1 - Ô 12",
    trangThai: "dang_luu_kho", ngayNhapKho: "02/02/2026", hanLuuKho: "02/08/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Chứng cứ vụ vi phạm nồng độ cồn",
    createdAt: "02/02/2026", updatedAt: "02/02/2026",
  },
  {
    id: "tv29", maTangVat: "TV-2026-029", hoSoId: "hs12", maBienBan: "BB-2026-012",
    ten: "Súng phun cát công suất cao", loai: "phuong_tien_khac",
    soLuong: 2, donViTinh: "chiếc",
    dacDiemNhanDang: "Súng phun cát chuyên dụng đi kèm tàu hút cát",
    tinhTrangBanDau: "Còn sử dụng được",
    giaTriUocTinh: 15000000, khoId: "kho4", khoTen: "Kho CA Huyện Bình Xuyên",
    viTriKhoMoTa: "Khu C - Bãi ngoài",
    trangThai: "dang_luu_kho", ngayNhapKho: "20/02/2026", hanLuuKho: "20/08/2026",
    canBoQuanLyId: "u4", canBoQuanLyTen: "Lê Minh Tuấn",
    hinhAnh: [], ghiChu: "",
    createdAt: "20/02/2026", updatedAt: "20/02/2026",
  },
  {
    id: "tv30", maTangVat: "TV-2026-030", hoSoId: "hs15", maBienBan: "BB-2026-015",
    ten: "Kíp nổ các loại", loai: "vu_khi_cong_cu",
    soLuong: 50, donViTinh: "cái",
    dacDiemNhanDang: "Kíp nổ điện và phi điện các loại",
    tinhTrangBanDau: "Còn nguyên",
    giaTriUocTinh: 5000000, khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt",
    viTriKhoMoTa: "Khu An Toàn - Két 3",
    trangThai: "dang_luu_kho", ngayNhapKho: "11/03/2026", hanLuuKho: "11/09/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "Chờ quyết định",
    createdAt: "11/03/2026", updatedAt: "11/03/2026",
  },
  // Tang vat het han can canh bao
  {
    id: "tv31", maTangVat: "TV-2025-089", hoSoId: "hs1", maBienBan: "BB-2025-089",
    ten: "Xe máy Honda SH Mode", loai: "phuong_tien_co_gioi",
    soLuong: 1, donViTinh: "chiếc",
    dacDiemNhanDang: "Xe máy tay ga màu đỏ trắng, đời 2021",
    bienSo: "86B4-111.22", soKhung: "RLHK...2021", soMay: "SH20...2021",
    hangSanXuat: "Honda", namSanXuat: "2021", mauSac: "Đỏ trắng",
    tinhTrangBanDau: "Còn tốt",
    giaTriUocTinh: 38000000, khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    viTriKhoMoTa: "Khu A - Hàng 3 - Ô 2",
    trangThai: "cho_xu_ly", ngayNhapKho: "10/10/2025", hanLuuKho: "10/04/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "SẮP HẾT HẠN LƯU KHO",
    createdAt: "10/10/2025", updatedAt: "10/10/2025",
  },
  {
    id: "tv32", maTangVat: "TV-2025-077", hoSoId: "hs1", maBienBan: "BB-2025-077",
    ten: "Hàng điện tử không rõ nguồn gốc", loai: "thiet_bi_dien_tu",
    soLuong: 50, donViTinh: "chiếc",
    dacDiemNhanDang: "Đồng hồ thông minh giả nhãn hiệu Apple Watch",
    tinhTrangBanDau: "Còn mới 80%",
    giaTriUocTinh: 25000000, khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    viTriKhoMoTa: "Khu C - Kệ 3 - Ô 6",
    trangThai: "cho_xu_ly", ngayNhapKho: "01/10/2025", hanLuuKho: "01/04/2026",
    canBoQuanLyId: "u3", canBoQuanLyTen: "Phạm Văn Đức",
    hinhAnh: [], ghiChu: "QUÁ HẠN LƯU KHO",
    createdAt: "01/10/2025", updatedAt: "01/10/2025",
  },
];

export const MOCK_NIEM_PHONG: NiemPhong[] = [
  { id: "np1", maNiemPhong: "NP-2026-001", tangVatId: "tv2", tenTangVat: "Ô tô Toyota Camry 2.5Q", maBienBan: "BB-2026-008", ngayNiemPhong: "02/02/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", ngoiChungKienTen: "Lê Minh Tuấn", moTaTinhTrang: "Xe còn nguyên vẹn, tem dán 4 cửa xe và nắp capô", soTem: "NP-001-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "", createdAt: "02/02/2026" },
  { id: "np2", maNiemPhong: "NP-2026-002", tangVatId: "tv3", tenTangVat: "Xe mô tô Yamaha R15 V3", maBienBan: "BB-2026-014", ngayNiemPhong: "06/03/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", ngoiChungKienTen: "Lê Minh Tuấn", moTaTinhTrang: "Xe còn nguyên, niêm phong tay ga và hộc xe", soTem: "NP-002-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "", createdAt: "06/03/2026" },
  { id: "np3", maNiemPhong: "NP-2026-003", tangVatId: "tv12", tenTangVat: "Tiền mặt 42 triệu", maBienBan: "BB-2026-011", ngayNiemPhong: "15/02/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", ngoiChungKienTen: "Trần Thị Lan", moTaTinhTrang: "Tiền đựng trong phong bì niêm phong, có chữ ký chứng kiến", soTem: "NP-003-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "", createdAt: "15/02/2026" },
  { id: "np4", maNiemPhong: "NP-2026-004", tangVatId: "tv20", tenTangVat: "Vật liệu nổ TNT", maBienBan: "BB-2026-009", ngayNiemPhong: "06/02/2026", nguoiNiemPhongId: "u1", nguoiNiemPhongTen: "Nguyễn Văn Hùng", ngoiChungKienTen: "Trần Thị Lan", moTaTinhTrang: "Hộp gỗ niêm phong đặc biệt, khóa hàn", soTem: "NP-004-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "Niêm phong đặc biệt theo quy trình an toàn", createdAt: "06/02/2026" },
  { id: "np5", maNiemPhong: "NP-2026-005", tangVatId: "tv14", tenTangVat: "iPhone 14 Pro nhập lậu", maBienBan: "BB-2026-010", ngayNiemPhong: "11/02/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", ngoiChungKienTen: "Lê Minh Tuấn", moTaTinhTrang: "Hộp sản phẩm niêm phong, lập danh sách IMEI", soTem: "NP-005-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "", createdAt: "11/02/2026" },
  { id: "np6", maNiemPhong: "NP-2026-006", tangVatId: "tv1", tenTangVat: "Xe máy Honda Wave Alpha", maBienBan: "BB-2026-001", ngayNiemPhong: "06/01/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", moTaTinhTrang: "Xe niêm phong tay ga và cốp sau", soTem: "NP-006-2026", hinhAnhUrl: "", trangThai: "da_mo", ngayMo: "09/01/2026", nguoiMoTen: "Phạm Văn Đức", lyDoMo: "Trả lại chủ xe theo quyết định xử phạt", ghiChu: "", createdAt: "06/01/2026" },
  { id: "np7", maNiemPhong: "NP-2026-007", tangVatId: "tv9", tenTangVat: "Đồng hồ giả Rolex Omega", maBienBan: "BB-2026-003", ngayNiemPhong: "13/01/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", moTaTinhTrang: "Hộp đựng niêm phong, liệt kê từng chiếc", soTem: "NP-007-2026", hinhAnhUrl: "", trangThai: "da_mo", ngayMo: "20/01/2026", nguoiMoTen: "Phạm Văn Đức", lyDoMo: "Tiêu hủy theo quyết định", ghiChu: "", createdAt: "13/01/2026" },
  { id: "np8", maNiemPhong: "NP-2026-008", tangVatId: "tv4", tenTangVat: "Kawasaki Z650", maBienBan: "BB-2026-014", ngayNiemPhong: "06/03/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", ngoiChungKienTen: "Lê Minh Tuấn", moTaTinhTrang: "Xe còn nguyên, niêm phong khóa cổ và bình xăng", soTem: "NP-008-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "", createdAt: "06/03/2026" },
  { id: "np9", maNiemPhong: "NP-2026-009", tangVatId: "tv21", tenTangVat: "Pháo hoa, pháo nổ", maBienBan: "BB-2026-015", ngayNiemPhong: "11/03/2026", nguoiNiemPhongId: "u1", nguoiNiemPhongTen: "Nguyễn Văn Hùng", moTaTinhTrang: "Niêm phong toàn bộ thùng pháo, khóa hàn kho", soTem: "NP-009-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "Chú ý: hàng dễ cháy nổ", createdAt: "11/03/2026" },
  { id: "np10", maNiemPhong: "NP-2026-010", tangVatId: "tv26", tenTangVat: "Thiết bị đánh bạc", maBienBan: "BB-2026-011", ngayNiemPhong: "15/02/2026", nguoiNiemPhongId: "u3", nguoiNiemPhongTen: "Phạm Văn Đức", moTaTinhTrang: "Niêm phong thiết bị trong hộp gỗ có khóa", soTem: "NP-010-2026", hinhAnhUrl: "", trangThai: "dang_niem_phong", ghiChu: "", createdAt: "15/02/2026" },
];

export const MOCK_PHIEU_NHAP_KHO: PhieuNhapKho[] = [
  { id: "pnk1", maPhieu: "PNK-2026-001", hoSoId: "hs1", maBienBan: "BB-2026-001", khoId: "kho2", khoTen: "Bãi Phương Tiện PC06", ngayNhap: "06/01/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u4", canBoKiemTraTen: "Lê Minh Tuấn", trangThai: "hoan_thanh", chiTiet: [{ id: "pnkct1", phieuId: "pnk1", tangVatId: "tv1", tenTangVat: "Xe máy Honda Wave Alpha", soLuong: 1, donViTinh: "chiếc", tinhTrang: "Còn hoạt động", ghiChu: "" }], ghiChu: "", createdAt: "06/01/2026" },
  { id: "pnk2", maPhieu: "PNK-2026-002", hoSoId: "hs2", maBienBan: "BB-2026-002", khoId: "kho1", khoTen: "Kho Tang Vật PC06", ngayNhap: "09/01/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u2", canBoKiemTraTen: "Trần Thị Lan", trangThai: "hoan_thanh", chiTiet: [{ id: "pnkct2", phieuId: "pnk2", tangVatId: "tv6", tenTangVat: "Hàng vải nhập lậu", soLuong: 350, donViTinh: "kg", tinhTrang: "Còn nguyên", ghiChu: "" }, { id: "pnkct3", phieuId: "pnk2", tangVatId: "tv7", tenTangVat: "Quần áo giả nhãn hiệu", soLuong: 200, donViTinh: "bộ", tinhTrang: "Còn mới", ghiChu: "" }], ghiChu: "", createdAt: "09/01/2026" },
  { id: "pnk3", maPhieu: "PNK-2026-003", hoSoId: "hs3", maBienBan: "BB-2026-003", khoId: "kho1", khoTen: "Kho Tang Vật PC06", ngayNhap: "13/01/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u2", canBoKiemTraTen: "Trần Thị Lan", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "", createdAt: "13/01/2026" },
  { id: "pnk4", maPhieu: "PNK-2026-004", hoSoId: "hs8", maBienBan: "BB-2026-008", khoId: "kho2", khoTen: "Bãi Phương Tiện PC06", ngayNhap: "02/02/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u1", canBoKiemTraTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "Xe cầm đồ không hợp lệ", createdAt: "02/02/2026" },
  { id: "pnk5", maPhieu: "PNK-2026-005", hoSoId: "hs10", maBienBan: "BB-2026-010", khoId: "kho1", khoTen: "Kho Tang Vật PC06", ngayNhap: "11/02/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u2", canBoKiemTraTen: "Trần Thị Lan", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "", createdAt: "11/02/2026" },
  { id: "pnk6", maPhieu: "PNK-2026-006", hoSoId: "hs12", maBienBan: "BB-2026-012", khoId: "kho2", khoTen: "Bãi Phương Tiện PC06", ngayNhap: "20/02/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u1", canBoKiemTraTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "Phương tiện khai thác cát trái phép", createdAt: "20/02/2026" },
  { id: "pnk7", maPhieu: "PNK-2026-007", hoSoId: "hs13", maBienBan: "BB-2026-013", khoId: "kho1", khoTen: "Kho Tang Vật PC06", ngayNhap: "26/02/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u2", canBoKiemTraTen: "Trần Thị Lan", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "", createdAt: "26/02/2026" },
  { id: "pnk8", maPhieu: "PNK-2026-008", hoSoId: "hs14", maBienBan: "BB-2026-014", khoId: "kho2", khoTen: "Bãi Phương Tiện PC06", ngayNhap: "06/03/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u2", canBoKiemTraTen: "Trần Thị Lan", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "Xe đua trái phép", createdAt: "06/03/2026" },
  { id: "pnk9", maPhieu: "PNK-2026-009", hoSoId: "hs15", maBienBan: "BB-2026-015", khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt", ngayNhap: "11/03/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u1", canBoKiemTraTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "Vật liệu dễ cháy nổ - xử lý đặc biệt", createdAt: "11/03/2026" },
  { id: "pnk10", maPhieu: "PNK-2026-010", hoSoId: "hs9", maBienBan: "BB-2026-009", khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt", ngayNhap: "06/02/2026", nguoiGiaoId: "u4", nguoiGiaoTen: "Lê Minh Tuấn", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", thuKhoId: "u3", thuKhoTen: "Phạm Văn Đức", canBoKiemTraId: "u1", canBoKiemTraTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", chiTiet: [], ghiChu: "Vật liệu nổ - bảo quản đặc biệt", createdAt: "06/02/2026" },
];

export const MOCK_KIEM_KE: KiemKe[] = [
  {
    id: "kk1", maKiemKe: "KK-2026-001", khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    ngayKiemKe: "01/03/2026", nguoiKiemKeId: "u3", nguoiKiemKeTen: "Phạm Văn Đức",
    lanhdaoPheDuyetId: "u2", lanhdaoPheDuyetTen: "Trần Thị Lan",
    trangThai: "phe_duyet", tongTangVatKiemKe: 18, soKhop: 15, soThieu: 1, soHuHong: 2, soDu: 0,
    chiTiet: [], ketLuan: "Kho còn tồn 17 loại tang vật, 1 loại thiếu cần xác minh, 2 loại xuống cấp cần xử lý",
    ghiChu: "", createdAt: "01/03/2026",
  },
  {
    id: "kk2", maKiemKe: "KK-2026-002", khoId: "kho2", khoTen: "Bãi Phương Tiện PC06",
    ngayKiemKe: "05/03/2026", nguoiKiemKeId: "u3", nguoiKiemKeTen: "Phạm Văn Đức",
    lanhdaoPheDuyetId: "u2", lanhdaoPheDuyetTen: "Trần Thị Lan",
    trangThai: "hoan_thanh", tongTangVatKiemKe: 8, soKhop: 8, soThieu: 0, soHuHong: 0, soDu: 0,
    chiTiet: [], ketLuan: "Tất cả phương tiện còn nguyên vẹn, khớp sổ sách",
    ghiChu: "", createdAt: "05/03/2026",
  },
  {
    id: "kk3", maKiemKe: "KK-2026-003", khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt",
    ngayKiemKe: "10/03/2026", nguoiKiemKeId: "u1", nguoiKiemKeTen: "Nguyễn Văn Hùng",
    trangThai: "dang_kiem_ke", tongTangVatKiemKe: 5, soKhop: 4, soThieu: 0, soHuHong: 0, soDu: 0,
    chiTiet: [], ketLuan: "", ghiChu: "Đang kiểm kê, chưa hoàn thành", createdAt: "10/03/2026",
  },
  {
    id: "kk4", maKiemKe: "KK-2026-004", khoId: "kho4", khoTen: "Kho CA Huyện Bình Xuyên",
    ngayKiemKe: "15/03/2026", nguoiKiemKeId: "u4", nguoiKiemKeTen: "Lê Minh Tuấn",
    trangThai: "hoan_thanh", tongTangVatKiemKe: 4, soKhop: 4, soThieu: 0, soHuHong: 0, soDu: 0,
    chiTiet: [], ketLuan: "Khớp hoàn toàn với sổ sách",
    ghiChu: "", createdAt: "15/03/2026",
  },
  {
    id: "kk5", maKiemKe: "KK-2026-005", khoId: "kho1", khoTen: "Kho Tang Vật PC06",
    ngayKiemKe: "01/02/2026", nguoiKiemKeId: "u3", nguoiKiemKeTen: "Phạm Văn Đức",
    lanhdaoPheDuyetId: "u2", lanhdaoPheDuyetTen: "Trần Thị Lan",
    trangThai: "phe_duyet", tongTangVatKiemKe: 12, soKhop: 10, soThieu: 0, soHuHong: 2, soDu: 0,
    chiTiet: [], ketLuan: "02 loại hàng thực phẩm bị hư hỏng, đề nghị tiêu hủy sớm",
    ghiChu: "", createdAt: "01/02/2026",
  },
];

export const MOCK_LUAN_CHUYEN: LuanChuyen[] = [
  { id: "lc1", maLuanChuyen: "LC-2026-001", tangVatId: "tv5", tenTangVat: "Tàu hút cát công suất lớn", maBienBan: "BB-2026-012", loaiLuanChuyen: "luan_chuyen_kho", khoNguonId: "kho2", khoNguonTen: "Bãi Phương Tiện PC06", donViNhanId: "dv3", donViNhanTen: "CA TP Vĩnh Yên", khoNhanId: "kho5", khoNhanTen: "Kho CA TP Vĩnh Yên", nguoiDeNghiId: "u4", nguoiDeNghiTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", nguoiGiaoTen: "Phạm Văn Đức", nguoiNhanTen: "Nguyễn Thị Hoa", lyDo: "Chuyển về đơn vị nơi phương tiện hoạt động để thuận tiện xử lý", canCuPhapLy: "Điều 27 NĐ 31/2023/NĐ-CP", trangThai: "da_ban_giao", ngayDeNghi: "25/02/2026", ngayPheDuyet: "28/02/2026", ngayBanGiao: "02/03/2026", ghiChu: "", createdAt: "25/02/2026" },
  { id: "lc2", maLuanChuyen: "LC-2026-002", tangVatId: "tv20", tenTangVat: "Vật liệu nổ TNT 25kg", maBienBan: "BB-2026-009", loaiLuanChuyen: "ban_giao_co_quan_khac", khoNguonId: "kho3", khoNguonTen: "Kho Hàng Hóa Đặc Biệt", donViNhanId: "dv1", donViNhanTen: "Bộ CHQS tỉnh Vĩnh Phúc", coQuanNhanTen: "Bộ CHQS tỉnh Vĩnh Phúc", nguoiDeNghiId: "u1", nguoiDeNghiTen: "Nguyễn Văn Hùng", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", lyDo: "Bàn giao Quân đội tiêu hủy theo quy định an toàn", canCuPhapLy: "Điều 56 Luật Quản lý vũ khí 2017", trangThai: "da_phe_duyet", ngayDeNghi: "01/03/2026", ngayPheDuyet: "04/03/2026", ghiChu: "Chờ lịch bàn giao với Quân đội", createdAt: "01/03/2026" },
  { id: "lc3", maLuanChuyen: "LC-2026-003", tangVatId: "tv14", tenTangVat: "iPhone 14 Pro 35 chiếc", maBienBan: "BB-2026-010", loaiLuanChuyen: "luan_chuyen_kho", khoNguonId: "kho1", khoNguonTen: "Kho Tang Vật PC06", donViNhanId: "dv2", donViNhanTen: "CA Huyện Bình Xuyên", nguoiDeNghiId: "u4", nguoiDeNghiTen: "Lê Minh Tuấn", lyDo: "Chuyển về đơn vị thụ lý hồ sơ gốc để xử lý tiếp", canCuPhapLy: "Điều 28 NĐ 31/2023/NĐ-CP", trangThai: "cho_phe_duyet", ngayDeNghi: "12/03/2026", ghiChu: "", createdAt: "12/03/2026" },
  { id: "lc4", maLuanChuyen: "LC-2026-004", tangVatId: "tv2", tenTangVat: "Ô tô Toyota Camry", maBienBan: "BB-2026-008", loaiLuanChuyen: "luan_chuyen_kho", khoNguonId: "kho2", khoNguonTen: "Bãi Phương Tiện PC06", donViNhanId: "dv4", donViNhanTen: "CA Huyện Vĩnh Tường", nguoiDeNghiId: "u4", nguoiDeNghiTen: "Lê Minh Tuấn", lyDo: "Xe đăng ký tại Vĩnh Tường, chuyển về để xử lý", canCuPhapLy: "Điều 27 NĐ 31/2023/NĐ-CP", trangThai: "tu_choi", ngayDeNghi: "05/02/2026", lyDoTuChoi: "Xe đang trong giai đoạn điều tra, chưa đủ cơ sở pháp lý để chuyển", ghiChu: "", createdAt: "05/02/2026" },
  { id: "lc5", maLuanChuyen: "LC-2026-005", tangVatId: "tv21", tenTangVat: "Pháo hoa pháo nổ 180kg", maBienBan: "BB-2026-015", loaiLuanChuyen: "ban_giao_co_quan_khac", khoNguonId: "kho3", khoNguonTen: "Kho Hàng Hóa Đặc Biệt", donViNhanId: "dv1", donViNhanTen: "Công an PCCC tỉnh", coQuanNhanTen: "Công an PCCC tỉnh Vĩnh Phúc", nguoiDeNghiId: "u1", nguoiDeNghiTen: "Nguyễn Văn Hùng", lyDo: "Bàn giao đơn vị có chức năng tiêu hủy an toàn", canCuPhapLy: "NĐ 137/2020/NĐ-CP Điều 16", trangThai: "cho_phe_duyet", ngayDeNghi: "20/03/2026", ghiChu: "", createdAt: "20/03/2026" },
  { id: "lc6", maLuanChuyen: "LC-2026-006", tangVatId: "tv12", tenTangVat: "Tiền mặt 42 triệu", maBienBan: "BB-2026-011", loaiLuanChuyen: "luan_chuyen_kho", khoNguonId: "kho3", khoNguonTen: "Kho Hàng Hóa Đặc Biệt", donViNhanId: "dv1", donViNhanTen: "Kho bạc Nhà nước tỉnh Vĩnh Phúc", nguoiDeNghiId: "u2", nguoiDeNghiTen: "Trần Thị Lan", nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng", lyDo: "Nộp sung công quỹ Nhà nước theo quyết định", canCuPhapLy: "Điều 30 NĐ 31/2023/NĐ-CP", trangThai: "da_phe_duyet", ngayDeNghi: "10/03/2026", ngayPheDuyet: "14/03/2026", ghiChu: "", createdAt: "10/03/2026" },
  { id: "lc7", maLuanChuyen: "LC-2026-007", tangVatId: "tv22", tenTangVat: "Máy hút cát mini", maBienBan: "BB-2026-012", loaiLuanChuyen: "luan_chuyen_kho", khoNguonId: "kho2", khoNguonTen: "Bãi Phương Tiện PC06", donViNhanId: "dv3", donViNhanTen: "CA TP Vĩnh Yên", khoNhanId: "kho5", khoNhanTen: "Kho CA TP Vĩnh Yên", nguoiDeNghiId: "u4", nguoiDeNghiTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", nguoiGiaoTen: "Phạm Văn Đức", nguoiNhanTen: "Nguyễn Thị Hoa", lyDo: "Chuyển cùng tàu hút cát đến đơn vị mới", canCuPhapLy: "Điều 27 NĐ 31/2023/NĐ-CP", trangThai: "da_ban_giao", ngayDeNghi: "25/02/2026", ngayPheDuyet: "28/02/2026", ngayBanGiao: "02/03/2026", ghiChu: "", createdAt: "25/02/2026" },
  { id: "lc8", maLuanChuyen: "LC-2026-008", tangVatId: "tv16", tenTangVat: "Thiết bị điện kém CL 500 cái", maBienBan: "BB-2026-013", loaiLuanChuyen: "luan_chuyen_kho", khoNguonId: "kho1", khoNguonTen: "Kho Tang Vật PC06", donViNhanId: "dv1", donViNhanTen: "Trung tâm Tiêu chuẩn Đo lường Chất lượng", nguoiDeNghiId: "u4", nguoiDeNghiTen: "Lê Minh Tuấn", lyDo: "Gửi giám định chất lượng", canCuPhapLy: "Luật Chất lượng SP HH 2007 Điều 24", trangThai: "cho_phe_duyet", ngayDeNghi: "15/03/2026", ghiChu: "", createdAt: "15/03/2026" },
  { id: "lc9", maLuanChuyen: "LC-2026-009", tangVatId: "tv6", tenTangVat: "Hàng vải nhập lậu 350kg", maBienBan: "BB-2026-002", loaiLuanChuyen: "luan_chuyen_kho", khoNguonId: "kho1", khoNguonTen: "Kho Tang Vật PC06", donViNhanId: "dv2", donViNhanTen: "CA Huyện Bình Xuyên", nguoiDeNghiId: "u4", nguoiDeNghiTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", nguoiGiaoTen: "Phạm Văn Đức", nguoiNhanTen: "Lê Minh Tuấn", lyDo: "Chuyển về đơn vị tiếp nhận xử lý theo thẩm quyền", canCuPhapLy: "Điều 28 NĐ 31/2023/NĐ-CP", trangThai: "dang_van_chuyen", ngayDeNghi: "10/03/2026", ngayPheDuyet: "12/03/2026", ghiChu: "", createdAt: "10/03/2026" },
  { id: "lc10", maLuanChuyen: "LC-2026-010", tangVatId: "tv13", tenTangVat: "Kiếm dao các loại", maBienBan: "BB-2026-005", loaiLuanChuyen: "chuyen_co_quan_to_tung", khoNguonId: "kho3", khoNguonTen: "Kho Hàng Hóa Đặc Biệt", coQuanNhanTen: "Viện Kiểm sát nhân dân tỉnh Vĩnh Phúc", soVanBanYeuCau: "VB-VKSND-2026-015", nguoiDeNghiId: "u1", nguoiDeNghiTen: "Nguyễn Văn Hùng", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", lyDo: "Chuyển Viện KSND làm vật chứng vụ án hình sự", canCuPhapLy: "Điều 106 BLTTHS 2015", trangThai: "da_ban_giao", ngayDeNghi: "25/01/2026", ngayPheDuyet: "28/01/2026", ngayBanGiao: "30/01/2026", ghiChu: "", createdAt: "25/01/2026" },
];

export const MOCK_XU_LY: XuLyTangVat[] = [
  { id: "xl1", maXuLy: "XL-2026-001", tangVatId: "tv1", tenTangVat: "Xe máy Honda Wave Alpha", maBienBan: "BB-2026-001", hinhThuc: "tra_lai", canCuPhapLy: "Điều 126 Luật Xử lý VPHC", quyetDinhSo: "QĐ-2026-001", ngayQuyetDinh: "09/01/2026", doiTuongTraLai: "Nguyễn Văn Tám", cccdNguoiNhan: "027045001234", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", trangThai: "hoan_thanh", ngayDeXuat: "08/01/2026", ngayPheDuyet: "09/01/2026", ngayHoanThanh: "10/01/2026", moTa: "Trả lại xe sau khi xử phạt vi phạm hành chính", ghiChu: "", createdAt: "08/01/2026" },
  { id: "xl2", maXuLy: "XL-2026-002", tangVatId: "tv8", tenTangVat: "Túi xách giả Coach 45 chiếc", maBienBan: "BB-2026-003", hinhThuc: "tieu_huy", canCuPhapLy: "Điều 28 NĐ 185/2013/NĐ-CP", quyetDinhSo: "QĐ-2026-003", ngayQuyetDinh: "18/01/2026", donViThucHienId: "dv1", donViThucHienTen: "PC06", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", ngayDeXuat: "17/01/2026", ngayPheDuyet: "18/01/2026", ngayHoanThanh: "20/01/2026", moTa: "Tiêu hủy hàng giả nhãn hiệu theo quy định", ghiChu: "", createdAt: "17/01/2026" },
  { id: "xl3", maXuLy: "XL-2026-003", tangVatId: "tv9", tenTangVat: "Đồng hồ giả Rolex Omega 28 chiếc", maBienBan: "BB-2026-003", hinhThuc: "tieu_huy", canCuPhapLy: "Điều 28 NĐ 185/2013/NĐ-CP", quyetDinhSo: "QĐ-2026-003", ngayQuyetDinh: "18/01/2026", donViThucHienId: "dv1", donViThucHienTen: "PC06", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", ngayDeXuat: "17/01/2026", ngayPheDuyet: "18/01/2026", ngayHoanThanh: "20/01/2026", moTa: "Tiêu hủy đồng hồ giả nhãn hiệu", ghiChu: "", createdAt: "17/01/2026" },
  { id: "xl4", maXuLy: "XL-2026-004", tangVatId: "tv10", tenTangVat: "Thực phẩm chức năng hết hạn", maBienBan: "BB-2026-007", hinhThuc: "tieu_huy", canCuPhapLy: "Điều 23 Luật ATTP 2010", donViThucHienId: "dv5", donViThucHienTen: "CA Huyện Yên Lạc", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", trangThai: "hoan_thanh", ngayDeXuat: "30/01/2026", ngayPheDuyet: "31/01/2026", ngayHoanThanh: "01/02/2026", moTa: "Tiêu hủy thực phẩm hết hạn sử dụng, không đảm bảo an toàn", ghiChu: "", createdAt: "30/01/2026" },
  { id: "xl5", maXuLy: "XL-2026-005", tangVatId: "tv5", tenTangVat: "Tàu hút cát công suất lớn", maBienBan: "BB-2026-012", hinhThuc: "tich_thu", canCuPhapLy: "Điều 26 Luật Khoáng sản 2010", quyetDinhSo: "QĐ-2026-012", ngayQuyetDinh: "28/02/2026", donViThucHienId: "dv1", donViThucHienTen: "PC06", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", ngayDeXuat: "26/02/2026", ngayPheDuyet: "28/02/2026", ngayHoanThanh: "01/03/2026", moTa: "Tịch thu tàu khai thác khoáng sản trái phép", ghiChu: "", createdAt: "26/02/2026" },
  { id: "xl6", maXuLy: "XL-2026-006", tangVatId: "tv23", tenTangVat: "Lợn vận chuyển không kiểm dịch", maBienBan: "BB-2026-004", hinhThuc: "tra_lai", canCuPhapLy: "Điều 31 Pháp lệnh Thú y 2004", donViThucHienId: "dv2", donViThucHienTen: "CA Huyện Bình Xuyên", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan", trangThai: "hoan_thanh", ngayDeXuat: "22/01/2026", ngayPheDuyet: "23/01/2026", ngayHoanThanh: "25/01/2026", moTa: "Trả lại sau xử phạt và cấp giấy kiểm dịch bổ sung", ghiChu: "", createdAt: "22/01/2026" },
  { id: "xl7", maXuLy: "XL-2026-007", tangVatId: "tv12", tenTangVat: "Tiền mặt 42 triệu", maBienBan: "BB-2026-011", hinhThuc: "tich_thu", canCuPhapLy: "Điều 28 NĐ 144/2021/NĐ-CP", quyetDinhSo: "QĐ-2026-011", ngayQuyetDinh: "01/03/2026", soTienBan: 42000000, nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng", trangThai: "da_phe_duyet", ngayDeXuat: "28/02/2026", ngayPheDuyet: "01/03/2026", moTa: "Tịch thu sung công tiền đánh bạc", ghiChu: "Đang làm thủ tục nộp Kho bạc", createdAt: "28/02/2026" },
  { id: "xl8", maXuLy: "XL-2026-008", tangVatId: "tv18", tenTangVat: "Xe tải chở gia súc không phép", maBienBan: "BB-2026-004", hinhThuc: "tra_lai", canCuPhapLy: "Điều 130 Luật Xử lý VPHC", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", trangThai: "cho_phe_duyet", ngayDeXuat: "25/02/2026", moTa: "Đề xuất trả lại xe sau khi xử phạt xong", ghiChu: "", createdAt: "25/02/2026" },
  { id: "xl9", maXuLy: "XL-2026-009", tangVatId: "tv16", tenTangVat: "Thiết bị điện kém chất lượng", maBienBan: "BB-2026-013", hinhThuc: "tieu_huy", canCuPhapLy: "Điều 29 Luật Chất lượng SP HH 2007", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", trangThai: "cho_phe_duyet", ngayDeXuat: "20/03/2026", moTa: "Tiêu hủy thiết bị điện không đạt chuẩn, nguy cơ gây cháy nổ", ghiChu: "", createdAt: "20/03/2026" },
  { id: "xl10", maXuLy: "XL-2026-010", tangVatId: "tv22", tenTangVat: "Máy hút cát mini", maBienBan: "BB-2026-012", hinhThuc: "tich_thu", canCuPhapLy: "Điều 26 Luật Khoáng sản 2010", quyetDinhSo: "QĐ-2026-012", ngayQuyetDinh: "28/02/2026", nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn", nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng", trangThai: "hoan_thanh", ngayDeXuat: "26/02/2026", ngayPheDuyet: "28/02/2026", ngayHoanThanh: "01/03/2026", moTa: "Tịch thu phương tiện khai thác trái phép", ghiChu: "", createdAt: "26/02/2026" },
];

export const MOCK_GIAO_TU_GIU: GiaoTuGiu[] = [
  {
    id: "gtg1", maGiaoTuGiu: "GTG-2026-001",
    tangVatId: "tv1", tenTangVat: "Xe máy Honda Wave Alpha", maBienBan: "BB-2026-001",
    hoSoId: "hs1",
    doiTuongId: "dt1", doiTuongTen: "Nguyễn Văn Tám", doiTuongCccd: "027045001234",
    doiTuongDiaChi: "Số 12 Đường Lê Lợi, TP Vĩnh Yên", doiTuongSdt: "0912345678",
    lyDoGiao: "Đối tượng có nơi cư trú ổn định, tài sản không có dấu hiệu tẩu tán",
    canCuPhapLy: "Điều 14 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    dieuKienGiu: "Không được sử dụng xe, không rời khỏi địa phương, nộp phạt trong 15 ngày",
    bienBanGiaoId: "vb1",
    nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn",
    nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan",
    ngayDeXuat: "07/01/2026", ngayPheDuyet: "08/01/2026", ngayGiao: "09/01/2026",
    hanTuGiu: "09/04/2026",
    trangThai: "da_thu_hoi" as TrangThaiGiaoTuGiu,
    ngayKiemTra: "09/03/2026",
    ketQuaKiemTra: "Tang vật còn nguyên vẹn, đối tượng chấp hành tốt",
    ngayHoanTra: "10/01/2026",
    ghiChu: "Trả lại sau khi có quyết định xử phạt chính thức",
    createdAt: "07/01/2026",
  },
  {
    id: "gtg2", maGiaoTuGiu: "GTG-2026-002",
    tangVatId: "tv23", tenTangVat: "Lợn vận chuyển không kiểm dịch", maBienBan: "BB-2026-004",
    hoSoId: "hs4",
    doiTuongId: "dt2", doiTuongTen: "Phạm Văn Long", doiTuongCccd: "027055007890",
    doiTuongDiaChi: "Thôn Đông, Xã Tam Hợp, Huyện Bình Xuyên", doiTuongSdt: "0987654321",
    lyDoGiao: "Lợn là gia súc sống, không thể lưu kho lâu dài, đối tượng có điều kiện chăm sóc",
    canCuPhapLy: "Điều 14 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    dieuKienGiu: "Không được bán, giết mổ hoặc di chuyển đàn lợn. Phải cách ly theo yêu cầu thú y",
    nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn",
    nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan",
    ngayDeXuat: "22/01/2026", ngayPheDuyet: "23/01/2026", ngayGiao: "24/01/2026",
    hanTuGiu: "24/04/2026",
    trangThai: "dang_tu_giu" as TrangThaiGiaoTuGiu,
    ngayKiemTra: "24/03/2026",
    ketQuaKiemTra: "Đàn lợn 12 con còn đủ, sức khỏe bình thường",
    ghiChu: "Yêu cầu kiểm tra định kỳ mỗi 30 ngày",
    createdAt: "22/01/2026",
  },
  {
    id: "gtg3", maGiaoTuGiu: "GTG-2026-003",
    tangVatId: "tv18", tenTangVat: "Xe tải chở gia súc không phép", maBienBan: "BB-2026-004",
    hoSoId: "hs4",
    doiTuongId: "dt3", doiTuongTen: "Trần Văn Minh", doiTuongCccd: "027066008901",
    doiTuongDiaChi: "Số 45 Đường Nguyễn Trãi, Huyện Bình Xuyên", doiTuongSdt: "0978123456",
    lyDoGiao: "Đối tượng cần phương tiện mưu sinh, cam kết không tái vi phạm",
    canCuPhapLy: "Điều 14 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    dieuKienGiu: "Chỉ sử dụng xe trong địa bàn tỉnh, phải có giấy phép vận tải hợp lệ",
    nguoiDeXuatId: "u4", nguoiDeXuatTen: "Lê Minh Tuấn",
    ngayDeXuat: "25/02/2026",
    hanTuGiu: "25/05/2026",
    trangThai: "cho_xet_duyet" as TrangThaiGiaoTuGiu,
    ghiChu: "Đang chờ lãnh đạo xét duyệt",
    createdAt: "25/02/2026",
  },
];

export const MOCK_TIEN_BAO_LANH: TienBaoLanh[] = [
  {
    id: "tbl1", maBaoLanh: "TBL-2026-001",
    tangVatId: "tv2", tenTangVat: "Ô tô Toyota Camry 2.5Q", maBienBan: "BB-2026-008",
    hoSoId: "hs8",
    doiTuongTen: "Nguyễn Văn Bình", doiTuongCccd: "027077009012",
    soTienBaoLanh: 85000000,
    lyDoBaoLanh: "Đối tượng nộp tiền bảo lãnh để nhận lại xe ô tô đang bị tạm giữ",
    canCuPhapLy: "Điều 15 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    ngayNop: "05/02/2026",
    ngayChuyenTaiVu: "07/02/2026",
    hanXuLy: "21/02/2026",
    trangThai: "cho_xu_ly" as TrangThaiBaoLanh,
    nguoiTiepNhanId: "u4", nguoiTiepNhanTen: "Lê Minh Tuấn",
    nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng",
    ghiChu: "Cần xử lý trước hạn 10 ngày LV",
    createdAt: "05/02/2026",
  },
  {
    id: "tbl2", maBaoLanh: "TBL-2026-002",
    tangVatId: "tv3", tenTangVat: "Xe mô tô Yamaha R15 V3", maBienBan: "BB-2026-014",
    hoSoId: "hs14",
    doiTuongTen: "Lê Văn Hải", doiTuongCccd: "027088001234",
    soTienBaoLanh: 25000000,
    lyDoBaoLanh: "Nộp tiền bảo lãnh để nhận xe mô tô tạm giữ do đua xe trái phép",
    canCuPhapLy: "Điều 15 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    ngayNop: "10/03/2026",
    ngayChuyenTaiVu: "12/03/2026",
    hanXuLy: "26/03/2026",
    trangThai: "da_khau_tru" as TrangThaiBaoLanh,
    ketQuaXuLy: "tich_thu",
    soQuyetDinhXuLy: "QĐ-2026-014",
    ngayXuLy: "24/03/2026",
    soTienNopNganSach: 25000000,
    nguoiTiepNhanId: "u4", nguoiTiepNhanTen: "Lê Minh Tuấn",
    nguoiPheDuyetId: "u1", nguoiPheDuyetTen: "Nguyễn Văn Hùng",
    ghiChu: "Tịch thu toàn bộ tiền bảo lãnh do đối tượng tái vi phạm",
    createdAt: "10/03/2026",
  },
  {
    id: "tbl3", maBaoLanh: "TBL-2026-003",
    tangVatId: "tv4", tenTangVat: "Kawasaki Z650", maBienBan: "BB-2026-014",
    hoSoId: "hs14",
    doiTuongTen: "Nguyễn Quang Minh", doiTuongCccd: "027099002345",
    soTienBaoLanh: 45000000,
    lyDoBaoLanh: "Nộp tiền bảo lãnh để nhận xe phân khối lớn bị tạm giữ",
    canCuPhapLy: "Điều 15 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    ngayNop: "10/03/2026",
    trangThai: "cho_chuyen_tai_vu" as TrangThaiBaoLanh,
    nguoiTiepNhanId: "u4", nguoiTiepNhanTen: "Lê Minh Tuấn",
    ghiChu: "Chờ chuyển tài vụ trong 2 ngày làm việc",
    createdAt: "10/03/2026",
  },
  {
    id: "tbl4", maBaoLanh: "TBL-2026-004",
    tangVatId: "tv6", tenTangVat: "Hàng vải nhập lậu 350kg", maBienBan: "BB-2026-002",
    hoSoId: "hs2",
    doiTuongTen: "Trần Thị Hoa", doiTuongCccd: "027011003456",
    soTienBaoLanh: 15000000,
    lyDoBaoLanh: "Nộp tiền bảo lãnh để nhận hàng hóa tạm giữ do nhập lậu",
    canCuPhapLy: "Điều 15 NĐ 138/2021/NĐ-CP (sửa đổi NĐ 47/2026)",
    ngayNop: "15/01/2026",
    ngayChuyenTaiVu: "17/01/2026",
    hanXuLy: "31/01/2026",
    trangThai: "da_hoan_tra" as TrangThaiBaoLanh,
    ketQuaXuLy: "hoan_tra",
    ngayXuLy: "29/01/2026",
    soTienHoanTra: 15000000,
    nguoiTiepNhanId: "u4", nguoiTiepNhanTen: "Lê Minh Tuấn",
    nguoiPheDuyetId: "u2", nguoiPheDuyetTen: "Trần Thị Lan",
    ghiChu: "Hoàn trả toàn bộ do đối tượng nộp phạt đầy đủ",
    createdAt: "15/01/2026",
  },
];

export const MOCK_CANH_BAO: CanhBao[] = [
  { id: "cb1", loai: "critical", tieuDe: "Tang vật quá hạn lưu kho", moTa: "Đồng hồ thông minh giả Apple Watch (TV-2025-077) đã quá hạn lưu kho 6 ngày, cần xử lý gấp", tangVatId: "tv32", tenTangVat: "Hàng điện tử không rõ nguồn gốc", maBienBan: "BB-2025-077", khoId: "kho1", khoTen: "Kho Tang Vật PC06", canBoId: "u3", canBoTen: "Phạm Văn Đức", ngayHetHan: "01/04/2026", soNgayConLai: -6, daXuLy: false, ngayTao: "07/04/2026" },
  { id: "cb2", loai: "critical", tieuDe: "Tang vật quá hạn lưu kho", moTa: "Xe máy Honda SH Mode (TV-2025-089) đã quá hạn lưu kho, hết hạn 10/04/2026", tangVatId: "tv31", tenTangVat: "Xe máy Honda SH Mode", maBienBan: "BB-2025-089", khoId: "kho2", khoTen: "Bãi Phương Tiện PC06", canBoId: "u3", canBoTen: "Phạm Văn Đức", ngayHetHan: "10/04/2026", soNgayConLai: 3, daXuLy: false, ngayTao: "07/04/2026" },
  { id: "cb3", loai: "warning", tieuDe: "Sắp hết hạn lưu kho 30 ngày", moTa: "Kiếm dao tang vật (TV-2026-013) sẽ hết hạn trong 103 ngày - 19/07/2026", tangVatId: "tv13", tenTangVat: "Kiếm tự chế, dao nhọn", maBienBan: "BB-2026-005", khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt", canBoId: "u3", canBoTen: "Phạm Văn Đức", ngayHetHan: "19/07/2026", soNgayConLai: 103, daXuLy: false, ngayTao: "06/04/2026" },
  { id: "cb4", loai: "warning", tieuDe: "Sắp hết hạn lưu kho", moTa: "Hàng vải nhập lậu (TV-2026-006) tồn kho đã 3 tháng, hết hạn 09/07/2026", tangVatId: "tv6", tenTangVat: "Hàng vải nhập lậu", maBienBan: "BB-2026-002", khoId: "kho1", khoTen: "Kho Tang Vật PC06", canBoId: "u3", canBoTen: "Phạm Văn Đức", ngayHetHan: "09/07/2026", soNgayConLai: 93, daXuLy: false, ngayTao: "06/04/2026" },
  { id: "cb5", loai: "warning", tieuDe: "Kiểm kê kho định kỳ chưa hoàn thành", moTa: "Kho Hàng Hóa Đặc Biệt (kho3) đang trong quá trình kiểm kê, chưa có kết quả cuối", khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt", canBoId: "u1", canBoTen: "Nguyễn Văn Hùng", daXuLy: false, ngayTao: "10/03/2026" },
  { id: "cb6", loai: "info", tieuDe: "Luân chuyển tang vật chờ phê duyệt", moTa: "Có 03 đề nghị luân chuyển tang vật đang chờ phê duyệt lãnh đạo", canBoId: "u2", canBoTen: "Trần Thị Lan", daXuLy: false, ngayTao: "07/04/2026" },
  { id: "cb7", loai: "info", tieuDe: "Đề xuất xử lý chờ phê duyệt", moTa: "Có 02 đề xuất xử lý tang vật đang chờ phê duyệt của lãnh đạo", canBoId: "u2", canBoTen: "Trần Thị Lan", daXuLy: false, ngayTao: "07/04/2026" },
  { id: "cb8", loai: "critical", tieuDe: "Vật liệu nguy hiểm chưa bàn giao", moTa: "Vật liệu nổ TNT 25kg (TV-2026-020) đã được phê duyệt luân chuyển nhưng chưa bàn giao Quân đội", tangVatId: "tv20", tenTangVat: "Vật liệu nổ TNT", maBienBan: "BB-2026-009", khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt", canBoId: "u1", canBoTen: "Nguyễn Văn Hùng", daXuLy: false, ngayTao: "05/03/2026" },
  { id: "cb9", loai: "warning", tieuDe: "Kho bãi gần đầy công suất", moTa: "Kho Tang Vật PC06 đang sử dụng 87/200 công suất, bãi phương tiện 43/100", khoId: "kho1", khoTen: "Kho Tang Vật PC06", canBoId: "u3", canBoTen: "Phạm Văn Đức", daXuLy: false, ngayTao: "01/04/2026" },
  { id: "cb10", loai: "info", tieuDe: "Hồ sơ chờ duyệt mới nhập", moTa: "03 hồ sơ vụ việc mới đang chờ phê duyệt: BB-2026-004, BB-2026-009, BB-2026-014", canBoId: "u2", canBoTen: "Trần Thị Lan", daXuLy: false, ngayTao: "05/03/2026" },
  { id: "cb11", loai: "critical", tieuDe: "Pháo nổ nguy hiểm chưa xử lý", moTa: "Pháo hoa, pháo nổ 180kg (TV-2026-021) lưu tại kho nguy hiểm, cần xử lý nhanh", tangVatId: "tv21", tenTangVat: "Pháo hoa, pháo nổ", maBienBan: "BB-2026-015", khoId: "kho3", khoTen: "Kho Hàng Hóa Đặc Biệt", canBoId: "u1", canBoTen: "Nguyễn Văn Hùng", daXuLy: false, ngayTao: "11/03/2026" },
  { id: "cb12", loai: "warning", tieuDe: "Ô tô chờ xử lý quá 2 tháng", moTa: "Toyota Camry (TV-2026-002) nhập kho ngày 02/02/2026, chưa có hướng xử lý sau 2 tháng", tangVatId: "tv2", tenTangVat: "Ô tô Toyota Camry", maBienBan: "BB-2026-008", khoId: "kho2", khoTen: "Bãi Phương Tiện PC06", canBoId: "u3", canBoTen: "Phạm Văn Đức", daXuLy: false, ngayTao: "05/04/2026" },
  { id: "cb13", loai: "info", tieuDe: "Đến hạn kiểm kê định kỳ tháng 4", moTa: "Tháng 4/2026: Cần tiến hành kiểm kê định kỳ Kho Tang Vật PC06 và Bãi Phương Tiện", khoId: "kho1", khoTen: "Kho Tang Vật PC06", canBoId: "u3", canBoTen: "Phạm Văn Đức", daXuLy: false, ngayTao: "01/04/2026" },
  { id: "cb14", loai: "critical", tieuDe: "Tang vật hư hỏng cần xử lý gấp", moTa: "Theo kết quả kiểm kê KK-2026-001, 02 loại tang vật tại Kho PC06 đã hư hỏng nặng", khoId: "kho1", khoTen: "Kho Tang Vật PC06", canBoId: "u3", canBoTen: "Phạm Văn Đức", daXuLy: false, ngayTao: "05/03/2026" },
  { id: "cb15", loai: "warning", tieuDe: "Thiết bị điện chờ giám định lâu ngày", moTa: "Thiết bị điện 500 cái (TV-2026-016) đã gửi giám định nhưng chưa có kết quả sau 5 tuần", tangVatId: "tv16", tenTangVat: "Thiết bị điện kém chất lượng", maBienBan: "BB-2026-013", canBoId: "u4", canBoTen: "Lê Minh Tuấn", daXuLy: false, ngayTao: "03/04/2026" },
  { id: "cb16", loai: "info", tieuDe: "Hồ sơ đã duyệt nhưng chưa hoàn tất thủ tục", moTa: "Hồ sơ BB-2026-003, BB-2026-007, BB-2026-011 đã duyệt nhưng chưa hoàn thiện thủ tục cuối", daXuLy: true, ngayTao: "20/01/2026", ngayXuLy: "25/03/2026", nguoiXuLyId: "u2", nguoiXuLyTen: "Trần Thị Lan" },
];

export const MOCK_VAN_BAN: VanBan[] = [
  { id: "vb1", maVanBan: "VB-2026-001", tieuDe: "Quyết định xử lý tang vật BB-2026-001", loaiVanBan: "quyet_dinh_xu_ly", hoSoId: "hs1", maBienBan: "BB-2026-001", tangVatId: "tv1", noiDung: "Quyết định trả lại xe máy cho ông Nguyễn Văn Tám sau khi xử phạt VPHC", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", nguoiKyId: "u2", nguoiKyTen: "Trần Thị Lan", trangThai: "da_ky", ngayTao: "08/01/2026", ngayKy: "09/01/2026" },
  { id: "vb2", maVanBan: "VB-2026-002", tieuDe: "Biên bản niêm phong ô tô Toyota BB-2026-008", loaiVanBan: "bien_ban_niem_phong", hoSoId: "hs8", maBienBan: "BB-2026-008", tangVatId: "tv2", noiDung: "Biên bản niêm phong ô tô Toyota Camry biển 88A-123.45 tại bãi xe PC06", nguoiTaoId: "u3", nguoiTaoTen: "Phạm Văn Đức", nguoiKyId: "u2", nguoiKyTen: "Trần Thị Lan", trangThai: "da_ky", ngayTao: "02/02/2026", ngayKy: "02/02/2026" },
  { id: "vb3", maVanBan: "VB-2026-003", tieuDe: "Quyết định tiêu hủy hàng giả BB-2026-003", loaiVanBan: "quyet_dinh_xu_ly", hoSoId: "hs3", maBienBan: "BB-2026-003", noiDung: "Quyết định tiêu hủy 45 túi xách và 28 đồng hồ giả mạo nhãn hiệu", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", nguoiKyId: "u1", nguoiKyTen: "Nguyễn Văn Hùng", trangThai: "da_ky", ngayTao: "17/01/2026", ngayKy: "18/01/2026" },
  { id: "vb4", maVanBan: "VB-2026-004", tieuDe: "Biên bản bàn giao tàu hút cát LC-2026-001", loaiVanBan: "bien_ban_ban_giao", hoSoId: "hs12", maBienBan: "BB-2026-012", tangVatId: "tv5", noiDung: "Biên bản bàn giao tàu hút cát từ PC06 sang CA TP Vĩnh Yên", nguoiTaoId: "u3", nguoiTaoTen: "Phạm Văn Đức", nguoiKyId: "u2", nguoiKyTen: "Trần Thị Lan", trangThai: "da_ky", ngayTao: "02/03/2026", ngayKy: "02/03/2026" },
  { id: "vb5", maVanBan: "VB-2026-005", tieuDe: "Quyết định tịch thu tàu hút cát BB-2026-012", loaiVanBan: "quyet_dinh_xu_ly", hoSoId: "hs12", maBienBan: "BB-2026-012", noiDung: "Quyết định tịch thu tàu hút cát và máy hút cát khai thác trái phép", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", nguoiKyId: "u1", nguoiKyTen: "Nguyễn Văn Hùng", trangThai: "da_ky", ngayTao: "26/02/2026", ngayKy: "28/02/2026" },
  { id: "vb6", maVanBan: "VB-2026-006", tieuDe: "Biên bản tiêu hủy thực phẩm BB-2026-007", loaiVanBan: "bien_ban_tieu_huy", hoSoId: "hs7", maBienBan: "BB-2026-007", noiDung: "Biên bản tiêu hủy 120 hộp thực phẩm chức năng và 85 lít rượu hết hạn", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", nguoiKyId: "u2", nguoiKyTen: "Trần Thị Lan", trangThai: "da_ky", ngayTao: "31/01/2026", ngayKy: "01/02/2026" },
  { id: "vb7", maVanBan: "VB-2026-007", tieuDe: "Báo cáo tổng hợp tang vật Quý 1/2026", loaiVanBan: "bao_cao", noiDung: "Báo cáo tổng hợp tình hình nhập xuất kho tang vật quý 1/2026", nguoiTaoId: "u3", nguoiTaoTen: "Phạm Văn Đức", nguoiKyId: "u1", nguoiKyTen: "Nguyễn Văn Hùng", trangThai: "cho_ky", ngayTao: "05/04/2026" },
  { id: "vb8", maVanBan: "VB-2026-008", tieuDe: "Công văn đề nghị giám định tang vật BB-2026-013", loaiVanBan: "cong_van", hoSoId: "hs13", maBienBan: "BB-2026-013", noiDung: "Đề nghị Trung tâm Tiêu chuẩn Đo lường CL giám định thiết bị điện", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", trangThai: "da_ky", ngayTao: "26/02/2026", ngayKy: "27/02/2026" },
  { id: "vb9", maVanBan: "VB-2026-009", tieuDe: "Quyết định tịch thu tiền đánh bạc BB-2026-011", loaiVanBan: "quyet_dinh_xu_ly", hoSoId: "hs11", maBienBan: "BB-2026-011", tangVatId: "tv12", noiDung: "Quyết định tịch thu 42.000.000 đồng tiền thu được từ đánh bạc", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", nguoiKyId: "u1", nguoiKyTen: "Nguyễn Văn Hùng", trangThai: "cho_ky", ngayTao: "28/02/2026" },
  { id: "vb10", maVanBan: "VB-2026-010", tieuDe: "Biên bản trả lại lợn cho hộ chăn nuôi", loaiVanBan: "bien_ban_tra_lai", hoSoId: "hs4", maBienBan: "BB-2026-004", tangVatId: "tv23", noiDung: "Biên bản trả lại 12 con lợn cho ông Phạm Văn Long sau khi xử phạt", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", nguoiKyId: "u2", nguoiKyTen: "Trần Thị Lan", trangThai: "da_ky", ngayTao: "24/01/2026", ngayKy: "25/01/2026" },
  { id: "vb11", maVanBan: "VB-2026-011", tieuDe: "Biên bản niêm phong vật liệu nổ", loaiVanBan: "bien_ban_niem_phong", hoSoId: "hs9", maBienBan: "BB-2026-009", tangVatId: "tv20", noiDung: "Biên bản niêm phong 25kg TNT và 50 kíp nổ tại Kho Hàng Hóa Đặc Biệt", nguoiTaoId: "u1", nguoiTaoTen: "Nguyễn Văn Hùng", nguoiKyId: "u1", nguoiKyTen: "Nguyễn Văn Hùng", trangThai: "da_ky", ngayTao: "06/02/2026", ngayKy: "06/02/2026" },
  { id: "vb12", maVanBan: "VB-2026-012", tieuDe: "Quyết định xử lý xe tải BB-2026-004", loaiVanBan: "quyet_dinh_xu_ly", hoSoId: "hs4", maBienBan: "BB-2026-004", tangVatId: "tv18", noiDung: "Đề xuất trả lại xe tải sau khi hoàn tất xử phạt VPHC", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", trangThai: "nhap", ngayTao: "25/02/2026" },
  { id: "vb13", maVanBan: "VB-2026-013", tieuDe: "Biên bản bàn giao vật liệu nổ cho Quân đội", loaiVanBan: "bien_ban_ban_giao", hoSoId: "hs9", maBienBan: "BB-2026-009", tangVatId: "tv20", noiDung: "Biên bản bàn giao vật liệu nổ cho Bộ CHQS tỉnh Vĩnh Phúc", nguoiTaoId: "u1", nguoiTaoTen: "Nguyễn Văn Hùng", trangThai: "nhap", ngayTao: "05/03/2026" },
  { id: "vb14", maVanBan: "VB-2026-014", tieuDe: "Công văn phối hợp xử lý iPhone nhập lậu", loaiVanBan: "cong_van", hoSoId: "hs10", maBienBan: "BB-2026-010", noiDung: "Đề nghị CA Huyện Bình Xuyên phối hợp xử lý lô hàng iPhone và Samsung nhập lậu", nguoiTaoId: "u1", nguoiTaoTen: "Nguyễn Văn Hùng", nguoiKyId: "u1", nguoiKyTen: "Nguyễn Văn Hùng", trangThai: "da_ky", ngayTao: "15/02/2026", ngayKy: "16/02/2026" },
  { id: "vb15", maVanBan: "VB-2026-015", tieuDe: "Biên bản tiêu hủy pháo nổ", loaiVanBan: "bien_ban_tieu_huy", hoSoId: "hs15", maBienBan: "BB-2026-015", tangVatId: "tv21", noiDung: "Biên bản tiêu hủy 180kg pháo hoa và pháo nổ", nguoiTaoId: "u4", nguoiTaoTen: "Lê Minh Tuấn", trangThai: "nhap", ngayTao: "20/03/2026" },
];

export const MOCK_THONG_BAO: ThongBao[] = [
  { id: "tb1", tieuDe: "Tang vật quá hạn lưu kho", noiDung: "Đồng hồ thông minh TV-2025-077 đã quá hạn lưu kho 6 ngày. Cần xử lý ngay.", loai: "canh_bao", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", tangVatId: "tv32", daDoc: false, ngayTao: "07/04/2026" },
  { id: "tb2", tieuDe: "Đề nghị luân chuyển mới cần phê duyệt", noiDung: "Có đề nghị luân chuyển iPhone 14 Pro (LC-2026-003) đang chờ phê duyệt.", loai: "phe_duyet", nguoiNhanId: "u2", nguoiNhanTen: "Trần Thị Lan", daDoc: false, ngayTao: "12/03/2026" },
  { id: "tb3", tieuDe: "Kiểm kê Kho Hàng Hóa Đặc Biệt đang tiến hành", noiDung: "Kiểm kê KK-2026-003 đang được tiến hành tại Kho Hàng Hóa Đặc Biệt.", loai: "he_thong", nguoiNhanId: "u2", nguoiNhanTen: "Trần Thị Lan", daDoc: true, ngayTao: "10/03/2026" },
  { id: "tb4", tieuDe: "Đề xuất xử lý được phê duyệt", noiDung: "Đề xuất xử lý tiền mặt 42 triệu (XL-2026-007) đã được phê duyệt.", loai: "phe_duyet", nguoiNhanId: "u4", nguoiNhanTen: "Lê Minh Tuấn", daDoc: false, ngayTao: "01/03/2026" },
  { id: "tb5", tieuDe: "Sắp hết hạn lưu kho - Xe máy Honda SH Mode", noiDung: "Xe máy Honda SH Mode (TV-2025-089) còn 3 ngày đến hạn lưu kho (10/04/2026).", loai: "nhac_nho", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", tangVatId: "tv31", daDoc: false, ngayTao: "07/04/2026" },
  { id: "tb6", tieuDe: "Luân chuyển vật liệu nổ được phê duyệt", noiDung: "Đề nghị luân chuyển vật liệu nổ (LC-2026-002) đã được phê duyệt. Cần lên lịch bàn giao.", loai: "phe_duyet", nguoiNhanId: "u1", nguoiNhanTen: "Nguyễn Văn Hùng", daDoc: true, ngayTao: "04/03/2026" },
  { id: "tb7", tieuDe: "Hồ sơ BB-2026-015 mới nhập", noiDung: "Hồ sơ vụ việc BB-2026-015 (Pháo nổ) đã được nhập vào hệ thống.", loai: "he_thong", nguoiNhanId: "u2", nguoiNhanTen: "Trần Thị Lan", hoSoId: "hs15", daDoc: true, ngayTao: "10/03/2026" },
  { id: "tb8", tieuDe: "Kết quả kiểm kê Kho Tang Vật PC06 Q1", noiDung: "Kiểm kê KK-2026-001 đã hoàn thành và được phê duyệt. Xem kết quả chi tiết.", loai: "he_thong", nguoiNhanId: "u1", nguoiNhanTen: "Nguyễn Văn Hùng", daDoc: true, ngayTao: "01/03/2026" },
  { id: "tb9", tieuDe: "Đề xuất tiêu hủy thiết bị điện chờ duyệt", noiDung: "Đề xuất tiêu hủy 500 thiết bị điện kém chất lượng (XL-2026-009) đang chờ phê duyệt.", loai: "phe_duyet", nguoiNhanId: "u2", nguoiNhanTen: "Trần Thị Lan", daDoc: false, ngayTao: "20/03/2026" },
  { id: "tb10", tieuDe: "Nhắc nhở kiểm kê định kỳ tháng 4", noiDung: "Theo lịch, tháng 4/2026 cần tiến hành kiểm kê tất cả các kho. Vui lòng lập kế hoạch.", loai: "nhac_nho", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", daDoc: false, ngayTao: "01/04/2026" },
  { id: "tb11", tieuDe: "Bàn giao tang vật cho CA TP Vĩnh Yên", noiDung: "Tàu hút cát và máy hút cát đã được bàn giao cho CA TP Vĩnh Yên ngày 02/03/2026.", loai: "he_thong", nguoiNhanId: "u4", nguoiNhanTen: "Lê Minh Tuấn", daDoc: true, ngayTao: "02/03/2026" },
  { id: "tb12", tieuDe: "Cảnh báo kho chứa chất nguy hiểm", noiDung: "Kho Hàng Hóa Đặc Biệt đang chứa vật liệu nổ và pháo. Chú ý an toàn PCCC.", loai: "canh_bao", nguoiNhanId: "u3", nguoiNhanTen: "Phạm Văn Đức", khoId: "kho3", daDoc: true, ngayTao: "11/03/2026" },
  { id: "tb13", tieuDe: "Văn bản báo cáo Quý 1 cần ký duyệt", noiDung: "Báo cáo tổng hợp tang vật Quý 1/2026 (VB-2026-007) đang chờ chữ ký lãnh đạo.", loai: "phe_duyet", nguoiNhanId: "u1", nguoiNhanTen: "Nguyễn Văn Hùng", daDoc: false, ngayTao: "05/04/2026" },
  { id: "tb14", tieuDe: "Đề nghị luân chuyển thiết bị điện", noiDung: "Đề nghị LC-2026-008 gửi thiết bị điện đi giám định đang chờ phê duyệt.", loai: "phe_duyet", nguoiNhanId: "u2", nguoiNhanTen: "Trần Thị Lan", daDoc: false, ngayTao: "15/03/2026" },
  { id: "tb15", tieuDe: "Hồ sơ BB-2026-011 đã được phê duyệt", noiDung: "Hồ sơ tổ chức đánh bạc BB-2026-011 đã được phê duyệt, chuyển giai đoạn xử lý.", loai: "he_thong", nguoiNhanId: "u4", nguoiNhanTen: "Lê Minh Tuấn", hoSoId: "hs11", daDoc: true, ngayTao: "20/02/2026" },
  { id: "tb16", tieuDe: "Phiếu nhập kho iPhone PNK-2026-005 hoàn thành", noiDung: "Phiếu nhập kho 35 iPhone 14 Pro và 20 Samsung Tab S8 đã được xác nhận.", loai: "he_thong", nguoiNhanId: "u4", nguoiNhanTen: "Lê Minh Tuấn", daDoc: true, ngayTao: "11/02/2026" },
  { id: "tb17", tieuDe: "Đề xuất luân chuyển pháo nổ", noiDung: "Đề nghị LC-2026-005 luân chuyển pháo nổ sang PCCC đang chờ phê duyệt.", loai: "phe_duyet", nguoiNhanId: "u2", nguoiNhanTen: "Trần Thị Lan", daDoc: false, ngayTao: "20/03/2026" },
  { id: "tb18", tieuDe: "Quyết định VB-2026-009 cần ký", noiDung: "Quyết định tịch thu tiền mặt 42 triệu đồng đang chờ chữ ký Trưởng phòng.", loai: "phe_duyet", nguoiNhanId: "u1", nguoiNhanTen: "Nguyễn Văn Hùng", daDoc: false, ngayTao: "01/03/2026" },
  { id: "tb19", tieuDe: "Xe đua Kawasaki Z650 nhập kho", noiDung: "Xe mô tô Kawasaki Z650 đã nhập kho Bãi Phương Tiện PC06 theo biên bản BB-2026-014.", loai: "he_thong", nguoiNhanId: "u2", nguoiNhanTen: "Trần Thị Lan", daDoc: true, ngayTao: "06/03/2026" },
  { id: "tb20", tieuDe: "Hệ thống bảo trì ngày 10/04/2026", noiDung: "Hệ thống sẽ bảo trì từ 22:00-24:00 ngày 10/04/2026. Vui lòng lưu dữ liệu trước khi bảo trì.", loai: "he_thong", nguoiNhanId: "u1", nguoiNhanTen: "Nguyễn Văn Hùng", daDoc: false, ngayTao: "06/04/2026" },
];

export const MOCK_NHAT_KY: NhatKy[] = [
  { id: "nk1", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Tạo hồ sơ", doiTuong: "HoSo", doiTuongId: "hs15", doiTuongMa: "BB-2026-015", chiTiet: "Tạo hồ sơ vụ việc mua bán pháo nổ trái phép", thoiGian: "10/03/2026 09:15" },
  { id: "nk2", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Nhập kho", doiTuong: "TangVat", doiTuongId: "tv21", doiTuongMa: "TV-2026-021", chiTiet: "Nhập kho 180kg pháo hoa, pháo nổ theo PNK-2026-009", thoiGian: "11/03/2026 10:30" },
  { id: "nk3", userId: "u1", userTen: "Nguyễn Văn Hùng", hanhDong: "Niêm phong", doiTuong: "NiemPhong", doiTuongId: "np9", doiTuongMa: "NP-2026-009", chiTiet: "Niêm phong pháo hoa, pháo nổ kho Hàng Hóa Đặc Biệt", thoiGian: "11/03/2026 11:00" },
  { id: "nk4", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Tạo đề nghị luân chuyển", doiTuong: "LuanChuyen", doiTuongId: "lc5", doiTuongMa: "LC-2026-005", chiTiet: "Tạo đề nghị luân chuyển pháo nổ sang PCCC tỉnh", thoiGian: "20/03/2026 14:00" },
  { id: "nk5", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Đề xuất xử lý", doiTuong: "XuLy", doiTuongId: "xl9", doiTuongMa: "XL-2026-009", chiTiet: "Đề xuất tiêu hủy 500 thiết bị điện kém chất lượng", thoiGian: "20/03/2026 15:30" },
  { id: "nk6", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Kiểm kê", doiTuong: "KiemKe", doiTuongId: "kk4", doiTuongMa: "KK-2026-004", chiTiet: "Hoàn thành kiểm kê Kho CA Huyện Bình Xuyên - kết quả khớp 100%", thoiGian: "15/03/2026 16:00" },
  { id: "nk7", userId: "u1", userTen: "Nguyễn Văn Hùng", hanhDong: "Ký văn bản", doiTuong: "VanBan", doiTuongId: "vb14", doiTuongMa: "VB-2026-014", chiTiet: "Ký công văn phối hợp xử lý iPhone nhập lậu", thoiGian: "16/02/2026 08:45" },
  { id: "nk8", userId: "u2", userTen: "Trần Thị Lan", hanhDong: "Phê duyệt luân chuyển", doiTuong: "LuanChuyen", doiTuongId: "lc6", doiTuongMa: "LC-2026-006", chiTiet: "Phê duyệt luân chuyển tiền mặt 42 triệu sang Kho bạc", thoiGian: "14/03/2026 09:30" },
  { id: "nk9", userId: "u1", userTen: "Nguyễn Văn Hùng", hanhDong: "Phê duyệt xử lý", doiTuong: "XuLy", doiTuongId: "xl7", doiTuongMa: "XL-2026-007", chiTiet: "Phê duyệt tịch thu sung công 42 triệu tiền đánh bạc", thoiGian: "01/03/2026 10:00" },
  { id: "nk10", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Tạo hồ sơ", doiTuong: "HoSo", doiTuongId: "hs14", doiTuongMa: "BB-2026-014", chiTiet: "Tạo hồ sơ xe đua mô tô phân khối lớn", thoiGian: "05/03/2026 08:30" },
  { id: "nk11", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Nhập kho", doiTuong: "TangVat", doiTuongId: "tv3", doiTuongMa: "TV-2026-003", chiTiet: "Nhập kho xe Yamaha R15 theo PNK-2026-008", thoiGian: "06/03/2026 09:00" },
  { id: "nk12", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Nhập kho", doiTuong: "TangVat", doiTuongId: "tv4", doiTuongMa: "TV-2026-004", chiTiet: "Nhập kho xe Kawasaki Z650 theo PNK-2026-008", thoiGian: "06/03/2026 09:15" },
  { id: "nk13", userId: "u1", userTen: "Nguyễn Văn Hùng", hanhDong: "Phê duyệt hồ sơ", doiTuong: "HoSo", doiTuongId: "hs3", doiTuongMa: "BB-2026-003", chiTiet: "Phê duyệt hồ sơ vụ tàng trữ hàng giả mạo", thoiGian: "20/01/2026 14:00" },
  { id: "nk14", userId: "u2", userTen: "Trần Thị Lan", hanhDong: "Phê duyệt luân chuyển", doiTuong: "LuanChuyen", doiTuongId: "lc2", doiTuongMa: "LC-2026-002", chiTiet: "Phê duyệt chuyển vật liệu nổ cho Quân đội", thoiGian: "04/03/2026 10:30" },
  { id: "nk15", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Kiểm kê", doiTuong: "KiemKe", doiTuongId: "kk1", doiTuongMa: "KK-2026-001", chiTiet: "Hoàn thành kiểm kê định kỳ Kho Tang Vật PC06", thoiGian: "01/03/2026 17:00" },
  { id: "nk16", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Tạo đề nghị luân chuyển", doiTuong: "LuanChuyen", doiTuongId: "lc3", doiTuongMa: "LC-2026-003", chiTiet: "Tạo đề nghị chuyển iPhone sang CA Huyện Bình Xuyên", thoiGian: "12/03/2026 11:00" },
  { id: "nk17", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Tạo hồ sơ", doiTuong: "HoSo", doiTuongId: "hs13", doiTuongMa: "BB-2026-013", chiTiet: "Tạo hồ sơ vụ kinh doanh thiết bị điện kém chất lượng", thoiGian: "25/02/2026 09:00" },
  { id: "nk18", userId: "u2", userTen: "Trần Thị Lan", hanhDong: "Phê duyệt kiểm kê", doiTuong: "KiemKe", doiTuongId: "kk1", doiTuongMa: "KK-2026-001", chiTiet: "Phê duyệt kết quả kiểm kê Kho Tang Vật PC06", thoiGian: "03/03/2026 10:00" },
  { id: "nk19", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Đề xuất xử lý", doiTuong: "XuLy", doiTuongId: "xl8", doiTuongMa: "XL-2026-008", chiTiet: "Đề xuất trả lại xe tải cho chủ phương tiện", thoiGian: "25/02/2026 14:00" },
  { id: "nk20", userId: "u1", userTen: "Nguyễn Văn Hùng", hanhDong: "Tạo văn bản", doiTuong: "VanBan", doiTuongId: "vb7", doiTuongMa: "VB-2026-007", chiTiet: "Tạo báo cáo tổng hợp tang vật Quý 1/2026", thoiGian: "05/04/2026 08:00" },
  { id: "nk21", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Tạo phiếu nhập kho", doiTuong: "PhieuNhapKho", doiTuongId: "pnk9", doiTuongMa: "PNK-2026-009", chiTiet: "Tạo phiếu nhập kho pháo nổ vào Kho Hàng Hóa Đặc Biệt", thoiGian: "11/03/2026 10:00" },
  { id: "nk22", userId: "u1", userTen: "Nguyễn Văn Hùng", hanhDong: "Phê duyệt luân chuyển", doiTuong: "LuanChuyen", doiTuongId: "lc2", doiTuongMa: "LC-2026-002", chiTiet: "Ký phê duyệt luân chuyển TNT sang Quân đội", thoiGian: "04/03/2026 09:00" },
  { id: "nk23", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Đề xuất xử lý", doiTuong: "XuLy", doiTuongId: "xl4", doiTuongMa: "XL-2026-004", chiTiet: "Đề xuất tiêu hủy thực phẩm hết hạn BB-2026-007", thoiGian: "30/01/2026 09:00" },
  { id: "nk24", userId: "u2", userTen: "Trần Thị Lan", hanhDong: "Phê duyệt xử lý", doiTuong: "XuLy", doiTuongId: "xl4", doiTuongMa: "XL-2026-004", chiTiet: "Phê duyệt tiêu hủy thực phẩm hết hạn", thoiGian: "31/01/2026 10:30" },
  { id: "nk25", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Kiểm kê", doiTuong: "KiemKe", doiTuongId: "kk5", doiTuongMa: "KK-2026-005", chiTiet: "Hoàn thành kiểm kê Kho PC06 tháng 02/2026", thoiGian: "01/02/2026 16:30" },
  { id: "nk26", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Tạo hồ sơ", doiTuong: "HoSo", doiTuongId: "hs8", doiTuongMa: "BB-2026-008", chiTiet: "Tạo hồ sơ ô tô vi phạm nồng độ cồn", thoiGian: "01/02/2026 14:00" },
  { id: "nk27", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Nhập kho", doiTuong: "TangVat", doiTuongId: "tv2", doiTuongMa: "TV-2026-002", chiTiet: "Nhập kho Toyota Camry biển 88A-123.45", thoiGian: "02/02/2026 10:00" },
  { id: "nk28", userId: "u1", userTen: "Nguyễn Văn Hùng", hanhDong: "Phê duyệt hồ sơ", doiTuong: "HoSo", doiTuongId: "hs12", doiTuongMa: "BB-2026-012", chiTiet: "Phê duyệt hồ sơ khai thác cát trái phép", thoiGian: "22/02/2026 09:00" },
  { id: "nk29", userId: "u4", userTen: "Lê Minh Tuấn", hanhDong: "Tạo hồ sơ", doiTuong: "HoSo", doiTuongId: "hs10", doiTuongMa: "BB-2026-010", chiTiet: "Tạo hồ sơ kinh doanh điện thoại nhập lậu", thoiGian: "10/02/2026 08:30" },
  { id: "nk30", userId: "u3", userTen: "Phạm Văn Đức", hanhDong: "Tạo phiếu nhập kho", doiTuong: "PhieuNhapKho", doiTuongId: "pnk4", doiTuongMa: "PNK-2026-004", chiTiet: "Tạo phiếu nhập kho ô tô Toyota theo BB-2026-008", thoiGian: "02/02/2026 09:30" },
];

export const DEFAULT_CAU_HINH: CauHinh = {
  tenHeThong: "Hệ thống Quản lý Tang Vật Vi Phạm Hành Chính",
  tenCongAn: "Công an tỉnh Vĩnh Phúc",
  moTa: "Phần mềm quản lý tang vật, phương tiện vi phạm hành chính",
  soNgayCanhBaoTruocHan: 30,
  soNgayLuuKhoToiDa: 180,
  tuDongCanhBao: true,
  yeuCauNiemPhong: true,
  batBuocHinhAnh: false,
  soAnhToiThieu: 2,
  logHoatDong: true,
  sessionTimeout: 60,
  emailCanhBao: true,
  emailNhan: "pc06@congantinhvinhphuc.gov.vn",
};

// ========================
// APP STORE
// ========================

type Listener = () => void;

// Demo password for all accounts
const DEMO_PASSWORD = "Demo@2026";
// Map username -> userId
const CREDENTIAL_MAP: Record<string, string> = {
  admin:   "u1",
  lanhdao: "u2",
  thukho:  "u3",
  canbonv: "u4",
  viewer:  "u5",
};

class AppStore {
  // --- State ---
  isAuthenticated: boolean = false;
  currentUser: User = MOCK_USERS[0];
  users: User[] = [...MOCK_USERS];
  donVi: DonVi[] = [...MOCK_DON_VI];
  kho: Kho[] = [...MOCK_KHO];
  hoSo: HoSoVuViec[] = [...MOCK_HO_SO];
  tangVat: TangVat[] = [...MOCK_TANG_VAT];
  niemPhong: NiemPhong[] = [...MOCK_NIEM_PHONG];
  phieuNhapKho: PhieuNhapKho[] = [...MOCK_PHIEU_NHAP_KHO];
  kiemKe: KiemKe[] = [...MOCK_KIEM_KE];
  luanChuyen: LuanChuyen[] = [...MOCK_LUAN_CHUYEN];
  xuLy: XuLyTangVat[] = [...MOCK_XU_LY];
  giaoTuGiu: GiaoTuGiu[] = [...MOCK_GIAO_TU_GIU];
  tienBaoLanh: TienBaoLanh[] = [...MOCK_TIEN_BAO_LANH];
  canhBao: CanhBao[] = [...MOCK_CANH_BAO];
  vanBan: VanBan[] = [...MOCK_VAN_BAN];
  thongBao: ThongBao[] = [...MOCK_THONG_BAO];
  nhatKy: NhatKy[] = [...MOCK_NHAT_KY];
  cauHinh: CauHinh = { ...DEFAULT_CAU_HINH };

  private listeners: Set<Listener> = new Set();

  // --- Subscription ---
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // ========================
  // AUTH
  // ========================
  login(username: string, password: string): boolean {
    const trimmed = username.trim().toLowerCase();
    const userId = CREDENTIAL_MAP[trimmed];
    if (!userId || password !== DEMO_PASSWORD) return false;
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;
    this.currentUser = user;
    this.isAuthenticated = true;
    this.notify();
    return true;
  }

  logout() {
    this.isAuthenticated = false;
    this.notify();
  }

  // ========================
  // USER
  // ========================
  switchUser(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.notify();
    }
  }

  // ========================
  // HO SO VU VIEC
  // ========================
  addHoSo(data: Omit<HoSoVuViec, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const hs: HoSoVuViec = {
      ...data,
      id: genId(),
      createdAt: dateStr,
      updatedAt: dateStr,
    };
    this.hoSo = [hs, ...this.hoSo];
    this._addNhatKy("Tạo hồ sơ", "HoSo", hs.id, hs.maBienBan, `Tạo hồ sơ vụ việc ${hs.maBienBan}`);
    this.notify();
    return hs;
  }

  updateHoSo(id: string, data: Partial<HoSoVuViec>) {
    this.hoSo = this.hoSo.map((h) => h.id === id ? { ...h, ...data, updatedAt: new Date().toLocaleDateString("vi-VN") } : h);
    this.notify();
  }

  updateTrangThaiHoSo(id: string, trangThai: TrangThaiHoSo) {
    this.updateHoSo(id, { trangThai });
    this._addNhatKy("Cập nhật trạng thái hồ sơ", "HoSo", id, this.hoSo.find(h => h.id === id)?.maBienBan ?? "", `Chuyển trạng thái sang ${trangThai}`);
  }

  deleteHoSo(id: string) {
    const hs = this.hoSo.find((h) => h.id === id);
    if (!hs) return;
    this.hoSo = this.hoSo.filter((h) => h.id !== id);
    this._addNhatKy("Xóa hồ sơ vụ việc", "HoSo", id, hs.maBienBan, `Xóa hồ sơ ${hs.maBienBan}`);
    this.notify();
  }

  // ========================
  // TANG VAT
  // ========================
  addTangVat(data: Omit<TangVat, "id" | "maTangVat" | "createdAt" | "updatedAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const tv: TangVat = {
      ...data,
      id: genId(),
      maTangVat: genMa("TV"),
      createdAt: dateStr,
      updatedAt: dateStr,
    };
    this.tangVat = [tv, ...this.tangVat];
    this._addNhatKy("Tạo tang vật", "TangVat", tv.id, tv.maTangVat, `Tạo tang vật ${tv.ten}`);
    this.notify();
    return tv;
  }

  updateTangVat(id: string, data: Partial<TangVat>) {
    this.tangVat = this.tangVat.map((t) => t.id === id ? { ...t, ...data, updatedAt: new Date().toLocaleDateString("vi-VN") } : t);
    this.notify();
  }

  deleteTangVat(id: string) {
    const tv = this.tangVat.find((t) => t.id === id);
    if (!tv) return;
    this.tangVat = this.tangVat.filter((t) => t.id !== id);
    this._addNhatKy("Xóa tang vật", "TangVat", id, tv.maTangVat, `Xóa tang vật ${tv.ten}`);
    this.notify();
  }

  updateTrangThaiTangVat(id: string, trangThai: TrangThaiTangVat) {
    this.updateTangVat(id, { trangThai });
    this._addNhatKy("Cập nhật trạng thái tang vật", "TangVat", id, this.tangVat.find(t => t.id === id)?.maTangVat ?? "", `Chuyển trạng thái sang ${trangThai}`);
  }

  // ========================
  // NIEM PHONG
  // ========================
  addNiemPhong(data: Omit<NiemPhong, "id" | "maNiemPhong" | "createdAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const np: NiemPhong = {
      ...data,
      id: genId(),
      maNiemPhong: genMa("NP"),
      createdAt: dateStr,
    };
    this.niemPhong = [np, ...this.niemPhong];
    this._addNhatKy("Niêm phong", "NiemPhong", np.id, np.maNiemPhong, `Niêm phong tang vật ${np.tenTangVat}`);
    this.notify();
    return np;
  }

  updateNiemPhong(id: string, data: Partial<NiemPhong>) {
    this.niemPhong = this.niemPhong.map((n) => n.id === id ? { ...n, ...data } : n);
    this.notify();
  }

  // ========================
  // LUAN CHUYEN
  // ========================
  addLuanChuyen(data: Omit<LuanChuyen, "id" | "maLuanChuyen" | "createdAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const lc: LuanChuyen = {
      ...data,
      id: genId(),
      maLuanChuyen: genMa("LC"),
      createdAt: dateStr,
    };
    this.luanChuyen = [lc, ...this.luanChuyen];
    this._addNhatKy("Tạo đề nghị luân chuyển", "LuanChuyen", lc.id, lc.maLuanChuyen, `Đề nghị luân chuyển ${lc.tenTangVat}`);
    this.notify();
    return lc;
  }

  updateLuanChuyen(id: string, data: Partial<LuanChuyen>) {
    this.luanChuyen = this.luanChuyen.map((l) => l.id === id ? { ...l, ...data } : l);
    this.notify();
  }

  pheChuyenLuanChuyen(id: string, approved: boolean, lyDo?: string) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    if (approved) {
      this.updateLuanChuyen(id, {
        trangThai: "da_phe_duyet",
        nguoiPheDuyetId: this.currentUser.id,
        nguoiPheDuyetTen: this.currentUser.hoTen,
        ngayPheDuyet: dateStr,
      });
    } else {
      this.updateLuanChuyen(id, {
        trangThai: "tu_choi",
        lyDoTuChoi: lyDo,
      });
    }
    this.notify();
  }

  // ========================
  // XU LY
  // ========================
  addXuLy(data: Omit<XuLyTangVat, "id" | "maXuLy" | "createdAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const xl: XuLyTangVat = {
      ...data,
      id: genId(),
      maXuLy: genMa("XL"),
      createdAt: dateStr,
    };
    this.xuLy = [xl, ...this.xuLy];
    this._addNhatKy("Tạo đề xuất xử lý", "XuLy", xl.id, xl.maXuLy, `Đề xuất xử lý ${xl.tenTangVat}`);
    this.notify();
    return xl;
  }

  updateXuLy(id: string, data: Partial<XuLyTangVat>) {
    this.xuLy = this.xuLy.map((x) => x.id === id ? { ...x, ...data } : x);
    this.notify();
  }

  pheXuLy(id: string, approved: boolean, lyDo?: string) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    if (approved) {
      this.updateXuLy(id, {
        trangThai: "da_phe_duyet",
        nguoiPheDuyetId: this.currentUser.id,
        nguoiPheDuyetTen: this.currentUser.hoTen,
        ngayPheDuyet: dateStr,
      });
    } else {
      this.updateXuLy(id, { trangThai: "tu_choi", lyDoTuChoi: lyDo });
    }
    this.notify();
  }

  // ========================
  // CANH BAO
  // ========================
  markCanhBaoDaXuLy(id: string) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    this.canhBao = this.canhBao.map((c) =>
      c.id === id
        ? { ...c, daXuLy: true, ngayXuLy: dateStr, nguoiXuLyId: this.currentUser.id, nguoiXuLyTen: this.currentUser.hoTen }
        : c
    );
    this.notify();
  }

  // ========================
  // VAN BAN
  // ========================
  addVanBan(data: Omit<VanBan, "id" | "maVanBan">) {
    const vb: VanBan = {
      ...data,
      id: genId(),
      maVanBan: genMa("VB"),
    };
    this.vanBan = [vb, ...this.vanBan];
    this._addNhatKy("Tạo văn bản", "VanBan", vb.id, vb.maVanBan, `Tạo văn bản: ${vb.tieuDe}`);
    this.notify();
    return vb;
  }

  kyVanBan(id: string) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    this.vanBan = this.vanBan.map((v) =>
      v.id === id
        ? { ...v, trangThai: "da_ky" as const, ngayKy: dateStr, nguoiKyId: this.currentUser.id, nguoiKyTen: this.currentUser.hoTen }
        : v
    );
    this._addNhatKy("Ký văn bản", "VanBan", id, this.vanBan.find(v => v.id === id)?.maVanBan ?? "", `Đã ký văn bản`);
    this.notify();
  }

  tuChoiVanBan(id: string, lyDo: string) {
    this.vanBan = this.vanBan.map((v) =>
      v.id === id ? { ...v, trangThai: "tu_choi" as const, lyDoTuChoi: lyDo } : v
    );
    this.notify();
  }

  // ========================
  // THONG BAO
  // ========================
  markThongBaoDaDoc(id: string) {
    this.thongBao = this.thongBao.map((t) => t.id === id ? { ...t, daDoc: true } : t);
    this.notify();
  }

  markAllThongBaoDaDoc() {
    this.thongBao = this.thongBao.map((t) =>
      t.nguoiNhanId === this.currentUser.id ? { ...t, daDoc: true } : t
    );
    this.notify();
  }

  // ========================
  // KIEM KE
  // ========================
  addKiemKe(data: Omit<KiemKe, "id" | "maKiemKe" | "createdAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const kk: KiemKe = {
      ...data,
      id: genId(),
      maKiemKe: genMa("KK"),
      createdAt: dateStr,
    };
    this.kiemKe = [kk, ...this.kiemKe];
    this._addNhatKy("Tạo phiếu kiểm kê", "KiemKe", kk.id, kk.maKiemKe, `Tạo kiểm kê kho ${kk.khoTen}`);
    this.notify();
    return kk;
  }

  updateKiemKe(id: string, data: Partial<KiemKe>) {
    this.kiemKe = this.kiemKe.map((k) => k.id === id ? { ...k, ...data } : k);
    this.notify();
  }

  // ========================
  // PHIEU NHAP KHO
  // ========================
  addPhieuNhapKho(data: Omit<PhieuNhapKho, "id" | "maPhieu" | "createdAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const pnk: PhieuNhapKho = {
      ...data,
      id: genId(),
      maPhieu: genMa("PNK"),
      createdAt: dateStr,
    };
    this.phieuNhapKho = [pnk, ...this.phieuNhapKho];
    this._addNhatKy("Tạo phiếu nhập kho", "PhieuNhapKho", pnk.id, pnk.maPhieu, `Nhập kho ${pnk.khoTen}`);
    this.notify();
    return pnk;
  }

  // ========================
  // CAU HINH
  // ========================
  updateCauHinh(data: Partial<CauHinh>) {
    this.cauHinh = { ...this.cauHinh, ...data };
    this.notify();
  }

  // ========================
  // USER MANAGEMENT
  // ========================
  toggleUserStatus(userId: string) {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx === -1) return;
    const current = this.users[idx].trangThai;
    const next = current === "active" ? "locked" : "active";
    this.users = this.users.map((u) =>
      u.id === userId ? { ...u, trangThai: next } : u
    );
    this._addNhatKy(
      next === "locked" ? "Khóa người dùng" : "Mở khóa người dùng",
      "User", userId, userId,
      `Chuyển trạng thái từ ${current} → ${next}`
    );
    this.notify();
  }

  // ========================
  // NHAT KY (private helper)
  // ========================
  private _addNhatKy(hanhDong: string, doiTuong: string, doiTuongId: string, doiTuongMa: string, chiTiet: string) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const nk: NhatKy = {
      id: genId(),
      userId: this.currentUser.id,
      userTen: this.currentUser.hoTen,
      hanhDong,
      doiTuong,
      doiTuongId,
      doiTuongMa,
      chiTiet,
      thoiGian: dateStr,
    };
    this.nhatKy = [nk, ...this.nhatKy];
  }

  // ========================
  // STATS & AGGREGATES
  // ========================

  getStatsOverview() {
    const active = this.tangVat;
    return {
      tongTangVat: active.length,
      dangLuuKho: active.filter((t) => t.trangThai === "dang_luu_kho").length,
      choNhapKho: active.filter((t) => t.trangThai === "cho_nhap_kho").length,
      choXuLy: active.filter((t) => ["cho_xu_ly", "dang_xu_ly"].includes(t.trangThai)).length,
      daTra: active.filter((t) => t.trangThai === "da_tra_lai").length,
      daTichThu: active.filter((t) => t.trangThai === "da_tich_thu").length,
      daTieuHuy: active.filter((t) => t.trangThai === "da_tieu_huy").length,
      daBan: active.filter((t) => t.trangThai === "da_ban").length,
      sapHanLuuKho: this.canhBao.filter((c) => c.loai === "warning" && !c.daXuLy).length,
      quaHanLuuKho: this.canhBao.filter((c) => c.loai === "critical" && !c.daXuLy).length,
      tongGiaTri: active.reduce((s, t) => s + t.giaTriUocTinh * t.soLuong, 0),
    };
  }

  getTangVatByLoai() {
    const map: Record<string, number> = {};
    this.tangVat.forEach((t) => {
      map[t.loai] = (map[t.loai] || 0) + 1;
    });
    return Object.entries(map).map(([loai, soLuong]) => ({ loai, soLuong }));
  }

  getTangVatByTrangThai() {
    const map: Record<string, number> = {};
    this.tangVat.forEach((t) => {
      map[t.trangThai] = (map[t.trangThai] || 0) + 1;
    });
    return Object.entries(map).map(([trangThai, soLuong]) => ({ trangThai, soLuong }));
  }

  getTangVatByKho() {
    return this.kho.map((k) => ({
      khoId: k.id,
      khoTen: k.ten,
      soLuong: this.tangVat.filter((t) =>
        t.khoId === k.id && ["dang_luu_kho", "cho_xu_ly", "dang_xu_ly"].includes(t.trangThai)
      ).length,
      sucChua: k.sucChua,
      dangLuu: k.dangLuu,
    }));
  }

  getNhapXuatTheoThang() {
    // Mock 6 tháng gần đây
    return [
      { thang: "T11/25", nhap: 12, xuat: 8 },
      { thang: "T12/25", nhap: 15, xuat: 10 },
      { thang: "T1/26", nhap: 18, xuat: 12 },
      { thang: "T2/26", nhap: 14, xuat: 9 },
      { thang: "T3/26", nhap: 20, xuat: 14 },
      { thang: "T4/26", nhap: 8, xuat: 5 },
    ];
  }

  getUnreadCount(): number {
    return this.thongBao.filter((t) => !t.daDoc && t.nguoiNhanId === this.currentUser.id).length;
  }

  getActiveCanhBaoCount(): number {
    return this.canhBao.filter((c) => !c.daXuLy && ["critical", "warning"].includes(c.loai)).length;
  }

  getTangVatSapHanLuuKho() {
    return this.tangVat
      .filter((t) => t.hanLuuKho && ["dang_luu_kho", "cho_xu_ly"].includes(t.trangThai))
      .sort((a, b) => {
        const parseD = (s: string) => {
          const [d, m, y] = s.split("/").map(Number);
          return new Date(y, m - 1, d).getTime();
        };
        return parseD(a.hanLuuKho!) - parseD(b.hanLuuKho!);
      })
      .slice(0, 10);
  }

  searchTangVat(query: string, filters: {
    loai?: LoaiTangVat | "";
    trangThai?: TrangThaiTangVat | "";
    khoId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.tangVat.filter((t) => {
      const q = query.toLowerCase();
      const matchQ =
        !query ||
        t.ten.toLowerCase().includes(q) ||
        t.maTangVat.toLowerCase().includes(q) ||
        t.maBienBan.toLowerCase().includes(q) ||
        (t.bienSo && t.bienSo.toLowerCase().includes(q)) ||
        t.dacDiemNhanDang.toLowerCase().includes(q);
      const matchLoai = !filters.loai || t.loai === filters.loai;
      const matchTT = !filters.trangThai || t.trangThai === filters.trangThai;
      const matchKho = !filters.khoId || t.khoId === filters.khoId;
      return matchQ && matchLoai && matchTT && matchKho;
    });
  }

  getHoSoStats() {
    return {
      total: this.hoSo.length,
      choDuyet: this.hoSo.filter((h) => h.trangThai === "cho_duyet").length,
      dangXuLy: this.hoSo.filter((h) => h.trangThai === "dang_xu_ly").length,
      daDuyet: this.hoSo.filter((h) => h.trangThai === "da_duyet").length,
      hoanThanh: this.hoSo.filter((h) => h.trangThai === "hoan_thanh").length,
    };
  }

  // ========================
  // BUSINESS DAYS HELPER
  // ========================
  addBusinessDays(dateStr: string, days: number): string {
    const [d, m, y] = dateStr.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6) added++;
    }
    return `${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
  }

  // ========================
  // CHI PHI LUU KHO
  // ========================
  tinhChiPhiLuuKho(tangVatId: string): { soNgay: number; donGia: number; tongChi: number } {
    const tv = this.tangVat.find((t) => t.id === tangVatId);
    if (!tv || !tv.ngayNhapKho) return { soNgay: 0, donGia: 50000, tongChi: 0 };
    const parseD = (s: string) => { const [d, m, y] = s.split("/").map(Number); return new Date(y, m - 1, d); };
    const nhap = parseD(tv.ngayNhapKho);
    const now = new Date();
    const soNgay = Math.max(0, Math.floor((now.getTime() - nhap.getTime()) / 86400000));
    const donGia = 50000;
    return { soNgay, donGia, tongChi: soNgay * donGia };
  }

  // ========================
  // GIAO TU GIU (Điều 14 NĐ 47/2026)
  // ========================
  addGiaoTuGiu(data: Omit<GiaoTuGiu, "id" | "maGiaoTuGiu" | "createdAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const rec: GiaoTuGiu = {
      ...data,
      id: genId(),
      maGiaoTuGiu: genMa("GTG"),
      trangThai: "cho_xet_duyet",
      createdAt: dateStr,
    };
    this.giaoTuGiu = [rec, ...this.giaoTuGiu];
    this._addNhatKy("Tạo giao tự giữ", "GiaoTuGiu", rec.id, rec.maGiaoTuGiu, `Đề xuất giao tự giữ ${rec.tenTangVat}`);
    this.notify();
    return rec;
  }

  xetDuyetGiaoTuGiu(id: string, approved: boolean, lyDoTuChoi?: string) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    this.giaoTuGiu = this.giaoTuGiu.map((g) => {
      if (g.id !== id) return g;
      if (approved) {
        const hanTuGiu = this.addBusinessDays(dateStr, 60);
        return { ...g, trangThai: "dang_tu_giu" as TrangThaiGiaoTuGiu, ngayPheDuyet: dateStr, nguoiPheDuyetId: this.currentUser.id, nguoiPheDuyetTen: this.currentUser.hoTen, ngayGiao: dateStr, hanTuGiu };
      } else {
        return { ...g, trangThai: "tu_choi" as TrangThaiGiaoTuGiu, ghiChu: lyDoTuChoi ?? "" };
      }
    });
    this._addNhatKy(approved ? "Phê duyệt giao tự giữ" : "Từ chối giao tự giữ", "GiaoTuGiu", id, "", approved ? "Đã phê duyệt" : `Từ chối: ${lyDoTuChoi}`);
    this.notify();
  }

  thuHoiTuGiu(id: string, lyDo: string) {
    const dateStr = new Date().toLocaleDateString("vi-VN");
    this.giaoTuGiu = this.giaoTuGiu.map((g) =>
      g.id === id ? { ...g, trangThai: "da_thu_hoi" as TrangThaiGiaoTuGiu, ngayHoanTra: dateStr, ghiChu: (g.ghiChu ? g.ghiChu + " | " : "") + `Thu hồi: ${lyDo}` } : g
    );
    this.notify();
  }

  capNhatKiemTraGiaoTuGiu(id: string, ketQua: string) {
    const dateStr = new Date().toLocaleDateString("vi-VN");
    this.giaoTuGiu = this.giaoTuGiu.map((g) =>
      g.id === id ? { ...g, ngayKiemTra: dateStr, ketQuaKiemTra: ketQua } : g
    );
    this.notify();
  }

  // ========================
  // TIEN BAO LANH (Điều 15 NĐ 47/2026)
  // ========================
  addTienBaoLanh(data: Omit<TienBaoLanh, "id" | "maBaoLanh" | "createdAt">) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
    const rec: TienBaoLanh = {
      ...data,
      id: genId(),
      maBaoLanh: genMa("TBL"),
      trangThai: "cho_chuyen_tai_vu",
      createdAt: dateStr,
    };
    this.tienBaoLanh = [rec, ...this.tienBaoLanh];
    this._addNhatKy("Tiếp nhận tiền bảo lãnh", "TienBaoLanh", rec.id, rec.maBaoLanh, `Tiếp nhận ${rec.soTienBaoLanh.toLocaleString("vi-VN")}đ bảo lãnh ${rec.tenTangVat}`);
    this.notify();
    return rec;
  }

  chuyenTaiVu(id: string) {
    const dateStr = new Date().toLocaleDateString("vi-VN");
    const hanXuLy = this.addBusinessDays(dateStr, 10);
    this.tienBaoLanh = this.tienBaoLanh.map((t) =>
      t.id === id ? { ...t, trangThai: "cho_xu_ly" as TrangThaiBaoLanh, ngayChuyenTaiVu: dateStr, hanXuLy } : t
    );
    // Note: State transitions cho_chuyen_tai_vu → cho_xu_ly (10 business days deadline)
    this._addNhatKy("Chuyển tài vụ", "TienBaoLanh", id, "", `Chuyển tài vụ, hạn xử lý: ${hanXuLy}`);
    this.notify();
  }

  xuLyBaoLanh(id: string, ketQua: "tich_thu" | "hoan_tra", soQuyetDinh?: string, ghiChu?: string) {
    const dateStr = new Date().toLocaleDateString("vi-VN");
    this.tienBaoLanh = this.tienBaoLanh.map((t) => {
      if (t.id !== id) return t;
      const update: Partial<TienBaoLanh> = {
        trangThai: (ketQua === "tich_thu" ? "da_khau_tru" : "da_hoan_tra") as TrangThaiBaoLanh,
        ketQuaXuLy: ketQua,
        ngayXuLy: dateStr,
        soQuyetDinhXuLy: soQuyetDinh,
        ghiChu: ghiChu ?? t.ghiChu,
      };
      if (ketQua === "tich_thu") update.soTienNopNganSach = t.soTienBaoLanh;
      else update.soTienHoanTra = t.soTienBaoLanh;
      return { ...t, ...update };
    });
    this._addNhatKy(ketQua === "tich_thu" ? "Tịch thu tiền bảo lãnh" : "Hoàn trả tiền bảo lãnh", "TienBaoLanh", id, soQuyetDinh ?? "", ketQua === "tich_thu" ? "Tịch thu sung công quỹ" : "Hoàn trả cho đối tượng");
    this.notify();
  }

  // ========================
  // CANH BAO THUC PHAM / DUOC PHAM
  // ========================
  generateCanhBaoThucPham(): CanhBao[] {
    const today = new Date();
    const result: CanhBao[] = [];
    this.tangVat.forEach((tv) => {
      if (!tv.hanDungSanPham) return;
      if (!["thuc_pham", "thuoc"].includes(tv.loai)) return;
      const [d, m, y] = tv.hanDungSanPham.split("/").map(Number);
      const han = new Date(y, m - 1, d);
      const soNgay = Math.floor((han.getTime() - today.getTime()) / 86400000);
      if (soNgay <= 30 && soNgay > 0) {
        result.push({ id: `cb-thucpham-${tv.id}`, loai: "critical", tieuDe: "Hàng gần hết hạn sử dụng — cần bán ngay", moTa: `${tv.ten} (${tv.maTangVat}) còn ${soNgay} ngày đến hạn sử dụng (${tv.hanDungSanPham}). Cần xử lý bán ngay theo Điều 17a NĐ 47/2026.`, tangVatId: tv.id, tenTangVat: tv.ten, khoId: tv.khoId, khoTen: tv.khoTen, canBoId: tv.canBoQuanLyId ?? "u3", canBoTen: tv.canBoQuanLyTen ?? "Phạm Văn Đức", ngayHetHan: tv.hanDungSanPham, soNgayConLai: soNgay, daXuLy: false, ngayTao: today.toLocaleDateString("vi-VN") });
      } else if (soNgay <= 60 && soNgay > 30) {
        result.push({ id: `cb-thucpham-${tv.id}`, loai: "warning", tieuDe: "Hàng sắp đến hạn sử dụng", moTa: `${tv.ten} (${tv.maTangVat}) còn ${soNgay} ngày đến hạn sử dụng (${tv.hanDungSanPham}). Chuẩn bị xử lý sớm.`, tangVatId: tv.id, tenTangVat: tv.ten, khoId: tv.khoId, khoTen: tv.khoTen, canBoId: tv.canBoQuanLyId ?? "u3", canBoTen: tv.canBoQuanLyTen ?? "Phạm Văn Đức", ngayHetHan: tv.hanDungSanPham, soNgayConLai: soNgay, daXuLy: false, ngayTao: today.toLocaleDateString("vi-VN") });
      }
    });
    return result;
  }

  checkGiayPhepHetHan(): CanhBao[] {
    const today = new Date();
    const result: CanhBao[] = [];
    this.tangVat.forEach((tv) => {
      if (tv.loai !== "giay_phep_chung_chi" || !tv.ngayHetHanGiayPhep) return;
      const [d, m, y] = tv.ngayHetHanGiayPhep.split("/").map(Number);
      const han = new Date(y, m - 1, d);
      const soNgay = Math.floor((han.getTime() - today.getTime()) / 86400000);
      if (soNgay <= 0) {
        result.push({ id: `cb-giayPhep-${tv.id}`, loai: "critical", tieuDe: "Giấy phép/chứng chỉ đã hết hạn", moTa: `${tv.ten} (${tv.maTangVat}): Giấy phép hết hạn ${tv.ngayHetHanGiayPhep}`, tangVatId: tv.id, tenTangVat: tv.ten, khoId: tv.khoId, khoTen: tv.khoTen, canBoId: "u3", canBoTen: "Phạm Văn Đức", ngayHetHan: tv.ngayHetHanGiayPhep, soNgayConLai: soNgay, daXuLy: false, ngayTao: today.toLocaleDateString("vi-VN") });
      } else if (soNgay <= 30) {
        result.push({ id: `cb-giayPhep-${tv.id}`, loai: "warning", tieuDe: "Giấy phép sắp hết hạn", moTa: `${tv.ten} (${tv.maTangVat}): Giấy phép còn ${soNgay} ngày (${tv.ngayHetHanGiayPhep})`, tangVatId: tv.id, tenTangVat: tv.ten, khoId: tv.khoId, khoTen: tv.khoTen, canBoId: "u3", canBoTen: "Phạm Văn Đức", ngayHetHan: tv.ngayHetHanGiayPhep, soNgayConLai: soNgay, daXuLy: false, ngayTao: today.toLocaleDateString("vi-VN") });
      }
    });
    return result;
  }

  // ========================
  // KPI & BAO CAO
  // ========================
  getKpiTienDo() {
    const total = this.hoSo.length;
    const hoanThanh = this.hoSo.filter((h) => h.trangThai === "hoan_thanh").length;
    const tongTV = this.tangVat.length;
    const daXuLy = this.tangVat.filter((t) => ["da_tra_lai", "da_tieu_huy", "da_tich_thu", "da_ban"].includes(t.trangThai)).length;
    const quaHan = this.tangVat.filter((t) => {
      if (!t.hanLuuKho) return false;
      const [d, m, y] = t.hanLuuKho.split("/").map(Number);
      return new Date(y, m - 1, d) < new Date();
    }).length;
    return {
      tiLeHoanThanhHoSo: total > 0 ? Math.round((hoanThanh / total) * 100) : 0,
      tiLeXuLyTangVat: tongTV > 0 ? Math.round((daXuLy / tongTV) * 100) : 0,
      tiLeQuaHan: tongTV > 0 ? Math.round((quaHan / tongTV) * 100) : 0,
      tongHoSo: total, hoanThanh, tongTV, daXuLy, quaHan,
    };
  }

  getBaoCaoChuyen(nam?: number, quy?: number) {
    const n = nam ?? new Date().getFullYear();
    const parseD = (s: string) => { const [d, m, y] = s.split("/").map(Number); return new Date(y, m - 1, d); };
    const inPeriod = (dateStr: string) => {
      const d = parseD(dateStr);
      if (d.getFullYear() !== n) return false;
      if (quy) {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        return q === quy;
      }
      return true;
    };
    const hoSoKy = this.hoSo.filter((h) => inPeriod(h.ngayLapBienBan));
    const xuLyKy = this.xuLy.filter((x) => inPeriod(x.createdAt));
    const nhapKhoKy = this.phieuNhapKho.filter((p) => inPeriod(p.ngayNhap));
    return {
      tongHoSo: hoSoKy.length,
      tongTangVatNhap: nhapKhoKy.length,
      tongXuLy: xuLyKy.length,
      traLai: xuLyKy.filter((x) => x.hinhThuc === "tra_lai").length,
      tieuHuy: xuLyKy.filter((x) => x.hinhThuc === "tieu_huy").length,
      tichThu: xuLyKy.filter((x) => x.hinhThuc === "tich_thu").length,
      tongTienTichThu: xuLyKy.reduce((s, x) => s + (x.soTienBan ?? 0), 0),
      giaoTuGiuKy: this.giaoTuGiu.filter((g) => inPeriod(g.createdAt)).length,
      tienBaoLanhKy: this.tienBaoLanh.filter((t) => inPeriod(t.createdAt)).length,
    };
  }
}

export const appStore = new AppStore();

// Context (optional, for legacy)
export const StoreContext = createContext<AppStore>(appStore);
export const useStore = () => useContext(StoreContext);
