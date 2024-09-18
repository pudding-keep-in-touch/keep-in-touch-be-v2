interface Emotion {
  name: string;
  emoji: string;
}

export interface DirectMessage {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  emotion: Emotion;
  isRead: boolean;
  comments: any;
  createdAt: string;
}
