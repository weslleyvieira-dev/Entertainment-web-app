import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Entertainment Web App API",
      version: "0.5",
    },
    servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token:",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication routes" },
      { name: "Bookmarks", description: "Bookmark management routes" },
      { name: "User", description: "User management routes" },
    ],
  },
  apis: ["src/routes/*"],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
