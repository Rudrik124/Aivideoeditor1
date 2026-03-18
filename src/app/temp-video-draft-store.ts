type VideoDraft = {
  prompt: string;
  uploadedFiles: File[];
  referenceVideo: File | null;
  apiKey: string;
  updatedAt: number;
};

let draft: VideoDraft = {
  prompt: "",
  uploadedFiles: [],
  referenceVideo: null,
  apiKey: "",
  updatedAt: Date.now(),
};

export function getVideoDraft(): VideoDraft {
  return draft;
}

export function saveVideoDraft(nextDraft: Omit<VideoDraft, "updatedAt">): void {
  draft = {
    ...nextDraft,
    updatedAt: Date.now(),
  };
}

export function clearVideoDraft(): void {
  draft = {
    prompt: "",
    uploadedFiles: [],
    referenceVideo: null,
    apiKey: "",
    updatedAt: Date.now(),
  };
}
