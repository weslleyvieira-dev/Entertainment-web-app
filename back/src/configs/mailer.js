import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GOOGLE_USER,
    pass: process.env.GOOGLE_PASS,
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".html",
      partialsDir: path.resolve("./src/utils/templates/emails"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/utils/templates/emails"),
    extName: ".html",
  })
);

export default transporter;
