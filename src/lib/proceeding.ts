export const calculateDeadline = (noticeSent: Date) => new Date(noticeSent.getTime() + 1000 * 60 * 60 * 24 * 62);
