import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { CustomerAuthProvider } from "@/src/context/CustomerAuthContext";
import "@/src/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CustomerAuthProvider>
        <App />
      </CustomerAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
