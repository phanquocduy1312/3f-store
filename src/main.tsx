import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { CustomerAuthProvider } from "@/src/context/CustomerAuthContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
import "@/src/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CustomerAuthProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CustomerAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
