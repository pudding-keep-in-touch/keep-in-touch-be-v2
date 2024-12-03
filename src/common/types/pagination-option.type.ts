export type OrderOption = 'ASC' | 'DESC';

export type PaginationOption = {
  cursor?: Date;
  limit: number;
  order: OrderOption;
};
