import { Emotion } from '@entities/emotion.entity';
import { Message, MessageStatus } from '@entities/message.entity';
import { Question } from '@entities/question.entity';
import { LoginType, User } from '@entities/user.entity';
import { DataSource, EntityManager } from 'typeorm';

// Base Factory Interface
interface Factory<T> {
  create(overrides?: Partial<T>): Promise<T>;
  createMany(count: number, overrides?: Partial<T>): Promise<T[]>;
}

// Base Factory Implementation
abstract class BaseFactory<T> implements Factory<T> {
  protected manager: EntityManager;
  protected sequence = 0;
  protected abstract entityClass: new () => T;

  constructor(protected readonly dataSource: DataSource) {
    this.manager = dataSource.manager;
  }

  protected abstract defineDefault(): Promise<T>;

  async create(overrides: Partial<T> = {}): Promise<T> {
    const defaultData = await this.defineDefault();
    this.sequence += 1;
    const entity = this.manager.create(this.entityClass, {
      ...defaultData,
      ...overrides,
    });
    return this.manager.save(entity);
  }

  async createMany(count: number, overrides: Partial<T> = {}): Promise<T[]> {
    const entities: T[] = [];
    for (let i = 0; i < count; i++) {
      entities.push(await this.create(overrides));
    }
    return entities;
  }
}

// User Factory
export class UserFactory extends BaseFactory<User> {
  protected entityClass = User;

  protected async defineDefault(): Promise<User> {
    const entity = this.manager.create(User, {
      email: `test${Date.now()}-${this.sequence}@example.com`,
      nickname: `user${this.sequence}`,
      loginType: LoginType.GOOGLE,
    });

    return entity;
  }
}

// Question Factory
export class QuestionFactory extends BaseFactory<Question> {
  protected entityClass = Question;

  constructor(
    dataSource: DataSource,
    private readonly userFactory: UserFactory,
  ) {
    super(dataSource);
  }

  protected async defineDefault(): Promise<Question> {
    return this.manager.create(Question, {
      content: `Test question ${this.sequence}`,
      isHidden: false,
    });
  }

  async createForUser(userId: string, overrides: Partial<Question> = {}): Promise<Question> {
    return this.create({ userId, ...overrides });
  }
}

// Message Factory
export class MessageFactory extends BaseFactory<Message> {
  protected entityClass = Message;

  constructor(
    dataSource: DataSource,
    private readonly userFactory: UserFactory,
  ) {
    super(dataSource);
  }

  protected async defineDefault(): Promise<Message> {
    return this.manager.create(Message, {
      content: `Test message ${this.sequence}`,
      status: MessageStatus.NORMAL,
    });
  }

  async createQuestionMessage(questionId: string, overrides: Partial<Message> = {}): Promise<Message> {
    return this.create({ questionId, ...overrides });
  }

  async createEmotionMessage(emotionId: string, overrides: Partial<Message> = {}): Promise<Message> {
    return this.create({ emotionId, ...overrides });
  }
}

// Emotion Factory
export class EmotionFactory extends BaseFactory<Emotion> {
  protected entityClass = Emotion;

  protected async defineDefault(): Promise<Emotion> {
    const emotions = ['응원과 감사', '솔직한 대화'];
    const emojis = ['🌟', '🤝'];
    return this.manager.create(Emotion, {
      name: emotions[this.sequence % 2],
      emoji: emojis[this.sequence % 2],
    });
  }
}

// Test Fixture Manager
export class TestFixtureManager {
  public readonly userFactory: UserFactory;
  public readonly questionFactory: QuestionFactory;
  public readonly messageFactory: MessageFactory;
  public readonly emotionFactory: EmotionFactory;

  constructor(private readonly dataSource: DataSource) {
    this.userFactory = new UserFactory(dataSource);
    this.questionFactory = new QuestionFactory(dataSource, this.userFactory);
    this.messageFactory = new MessageFactory(dataSource, this.userFactory);
    this.emotionFactory = new EmotionFactory(dataSource);
  }

  async cleanDatabase() {
    await this.dataSource.synchronize(true);
  }

  /**
   * user 2명
   * emotion 2개 (응원과 감사, 솔직한 대화 고정)
   * question 2개
   *
   *
   * @returns
   */
  async createBasicTestData() {
    const emotions = await this.emotionFactory.createMany(2);
    const [loginUser, targetUser] = await this.userFactory.createMany(2);
    const questions = await this.questionFactory.createMany(2, { userId: targetUser.userId });

    // loginUser -> targetUser: emotion (0)
    // targetUser -> loginUser: question (1)
    const messages = await Promise.all([
      this.messageFactory.createEmotionMessage('1', {
        senderId: loginUser.userId,
        receiverId: targetUser.userId,
      }),
      this.messageFactory.createQuestionMessage(questions[0].questionId, {
        senderId: targetUser.userId,
        receiverId: loginUser.userId,
      }),
    ]);

    return {
      emotions,
      users: { loginUser, targetUser },
      questions,
      messages,
    };
  }
}
