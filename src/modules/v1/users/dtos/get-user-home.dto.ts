import { Emotions } from "@entities/emotions.entity";
import { ApiProperty } from "@nestjs/swagger";
import { ResponseGetDmListByUserIdDto } from "@v1/direct-messages/dtos/get-dm-list-by-user-id.dto";
import { IsOptional } from "class-validator";

class ResponseGetFriendDto {
  @ApiProperty({ description: '친구 id', example: 1 })
  id: number;

  @ApiProperty({ description: '친구 닉네임', example: '친구' })
  nickname: string;
}

class ResponseGetLoginUserDto {
  @ApiProperty({ description: '로그인 한 유저 id', example: 1 })
  id: number;

  @ApiProperty({ description: '로그인 한 유저 닉네임', example: '친구' })
  nickname: string;
}

export class ResponseGetUserHomeDto {
  @ApiProperty({ description: '현재 home url이 로그인한 유저인지 판별하는 값', example: true, nullable: false })
  isOwner: boolean;
  
  @ApiProperty({ description: '현재 로그인한 유저', nullable: false, type: [ResponseGetLoginUserDto]})
  loginUser: ResponseGetLoginUserDto;

  @ApiProperty({ description: '쪽지 리스트', nullable: true, type: [ResponseGetDmListByUserIdDto] })
  @IsOptional()
  dmList?: ResponseGetDmListByUserIdDto[] | [];

  @ApiProperty({ description: '친구 정보', nullable: true, type: ResponseGetFriendDto })
  friendUser?: ResponseGetFriendDto;

  @ApiProperty({description: '메시지 타입', nullable:false, type: [Emotions]})
  emotions: Emotions[]
}

