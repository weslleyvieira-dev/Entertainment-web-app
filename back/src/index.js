import express from "express";

const app = express();

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server running on ${process.env.PORT || "http://localhost:3000/"}`
  );
});
