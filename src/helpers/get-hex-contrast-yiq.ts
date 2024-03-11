import { hexToRGB } from './hex-to-rgb';

export function getHexContrastYIQ(hex: string) {
  // console.log('hex=>>', hex);
  //@ts-ignore
  const { r, g, b } = hexToRGB(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}
