import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserSession } from './UserSession.js';
import { Transaction } from './Transaction.js';
import { Deposit } from './Deposit.js';
import { Bet } from './Bet.js';

export enum UserStatus {
    ACTIVE = 'active',
    BANNED = 'banned',
    INACTIVE = 'inactive'
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    username!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash!: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    balance!: number;

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    status!: UserStatus;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role!: UserRole;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt!: Date;

    // Relations
    @OneToMany(() => UserSession, session => session.user)
    sessions!: UserSession[];

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions!: Transaction[];

    @OneToMany(() => Deposit, deposit => deposit.user)
    deposits!: Deposit[];

    @OneToMany(() => Bet, bet => bet.user)
    bets!: Bet[];
} 