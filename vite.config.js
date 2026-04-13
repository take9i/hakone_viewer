import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";

/** GitHub Pages の project site（…github.io/リポジトリ名/）向け。Actions では GITHUB_REPOSITORY が自動で入る */
function githubPagesBase() {
  if (process.env.NODE_ENV !== "production") return "/";
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  return repo ? `/${repo}/` : "/";
}

// MUI + Vite: 事前バンドル時に @mui/system と @mui/material の CJS/ESM が混ざると
// createTheme の default 解決が壊れることがある。alias は使わず dedupe + include + mainFields で揃える。
// https://github.com/mui/material-ui/issues/32727
export default defineConfig({
  base: githubPagesBase(),
  plugins: [react(), cesium()],
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "@mui/material",
      "@mui/system",
      "@emotion/react",
      "@emotion/styled",
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      mainFields: ["module", "main"],
    },
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/material/styles",
      "@mui/system",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "@mui/x-date-pickers/LocalizationProvider",
      "@mui/x-date-pickers/DateTimePicker",
      "@mui/x-date-pickers/AdapterDayjs",
    ],
  },
});
