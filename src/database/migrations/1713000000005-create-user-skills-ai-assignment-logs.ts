import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUserSkillsAiAssignmentLogs1713000000005
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_skills',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'skill_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'level_score',
            type: 'int',
            isNullable: false,
            default: 50,
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
        uniques: [
          {
            name: 'uq_user_skills_user_skill_name',
            columnNames: ['user_id', 'skill_name'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('user_skills', [
      new TableIndex({
        name: 'idx_user_skills_user_id',
        columnNames: ['user_id'],
      }),
    ]);

    await queryRunner.createForeignKey(
      'user_skills',
      new TableForeignKey({
        name: 'fk_user_skills_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'ai_assignment_logs',
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
            name: 'recommended_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'final_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'reason_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'score_breakdown_json',
            type: 'json',
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

    await queryRunner.createIndices('ai_assignment_logs', [
      new TableIndex({
        name: 'idx_ai_assignment_logs_task_id',
        columnNames: ['task_id'],
      }),
      new TableIndex({
        name: 'idx_ai_assignment_logs_recommended_user_id',
        columnNames: ['recommended_user_id'],
      }),
    ]);

    await queryRunner.createForeignKeys('ai_assignment_logs', [
      new TableForeignKey({
        name: 'fk_ai_assignment_logs_task_id',
        columnNames: ['task_id'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'fk_ai_assignment_logs_recommended_user_id',
        columnNames: ['recommended_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const aiLogsTable = await queryRunner.getTable('ai_assignment_logs');
    if (aiLogsTable) {
      await queryRunner.dropForeignKeys(
        'ai_assignment_logs',
        aiLogsTable.foreignKeys,
      );
      await queryRunner.dropIndices('ai_assignment_logs', aiLogsTable.indices);
    }

    const userSkillsTable = await queryRunner.getTable('user_skills');
    if (userSkillsTable) {
      await queryRunner.dropForeignKeys(
        'user_skills',
        userSkillsTable.foreignKeys,
      );
      await queryRunner.dropIndices('user_skills', userSkillsTable.indices);
    }

    await queryRunner.dropTable('ai_assignment_logs', true);
    await queryRunner.dropTable('user_skills', true);
  }
}