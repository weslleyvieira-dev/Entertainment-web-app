import jwt from "jsonwebtoken";

export async function checkToken(req, res, next) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ token: "Token is missing." });
  }

  const token = authToken.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ token: "Token expired or invalid." });
  }
}
