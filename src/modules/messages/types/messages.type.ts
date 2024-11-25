export type MessageBaseData = {
  senderId: string;
  receiverId: string;
  content: string;
};

export type createQuestionMessageParam = MessageBaseData & {
  questionId: string;
};

export type createEmotionMessageParam = MessageBaseData & {
  emotionId: string;
};
