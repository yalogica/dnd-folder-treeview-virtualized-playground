import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "@/app"
import "@/index.css";

const $app = document.getElementById("app");
if ($app) {
    ReactDOM.createRoot($app).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}