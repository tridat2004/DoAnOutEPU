import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

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
  ) { }

  findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }
  findAll() {
    return this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
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