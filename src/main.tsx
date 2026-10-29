import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isDesktop } from "./desktop-window";
import "./styles.css";

if (isDesktop) document.documentElement.classList.add("is-desktop");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
