import { Emotion } from '@entities/emotion.entity';
import { Message, MessageStatus } from '@entities/message.entity';
import { Question } from '@entities/question.entity';
import { User } from '@entities/user.entity';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmotionRepository, MessageRepository, QuestionRepository, UserRepository } from '@repositories/index';
import { CreateMessageDto } from './dto/create-message.dto';
import { SentMessageDetailDto } from './dto/message-detail.dto';
import { MessagesService } from './messages.service';
import { MessageDetailParam } from './types/messages.type';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepository: MessageRepository;
  let userRepository: UserRepository;
  let questionRepository: QuestionRepository;
  let emotionRepository: EmotionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: MessageRepository,
          useValue: {
            createQuestionMessage: jest.fn(),
            createEmotionMessage: jest.fn(),
            findMessageDetailById: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: QuestionRepository,
          useValue: {
            findQuestionById: jest.fn(),
          },
        },
        {
          provide: EmotionRepository,
          useValue: {
            findEmotionById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageRepository = module.get<MessageRepository>(MessageRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    questionRepository = module.get<QuestionRepository>(QuestionRepository);
    emotionRepository = module.get<EmotionRepository>(EmotionRepository);
  });

  // SECTION: createMessage success case
  it('questionId가 제공되고 question의 userId와 receiverId가 일치하면 question message를 생성해야 한다', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
      questionId: '3',
    };
    const userId = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue({ userId: '2' } as User); // receiver check
    jest.spyOn(questionRepository, 'findQuestionById').mockResolvedValue({ questionId: '3', userId: '2' } as Question);
    jest.spyOn(messageRepository, 'createQuestionMessage').mockResolvedValue('5');

    const result = await service.createMessage(createMessageDto, userId);

    expect(result).toEqual({ messageId: '5' });
  });

  it('emotionId가 제공되면 emotion message를 생성해야 한다', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
      emotionId: '4',
    };
    const userId = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue({ userId: '2' } as User);
    jest.spyOn(emotionRepository, 'findEmotionById').mockResolvedValue({ emotionId: '4' } as Emotion);
    jest.spyOn(messageRepository, 'createEmotionMessage').mockResolvedValue('5');

    const result = await service.createMessage(createMessageDto, userId);

    expect(result).toEqual({ messageId: '5' });
  });
  // !SECTION

  // SECTION: createMessage failure case

  it('questionId와 emotionId가 모두 제공되면 BadRequestException', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
      questionId: '3',
      emotionId: '4',
    };
    const userId = '1';

    await expect(service.createMessage(createMessageDto, userId)).rejects.toThrow(BadRequestException);
  });

  it('questionId와 emotionId가 모두 제공되지 않으면 BadRequestException', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
    };
    const userId = '1';

    await expect(service.createMessage(createMessageDto, userId)).rejects.toThrow(BadRequestException);
  });

  it('questionId가 제공되었지만 question이 존재하지 않으면 NotFoundException', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
      questionId: '3',
    };
    const userId = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue({ userId: '2' } as User);
    jest.spyOn(questionRepository, 'findQuestionById').mockResolvedValue(null);

    await expect(service.createMessage(createMessageDto, userId)).rejects.toThrow(NotFoundException);
  });

  it('emotionId가 제공되었지만 emotion이 존재하지 않으면 NotFoundException', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
      emotionId: '4',
    };
    const userId = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue({ userId: '2' } as User);
    jest.spyOn(emotionRepository, 'findEmotionById').mockResolvedValue(null);

    await expect(service.createMessage(createMessageDto, userId)).rejects.toThrow(NotFoundException);
  });

  it('receiver가 존재하지 않으면 NotFoundException', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
      questionId: '3',
    };
    const userId = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue(null);

    await expect(service.createMessage(createMessageDto, userId)).rejects.toThrow(NotFoundException);
  });

  it('receiverId가 userId와 같으면 BadRequestException', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '1',
      content: 'content',
      questionId: '3',
    };
    const userId = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue({ userId: '1' } as User);

    await expect(service.createMessage(createMessageDto, userId)).rejects.toThrow(BadRequestException);
  });

  it('question의 userId와 receiverId가 일치하지 않으면 BadRequestException', async () => {
    const createMessageDto: CreateMessageDto = {
      receiverId: '2',
      content: 'content',
      questionId: '3',
    };
    const userId = '1';

    jest.spyOn(userRepository, 'findUserById').mockResolvedValue({ userId: '2' } as User);
    jest.spyOn(questionRepository, 'findQuestionById').mockResolvedValue({ questionId: '3', userId: '3' } as Question);

    await expect(service.createMessage(createMessageDto, userId)).rejects.toThrow(BadRequestException);
  });
  //!SECTION

  describe('getMessageDetail', () => {
    // SECTION: getMessageDetail success case
    it('보낸 쪽지의 상세 정보를 조회할 수 있어야 한다', async () => {
      const messageDetailParam: MessageDetailParam = {
        userId: '1',
        messageId: '5',
      };

      const message = {
        messageId: '5',
        senderId: '1',
        receiverId: '2',
        receiver: {
          userId: '2',
          nickname: 'KimUser',
        } as User,
        questionId: '1',
        question: {
          questionId: '1',
          content: 'test question',
        } as Question,
        reactions: [],
        content: 'test content',
        createdAt: new Date(),
        status: MessageStatus.NORMAL,
      };

      jest.spyOn(messageRepository, 'findMessageDetailById').mockResolvedValue(message as any);

      const result = await service.getMessageDetail(messageDetailParam);

      expect(result).toEqual({
        type: 'sent',
        messageId: message.messageId,
        receiverId: message.receiverId,
        receiverNickname: message.receiver.nickname,
        reactions: [],
        question: { questionId: message.question.questionId, content: message.question.content },
        content: message.content,
        createdAt: message.createdAt,
      } as SentMessageDetailDto);
    });

    it('받은 쪽지의 상세 정보를 조회할 수 있어야 한다', async () => {
      const messageDetailParam: MessageDetailParam = {
        userId: '2',
        messageId: '5',
      };
      const message = {
        messageId: '5',
        senderId: '1',
        receiverId: '2',
        receiver: {
          userId: '2',
          nickname: 'KimReceiver',
        } as User,
        questionId: '1',
        question: {
          questionId: '1',
          content: 'test question',
        } as Question,
        reactions: [],
        content: 'test content',
        status: MessageStatus.NORMAL,
        createdAt: new Date(),
      };

      jest.spyOn(messageRepository, 'findMessageDetailById').mockResolvedValue(message as any);

      const result = await service.getMessageDetail(messageDetailParam);
      expect(result).toEqual({
        type: 'received',
        messageId: message.messageId,
        receiverId: message.receiverId,
        receiverNickname: message.receiver.nickname,
        question: { questionId: message.question?.questionId, content: message.question?.content },
        content: message.content,
        createdAt: message.createdAt,
        status: 'normal',
        reactions: [],
      });
    });
  });
  // !SECTION

  // SECTION: getMessageDetail failure case
  it('메세지가 존재하지 않으면 NotFoundException', async () => {
    const messageDetailParam: MessageDetailParam = {
      userId: '1',
      messageId: '5',
    };

    jest.spyOn(messageRepository, 'findMessageDetailById').mockResolvedValue(null);

    await expect(service.getMessageDetail(messageDetailParam)).rejects.toThrow(NotFoundException);
  });

  it('메세지를 볼 권한이 없으면 ForbiddenException', async () => {
    const messageDetailParam: MessageDetailParam = {
      userId: '3',
      messageId: '5',
    };

    const message = {
      messageId: '5',
      senderId: '1',
      receiverId: '2',
      content: 'content',
      status: MessageStatus.NORMAL,
    };

    jest.spyOn(messageRepository, 'findMessageDetailById').mockResolvedValue(message as Message);

    await expect(service.getMessageDetail(messageDetailParam)).rejects.toThrow(ForbiddenException);
  });
  // !SECTION
});
