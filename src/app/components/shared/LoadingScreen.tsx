// ============================================================
// LoadingScreen — Màn hình loading khởi động ứng dụng
// ============================================================

import { useEffect, useState } from "react";
import { Shield, Database, CheckCircle2 } from "lucide-react";

const STEPS = [
  { label: "Khởi tạo hệ thống...", delay: 0 },
  { label: "Đang tải dữ liệu tang vật...", delay: 400 },
  { label: "Đang tải cấu hình & phân quyền...", delay: 800 },
  { label: "Sẵn sàng!", delay: 1100 },
];

interface LoadingScreenProps {
  onDone: () => void;
  duration?: number;
}

export function LoadingScreen({ onDone, duration = 1400 }: LoadingScreenProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Step messages
    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => setStepIdx(i), step.delay));
    });

    // Progress bar — tăng dần đến 95% trong duration, sau đó 100% khi done
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(interval);
          return 95;
        }
        return p + 3;
      });
    }, duration / 35);

    // Done
    const doneTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(onDone, 200);
    }, duration);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
      clearInterval(interval);
    };
  }, [onDone, duration]);

  const currentStep = STEPS[stepIdx];
  const isDone = stepIdx === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0d3b66 0%, #1a5c9a 50%, #0d3b66 100%)" }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white"
            style={{
              width: `${60 + i * 40}px`,
              height: `${60 + i * 40}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-sm w-full">
        {/* Logo / Icon */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}
          >
            {isDone ? (
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            ) : (
              <Shield className="w-12 h-12 text-white" />
            )}
          </div>
          {/* Spinner ring */}
          {!isDone && (
            <div
              className="absolute -inset-2 rounded-2xl border-2 border-white/30 border-t-white/80 animate-spin"
              style={{ borderRadius: "18px" }}
            />
          )}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Quản lý Tang Vật
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Vi phạm Hành chính — Ninh Bình
          </p>
        </div>

        {/* Progress */}
        <div className="w-full space-y-3">
          {/* Bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step label */}
          <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="transition-all">{currentStep.label}</span>
          </div>
        </div>

        {/* Version */}
        <p className="text-white/30 text-xs absolute bottom-8 left-0 right-0 text-center">
          v1.0.0 — Demo LocalStorage
        </p>
      </div>
    </div>
  );
}
