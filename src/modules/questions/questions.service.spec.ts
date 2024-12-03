import { Question } from '@entities/question.entity';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionRepository } from '@repositories/question.repository';
import { find } from 'lodash';
import { QUESTION_COUNT_LIMIT } from './constants/question.constant';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';
import { UpdateQuestionHiddenParam } from './types/question.types';

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
            findQuestionById: jest.fn(),
            updateQuestionHidden: jest.fn(),
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
    it(`총 질문이 ${QUESTION_COUNT_LIMIT}개 미만이면 새 질문 생성`, async () => {
      const dto: CreateQuestionDto = {
        content: 'test content',
        isHidden: false,
      };
      const userId = '1';

      jest.spyOn(repository, 'countQuestionsByUserId').mockResolvedValue(0);
      jest.spyOn(repository, 'createQuestion').mockResolvedValue('1');

      const result = await service.createQuestion(dto, userId);

      expect(result).toEqual({ questionId: '1' });
    });

    it(`총 질문이 정확히 ${QUESTION_COUNT_LIMIT} - 1 개일 때 새 질문 생성`, async () => {
      const dto: CreateQuestionDto = {
        content: 'test content',
        isHidden: false,
      };
      const userId = '1';

      jest.spyOn(repository, 'countQuestionsByUserId').mockResolvedValue(QUESTION_COUNT_LIMIT - 1);
      jest.spyOn(repository, 'createQuestion').mockResolvedValue('1');

      const result = await service.createQuestion(dto, userId);

      expect(result).toEqual({ questionId: '1' });
    });
    // !SECTION success case

    //SECTION failure case
    it('총 질문이 10개 이상일 때 생성 시도하면 ConflictException', async () => {
      const dto: CreateQuestionDto = {
        content: 'test content',
        isHidden: false,
      };
      const userId = '1';

      const countSpy = jest.spyOn(repository, 'countQuestionsByUserId').mockResolvedValue(QUESTION_COUNT_LIMIT);
      const createSpy = jest.spyOn(repository, 'createQuestion');

      await expect(service.createQuestion(dto, userId)).rejects.toThrow(ConflictException);

      expect(countSpy).toHaveBeenCalledWith(userId);
      expect(createSpy).not.toHaveBeenCalled();
    });

    describe('updateQuestionHidden', () => {
      it('질문 숨김 처리', () => {
        expect(service.updateQuestionHidden).toBeDefined();
      });

      it('should update the hidden status of a question', async () => {
        const param: UpdateQuestionHiddenParam = {
          questionId: '1',
          isHidden: true,
          userId: '1',
        };

        const question = {
          id: '1',
          userId: '1',
          content: 'test content',
          isHidden: false,
        } as any;

        jest.spyOn(repository, 'findQuestionById').mockResolvedValue(question);

        const result = await service.updateQuestionHidden(param);

        expect(result).toEqual({ questionId: '1', isHidden: true });
        expect(repository.findQuestionById).toHaveBeenCalledWith('1');
        expect(repository.updateQuestionHidden).toHaveBeenCalledWith('1', true);
      });

      it('없는 질문이면 Not Found', async () => {
        const param: UpdateQuestionHiddenParam = {
          questionId: '1',
          isHidden: true,
          userId: '1',
        };

        jest.spyOn(repository, 'findQuestionById').mockResolvedValue(null);

        await expect(service.updateQuestionHidden(param)).rejects.toThrow(NotFoundException);
        expect(repository.findQuestionById).toHaveBeenCalledWith('1');
      });

      it('요청한 유저가 소유한 질문이 아니면 Forbidden', async () => {
        const param: UpdateQuestionHiddenParam = {
          questionId: '1',
          isHidden: true,
          userId: '2',
        };

        const question = {
          id: '1',
          userId: '1',
          content: 'test content',
          isHidden: false,
        } as any;

        jest.spyOn(repository, 'findQuestionById').mockResolvedValue(question);

        await expect(service.updateQuestionHidden(param)).rejects.toThrow(ForbiddenException);
        expect(repository.findQuestionById).toHaveBeenCalledWith('1');
      });
    });
    // !SECTION failure case
  });
});
