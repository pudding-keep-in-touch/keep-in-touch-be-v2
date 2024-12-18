import { ReactionTemplateType } from '@entities/reaction-template.entity';
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
            getReactionTemplates: jest.fn(),
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
            create: jest.fn(),
            insert: jest.fn(),
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
      jest.spyOn(reactionTemplateRepository, 'getReactionTemplates').mockResolvedValue(mockTemplates);

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
});
