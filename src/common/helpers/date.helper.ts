import * as dayjs from 'dayjs';

// 현재 시간 가져오기
export const getNowDate = (format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs().format(format);
};

// 시간 포맷하기
export const getFormatDate = (date: string | number | Date | dayjs.Dayjs, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format);
};
