import { ReactionTemplateType } from '@entities/reaction-template.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MessageRepository } from '@repositories/message.repository';
import { ReactionTemplateRepository } from '@repositories/reaction-template.repository';
import { ReactionRepository } from '@repositories/reaction.repository';
import { ResponseReactionTemplates } from './dto/get-reaction-templates.dto';
import { toReactionTypeString } from './helpers/reactions.helper';
import { ReactionsService } from './reactions.service';

describe('ReactionsService', () => {
  let reactionsService: ReactionsService;
  let reactionTemplateRepository: ReactionTemplateRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionsService,
        {
          provide: ReactionTemplateRepository,
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: MessageRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ReactionRepository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
            createReactionsToMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    reactionsService = module.get<ReactionsService>(ReactionsService);
    reactionTemplateRepository = module.get<ReactionTemplateRepository>(ReactionTemplateRepository);
  });

  describe('getReactionTemplates', () => {
    it('type이 string으로 변환된 반응 템플릿 리턴', async () => {
      const mockTemplates = [
        {
          reactionTemplateId: '1',
          emoji: '😀',
          content: '',
          type: ReactionTemplateType.APOLOGY,
        },
        {
          reactionTemplateId: '2',
          emoji: '😢',
          content: 'Sad',
          type: ReactionTemplateType.RECONCILIATION,
        },
      ] as any;

      // Mock repository method
      jest.spyOn(reactionTemplateRepository, 'find').mockResolvedValue(mockTemplates);

      // Expected DTO output
      const expectedOutput: ResponseReactionTemplates[] = mockTemplates.map((template: any) => ({
        reactionTemplateId: template.reactionTemplateId,
        emoji: template.emoji,
        content: template.content,
        type: toReactionTypeString(template.type), // Ensures transformation logic is applied
      }));
      const result = await reactionsService.getReactionTemplates();
      expect(result).toEqual(expectedOutput);
    });
  });
  describe('createReactionToMessage', () => {
    it('쪽지에 반응을 성공적으로 추가', async () => {
      const param = {
        messageId: '1',
        userId: 'user1',
        reactionTemplateIds: ['1', '2'],
      };

      const mockMessage = { messageId: '1', receiverId: 'user1' };
      const mockReactionIds = ['reaction1', 'reaction2'];

      jest.spyOn(reactionsService['messageRepository'], 'findOne').mockResolvedValue(mockMessage as any);
      jest
        .spyOn(reactionsService['reactionTemplateRepository'], 'find')
        .mockResolvedValue([{ reactionTemplateId: '1' }, { reactionTemplateId: '2' }] as any);
      jest.spyOn(reactionsService['reactionRepository'], 'findOne').mockResolvedValue(null);
      jest.spyOn(reactionsService['reactionRepository'], 'createReactionsToMessage').mockResolvedValue(mockReactionIds);

      const result = await reactionsService.createReactionToMessage(param);
      expect(result).toEqual({
        messageId: '1',
        reactionIds: mockReactionIds,
      });
    });

    it('유효하지 않은 쪽지 ID로 반응 추가 시도 시 NotFoundException', async () => {
      const param = {
        messageId: 'invalid',
        userId: 'user1',
        reactionTemplateIds: ['1', '2'],
      };

      jest.spyOn(reactionsService['messageRepository'], 'findOne').mockResolvedValue(null);

      await expect(reactionsService.createReactionToMessage(param)).rejects.toThrow(NotFoundException);
    });

    it('유효하지 않은 reaction template ID 포함 시 BadRequestException', async () => {
      const param = {
        messageId: '1',
        userId: 'user1',
        reactionTemplateIds: ['1', 'invalid'],
      };

      const mockMessage = { messageId: '1', receiverId: 'user1' };

      jest.spyOn(reactionsService['messageRepository'], 'findOne').mockResolvedValue(mockMessage as any);
      jest
        .spyOn(reactionsService['reactionTemplateRepository'], 'find')
        .mockResolvedValue([{ reactionTemplateId: '1' } as any]);

      await expect(reactionsService.createReactionToMessage(param)).rejects.toThrow(BadRequestException);
    });

    it('이미 반응이 추가된 쪽지에 다시 반응 추가 시도 시 ConflictException', async () => {
      const param = {
        messageId: '1',
        userId: 'user1',
        reactionTemplateIds: ['1', '2'],
      };

      const mockMessage = { messageId: '1', receiverId: 'user1' };
      const mockExistingReaction = { messageId: '1' };

      jest.spyOn(reactionsService['messageRepository'], 'findOne').mockResolvedValue(mockMessage as any);
      jest
        .spyOn(reactionsService['reactionTemplateRepository'], 'find')
        .mockResolvedValue([{ reactionTemplateId: '1' }, { reactionTemplateId: '2' }] as any);
      jest.spyOn(reactionsService['reactionRepository'], 'findOne').mockResolvedValue(mockExistingReaction as any);

      await expect(reactionsService.createReactionToMessage(param)).rejects.toThrow(ConflictException);
    });
  });
});
