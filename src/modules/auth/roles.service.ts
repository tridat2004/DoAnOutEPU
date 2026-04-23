import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { successResponse } from '../../common/response';
import { AppErrors } from '../../common/exceptions/exception';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll() {
    try {
      const roles = await this.roleRepository.find({
        order: {
          name: 'ASC',
        },
      });

      return successResponse({
        message: 'Lay danh sach role thanh cong',
        data: roles.map((role) => ({
          id: role.id,
          code: role.code,
          name: role.name,
        })),
      });
    } catch {
      throw AppErrors.roles.roleLoadFailed();
    }
  }
}