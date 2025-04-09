import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Bet } from './Bet.js';

@Entity('games')
export class Game {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 50 })
    type!: string;

    @Column({ type: 'jsonb', nullable: true })
    config?: Record<string, any>;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    // Relations
    @OneToMany(() => Bet, bet => bet.game)
    bets!: Bet[];
} 