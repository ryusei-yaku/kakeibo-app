import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ES Modulesでは__dirnameが使えないため、現在のファイル位置から作成する
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);

// package.jsonを読み込み、アプリのバージョンを取得する
const packageJsonPath = path.resolve(
    currentDirectoryPath,
    "package.json"
);

const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf-8")
) as {
    version: string;
};

export default defineConfig({
    plugins: [react()],
    define: {
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(
            packageJson.version
        ),
    },
});