import { MESSAGE_STATUS } from '../constants/messages.constant';

export type MessageBaseData = {
  senderId: string;
  receiverId: string;
  content: string;
};

export type CreateQuestionMessageParam = MessageBaseData & {
  questionId: string;
  // never는 값을 허용하지 않는 타입이지만, optional 연산자가 없으면 속성이 존재해야하기 때문에 모순이 발생
  // optional 연산자를 사용해서 emotion id가 존재하지 않아야함을 명시.
  emotionId?: never;
};

export type CreateEmotionMessageParam = MessageBaseData & {
  emotionId: string;
  questionId?: never;
};

export type MessageType = 'received' | 'sent';

export type MessageOrder = 'desc' | 'asc';

export type MessageStatusString = (typeof MESSAGE_STATUS)[number];

export type MessageDetailParam = {
  messageId: string;
  userId: string;
};

export type UpdateMessageStatusParam = {
  messageId: string;
  userId: string;
  status: MessageStatusString;
};
