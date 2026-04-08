// ============================================================
// EXPORT THU TUC — Xuat danh muc thu tuc ra Excel / PDF
// ============================================================

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { exportToExcel, formatDate } from "./utils";
import type { ThuTuc, LinhVuc, CoQuan } from "./types";

// ── Font base64 cho tieng Viet (jsPDF mac dinh khong ho tro Unicode) ──
// Giai phap: dung phan ASCII + mo ta thay the cho dau tieng Viet
// Trong moi truong thuc te, nhung font nhu Roboto/NotoSans se duoc nhung vao

/**
 * Chuyen chuoi tieng Viet sang ASCII de hien thi trong PDF
 * (jsPDF mac dinh khong render duoc dau tieng Viet)
 */
function toASCII(str: string): string {
  const map: Record<string, string> = {
    "à": "a", "á": "a", "ả": "a", "ã": "a", "ạ": "a",
    "ă": "a", "ằ": "a", "ắ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
    "â": "a", "ầ": "a", "ấ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
    "è": "e", "é": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
    "ê": "e", "ề": "e", "ế": "e", "ể": "e", "ễ": "e", "ệ": "e",
    "ì": "i", "í": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
    "ò": "o", "ó": "o", "ỏ": "o", "õ": "o", "ọ": "o",
    "ô": "o", "ồ": "o", "ố": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
    "ơ": "o", "ờ": "o", "ớ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
    "ù": "u", "ú": "u", "ủ": "u", "ũ": "u", "ụ": "u",
    "ư": "u", "ừ": "u", "ứ": "u", "ử": "u", "ữ": "u", "ự": "u",
    "ỳ": "y", "ý": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
    "đ": "d",
    "À": "A", "Á": "A", "Ả": "A", "Ã": "A", "Ạ": "A",
    "Ă": "A", "Ằ": "A", "Ắ": "A", "Ẳ": "A", "Ẵ": "A", "Ặ": "A",
    "Â": "A", "Ầ": "A", "Ấ": "A", "Ẩ": "A", "Ẫ": "A", "Ậ": "A",
    "È": "E", "É": "E", "Ẻ": "E", "Ẽ": "E", "Ẹ": "E",
    "Ê": "E", "Ề": "E", "Ế": "E", "Ể": "E", "Ễ": "E", "Ệ": "E",
    "Ì": "I", "Í": "I", "Ỉ": "I", "Ĩ": "I", "Ị": "I",
    "Ò": "O", "Ó": "O", "Ỏ": "O", "Õ": "O", "Ọ": "O",
    "Ô": "O", "Ồ": "O", "Ố": "O", "Ổ": "O", "Ỗ": "O", "Ộ": "O",
    "Ơ": "O", "Ờ": "O", "Ớ": "O", "Ở": "O", "Ỡ": "O", "Ợ": "O",
    "Ù": "U", "Ú": "U", "Ủ": "U", "Ũ": "U", "Ụ": "U",
    "Ư": "U", "Ừ": "U", "Ứ": "U", "Ử": "U", "Ữ": "U", "Ự": "U",
    "Ỳ": "Y", "Ý": "Y", "Ỷ": "Y", "Ỹ": "Y", "Ỵ": "Y",
    "Đ": "D",
  };
  return str.replace(/[^\x00-\x7F]/g, (ch) => map[ch] || ch);
}

