// Vendure configuration file
import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSchedulerPlugin,
  DefaultSearchPlugin,
  VendureConfig,
  LanguageCode,
} from "@vendure/core";
import {
  defaultEmailHandlers,
  EmailPlugin,
  FileBasedTemplateLoader,
} from "@vendure/email-plugin";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import { GraphiqlPlugin } from "@vendure/graphiql-plugin";
import "dotenv/config";
import path from "path";
import { DeliveryZonePlugin } from "./plugins/delivery-zone/delivery-zone.plugin";

// Check if the environment is development
const IS_DEV = process.env.APP_ENV === "dev";
const serverPort = +process.env.PORT || 3000;

export const config: VendureConfig = {
  apiOptions: {
    port: serverPort, // API server port
    adminApiPath: "admin-api", // Path for Admin API
    shopApiPath: "shop-api", // Path for Shop API
    ...(IS_DEV
      ? {
          adminApiDebug: true, // Enable Admin API debug in dev
          shopApiDebug: true, // Enable Shop API debug in dev
        }
      : {}),
  },
  authOptions: {
    tokenMethod: ["bearer", "cookie"], // Supported auth methods
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
    },
  },
  dbConnectionOptions: {
    type: "postgres", // Database type
    synchronize: false, // Never use true in production!
    migrations: [path.join(__dirname, "./migrations/*.+(js|ts)")], // Path to migrations
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler], // Payment handlers
  },
  customFields: {
    Address: [
      {
        name: "latitude",
        type: "float",
        label: [{ languageCode: LanguageCode.en, value: "Latitude" }],
      },
      {
        name: "longitude",
        type: "float",
        label: [{ languageCode: LanguageCode.en, value: "Longitude" }],
      },
    ],
  },
  plugins: [
    GraphiqlPlugin.init(), // Enables GraphiQL playground
    AssetServerPlugin.init({
      route: "assets", // Route for asset server
      assetUploadDir: path.join(__dirname, "../static/assets"), // Directory for uploaded assets
      assetUrlPrefix: IS_DEV ? undefined : "https://www.my-shop.com/assets/", // CDN prefix in production
    }),
    DefaultSchedulerPlugin.init(), // Job scheduler
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }), // Job queue using DB
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }), // Search plugin
    EmailPlugin.init({
      devMode: true, // Enable dev mode for emails
      outputPath: path.join(__dirname, "../static/email/test-emails"), // Where to output test emails
      route: "mailbox", // Route for mailbox
      handlers: defaultEmailHandlers, // Default email handlers
      templateLoader: new FileBasedTemplateLoader(
        path.join(__dirname, "../static/email/templates")
      ), // Loads email templates from file system
      globalTemplateVars: {
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: "http://localhost:8080/verify",
        passwordResetUrl: "http://localhost:8080/password-reset",
        changeEmailAddressUrl:
          "http://localhost:8080/verify-email-address-change",
      },
    }),

    // ❗ Connect the plugin with the React dashboard
    DeliveryZonePlugin.init({}),
  ],
};
