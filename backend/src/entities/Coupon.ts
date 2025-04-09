import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { CouponRedemption } from './CouponRedemption.js';

export enum CouponStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    USED_UP = 'used_up'
}

@Entity('coupons')
export class Coupon {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    code!: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    bonus_amount!: number;

    @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
    valid_from!: Date;

    @Column({ type: 'timestamp with time zone' })
    valid_until!: Date;

    @Column({ type: 'int', default: 1 })
    max_uses!: number;

    @Column({ type: 'int', default: 0 })
    used_count!: number;

    @Column({
        type: 'enum',
        enum: CouponStatus,
        default: CouponStatus.ACTIVE
    })
    status!: CouponStatus;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

    // Relations
    @OneToMany(() => CouponRedemption, redemption => redemption.coupon)
    redemptions!: CouponRedemption[];
} 