/** Sinh ten file theo ngay */
function makeFileName(prefix: string, ext: string): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${prefix}_${dd}_${mm}_${yyyy}.${ext}`;
}

// ═══════════════════════════════════════════════════
// 1) EXPORT EXCEL
// ═══════════════════════════════════════════════════

export interface ExportThuTucParams {
  thuTucList: ThuTuc[];
  linhVucList: LinhVuc[];
  coQuanList: CoQuan[];
  exportedBy?: string;
}

export function exportThuTucToExcel(params: ExportThuTucParams): void {
  const { thuTucList, linhVucList, coQuanList, exportedBy } = params;

  const linhVucMap = new Map(linhVucList.map((l) => [l.id, l.ten]));
  const coQuanMap = new Map(coQuanList.map((c) => [c.id, c.ten]));

  const data = thuTucList.map((tt, idx) => ({
    stt: idx + 1,
    maTT: tt.maTT,
    ten: tt.ten,
    linhVuc: linhVucMap.get(tt.linhVucId) || "",
    mucDo: `Mức ${tt.mucDo}`,
    thoiGian: tt.thoiGianHienThi,
    phiLePhi: tt.phiLePhi,
    coQuan: coQuanMap.get(tt.coQuanId) || "",
    rating: tt.rating ? `${tt.rating}/5` : "",
  }));

  exportToExcel({
    sheetName: "Danh muc TTHC",
    title: "BỘ THÔNG TIN VÀ TRUYỀN THÔNG — DANH MỤC THỦ TỤC HÀNH CHÍNH",
    subtitle: `Lĩnh vực Thông tin & Truyền thông — Cập nhật ngày ${formatDate(new Date())}`,
    exportedBy,
    fileName: makeFileName("Danh_muc_TTHC", "xlsx"),
    columns: [
      { header: "STT", key: "stt", width: 6 },
      { header: "Mã thủ tục", key: "maTT", width: 16 },
      { header: "Tên thủ tục hành chính", key: "ten", width: 50 },
      { header: "Lĩnh vực", key: "linhVuc", width: 22 },
      { header: "Mức độ DVC", key: "mucDo", width: 12 },
      { header: "Thời hạn xử lý", key: "thoiGian", width: 18 },
      { header: "Phí, lệ phí", key: "phiLePhi", width: 18 },
      { header: "Cơ quan thực hiện", key: "coQuan", width: 28 },
      { header: "Đánh giá", key: "rating", width: 10 },
    ],
    data,
  });
}

// ═══════════════════════════════════════════════════
// 2) EXPORT PDF  (jsPDF + jspdf-autotable)
// ═══════════════════════════════════════════════════

export function exportThuTucToPDF(params: ExportThuTucParams): void {
  const { thuTucList, linhVucList, coQuanList } = params;

  const linhVucMap = new Map(linhVucList.map((l) => [l.id, l.ten]));
  const coQuanMap = new Map(coQuanList.map((c) => [c.id, c.ten]));

  // A4 landscape cho nhieu cot
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── Mau sac nhan dien ──
  const PRIMARY = [13, 59, 102] as const;   // #0d3b66
  const ACCENT = [198, 40, 40] as const;     // #c62828
  const HEADER_BG = [13, 59, 102] as const;
  const HEADER_TEXT = [255, 255, 255] as const;
  const STRIPE_BG = [240, 244, 248] as const; // #f0f4f8

  // ═══ HEADER BLOCK ═══
  // Duong ke tren cung mau do
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageWidth, 3, "F");

  // Background header
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 3, pageWidth, 28, "F");

  // Quoc huy placeholder (circle)
  doc.setFillColor(255, 255, 255);
  doc.circle(20, 17, 8, "F");
  doc.setFontSize(6);
  doc.setTextColor(...PRIMARY);
  doc.text("QH", 20, 18, { align: "center" });

  // Ten co quan
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(toASCII("CONG HOA XA HOI CHU NGHIA VIET NAM"), pageWidth / 2, 10, { align: "center" });
  doc.setFontSize(8);
  doc.text(toASCII("Doc lap — Tu do — Hanh phuc"), pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(toASCII("BO THONG TIN VA TRUYEN THONG"), pageWidth / 2, 22, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(toASCII("He thong Dich vu cong truc tuyen"), pageWidth / 2, 27, { align: "center" });

  // ═══ TITLE ═══
  const titleY = 38;
  doc.setTextColor(...PRIMARY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(toASCII("DANH MUC THU TUC HANH CHINH"), pageWidth / 2, titleY, { align: "center" });

  // Underline
  const titleWidth = doc.getTextWidth(toASCII("DANH MUC THU TUC HANH CHINH"));
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.8);
  doc.line((pageWidth - titleWidth) / 2, titleY + 1.5, (pageWidth + titleWidth) / 2, titleY + 1.5);

  // ═══ META INFO ═══
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 106, 126);
  const metaY = titleY + 7;
  const metaLine = toASCII(
    `Linh vuc: Thong tin & Truyen thong  |  Tong so: ${thuTucList.length} thu tuc  |  Ngay xuat: ${formatDate(new Date())}`
  );
  doc.text(metaLine, pageWidth / 2, metaY, { align: "center" });

  // Separator line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, metaY + 3, pageWidth - 14, metaY + 3);

  // ═══ TABLE ═══
  const tableStartY = metaY + 7;

  const tableHead = [[
    "STT",
    toASCII("Ma thu tuc"),
    toASCII("Ten thu tuc hanh chinh"),
    toASCII("Linh vuc"),
    toASCII("Muc do"),
    toASCII("Thoi han"),
    toASCII("Phi, le phi"),
    toASCII("Co quan thuc hien"),
  ]];

  const tableBody = thuTucList.map((tt, idx) => [
    String(idx + 1),
    tt.maTT,
    toASCII(tt.ten),
    toASCII(linhVucMap.get(tt.linhVucId) || ""),
    `DVC ${tt.mucDo}`,
    toASCII(tt.thoiGianHienThi),
    toASCII(tt.phiLePhi),
    toASCII(coQuanMap.get(tt.coQuanId) || ""),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [26, 35, 50],
      font: "helvetica",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [...HEADER_BG],
      textColor: [...HEADER_TEXT],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 3,
    },
    bodyStyles: {
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [...STRIPE_BG],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },     // STT
      1: { cellWidth: 24 },                         // Ma
      2: { cellWidth: "auto" },                      // Ten (co dan)
      3: { cellWidth: 30 },                          // Linh vuc
      4: { halign: "center", cellWidth: 16 },        // Muc do
      5: { cellWidth: 22 },                          // Thoi han
      6: { cellWidth: 22 },                          // Phi
      7: { cellWidth: 38 },                          // Co quan
    },
    margin: { left: 14, right: 14 },

    // ── Footer moi trang ──
    didDrawPage: (data: any) => {
      const pageNum = doc.getNumberOfPages();
      // Footer line
      doc.setDrawColor(...PRIMARY);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      doc.setFontSize(7);
      doc.setTextColor(90, 106, 126);
      doc.setFont("helvetica", "normal");
      doc.text(
        toASCII("Bo Thong tin va Truyen thong — He thong DVC truc tuyen"),
        14,
        pageHeight - 8,
      );
      doc.text(
        `Trang ${pageNum}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: "right" },
      );

      // Red bottom border
      doc.setFillColor(...ACCENT);
      doc.rect(0, pageHeight - 3, pageWidth, 3, "F");
    },
  });

  // ═══ SUMMARY SECTION ═══
  // Lay vi tri cuoi bang
  const finalY = (doc as any).lastAutoTable?.finalY ?? tableStartY + 20;
  const summaryY = finalY + 8;

  // Kiem tra con du cho trong trang hay can new page
  if (summaryY + 25 > pageHeight - 15) {
    doc.addPage();
    drawSummaryBlock(doc, 20, pageWidth, thuTucList, params);
  } else {
    drawSummaryBlock(doc, summaryY, pageWidth, thuTucList, params);
  }

  // ═══ SAVE ═══
  doc.save(makeFileName("Danh_muc_TTHC", "pdf"));
}

