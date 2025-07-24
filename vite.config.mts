import { vendureDashboardPlugin } from "@vendure/dashboard/plugin";
import { pathToFileURL } from "url";
import { defineConfig } from "vite";
import path, { resolve, join } from "path";

export default defineConfig({
  build: {
    outDir: join(__dirname, "dist/dashboard"), // Output directory for the dashboard build
  },
  // @ts-expect-error: type incompatibility due to different Vite versions
  plugins: [
    ...vendureDashboardPlugin({
      vendureConfigPath: pathToFileURL(
        path.resolve(__dirname, "./src/vendure-config.ts")
      ), // Path to Vendure config file
      adminUiConfig: {
        apiHost: "http://localhost", // Host for the Vendure Admin API
        apiPort: 3000, // Port for the Vendure Admin API
      },
      gqlTadaOutputPath: "./src/gql", // TypeScript SDK will be generated here
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"), // Shortcut for imports from src
      "@gql": resolve(__dirname, "./src/gql/graphql.ts"), // Shortcut for GraphQL SDK imports
    },
  },
});
