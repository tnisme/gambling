import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Bet } from './Bet.js';

export enum GameType {
    ROULETTE = 'roulette',
    BLACKJACK = 'blackjack',
    SLOTS = 'slots'
}

@Entity('games')
export class Game {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({
        type: 'enum',
        enum: GameType,
        default: GameType.ROULETTE
    })
    type!: GameType;

    @Column({ type: 'jsonb', nullable: true })
    config?: Record<string, any>;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    // Relations
    @OneToMany(() => Bet, bet => bet.game)
    bets!: Bet[];
} 