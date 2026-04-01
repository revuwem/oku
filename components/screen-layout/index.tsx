import { Box } from "@/components/ui/box";

type Props = {
  children: React.ReactNode;
};

export function ScreenLayout({ children }: Props) {
  return <Box className="h-full bg-background-50 pt-[10vh]">{children}</Box>;
}
