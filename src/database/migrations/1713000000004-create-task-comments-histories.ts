import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTaskCommentsHistories1713000000004
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'task_comments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'task_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'author_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('task_comments', [
      new TableIndex({
        name: 'idx_task_comments_task_id',
        columnNames: ['task_id'],
      }),
      new TableIndex({
        name: 'idx_task_comments_author_user_id',
        columnNames: ['author_user_id'],
      }),
    ]);

    await queryRunner.createForeignKeys('task_comments', [
      new TableForeignKey({
        name: 'fk_task_comments_task_id',
        columnNames: ['task_id'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'fk_task_comments_author_user_id',
        columnNames: ['author_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'task_histories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'task_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'changed_by_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'field_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'old_value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'new_value',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('task_histories', [
      new TableIndex({
        name: 'idx_task_histories_task_id',
        columnNames: ['task_id'],
      }),
      new TableIndex({
        name: 'idx_task_histories_changed_by_user_id',
        columnNames: ['changed_by_user_id'],
      }),
    ]);

    await queryRunner.createForeignKeys('task_histories', [
      new TableForeignKey({
        name: 'fk_task_histories_task_id',
        columnNames: ['task_id'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'fk_task_histories_changed_by_user_id',
        columnNames: ['changed_by_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const taskCommentsTable = await queryRunner.getTable('task_comments');
    if (taskCommentsTable) {
      await queryRunner.dropForeignKeys('task_comments', taskCommentsTable.foreignKeys);
      await queryRunner.dropIndices('task_comments', taskCommentsTable.indices);
    }

    const taskHistoriesTable = await queryRunner.getTable('task_histories');
    if (taskHistoriesTable) {
      await queryRunner.dropForeignKeys('task_histories', taskHistoriesTable.foreignKeys);
      await queryRunner.dropIndices('task_histories', taskHistoriesTable.indices);
    }

    await queryRunner.dropTable('task_histories', true);
    await queryRunner.dropTable('task_comments', true);
  }
}