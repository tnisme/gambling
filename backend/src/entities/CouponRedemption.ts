import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Coupon } from './Coupon.js';
import { User } from './User.js';
import { Transaction } from './Transaction.js';

@Entity('coupon_redemptions')
export class CouponRedemption {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'int' })
    coupon_id!: number;

    @Column({ type: 'int' })
    user_id!: number;

    @Column({ type: 'int' })
    transaction_id!: number;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    redeemed_at!: Date;

    // Relations
    @ManyToOne(() => Coupon, coupon => coupon.redemptions)
    @JoinColumn({ name: 'coupon_id' })
    coupon!: Coupon;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Transaction)
    @JoinColumn({ name: 'transaction_id' })
    transaction!: Transaction;
} 