import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, LayoutDashboard, FolderOpen, ClipboardList, BarChart3,
  Users, FileText, Mail, Settings, AlertTriangle,
  History,
} from "lucide-react";
import { useStoreState } from "../../hooks/useStoreState";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { hoSo, currentUser } = useStoreState();

  // Commands
  const commands: CommandItem[] = useMemo(() => {
    const nav: CommandItem[] = [
      { id: "nav-home", label: "Trang chủ", description: "Tổng quan hệ thống", icon: LayoutDashboard, action: () => navigate("/"), category: "Di chuyển", keywords: ["dashboard", "tổng quan"] },
      { id: "nav-hoso", label: "Hồ sơ vụ việc", description: "Quản lý hồ sơ vi phạm", icon: FolderOpen, action: () => navigate("/ho-so"), category: "Di chuyển", keywords: ["hồ sơ", "vụ việc"] },
      { id: "nav-tangvat", label: "Quản lý tang vật", description: "Danh sách tang vật", icon: ClipboardList, action: () => navigate("/tang-vat"), category: "Di chuyển", keywords: ["tang vật", "quản lý"] },
      { id: "nav-niemphong", label: "Niêm phong", description: "Quản lý niêm phong tang vật", icon: FileText, action: () => navigate("/niem-phong"), category: "Di chuyển", keywords: ["niêm phong"] },
      { id: "nav-khobai", label: "Kho bãi", description: "Quản lý kho lưu trữ", icon: Users, action: () => navigate("/kho-bai"), category: "Di chuyển", keywords: ["kho", "bãi"] },
      { id: "nav-kiemke", label: "Kiểm kê kho", description: "Kiểm kê định kỳ", icon: ClipboardList, action: () => navigate("/kiem-ke"), category: "Di chuyển", keywords: ["kiểm kê"] },
      { id: "nav-luanchuyen", label: "Luân chuyển", description: "Luân chuyển tang vật", icon: BarChart3, action: () => navigate("/luan-chuyen"), category: "Di chuyển", keywords: ["luân chuyển", "bàn giao"] },
      { id: "nav-xuly", label: "Xử lý tang vật", description: "Đề xuất xử lý", icon: FileText, action: () => navigate("/xu-ly"), category: "Di chuyển", keywords: ["xử lý", "tiêu hủy", "trả lại"] },
      { id: "nav-kyso", label: "Ký duyệt văn bản", description: "Ký số điện tử", icon: FileText, action: () => navigate("/ky-so"), category: "Di chuyển", keywords: ["ký số", "văn bản", "chữ ký"] },
      { id: "nav-tracuu", label: "Tra cứu tang vật", description: "Tìm kiếm tang vật", icon: Search, action: () => navigate("/tra-cuu"), category: "Di chuyển", keywords: ["tra cứu", "tìm kiếm"] },
      { id: "nav-thongke", label: "Thống kê & Báo cáo", description: "Số liệu và biểu đồ", icon: BarChart3, action: () => navigate("/thong-ke"), category: "Di chuyển", keywords: ["thống kê", "báo cáo"] },
      { id: "nav-canhbao", label: "Cảnh báo", description: "Tang vật quá hạn", icon: AlertTriangle, action: () => navigate("/canh-bao"), category: "Di chuyển", keywords: ["cảnh báo", "quá hạn"] },
      { id: "nav-thongbao", label: "Thông báo", description: "Thông báo hệ thống", icon: Mail, action: () => navigate("/thong-bao"), category: "Di chuyển", keywords: ["thông báo"] },
      { id: "nav-nhatky", label: "Nhật ký", description: "Audit trail hoạt động", icon: History, action: () => navigate("/nhat-ky"), category: "Di chuyển", keywords: ["nhật ký", "log", "audit"] },
      { id: "nav-caidat", label: "Cài đặt", description: "Cấu hình hệ thống", icon: Settings, action: () => navigate("/cai-dat"), category: "Di chuyển", keywords: ["cài đặt", "settings"] },
    ];

    // Quick search for ho so (tang vat)
    const hoSoItems: CommandItem[] = hoSo.slice(0, 20).map(hs => ({
      id: `hs-${hs.id}`,
      label: hs.maBienBan,
      description: `${hs.doiTuongViPham} — ${hs.hanhViViPham.slice(0, 40)}`,
      icon: FolderOpen,
      action: () => navigate("/ho-so"),
      category: "Hồ sơ vụ việc",
      keywords: [hs.maBienBan.toLowerCase(), hs.doiTuongViPham.toLowerCase()],
    }));

    return [...nav, ...hoSoItems];
  }, [navigate, hoSo]);

  const filtered = useMemo(() => {
    if (!query) return commands.filter(c => c.category === "Di chuyển");
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.keywords?.some(k => k.includes(q))
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  // Flatten for keyboard nav
  const flatItems = useMemo(() => filtered, [filtered]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatItems[selectedIndex]) {
      flatItems[selectedIndex].action();
      setIsOpen(false);
    }
  }, [flatItems, selectedIndex]);

  const executeCommand = (item: CommandItem) => {
    item.action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger hint (optional in header) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-border"
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm kiếm chức năng, tang vật, hồ sơ..."
                  className="flex-1 py-4 text-sm bg-transparent focus:outline-none"
                />
                <kbd className="px-2 py-1 bg-[#f0f4f8] text-[10px] text-muted-foreground rounded border border-border">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {flatItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                    Không tìm thấy kết quả nào
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <p className="px-4 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider" style={{ fontWeight: 500 }}>
                        {category}
                      </p>
                      {items.map((item) => {
                        const globalIndex = flatItems.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => executeCommand(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected ? "bg-[#e8eef5]" : "hover:bg-[#f8fafc]"
                            }`}
                          >
                            <item.icon className="w-4 h-4 text-[#5a6a7e] shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm" style={{ fontWeight: isSelected ? 500 : 400 }}>{item.label}</p>
                              {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
                            </div>
                            {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-border bg-[#f8fafc] flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[10px]">↑↓</kbd> Di chuyen</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[10px]">↵</kbd> Chon</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[10px]">Esc</kbd> Dong</span>
                </div>
                <span className="flex items-center gap-1">
                  <Command className="w-3 h-3" /> + K
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
