import { RouterProvider } from "react-router";
import { router } from "./routes";
import { StoreContext, appStore } from "./lib/store";
import { Toaster } from "sonner";
import { Component, ReactNode, useState } from "react";
import { LoadingScreen } from "./components/shared/LoadingScreen";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", color: "#c00" }}>
          <h2>Lỗi khởi động ứng dụng</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>
            {(this.state.error as Error).message}
            {"\n\n"}
            {(this.state.error as Error).stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} duration={1400} />;
  }

  return (
    <ErrorBoundary>
      <StoreContext.Provider value={appStore}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: "'Inter', system-ui, sans-serif" },
          }}
        />
      </StoreContext.Provider>
    </ErrorBoundary>
  );
}
