import { User } from "../Schema/schema.js";


export const isAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.Role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé. Rôle admin requis." });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
