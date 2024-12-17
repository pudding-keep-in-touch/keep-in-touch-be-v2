import { OrderOption } from '@common/types/pagination-option.type';

export function getOrderUpperCase(order: string): OrderOption {
  switch (order) {
    case 'asc':
      return 'ASC';
    case 'desc':
      return 'DESC';
    default:
      return 'DESC';
  }
}
