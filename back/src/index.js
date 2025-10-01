import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/router.js";
import { specs, swaggerUi } from "./configs/swagger.js";

const app = express();

const swaggerDistPath = path.join(
  process.cwd(),
  "node_modules",
  "swagger-ui-dist"
);

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use("/docs", express.static(swaggerDistPath, { index: false }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.use("/", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (process.env.PORT) {
    console.log("Server running in production environment.");
  } else {
    console.log(`App running locally at http://localhost:${port}/`);
  }
});
