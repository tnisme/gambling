import { EntityManager } from 'typeorm';
import { Coupon, CouponStatus } from '../entities/Coupon.js';
import { CouponRedemption } from '../entities/CouponRedemption.js';
import { Transaction } from '../entities/Transaction.js';
import { User } from '../entities/User.js';
import { TransactionType } from '../entities/Transaction.js';

export class CouponService {
    constructor(private readonly entityManager: EntityManager) {}

    async applyCoupon(userId: number, couponCode: string): Promise<{ success: boolean; message: string; transaction?: Transaction }> {
        return this.entityManager.transaction(async (transactionalEntityManager) => {
            // Find the coupon
            const coupon = await transactionalEntityManager.findOne(Coupon, {
                where: { code: couponCode }
            });

            if (!coupon) {
                return { success: false, message: 'Coupon not found' };
            }

            // Check if coupon is valid
            if (coupon.status !== CouponStatus.ACTIVE) {
                return { success: false, message: 'Coupon is not active' };
            }

            if (new Date() > coupon.valid_until) {
                return { success: false, message: 'Coupon has expired' };
            }

            if (coupon.used_count >= coupon.max_uses) {
                return { success: false, message: 'Coupon has been used up' };
            }

            // Check if user has already used this coupon
            const existingRedemption = await transactionalEntityManager.findOne(CouponRedemption, {
                where: {
                    user_id: userId,
                    coupon_id: coupon.id
                }
            });

            if (existingRedemption) {
                return { success: false, message: 'You have already used this coupon' };
            }

            // Create transaction
            const transaction = new Transaction();
            transaction.userId = userId;
            transaction.type = TransactionType.COUPON;
            transaction.amount = coupon.bonus_amount;
            transaction.createdAt = new Date();

            const savedTransaction = await transactionalEntityManager.save(Transaction, transaction);

            // Update user balance
            await transactionalEntityManager
                .createQueryBuilder()
                .update(User)
                .set({ balance: () => `balance + ${coupon.bonus_amount}` })
                .where("id = :id", { id: userId })
                .execute();

            // Create coupon redemption
            const redemption = new CouponRedemption();
            redemption.coupon_id = coupon.id;
            redemption.user_id = userId;
            redemption.transaction_id = savedTransaction.id;
            redemption.redeemed_at = new Date();

            await transactionalEntityManager.save(CouponRedemption, redemption);

            // Update coupon usage count
            coupon.used_count += 1;
            if (coupon.used_count >= coupon.max_uses) {
                coupon.status = CouponStatus.USED_UP;
            }
            await transactionalEntityManager.save(Coupon, coupon);

            return {
                success: true,
                message: 'Coupon applied successfully',
                transaction: savedTransaction
            };
        });
    }
} 