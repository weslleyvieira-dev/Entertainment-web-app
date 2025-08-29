import jwt from "jsonwebtoken";

export async function checkToken(req, res, next) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).send("Token is missing.");
  }

  const token = authToken.split(" ")[1];

  try {
    jwt.verify(token, process.env.SECRET);
    next();
  } catch (error) {
    return res.status(401).send("Token expired or invalid.");
  }
}
