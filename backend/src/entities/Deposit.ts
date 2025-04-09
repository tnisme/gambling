import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.js';
import { Transaction } from './Transaction.js';

export enum DepositStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

@Entity('deposits')
export class Deposit {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'int' })
    userId!: number;

    @Column({ type: 'int' })
    transactionId!: number;

    @Column({ type: 'varchar', length: 50 })
    paymentMethod!: string;

    @Column({
        type: 'enum',
        enum: DepositStatus,
        default: DepositStatus.PENDING
    })
    status!: DepositStatus;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt!: Date;

    // Relations
    @ManyToOne(() => User, user => user.deposits)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Transaction, transaction => transaction.deposits)
    @JoinColumn({ name: 'transactionId' })
    transaction!: Transaction;
} 