// ============================================================
// useStoreState — React hook to subscribe to AppStore updates
// ============================================================

import { useState, useEffect } from "react";
import { appStore } from "../lib/store";

export function useStoreState() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      forceUpdate((v) => v + 1);
    });
    return unsub;
  }, []);

  return {
    isAuthenticated: appStore.isAuthenticated,
    currentUser: appStore.currentUser,
    users: appStore.users,
    donVi: appStore.donVi,
    canCuPhapLyMau: appStore.canCuPhapLyMau,
    donViTinhDM: appStore.donViTinhDM,
    nhomQuyen: appStore.nhomQuyen,
    kho: appStore.kho,
    hoSo: appStore.hoSo,
    tangVat: appStore.tangVat,
    niemPhong: appStore.niemPhong,
    phieuNhapKho: appStore.phieuNhapKho,
    phieuXuatKho: appStore.phieuXuatKho,
    kiemKe: appStore.kiemKe,
    luanChuyen: appStore.luanChuyen,
    xuLy: appStore.xuLy,
    giaoTuGiu: appStore.giaoTuGiu,
    tienBaoLanh: appStore.tienBaoLanh,
    canhBao: appStore.canhBao,
    vanBan: appStore.vanBan,
    thongBao: appStore.thongBao,
    nhatKy: appStore.nhatKy,
    cauHinh: appStore.cauHinh,
    store: appStore,
  };
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for pagination
 */
export function usePagination(totalItems: number, initialPageSize: number = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(page, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalItems, pageSize, totalPages, page]);

  return {
    page: safeCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    setPage,
    setPageSize: (size: number) => { setPageSize(size); setPage(1); },
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToPage: (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
  };
}
