import { Request, Response } from 'express';
import { DepositService } from '../services/DepositService.js';
import { DepositDto } from '../dto/DepositDto.js';

interface AuthenticatedRequest extends Request {
    user: {
        id: number;
    };
}

export class DepositController {
    private depositService = new DepositService();

    async createDeposit(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user.id;
            const depositDto: DepositDto = req.body;

            if (!depositDto.amount || depositDto.amount <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            if (!depositDto.paymentMethod) {
                return res.status(400).json({ error: 'Payment method is required' });
            }

            const deposit = await this.depositService.createDeposit(
                userId,
                depositDto.amount,
                depositDto.paymentMethod
            );

            return res.status(201).json(deposit);
        } catch (error: unknown) {
            console.error('Error creating deposit:', error);
            return res.status(500).json({ error: 'Failed to create deposit' });
        }
    }

    async getDeposits(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user.id;
            const deposits = await this.depositService.getDeposits(userId);
            return res.json(deposits);
        } catch (error: unknown) {
            console.error('Error getting deposits:', error);
            return res.status(500).json({ error: 'Failed to get deposits' });
        }
    }

    async getDepositById(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user.id;
            const depositId = parseInt(req.params.id);

            if (isNaN(depositId)) {
                return res.status(400).json({ error: 'Invalid deposit ID' });
            }

            const deposit = await this.depositService.getDepositById(userId, depositId);
            return res.json(deposit);
        } catch (error: unknown) {
            console.error('Error getting deposit:', error);
            if (error instanceof Error && error.message === 'Deposit not found') {
                return res.status(404).json({ error: 'Deposit not found' });
            }
            return res.status(500).json({ error: 'Failed to get deposit' });
        }
    }
} 