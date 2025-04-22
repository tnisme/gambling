import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlackjackGame1713081600001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "games" ("name", "type", "config", "createdAt", "updatedAt")
            VALUES (
                'Blackjack',
                'blackjack',
                '{"minBet": 1, "maxBet": 1000}',
                NOW(),
                NOW()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "games"
            WHERE "name" = 'Blackjack';
        `);
    }
} 