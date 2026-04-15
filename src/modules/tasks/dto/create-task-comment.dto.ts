import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTaskCommentDto {
  @IsString({ message: 'Noi dung comment phai la chuoi' })
  @IsNotEmpty({ message: 'Noi dung comment khong duoc de trong' })
  @MaxLength(3000, { message: 'Noi dung comment toi da 3000 ky tu' })
  content: string;
}