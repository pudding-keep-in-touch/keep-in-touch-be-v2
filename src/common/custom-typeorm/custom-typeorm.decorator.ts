import { SetMetadata } from '@nestjs/common';

export const TYPEORM_CUSTOM_REPOSITORY = 'TYPEORM_CUSTOM_REPOSITORY';

/**
 * @brief EntityRepository을 커스텀한 데코레이터
 * @description 기존 TypeORM 3.0 이하 버전에서 사용하던 EntityRepository을 데코레이터가 없어지면서 커스텀한 데코레이터
 */
export function CustomEntityRepository(entity: new (...args: any[]) => any): ClassDecorator {
  // ban-type 대신 (entity: new (...args: any[]) => any) 생성자 타입을 지정해 class 허용
  // SetMetadata는 key: value형태이고 TYPEORM_CUSTOM_REPOSITORY가 key가 되고 엔티티가 vaule가 된다.
  return SetMetadata(TYPEORM_CUSTOM_REPOSITORY, entity);
}
