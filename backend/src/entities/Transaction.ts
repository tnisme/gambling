import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './User.js';
import { Deposit } from './Deposit.js';
import { Bet } from './Bet.js';

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    BET = 'bet',
    WIN = 'win'
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'int' })
    userId!: number;

    @Column({
        type: 'enum',
        enum: TransactionType
    })
    type!: TransactionType;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount!: number;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    // Relations
    @ManyToOne(() => User, user => user.transactions)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @OneToMany(() => Deposit, deposit => deposit.transaction)
    deposits!: Deposit[];

    @OneToMany(() => Bet, bet => bet.transaction)
    bets!: Bet[];

    @OneToMany(() => Bet, bet => bet.winTransaction)
    winBets!: Bet[];
} 