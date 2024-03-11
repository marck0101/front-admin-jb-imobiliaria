import { Oval } from 'react-loader-spinner';

interface Props {
  size?: number;
  stroke?: number;
  className?: string;
  color?: string;
  secondaryColor?: string;
}

export function Loader({
  className,
  size,
  stroke,
  color,
  secondaryColor,
}: Props) {
  return (
    <Oval
      height={size || 60}
      width={size || 60}
      color={color || '#0054F5'}
      wrapperStyle={{}}
      wrapperClass={className || ''}
      visible={true}
      ariaLabel="oval-loading"
      secondaryColor={secondaryColor || '#84abf4'}
      strokeWidth={stroke || 2}
      strokeWidthSecondary={stroke || 2}
    />
  );
}
