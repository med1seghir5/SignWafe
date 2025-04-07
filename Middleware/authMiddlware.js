import jwt from 'jsonwebtoken';
import { Users } from '../Schema/schema.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export const authenticateToken = async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS);
        const user = await Users.findById(decoded._id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Attacher l'utilisateur à la requête
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