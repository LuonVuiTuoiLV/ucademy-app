export const formatDateVN = (date: number | string | Date) => {
  return new Date(date).toLocaleDateString('vi-Vi');
};
export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};
export const timeAgo = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years) return `${years} năm trước`;
  if (months) return `${months} tháng trước`;
  if (days) return `${days} ngày trước`;
  if (hours) return `${hours} giờ trước`;
  if (minutes) return `${minutes} phút trước`;

  return `${seconds} giây trước`;
};

// Hàm chuyển đổi giây sang {h, m, s}
export const secondsToHMS = (
  totalSeconds: number | undefined | null,
): { h: number; m: number; s: number } => {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    isNaN(totalSeconds) ||
    totalSeconds < 0
  ) {
    return { h: 0, m: 0, s: 0 };
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return { h, m, s };
};

// Hàm chuyển đổi {h, m, s} sang tổng số giây
export const hmsToSeconds = (h: number, m: number, s: number): number => {
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
};
