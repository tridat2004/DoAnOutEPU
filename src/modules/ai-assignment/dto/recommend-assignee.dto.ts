import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequiredSkillDto {
  @ApiProperty({
    example: 'problem-solving',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  minLevel!: number;
}

export class RecommendAssigneeDto {
  @ApiProperty({
    example: 'Assign backend bugfix ticket',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Need a backend engineer who can fix auth cookie and Redis session issues.',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    type: () => RequiredSkillDto,
    isArray: true,
    example: [{ name: 'redis', minLevel: 80 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredSkillDto)
  requiredSkills!: RequiredSkillDto[];

  @ApiPropertyOptional({
    example: 4,
    minimum: 1,
    maximum: 5,
    default: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number = 3;
}
