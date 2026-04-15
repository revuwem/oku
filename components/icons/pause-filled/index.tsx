import Svg, { Rect } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function PauseFilledIcon({ size = 24, color = "#FFFFFF" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={6.25} y={4} width={4.5} height={16} rx={1} fill={color} />
      <Rect x={13.25} y={4} width={4.5} height={16} rx={1} fill={color} />
    </Svg>
  );
}
