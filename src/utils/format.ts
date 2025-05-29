export const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};
