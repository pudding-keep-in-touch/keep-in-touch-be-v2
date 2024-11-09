import { DynamicModule, Provider } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TYPEORM_CUSTOM_REPOSITORY } from './custom-typeorm.decorator';

/**
 * @brief 커스텀 TypeORM 모듈
 */
export class CustomTypeOrmModule {
  public static forCustomRepository<T extends new (...args: any[]) => any>(
    repositories: T[],
    dataSource?: DataSource | DataSourceOptions | string,
  ): DynamicModule {
    const providers: Provider[] = [];

    for (const repository of repositories) {
      // 이전에 데코레이터로 metadata로 set했던걸 get해온다.
      const entity = Reflect.getMetadata(TYPEORM_CUSTOM_REPOSITORY, repository);
      if (!entity) {
        continue;
      }

      providers.push({
        inject: [getDataSourceToken(dataSource)], // DB 연결
        provide: repository, // 공급자를 넣어준다.
        useFactory: (dataSource: DataSource): typeof repository => {
          // entity를 넣어 레포지토리를 가져온다.
          const baseRepository = dataSource.getRepository(entity);

          return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
        },
      });
    }

    return { exports: providers, module: CustomTypeOrmModule, providers };
  }
}
