import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { ListUsersDto } from './dto/list-users.dto';
import { successResponse } from '../../common/response';
import { AppErrors } from '../../common/exceptions/exception';

type CreateUserInput = {
  email: string;
  username: string;
  fullName: string;
  passwordHash: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  findById(id: string) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findAll(query: ListUsersDto) {
    const keyword = query.keyword?.trim();
    const limit = query.limit ?? 20;
    const onlyActive = query.onlyActive ?? true;

    try {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .select([
          'user.id',
          'user.email',
          'user.username',
          'user.fullName',
          'user.avatarUrl',
          'user.isActive',
          'user.createdAt',
          'user.updatedAt',
        ])
        .orderBy('user.fullName', 'ASC')
        .take(limit);

      if (onlyActive) {
        qb.andWhere('user.is_active = :isActive', { isActive: true });
      }

      if (keyword) {
        qb.andWhere(
          new Brackets((subQb) => {
            subQb
              .where('user.email ILIKE :keyword', { keyword: `%${keyword}%` })
              .orWhere('user.username ILIKE :keyword', {
                keyword: `%${keyword}%`,
              })
              .orWhere('user.full_name ILIKE :keyword', {
                keyword: `%${keyword}%`,
              });
          }),
        );
      }

      if (query.excludeProjectId) {
        qb.andWhere(
          `user.id NOT IN (
            SELECT pm.user_id
            FROM project_members pm
            WHERE pm.project_id = :excludeProjectId
          )`,
          { excludeProjectId: query.excludeProjectId },
        );
      }

      const users = await qb.getMany();

      return successResponse({
        message: 'Lay danh sach user thanh cong',
        data: users.map((user) => ({
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
        })),
      });
    } catch {
      throw AppErrors.users.userLoadFailed();
    }
  }

  async createUser(input: CreateUserInput) {
    const user = this.userRepository.create({
      email: input.email,
      username: input.username,
      fullName: input.fullName,
      passwordHash: input.passwordHash,
      isActive: true,
    });

    return this.userRepository.save(user);
  }
}