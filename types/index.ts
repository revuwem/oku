export type BookRecord = {
  id: string;
  title: string;
  author: string | null;
  coverPath: string | null;
  importedAt: number;
};

export type ChapterRecord = {
  id: string;
  bookId: string;
  index: number;
  title: string;
  filePath: string;
};

export type ImportErrorCode =
  | "passwordProtected"
  | "extractionFailed"
  | "unsupportedFormat"
  | "noAudioFiles"
  | "diskFull";

export type ImportError = {
  code: ImportErrorCode;
  message: string;
  offendingFile?: string;
};

export type ImportStage = "copying" | "extracting" | "processing" | "done";

export type ImportProgress = {
  stage: ImportStage;
  extractionProgress?: number; // 0–1 fraction
};
