import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User.js';

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'int' })
    userId!: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    token!: string;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt!: Date;

    @Column({ type: 'timestamp with time zone' })
    expiresAt!: Date;

    // Relations
    @ManyToOne(() => User, user => user.sessions)
    @JoinColumn({ name: 'userId' })
    user!: User;
} 