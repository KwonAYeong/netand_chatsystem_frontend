export const getPreviewMessage = (content: string, maxLen = 20) => {
  return content.length > maxLen ? content.slice(0, maxLen) + '...' : content;
};
