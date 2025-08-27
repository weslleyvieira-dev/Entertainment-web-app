import express from "express";
import router from "./configs/router.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/", router);

app.listen(process.env.PORT || 3000, () => {
  console.log(`App running on ${process.env.PORT || "http://localhost:3000/"}`);
});
