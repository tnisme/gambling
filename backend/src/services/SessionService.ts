import { AppDataSource } from '../config/database.js';
import { UserSession } from '../entities/UserSession.js';
import { User } from '../entities/User.js';

export class SessionService {
    private sessionRepository = AppDataSource.getRepository(UserSession);

    async createSession(user: User, token: string): Promise<UserSession> {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes from now

        const session = this.sessionRepository.create({
            userId: user.id,
            token,
            expiresAt
        });

        return await this.sessionRepository.save(session);
    }

    async validateSession(token: string): Promise<boolean> {
        const session = await this.sessionRepository.findOne({
            where: { token }
        });

        if (!session) {
            return false;
        }

        // Check if session is expired
        if (session.expiresAt < new Date()) {
            await this.deleteSession(token);
            return false;
        }

        return true;
    }

    async deleteSession(token: string): Promise<void> {
        await this.sessionRepository.delete({ token });
    }

    async deleteExpiredSessions(): Promise<void> {
        const now = new Date();
        await this.sessionRepository
            .createQueryBuilder()
            .delete()
            .where('expiresAt < :now', { now })
            .execute();
    }
} 