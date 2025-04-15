import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SessionService } from '../services/SessionService.js';

interface JwtPayload {
    userId: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
            };
        }
    }
}

const sessionService = new SessionService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
        
        // Validate session
        const isValidSession = await sessionService.validateSession(token);
        if (!isValidSession) {
            return res.status(401).json({ error: 'Session expired' });
        }

        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}; 