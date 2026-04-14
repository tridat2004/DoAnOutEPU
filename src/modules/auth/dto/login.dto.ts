import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({
    description: 'Email dung de dang nhap.',
    example: 'admin@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mat khau tai khoan.',
    example: 'Secret123!',
    minLength: 6,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
