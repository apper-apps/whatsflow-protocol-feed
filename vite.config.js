import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") }},
  server: { allowedHosts: true, host: true, strictPort: true, port: 5173 }
});