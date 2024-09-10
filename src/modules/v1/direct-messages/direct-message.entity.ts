import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('direct-messages')
export class DirectMessage {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'id' })
  id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '보내는 사람 id' })
  senderId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '받는 사람 id' })
  receiverId: number;

  @IsNotEmpty()
  @ApiProperty({ description: '이모티콘 id' })
  emotionId: number;

  @IsString()
  @IsNotEmpty()
  @Column({ length: 500 })
  @ApiProperty({ description: '쪽지 내용' })
  content: string;

  @IsBoolean()
  @ApiProperty({ description: '쪽지 읽음 여부' })
  isRead: boolean = false;

  @IsBoolean()
  @ApiProperty({ description: '쪽지 삭제 여부' })
  isDeleted: boolean = false;

  @ApiProperty({ description: '생성한 시간' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTEMP' })
  createdAt: string;

  @ApiProperty({ description: '수정한 시간' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTEMP' })
  updatedAt: string;

  // Add join table
}
