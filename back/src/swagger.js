import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Entertainment Web App API",
      version: "0.5",
      description: "EWApp API Documentation",
    },
  },
  apis: ["src/configs/router.js"],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
