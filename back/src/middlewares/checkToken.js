import jwt from "jsonwebtoken";

export function checkToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send("Access denied.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access denied.");
  }
  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send("Invalid or malformed token.");
  }
}
