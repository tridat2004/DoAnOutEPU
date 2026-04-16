import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTaskStatusDto {
  @IsString({ message: 'code phai la chuoi' })
  @IsNotEmpty({ message: 'code khong duoc de trong' })
  @MaxLength(50, { message: 'code toi da 50 ky tu' })
  @Matches(/^[a-z0-9_]+$/, {
    message: 'code chi duoc chua chu thuong, so va dau gach duoi',
  })
  code: string;

  @IsString({ message: 'name phai la chuoi' })
  @IsNotEmpty({ message: 'name khong duoc de trong' })
  @MaxLength(100, { message: 'name toi da 100 ky tu' })
  name: string;

  @IsOptional()
  @IsString({ message: 'color phai la chuoi' })
  @MaxLength(30, { message: 'color toi da 30 ky tu' })
  color?: string;

  @IsInt({ message: 'position phai la so nguyen' })
  @Min(0, { message: 'position phai lon hon hoac bang 0' })
  position: number;
}