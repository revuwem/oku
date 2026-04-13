import { Image } from "expo-image";
import { BookOpen } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { tva, VariantProps } from "@gluestack-ui/utils/nativewind-utils";

const coverStyle = tva({
  base: "bg-background-200 items-center justify-center",
  parentVariants: {
    size: {
      md: "w-20 h-20 rounded-sm",
      lg: "w-64 h-64 rounded-lg",
      xl: "w-72 h-72 rounded-3xl",
    },
  },
});

type Props = {
  coverPath: string | null;
} & VariantProps<typeof coverStyle>;

export function Cover({ coverPath, size = "md" }: Props) {
  if (coverPath) {
    return (
      <Image
        source={{ uri: coverPath }}
        className={coverStyle({ size })}
        contentFit="cover"
      />
    );
  }

  return (
    <Box className={coverStyle({ size })}>
      <BookOpen size={28} strokeWidth={1.8} color="rgb(138 128 118)" />
    </Box>
  );
}