/** Ve khoi thong ke tom tat o cuoi PDF */
function drawSummaryBlock(
  doc: jsPDF,
  y: number,
  pageWidth: number,
  thuTucList: ThuTuc[],
  params: ExportThuTucParams,
): void {
  const PRIMARY = [13, 59, 102] as const;

  // Box background
  doc.setFillColor(240, 244, 248);
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY);
  doc.text(toASCII("THONG KE TOM TAT"), 20, y + 6);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 35, 50);

  const dvc3 = thuTucList.filter((t) => t.mucDo === 3).length;
  const dvc4 = thuTucList.filter((t) => t.mucDo === 4).length;
  const uniqueAgencies = new Set(thuTucList.map((t) => t.coQuanId)).size;

  const stats = [
    `${toASCII("Tong so thu tuc")}: ${thuTucList.length}`,
    `DVC ${toASCII("Muc")} 3: ${dvc3}`,
    `DVC ${toASCII("Muc")} 4: ${dvc4}`,
    `${toASCII("Co quan xu ly")}: ${uniqueAgencies}`,
  ];

  const colW = (pageWidth - 48) / stats.length;
  stats.forEach((text, i) => {
    doc.text(text, 20 + i * colW, y + 14);
  });

  // Ngay xuat + nguoi xuat
  doc.setFontSize(7);
  doc.setTextColor(90, 106, 126);
  doc.text(
    `${toASCII("Ngay xuat")}: ${formatDate(new Date())}${params.exportedBy ? ` | ${toASCII("Nguoi xuat")}: ${toASCII(params.exportedBy)}` : ""}`,
    20,
    y + 19,
  );
}
