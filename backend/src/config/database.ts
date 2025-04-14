import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
import { Bet } from '../entities/Bet.js';
import { Game } from '../entities/Game.js';
import { Transaction } from '../entities/Transaction.js';
import { Deposit } from '../entities/Deposit.js';
import { UserSession } from '../entities/UserSession.js';
import { Coupon } from '../entities/Coupon.js';
import { CouponRedemption } from '../entities/CouponRedemption.js';
import { AddAmericanRouletteGame1713081600000 } from '../migrations/1713081600000-AddAmericanRouletteGame.js';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "gamblingDatabase",
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: [
        User,
        Bet,
        Game,
        Transaction,
        Deposit,
        UserSession,
        Coupon,
        CouponRedemption
    ],
    migrations: [
        AddAmericanRouletteGame1713081600000
    ],
    subscribers: []
}); 