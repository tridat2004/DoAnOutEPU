import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskCommentReactions1714300000001
  implements MigrationInterface
{
  name = 'CreateTaskCommentReactions1714300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "task_comment_reactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "comment_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "emoji" character varying(16) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_task_comment_reactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_task_comment_reactions_comment_user_emoji"
          UNIQUE ("comment_id", "user_id", "emoji")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "task_comment_reactions"
      ADD CONSTRAINT "FK_task_comment_reactions_comment_id"
      FOREIGN KEY ("comment_id")
      REFERENCES "task_comments"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "task_comment_reactions"
      ADD CONSTRAINT "FK_task_comment_reactions_user_id"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "task_comment_reactions"
      DROP CONSTRAINT "FK_task_comment_reactions_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "task_comment_reactions"
      DROP CONSTRAINT "FK_task_comment_reactions_comment_id"
    `);

    await queryRunner.query(`
      DROP TABLE "task_comment_reactions"
    `);
  }
}