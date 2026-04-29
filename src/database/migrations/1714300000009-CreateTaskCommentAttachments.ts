import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskCommentAttachments1714300000000
  implements MigrationInterface
{
  name = 'CreateTaskCommentAttachments1714300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "task_comment_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "comment_id" uuid NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "file_url" text NOT NULL,
        "mime_type" character varying(255),
        "size_bytes" integer,
        CONSTRAINT "PK_task_comment_attachments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "task_comment_attachments"
      ADD CONSTRAINT "FK_task_comment_attachments_comment_id"
      FOREIGN KEY ("comment_id")
      REFERENCES "task_comments"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "task_comment_attachments"
      DROP CONSTRAINT "FK_task_comment_attachments_comment_id"
    `);

    await queryRunner.query(`
      DROP TABLE "task_comment_attachments"
    `);
  }
}