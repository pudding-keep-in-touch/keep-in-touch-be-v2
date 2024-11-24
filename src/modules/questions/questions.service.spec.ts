import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QUESTION_COUNT_LIMIT } from './constants/question.constant';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';
import { QuestionRepository } from './repository/question.repository';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let repository: QuestionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: QuestionRepository,
          useValue: {
            countQuestionsByUserId: jest.fn(),
            createQuestion: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
    repository = module.get<QuestionRepository>(QuestionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createQuestion', () => {
    it('should be defined', () => {
      expect(service.createQuestion).toBeDefined();
    });

    // NOTE: QUESTION_COUNT_LIMIT에 따라 변경
    // SECTION success case
    it('총 질문이 10개 이하이면 새 질문 생성', async () => {
      const dto: CreateQuestionDto = {
        content: 'test content',
        isHidden: false,
      };
      const userId = '1';

      jest.spyOn(repository, 'countQuestionsByUserId').mockResolvedValue(9);
      jest.spyOn(repository, 'createQuestion').mockResolvedValue('1');

      const result = await service.createQuestion(dto, userId);

      expect(result).toEqual({ questionId: '1' });
    });
    // !SECTION success case

    //SECTION failure case
    it('총 질문이 10 이상일 때 생성 시도하면 ConflictException', async () => {
      const dto: CreateQuestionDto = {
        content: 'test content',
        isHidden: false,
      };
      const userId = '1';

      jest.spyOn(repository, 'countQuestionsByUserId').mockResolvedValue(QUESTION_COUNT_LIMIT);

      await expect(service.createQuestion(dto, userId)).rejects.toThrow(ConflictException);
    });

    // !SECTION failure case
  });
});