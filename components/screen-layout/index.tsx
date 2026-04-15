import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Heading as GSHeading } from "@/components/ui/heading";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

type Props = {
  children: React.ReactNode;
};

export function ScreenLayout({ children }: Props) {
  return (
    <Box className="h-full bg-background-50 pt-[7vh] px-5">{children}</Box>
  );
}

function Heading({ children }: React.PropsWithChildren) {
  const router = useRouter();
  return (
    <Box className="flex-row items-center gap-4">
      <Button
        onPress={() => router.back()}
        aria-label="Go back"
        variant="link"
        action="secondary"
        size="xl"
        className="w-10"
      >
        <ButtonIcon as={ChevronLeft} />
      </Button>
      <GSHeading size="2xl" bold>
        {children}
      </GSHeading>
    </Box>
  );
}

ScreenLayout.Heading = Heading;
