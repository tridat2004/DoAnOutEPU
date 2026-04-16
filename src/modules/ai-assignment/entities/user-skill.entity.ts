import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_skills')
@Unique('uq_user_skills_user_skill_name', ['user', 'skillName'])
export class UserSkill extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userSkills, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'skill_name', type: 'varchar', length: 100 })
  skillName!: string;

  @Column({ name: 'level_score', type: 'int', default: 50 })
  levelScore!: number;
}