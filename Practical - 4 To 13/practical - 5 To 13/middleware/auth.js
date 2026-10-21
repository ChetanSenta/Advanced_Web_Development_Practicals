import jwt from "jsonwebtoken";

export function requireAuth(request, response, next) {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!token) return response.status(401).json({ message: "Authentication token required." });
  if (!process.env.JWT_SECRET) return next(new Error("JWT_SECRET is not configured."));

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return response.status(401).json({ message: "Authentication token expired." });
    }
    return response.status(401).json({ message: "Invalid authentication token." });
  }
}
