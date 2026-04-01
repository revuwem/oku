import { useState } from "react";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import {
  ArrowLeft,
  Layers,
  PackageOpen,
  ScanText,
  Upload,
  TriangleAlert,
} from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { importAudiobook } from "@/services/archive-importer";
import { useLibraryStore } from "@/store/library-store";
import type { ImportError, ImportProgress } from "@/types";

type ScreenState =
  | { status: "idle" }
  | { status: "importing"; progress: ImportProgress }
  | { status: "error"; error: ImportError };

export default function ImportScreen() {
  const [state, setState] = useState<ScreenState>({ status: "idle" });
  const { addBook } = useLibraryStore();

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/zip",
      copyToCacheDirectory: false,
    });

    if (result.canceled) return;

    const { uri, name } = result.assets[0];
    setState({ status: "importing", progress: { stage: "copying" } });

    try {
      const book = await importAudiobook(uri, name ?? "audiobook.zip", (progress) => {
        setState({ status: "importing", progress });
      });
      addBook(book);
      router.back();
    } catch (err) {
      setState({
        status: "error",
        error: err as ImportError,
      });
    }
  };

  const isImporting = state.status === "importing";

  return (
    <Box className="flex-1 bg-background-0">
      <Header />
      <VStack space="xl" className="flex-1 px-6 pt-8">
        <UploadArea
          onPress={handlePickFile}
          importing={isImporting}
          progress={state.status === "importing" ? state.progress : undefined}
        />
        {state.status === "error" && (
          <ErrorBox
            error={state.error}
            onDismiss={() => setState({ status: "idle" })}
          />
        )}
        <Text size="sm" className="text-typography-500 text-center">
          ZIP archive containing MP3 files
        </Text>
      </VStack>
    </Box>
  );
}

function Header() {
  return (
    <Box className="flex-row items-center px-4 pt-16 pb-4 gap-3">
      <Pressable onPress={() => router.back()} className="p-2">
        <ArrowLeft size={22} strokeWidth={1.8} color="rgb(232 223 211)" />
      </Pressable>
      <Heading size="xl" className="text-typography-0">
        Add book
      </Heading>
    </Box>
  );
}

type UploadAreaProps = {
  onPress: () => void;
  importing: boolean;
  progress?: ImportProgress;
};

function UploadArea({ onPress, importing, progress }: UploadAreaProps) {
  return (
    <Pressable onPress={importing ? undefined : onPress} disabled={importing}>
      <Box className="border-2 border-dashed border-outline-300 rounded-2xl p-10 items-center gap-4">
        {importing && progress ? (
          <ImportProgress progress={progress} />
        ) : (
          <IdleUpload />
        )}
      </Box>
    </Pressable>
  );
}

function IdleUpload() {
  return (
    <>
      <Upload size={32} strokeWidth={1.8} color="rgb(138 128 118)" />
      <Text size="md" className="text-typography-0">
        Choose a ZIP file
      </Text>
    </>
  );
}

function ImportProgress({ progress }: { progress: ImportProgress }) {
  const { icon: Icon, label } = getProgressDisplay(progress);
  return (
    <>
      <Icon size={32} strokeWidth={1.8} color="rgb(212 165 116)" />
      <Text size="md" className="text-primary-500">
        {label}
      </Text>
    </>
  );
}

function getProgressDisplay(progress: ImportProgress): {
  icon: typeof Layers;
  label: string;
} {
  switch (progress.stage) {
    case "copying":
      return { icon: Layers, label: "Copying..." };
    case "extracting": {
      const pct =
        progress.extractionProgress != null
          ? ` ${Math.round(progress.extractionProgress * 100)}%`
          : "";
      return { icon: PackageOpen, label: `Extracting...${pct}` };
    }
    case "processing":
      return { icon: ScanText, label: "Scanning..." };
    default:
      return { icon: Layers, label: "Processing..." };
  }
}

type ErrorBoxProps = {
  error: ImportError;
  onDismiss: () => void;
};

function ErrorBox({ error, onDismiss }: ErrorBoxProps) {
  return (
    <VStack space="md" className="bg-background-error rounded-2xl p-4">
      <Box className="flex-row items-center gap-2">
        <TriangleAlert size={18} strokeWidth={1.8} color="rgb(232 92 84)" />
        <Text size="sm" className="text-error-500 flex-1">
          {error.message}
        </Text>
      </Box>
      <Button variant="outline" size="sm" onPress={onDismiss} className="border-error-500">
        <ButtonText className="text-error-500">Try again</ButtonText>
      </Button>
    </VStack>
  );
}
