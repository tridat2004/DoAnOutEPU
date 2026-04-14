import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequiredSkillDto {
  @ApiProperty({
    example: 'nestjs',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 70,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  @Max(100)
  minLevel!: number;
}

export class CreateTaskDto {
  @ApiProperty({
    example: 'Set up Swagger for the API',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'Expose OpenAPI docs under /api/v1/docs for frontend and QA.',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    type: () => RequiredSkillDto,
    isArray: true,
    example: [{ name: 'nestjs', minLevel: 70 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredSkillDto)
  requiredSkills!: RequiredSkillDto[];

  @ApiPropertyOptional({
    example: 3,
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
