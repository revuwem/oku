import { Box } from "@/components/ui/box";
import { Heading as GSHeading } from "@/components/ui/heading";

type Props = {
  children: React.ReactNode;
};

export function ScreenLayout({ children }: Props) {
  return (
    <Box className="h-full bg-background-50 pt-[10vh] px-5">{children}</Box>
  );
}

function Heading({ children }: React.PropsWithChildren) {
  return (
    <GSHeading size="2xl" bold>
      {children}
    </GSHeading>
  );
}

ScreenLayout.Heading = Heading;
