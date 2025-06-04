import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

export const toCamel = <T = any>(data: unknown): T => {
  if (typeof data === 'object' && data !== null) {
    return camelcaseKeys(data as Record<string, unknown>, { deep: true }) as T;
  }
  return data as T;
};

export const toSnake = (data: unknown): any => {
  if (typeof data === 'object' && data !== null) {
    return snakecaseKeys(data as Record<string, unknown>, { deep: true });
  }
  return data;
};
