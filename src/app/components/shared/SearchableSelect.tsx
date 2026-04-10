import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  emptyText?: string;
  clearable?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "— Chọn —",
  className = "",
  disabled = false,
  emptyText = "Không tìm thấy kết quả",
  clearable = true,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const filtered = search.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
      )
    : options;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      // auto-focus search input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          "w-full border rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 outline-none transition-colors",
          "bg-white border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100",
          disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "hover:border-gray-300 cursor-pointer",
          open ? "border-blue-400 ring-1 ring-blue-100" : "",
        ].join(" ")}
      >
        <span className={selectedOption ? "text-gray-800 truncate" : "text-gray-400 truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              onClick={handleClear}
              className="text-gray-300 hover:text-gray-500 transition-colors"
              title="Xóa lựa chọn"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-2xl z-[200] overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-colors">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 min-w-0"
                placeholder="Tìm kiếm..."
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-300 hover:text-gray-500">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{emptyText}</p>
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={[
                    "w-full px-4 py-2.5 text-sm text-left flex flex-col hover:bg-blue-50 transition-colors",
                    value === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700",
                  ].join(" ")}
                >
                  <span>{opt.label}</span>
                  {opt.sublabel && (
                    <span className={`text-xs mt-0.5 ${value === opt.value ? "text-blue-500" : "text-gray-400"}`}>
                      {opt.sublabel}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              {filtered.length} / {options.length} mục
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
