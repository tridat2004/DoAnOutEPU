import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ToggleTaskCommentReactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  emoji: string;
}