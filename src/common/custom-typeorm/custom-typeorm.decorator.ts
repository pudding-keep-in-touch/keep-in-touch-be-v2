import { SetMetadata } from '@nestjs/common';

export const TYPEORM_CUSTOM_REPOSITORY = 'TYPEORM_CUSTOM_REPOSITORY';

/**
 * @brief EntityRepository을 커스텀한 데코레이터
 * @description 기존 TypeORM 3.0 이하 버전에서 사용하던 EntityRepository을 데코레이터가 없어지면서 커스텀한 데코레이터
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function CustomEntityRepository(entity: Function): ClassDecorator {
  // SetMetadata는 key: value형태이고 TYPEORM_CUSTOM_REPOSITORY가 key가 되고 엔티티가 vaule가 된다.
  return SetMetadata(TYPEORM_CUSTOM_REPOSITORY, entity);
}
