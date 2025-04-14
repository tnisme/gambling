import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User.js';
import { Game } from './Game.js';
import { Transaction } from './Transaction.js';

export enum BetOutcome {
    WIN = 'win',
    LOSS = 'loss',
    PENDING = 'pending'
}

@Entity('bets')
export class Bet {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'int' })
    userId!: number;

    @Column({ type: 'int' })
    gameId!: number;

    @Column({ type: 'int' })
    transactionId!: number;

    @Column({ type: 'int', nullable: true })
    winTransactionId?: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount!: number;

    @Column({ type: 'varchar' })
    betType!: string;

    @Column({ type: 'varchar' })
    betValue!: string;

    @Column({
        type: 'enum',
        enum: BetOutcome,
        default: BetOutcome.PENDING
    })
    outcome!: BetOutcome;

    @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
    payoutAmount?: number;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    @Column({ type: 'timestamp with time zone', nullable: true })
    resolvedAt?: Date;

    // Relations
    @ManyToOne(() => User, user => user.bets)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ManyToOne(() => Game, game => game.bets)
    @JoinColumn({ name: 'gameId' })
    game!: Game;

    @ManyToOne(() => Transaction, transaction => transaction.bets)
    @JoinColumn({ name: 'transactionId' })
    transaction!: Transaction;

    @ManyToOne(() => Transaction, transaction => transaction.winBets)
    @JoinColumn({ name: 'winTransactionId' })
    winTransaction?: Transaction;
} 