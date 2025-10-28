import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { enableMapSet } from "immer";

import { Toaster } from "@/components/ui/sonner";

import { App } from "@/app.tsx";
import { store } from "@/store/store";

enableMapSet();

const ROOT_ELEMENT_ID = "root";

const rootEl = document && document.getElementById(ROOT_ELEMENT_ID);

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <Provider store={store}>
        <App />
        <Toaster />
      </Provider>
    </StrictMode>,
  );
}
