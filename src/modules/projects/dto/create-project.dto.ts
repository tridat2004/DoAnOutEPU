import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreateProjectDto{
    @IsString({message: 'Tên project phải là chuỗi'})
    @IsNotEmpty({message: 'Tên project không được để trống'})
    @MaxLength(255, {message: 'Tên project không được vượt quá 255 ký tự'})
    name: string;

    @IsString({message:'Project key phải là chuỗi'})
    @IsNotEmpty({message: 'Project key không được để trống'})
    @MaxLength(20, {message: 'Project key không được vượt quá 20 ký tự'})
    @Matches(/^[A-Z0-9_]+$/, {
        message: 'Project key chỉ được chứa chữ in hoa, số và dấu gạch dưới',
    })
    projectKey: string;

    @IsOptional()
    @IsString({message: 'Mô tả phải là chuỗi'})
    @MaxLength(1000, {message: 'Mô tả không được vượt quá 1000 ký tự'})
    description?: string;
}