import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
declare global { interface Window { __VITE_API_URL?: string } }
window.__VITE_API_URL = import.meta.env.VITE_API_URL;

createRoot(document.getElementById("root")!).render(<App />);
