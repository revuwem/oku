import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function PlayFilledIcon({ size = 24, color = "#FFFFFF" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.72 4.03 Q7 3 7 5 L7 19 Q7 21 8.72 19.97 L20.28 13.03 Q22 12 20.28 10.97 Z"
        fill={color}
      />
    </Svg>
  );
}
