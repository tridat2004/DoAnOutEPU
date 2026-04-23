import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListUsersDto {
  @IsOptional()
  @IsString({ message: 'keyword phai la chuoi' })
  @MaxLength(255, { message: 'keyword toi da 255 ky tu' })
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value ?? 20))
  @IsInt({ message: 'limit phai la so nguyen' })
  @Min(1, { message: 'limit phai lon hon hoac bang 1' })
  @Max(100, { message: 'limit toi da 100' })
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    return value === 'true';
  })
  @IsBoolean({ message: 'onlyActive phai la boolean' })
  onlyActive?: boolean = true;

  @IsOptional()
  @IsUUID('4', { message: 'excludeProjectId khong hop le' })
  excludeProjectId?: string;
}