import { Injectable } from '@nestjs/common';
import { RequestGetDmDetailDto } from './dtos/get-dm-detail.dto';

@Injectable()
export class DirectMessagesService {
  // 받은 메시지 조회
  async getReceivedDmListByUserId() {
    return {};
  }

  // 보낸 메시지 조회

  // 메시지 상세 조회
  async getDmDetail(directMessageId: number, request: RequestGetDmDetailDto): Promise<any> {
    // user id 조회
    if (request.type === 'received') {
      return {
        id: directMessageId,
        senderId: 10,
        receiverId: 12,
        content: '안녕, 너가 토이 프로젝트를 배포까지 하다니 진짜 대단하다..!!',
        emotion: {
          name: '응원과 감사',
          emoji: '🌟',
        },
        isRead: false,
        isDeleted: false,
        createdAt: '2024-09-02',
        comments: {
          emoji: '😁',
          content: '덕분에 자신감이 생겼어. 고마워',
          createdAt: '2024-09-02',
        },
      };
    }
  }
}
