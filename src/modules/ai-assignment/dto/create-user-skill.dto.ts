import { IsInt, IsNotEmpty, IsString, MaxLength, Min, Max } from 'class-validator';

export class CreateUserSkillDto {
  @IsString({ message: 'skillName phai la chuoi' })
  @IsNotEmpty({ message: 'skillName khong duoc de trong' })
  @MaxLength(100, { message: 'skillName toi da 100 ky tu' })
  skillName: string;

  @IsInt({ message: 'levelScore phai la so nguyen' })
  @Min(1, { message: 'levelScore phai lon hon hoac bang 1' })
  @Max(100, { message: 'levelScore phai nho hon hoac bang 100' })
  levelScore: number;
}