import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, LogIn, Shield, ChevronDown, Lock, User, Star, CheckCircle2, AlertCircle } from "lucide-react";
import { useStoreState } from "../hooks/useStoreState";

// ─── Demo accounts ────────────────────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  { username: "admin",   label: "Quản trị viên",    name: "Nguyễn Văn Hùng", dept: "PC06 - Phòng CSQLHC về TTXH", avatar: "NH", color: "#0d3b66", roleColor: "#c62828" },
  { username: "lanhdao", label: "Lãnh đạo",          name: "Trần Thị Lan",    dept: "PC06 - Phòng CSQLHC về TTXH", avatar: "TL", color: "#1565c0", roleColor: "#1565c0" },
  { username: "thukho",  label: "Thủ kho",           name: "Phạm Văn Đức",    dept: "PC06 - Phòng CSQLHC về TTXH", avatar: "PD", color: "#2e7d32", roleColor: "#2e7d32" },
  { username: "canbonv", label: "Cán bộ nghiệp vụ",  name: "Lê Minh Tuấn",   dept: "CA xã Bình Xuyên",             avatar: "LT", color: "#7b1fa2", roleColor: "#7b1fa2" },
  { username: "viewer",  label: "Xem",               name: "Nguyễn Thị Hoa",  dept: "Thanh tra Công an tỉnh",       avatar: "NH", color: "#5a6a7e", roleColor: "#5a6a7e" },
];

// ─── Police shield SVG ────────────────────────────────────────────────────────
function ShieldLogo({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer glow */}
      <defs>
        <radialGradient id="shieldGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#f5e070" />
          <stop offset="100%" stopColor="#b8972e" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d3b66" />
          <stop offset="100%" stopColor="#0a2f52" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="55" r="50" fill="url(#shieldGlow)" />
      {/* Shield outer */}
      <path d="M60 8 L100 24 L100 56 C100 78 82 96 60 104 C38 96 20 78 20 56 L20 24 Z" fill="url(#shieldGrad)" />
      {/* Shield inner */}
      <path d="M60 16 L93 29 L93 57 C93 75 78 91 60 98 C42 91 27 75 27 57 L27 29 Z" fill="url(#innerGrad)" />
      {/* Star */}
      <polygon points="60,32 63.5,43 75,43 65.8,49.5 69.2,60.5 60,54 50.8,60.5 54.2,49.5 45,43 56.5,43" fill="url(#shieldGrad)" />
      {/* Bottom text area */}
      <rect x="38" y="72" width="44" height="14" rx="3" fill="#d4af37" opacity="0.9" />
      <text x="60" y="82.5" textAnchor="middle" fill="#0d3b66" fontSize="7.5" fontWeight="bold" fontFamily="Arial">CÔNG AN</text>
    </svg>
  );
}

// ─── Floating geometric shapes (background decoration) ───────────────────────
function GeometricBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { w: 180, h: 180, top: "-5%",  left: "-5%",  delay: 0,   dur: 8  },
        { w: 120, h: 120, top: "60%",  left: "5%",   delay: 2,   dur: 10 },
        { w: 80,  h: 80,  top: "20%",  left: "75%",  delay: 1,   dur: 7  },
        { w: 60,  h: 60,  top: "75%",  left: "70%",  delay: 3,   dur: 9  },
        { w: 140, h: 140, top: "40%",  left: "40%",  delay: 1.5, dur: 11 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{ width: s.w, height: s.h, top: s.top, left: s.left }}
          animate={{ y: [0, -20, 0], rotate: [0, 15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Diagonal lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "30px 30px" }}
      />
    </div>
  );
}

