import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DirectMessages } from './direct-messages.entity';

@Entity('users')
export class Users {
  @ApiProperty({ description: '시퀀스 번호', example: 1 })
  @PrimaryGeneratedColumn({
    type: 'bigint', // 'bigint' 사용 권장
    name: 'id',
  })
  id: number;

  @ApiProperty({ description: '유저 가입 이메일', example: 'user@example.com' })
  @Column({
    type: 'varchar',
    length: 100,
    name: 'email',
    nullable: false,
  })
  email: string;

  @ApiProperty({ description: '유저 패스워드', example: 'securePassword123!' })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'password',
    nullable: true,
  })
  password: string | null;

  @ApiProperty({ description: '유저 닉네임', example: 'user123' })
  @Column({
    type: 'varchar',
    length: 20,
    name: 'nickname',
    nullable: true,
  })
  nickname: string;

  @ApiProperty({ description: '유저 나이', example: 25 })
  @Column({
    type: 'int',
    name: 'age',
    nullable: true,
  })
  age: number;

  @ApiProperty({ description: '유저 성별', example: 'Male' })
  @Column({
    type: 'varchar',
    length: 10,
    name: 'gender',
    nullable: true,
  })
  gender: string;

  @ApiProperty({ description: '유저 계정 상태', example: 1 })
  @Column({
    type: 'smallint',
    name: 'status',
    default: 1,
  })
  status: number;

  @ApiProperty({ description: '로그인 타입', example: 1 })
  @Column({
    type: 'smallint',
    name: 'login_type',
    nullable: false,
    default: 1,
  })
  loginType: number;

  @ApiProperty({ description: '계정 생성 시각', example: '2024-09-09 00:00:00' })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ApiProperty({ description: '계정 수정 시각', example: '2024-09-09 00:00:00' })
  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToMany(
    () => DirectMessages,
    (directMessage) => directMessage.sender,
  )
  sentMessage: DirectMessages[];

  @OneToMany(
    () => DirectMessages,
    (directMessage) => directMessage.receiver,
  )
  receiveMessage: DirectMessages[];
}
