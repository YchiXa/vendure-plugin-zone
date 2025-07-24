import { bootstrap, runMigrations } from "@vendure/core";
import { config } from "./vendure-config";

// Run database migrations and then start the Vendure server
runMigrations(config)
  .then(() => bootstrap(config))
  .catch((err) => {
    console.error("Failed to run migrations or start Vendure server:", err);
  });
