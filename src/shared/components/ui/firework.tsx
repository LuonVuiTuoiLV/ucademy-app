// ConfettiFireworks.tsx (Đảm bảo đường dẫn import confetti đúng)
'use client';

import confetti from 'canvas-confetti'; // Giả sử lỗi "Cannot find module" đã được khắc phục
import { useEffect, useRef } from 'react';

export function ConfettiFireworks() {
  const intervalRef = useRef<number | null>(null); // Dùng number cho NodeJS, ReturnType<typeof setInterval> cho browser

  useEffect(() => {
    const duration = 3 * 1000; // Thời gian hiệu ứng: 3 giây (điều chỉnh nếu muốn)
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }; // Tăng zIndex nếu cần

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const launchConfetti = () => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      // Bắn confetti từ hai điểm
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    };

    // Đảm bảo chỉ chạy ở client-side
    if (typeof window !== 'undefined') {
      launchConfetti(); // Bắn một lượt ngay khi component mount
      intervalRef.current = window.setInterval(launchConfetti, 250);
    }

    // Hàm cleanup để dừng interval khi component unmount
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Mảng dependency rỗng đảm bảo effect chỉ chạy một lần khi mount

  // Component này chỉ tạo hiệu ứng, không cần render gì ra DOM
  return null;
}
