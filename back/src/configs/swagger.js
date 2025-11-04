import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Entertainment Web App API",
      version: "0.5",
    },
    servers: [
      { url: "http://localhost:3000", description: "Localhost" },
      {
        url: "https://watch-api-wellsz.vercel.app",
        description: "Vercel Production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication routes" },
      { name: "User", description: "User management routes" },
      { name: "Lists", description: "Custom list management routes" },
    ],
  },
  apis: [path.resolve(__dirname, "../routes/*.js")],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
