import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

const templatesPath = path.resolve(__dirname, "../utils/templates/emails");

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".html",
      partialsDir: templatesPath,
      defaultLayout: false,
    },
    viewPath: templatesPath,
    extName: ".html",
  })
);

export default transporter;
