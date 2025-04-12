import jwt from 'jsonwebtoken';
import { User } from '../Schema/schema.js';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = async (req, res, next) => {
    const authorization = req.headers.authorization 
    const token = authorization && authorization.startsWith('Bearer') 
        ? authorization.split(' ')[1] 
        : null;
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS);
        const user = await User.findById(decoded._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        req.user = user;
        next();

    } catch (error) {
        console.error("Erreur d'authentification:", error);
        return res.status(403).json({ 
            message: error.name === 'TokenExpiredError' 
                   ? 'Token expiré' 
                   : 'Token invalide'
        });
    }
};