import { Manrope } from 'next/font/google';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});
export { manrope };

export const createOrderCode = () =>
  `DH-${new Date().getTime().toString().slice(-6)}`;
