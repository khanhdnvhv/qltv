import { RouterProvider } from "react-router";
import { router } from "./routes";
import { StoreContext, appStore } from "./lib/store";
import { Toaster } from "sonner";

export default function App() {
  return (
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
  );
}