// ─── Main LoginPage ───────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, store } = useStoreState();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showDemo, setShowDemo] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate network delay for realism
    await new Promise((r) => setTimeout(r, 900));
    const ok = store.login(username.trim().toLowerCase(), password);
    setLoading(false);
    if (!ok) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
    // navigation handled by useEffect above
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedDemo(acc.username);
    setUsername(acc.username);
    setPassword("Demo@2026");
    setError("");
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══ LEFT PANEL ═══════════════════════════════════════════════════════ */}
      <motion.div
        className="hidden lg:flex flex-col relative w-[46%] overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0a2540 0%, #0d3b66 45%, #0f4880 100%)" }}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <GeometricBg />

        {/* Red top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #c62828, #ef5350, #c62828)" }} />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo + unit name */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)" }}>
              <Shield className="w-6 h-6" style={{ color: "#d4af37" }} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "#d4af37" }}>Bộ Công An</p>
              <p className="text-sm font-bold text-white/90">Công an tỉnh XX</p>
            </div>
          </motion.div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 120 }}
              className="mb-8 drop-shadow-2xl"
            >
              <ShieldLogo size={130} />
            </motion.div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
                style={{ background: "rgba(198,40,40,0.2)", border: "1px solid rgba(198,40,40,0.4)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-red-300 uppercase">Hệ thống chính thức</span>
              </div>

              <h1 className="text-3xl font-extrabold text-white leading-tight mb-3 tracking-tight">
                Quản lý Tang Vật<br />
                <span style={{ color: "#d4af37" }}>Vi phạm Hành chính</span>
              </h1>

              <div className="w-16 h-0.5 mx-auto mb-5" style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }} />

              <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
                Nền tảng quản lý tang vật toàn diện theo NĐ&nbsp;138/2021/NĐ-CP và NĐ&nbsp;31/2023/NĐ-CP
              </p>
            </motion.div>

            {/* Feature highlights */}
            <motion.div
              className="mt-10 space-y-3 text-left w-full max-w-xs"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {[
                "Quản lý vòng đời tang vật từ tiếp nhận đến xử lý",
                "Theo dõi kho bãi và kiểm kê định kỳ",
                "Ký duyệt điện tử & cảnh báo thông minh",
                "Phân quyền theo vai trò, nhật ký toàn diện",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#d4af37" }} />
                  <span className="text-sm text-white/70">{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            className="flex items-center justify-between text-xs text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span>© 2026 Công an tỉnh XX</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3 h-3" style={{ color: "#d4af37", fill: "#d4af37" }} />
              Phiên bản 1.0.0
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ RIGHT PANEL ══════════════════════════════════════════════════════ */}
      <motion.div
        className="flex-1 flex items-center justify-center px-6 py-10 relative overflow-auto"
        style={{ background: "#f0f4f8" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #0d3b66 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 25px 60px rgba(13,59,102,0.15), 0 8px 20px rgba(13,59,102,0.08)" }}>

            {/* Card header */}
            <div className="px-8 pt-8 pb-6 text-center" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-4">
                <ShieldLogo size={70} />
              </div>
              {/* Lock icon */}
              <div className="hidden lg:flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #0d3b66, #1565c0)", boxShadow: "0 8px 20px rgba(13,59,102,0.3)" }}>
                  <Lock className="w-7 h-7 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: "#0d3b66" }}>
                Đăng nhập hệ thống
              </h2>
              <p className="text-sm mt-1.5" style={{ color: "#5a6a7e" }}>
                Quản lý Tang Vật Vi phạm Hành chính
              </p>
            </div>

            {/* Divider */}
            <div className="h-px mx-8" style={{ background: "linear-gradient(90deg, transparent, rgba(13,59,102,0.12), transparent)" }} />

            {/* Form */}
            <form onSubmit={handleLogin} className="px-8 pt-6 pb-8 space-y-5">

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "#ffebee", border: "1px solid #ef9a9a", color: "#c62828" }}
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0d3b66" }}>
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 w-[18px] h-[18px]" style={{ color: "#5a6a7e" }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(""); }}
                    placeholder="Nhập tên đăng nhập"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: "1.5px solid rgba(13,59,102,0.15)",
                      background: "#f8fafc",
                      color: "#0d3b66",
                      fontWeight: 500,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#0d3b66"; e.target.style.boxShadow = "0 0 0 3px rgba(13,59,102,0.1)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "rgba(13,59,102,0.15)"; e.target.style.boxShadow = "none"; }}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0d3b66" }}>
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: "#5a6a7e" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: "1.5px solid rgba(13,59,102,0.15)",
                      background: "#f8fafc",
                      color: "#0d3b66",
                      fontWeight: 500,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#0d3b66"; e.target.style.boxShadow = "0 0 0 3px rgba(13,59,102,0.1)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "rgba(13,59,102,0.15)"; e.target.style.boxShadow = "none"; }}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-opacity hover:opacity-70">
                    {showPass
                      ? <EyeOff className="w-[18px] h-[18px]" style={{ color: "#5a6a7e" }} />
                      : <Eye    className="w-[18px] h-[18px]" style={{ color: "#5a6a7e" }} />
                    }
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm text-white transition-all"
                style={{
                  background: loading ? "#5a8ab0" : "linear-gradient(135deg, #0d3b66 0%, #1565c0 100%)",
                  boxShadow: loading ? "none" : "0 6px 20px rgba(13,59,102,0.35)",
                }}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 8px 24px rgba(13,59,102,0.45)" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </>
                )}
              </motion.button>

              {/* Demo accounts */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(13,59,102,0.1)" }}>
                <button
                  type="button"
                  onClick={() => setShowDemo((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors"
                  style={{ background: showDemo ? "#e8eef5" : "#f0f4f8", color: "#0d3b66" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#0d3b66" }}>
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span>Tài khoản demo</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: "#c62828" }}>5</span>
                  </div>
                  <motion.div animate={{ rotate: showDemo ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" style={{ color: "#5a6a7e" }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showDemo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-2" style={{ background: "#fafbfc" }}>
                        <p className="text-xs text-center mb-2" style={{ color: "#5a6a7e" }}>
                          Mật khẩu chung: <span className="font-bold" style={{ color: "#0d3b66" }}>Demo@2026</span>
                        </p>
                        {DEMO_ACCOUNTS.map((acc) => (
                          <motion.button
                            key={acc.username}
                            type="button"
                            onClick={() => fillDemo(acc)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                            style={{
                              background: selectedDemo === acc.username ? `${acc.color}14` : "white",
                              border: `1.5px solid ${selectedDemo === acc.username ? acc.color + "50" : "rgba(13,59,102,0.08)"}`,
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: acc.color }}>
                              {acc.avatar}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold truncate" style={{ color: "#0d3b66" }}>{acc.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                                  style={{ background: acc.roleColor + "20", color: acc.roleColor }}>
                                  {acc.label}
                                </span>
                              </div>
                              <p className="text-[11px] truncate" style={{ color: "#5a6a7e" }}>{acc.dept}</p>
                            </div>
                            {/* Tick */}
                            {selectedDemo === acc.username && (
                              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: acc.color }} />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs mt-5" style={{ color: "#5a6a7e" }}>
            Hệ thống dành cho cán bộ Công an có thẩm quyền.
            <br />Mọi truy cập đều được ghi lại.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
