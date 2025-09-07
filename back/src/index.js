import "dotenv/config";
import express from "express";
import path from "path";
import router from "./routes/router.js";
import { specs, swaggerUi } from "./configs/swagger.js";

const app = express();

const swaggerDistPath = path.join(
  process.cwd(),
  "node_modules",
  "swagger-ui-dist"
);

app.use("/docs", express.static(swaggerDistPath, { index: false }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  if (process.env.PORT) {
    console.log("Server running in production environment.");
  } else {
    console.log(`App running locally at http://localhost:${port}/`);
  }
});
