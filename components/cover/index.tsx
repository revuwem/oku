import { Image } from "expo-image";

import { Oku } from "@/components/icons/oku";
import { Box } from "@/components/ui/box";
import { tva, VariantProps } from "@gluestack-ui/utils/nativewind-utils";

const coverStyle = tva({
  base: "bg-background-300 shadow-xs items-center justify-center",
  parentVariants: {
    size: {
      md: "w-20 h-20 rounded-md",
      lg: "w-64 h-64 rounded-lg",
      xl: "w-96 h-96 rounded-3xl",
    },
  },
});

const coverIconSize: Record<"md" | "lg" | "xl", string> = {
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
};

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
      <Box className={coverIconSize[size]}>
        <Oku />
      </Box>
    </Box>
  );
}
