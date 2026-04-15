import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsUUID('4', { message: 'statusId khong hop le' })
  @IsNotEmpty({ message: 'statusId khong duoc de trong' })
  statusId: string;
}