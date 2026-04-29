import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTaskCommentAttachmentsForTaskFiles1777500000000
  implements MigrationInterface
{
  name = 'UpdateTaskCommentAttachmentsForTaskFiles1777500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      ADD COLUMN IF NOT EXISTS task_id uuid
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      ADD COLUMN IF NOT EXISTS uploaded_by_id uuid
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      ALTER COLUMN comment_id DROP NOT NULL
    `);

    await queryRunner.query(`
      UPDATE task_comment_attachments tca
      SET task_id = tc.task_id
      FROM task_comments tc
      WHERE tca.comment_id = tc.id
      AND tca.task_id IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      ALTER COLUMN task_id SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      ADD CONSTRAINT fk_task_comment_attachments_task
      FOREIGN KEY (task_id)
      REFERENCES tasks(id)
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      ADD CONSTRAINT fk_task_comment_attachments_uploaded_by
      FOREIGN KEY (uploaded_by_id)
      REFERENCES users(id)
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      DROP CONSTRAINT IF EXISTS fk_task_comment_attachments_uploaded_by
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      DROP CONSTRAINT IF EXISTS fk_task_comment_attachments_task
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      DROP COLUMN IF EXISTS uploaded_by_id
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      DROP COLUMN IF EXISTS task_id
    `);

    await queryRunner.query(`
      ALTER TABLE task_comment_attachments
      DROP COLUMN IF EXISTS created_at
    `);
  }
}