import { IsInt, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

export class UpdateUserSkillDto {
  @IsOptional()
  @IsString({ message: 'skillName phai la chuoi' })
  @MaxLength(100, { message: 'skillName toi da 100 ky tu' })
  skillName?: string;

  @IsOptional()
  @IsInt({ message: 'levelScore phai la so nguyen' })
  @Min(1, { message: 'levelScore phai lon hon hoac bang 1' })
  @Max(100, { message: 'levelScore phai nho hon hoac bang 100' })
  levelScore?: number;
}