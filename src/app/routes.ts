import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { HoSoVuViec } from "./components/HoSoVuViec";
import { TangVatManager } from "./components/TangVatManager";
import { NiemPhong } from "./components/NiemPhong";
import { KhoBai } from "./components/KhoBai";
import { KiemKe } from "./components/KiemKe";
import { LuanChuyen } from "./components/LuanChuyen";
import { XuLyTangVat } from "./components/XuLyTangVat";
import { GiaoTuGiu } from "./components/GiaoTuGiu";
import { TienBaoLanh } from "./components/TienBaoLanh";
import { KySo } from "./components/KySo";
import { TraCuu } from "./components/TraCuu";
import { ThongKe } from "./components/ThongKe";
import { CanhBao } from "./components/CanhBao";
import { ThongBao } from "./components/ThongBao";
import { NhatKy } from "./components/NhatKy";
import { CaiDat } from "./components/CaiDat";
import { DanhMuc } from "./components/DanhMuc";

export const router = createBrowserRouter(
  [
  { path: "/login", Component: LoginPage },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "ho-so", Component: HoSoVuViec },
      { path: "tang-vat", Component: TangVatManager },
      { path: "niem-phong", Component: NiemPhong },
      { path: "kho-bai", Component: KhoBai },
      { path: "kiem-ke", Component: KiemKe },
      { path: "luan-chuyen", Component: LuanChuyen },
      { path: "xu-ly", Component: XuLyTangVat },
      { path: "giao-tu-giu", Component: GiaoTuGiu },
      { path: "tien-bao-lanh", Component: TienBaoLanh },
      { path: "ky-so", Component: KySo },
      { path: "tra-cuu", Component: TraCuu },
      { path: "thong-ke", Component: ThongKe },
      { path: "canh-bao", Component: CanhBao },
      { path: "thong-bao", Component: ThongBao },
      { path: "nhat-ky", Component: NhatKy },
      { path: "cai-dat", Component: CaiDat },
      { path: "danh-muc", Component: DanhMuc },
    ],
  },
],
  { basename: '/qltv' }
);
