import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePriorityDto {
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

  @IsInt({ message: 'weight phai la so nguyen' })
  @Min(0, { message: 'weight phai lon hon hoac bang 0' })
  weight: number;
}