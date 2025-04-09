import { AppDataSource } from '../config/database.js';
import { Deposit, DepositStatus } from '../entities/Deposit.js';
import { Transaction, TransactionType } from '../entities/Transaction.js';
import { User } from '../entities/User.js';

export class DepositService {
    private depositRepository = AppDataSource.getRepository(Deposit);
    private transactionRepository = AppDataSource.getRepository(Transaction);
    private userRepository = AppDataSource.getRepository(User);

    async createDeposit(userId: number, amount: number, paymentMethod: string): Promise<Deposit> {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create transaction
            const transaction = this.transactionRepository.create({
                userId,
                type: TransactionType.DEPOSIT,
                amount
            });
            await queryRunner.manager.save(transaction);

            // Create deposit
            const deposit = this.depositRepository.create({
                userId,
                transactionId: transaction.id,
                paymentMethod,
                status: DepositStatus.PENDING
            });
            await queryRunner.manager.save(deposit);

            // Update user balance
            await queryRunner.manager
                .createQueryBuilder()
                .update(User)
                .set({ balance: () => `balance + ${amount}` })
                .where("id = :id", { id: userId })
                .execute();

            // Update deposit status to completed
            deposit.status = DepositStatus.COMPLETED;
            await queryRunner.manager.save(deposit);

            await queryRunner.commitTransaction();
            return deposit;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getDeposits(userId: number): Promise<Deposit[]> {
        return this.depositRepository.find({
            where: { userId },
            relations: ['transaction'],
            order: { createdAt: 'DESC' }
        });
    }

    async getDepositById(userId: number, depositId: number): Promise<Deposit> {
        const deposit = await this.depositRepository.findOne({
            where: { id: depositId, userId },
            relations: ['transaction']
        });

        if (!deposit) {
            throw new Error('Deposit not found');
        }

        return deposit;
    }
} 