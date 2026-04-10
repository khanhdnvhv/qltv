// ============================================================
// STORAGE SERVICE — Wrapper cho localStorage
// Dễ dàng thay thế bằng API thật sau này:
//   chỉ cần thay các phương thức get/set sang fetch()
// ============================================================

export const STORAGE_KEYS = {
  SEEDED:         'qltvhc_v1_seeded',
  AUTH_USER_ID:   'qltvhc_v1_auth_user_id',
  AUTH_LAST_ACTIVE: 'qltvhc_v1_auth_last_active',
  USERS:          'qltvhc_v1_users',
  DON_VI:         'qltvhc_v1_don_vi',
  KHO:            'qltvhc_v1_kho',
  HO_SO:          'qltvhc_v1_ho_so',
  TANG_VAT:       'qltvhc_v1_tang_vat',
  NIEM_PHONG:     'qltvhc_v1_niem_phong',
  PHIEU_NHAP_KHO: 'qltvhc_v1_phieu_nhap_kho',
  PHIEU_XUAT_KHO: 'qltvhc_v1_phieu_xuat_kho',
  KIEM_KE:        'qltvhc_v1_kiem_ke',
  LUAN_CHUYEN:    'qltvhc_v1_luan_chuyen',
  XU_LY:          'qltvhc_v1_xu_ly',
  GIAO_TU_GIU:    'qltvhc_v1_giao_tu_giu',
  TIEN_BAO_LANH:  'qltvhc_v1_tien_bao_lanh',
  VAN_BAN:        'qltvhc_v1_van_ban',
  CANH_BAO:       'qltvhc_v1_canh_bao',
  THONG_BAO:      'qltvhc_v1_thong_bao',
  NHAT_KY:        'qltvhc_v1_nhat_ky',
  CAU_HINH:       'qltvhc_v1_cau_hinh',
  CAN_CU_PHAP_LY_MAU: 'qltvhc_v1_can_cu_phap_ly_mau',
  DON_VI_TINH_DM:     'qltvhc_v1_don_vi_tinh_dm',
} as const;

// ========================
// CORE — Generic CRUD
// ========================

/**
 * Đọc mảng dữ liệu từ localStorage.
 * Trả về defaultValue nếu chưa có hoặc lỗi parse.
 */
export function lsGet<T>(key: string, defaultValue: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T[];
  } catch {
    console.warn(`[StorageService] Lỗi đọc key="${key}", trả về mặc định`);
    return defaultValue;
  }
}

/**
 * Đọc object đơn lẻ từ localStorage.
 */
export function lsGetOne<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Ghi mảng dữ liệu vào localStorage.
 */
export function lsSet<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // Xử lý quota exceeded
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('[StorageService] Hết dung lượng localStorage!');
    }
  }
}

/**
 * Ghi object đơn lẻ vào localStorage.
 */
export function lsSetOne<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

// ========================
// SEED / RESET HELPERS
// ========================

/** Kiểm tra đã seed mock data chưa */
export function isSeeded(): boolean {
  return localStorage.getItem(STORAGE_KEYS.SEEDED) === 'true';
}

/** Đánh dấu đã seed xong */
export function markSeeded(): void {
  localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
}

/**
 * Xóa toàn bộ dữ liệu ứng dụng khỏi localStorage.
 * Dùng để reset về mock data ban đầu.
 */
export function resetAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

/**
 * Lấy dung lượng localStorage đang dùng (KB).
 */
export function getStorageSizeKB(): number {
  let total = 0;
  Object.values(STORAGE_KEYS).forEach((key) => {
    const val = localStorage.getItem(key);
    if (val) total += val.length * 2; // UTF-16 = 2 bytes/char
  });
  return Math.round(total / 1024);
}

// ========================
// MODULE SERVICE FACTORY
// Tạo CRUD helper cho từng module — dễ swap sang API thật
// ========================

export interface CrudService<T extends { id: string }> {
  getAll(): T[];
  getById(id: string): T | null;
  create(item: T): T;
  update(id: string, data: Partial<T>): T | null;
  delete(id: string): boolean;
  saveAll(items: T[]): void;
}

export function createCrudService<T extends { id: string }>(
  storageKey: string
): CrudService<T> {
  return {
    getAll(): T[] {
      return lsGet<T>(storageKey);
    },

    getById(id: string): T | null {
      return lsGet<T>(storageKey).find((item) => item.id === id) ?? null;
    },

    create(item: T): T {
      const list = lsGet<T>(storageKey);
      list.unshift(item);
      lsSet(storageKey, list);
      return item;
    },

    update(id: string, data: Partial<T>): T | null {
      const list = lsGet<T>(storageKey);
      const idx = list.findIndex((item) => item.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...data };
      lsSet(storageKey, list);
      return list[idx];
    },

    delete(id: string): boolean {
      const list = lsGet<T>(storageKey);
      const filtered = list.filter((item) => item.id !== id);
      if (filtered.length === list.length) return false;
      lsSet(storageKey, filtered);
      return true;
    },

    saveAll(items: T[]): void {
      lsSet(storageKey, items);
    },
  };
}
