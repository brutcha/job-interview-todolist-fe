import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";

const ROOT_ELEMENT_ID = "root";

const rootEl = document && document.getElementById(ROOT_ELEMENT_ID);

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
