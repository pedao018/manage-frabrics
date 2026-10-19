export const demoFeatureSlugs = {
  inputTextJsonCache: "input-text-json-cache",
  qrScanLocalImage: "qr-scan-local-image",
  captureRecordingPictureVideo: "capture-recording-picture-video",
  recordingLocalStorage: "recording-local-storage",
} as const;

export const demoFeatures = [
  {
    slug: demoFeatureSlugs.inputTextJsonCache,
    title: "Input text -> JSON Cache. Read cache",
  },
  {
    slug: demoFeatureSlugs.qrScanLocalImage,
    title: "QR Scan. Read QR image from file local",
  },
  {
    slug: demoFeatureSlugs.captureRecordingPictureVideo,
    title: "Capture. Recording. Open picture, open video",
  },
  {
    slug: demoFeatureSlugs.recordingLocalStorage,
    title: "Recording. Save and Read from local",
  },
] as const;

export const voiceRecordingConfig = {
  databaseName: "manage-frabrics-demo",
  storeName: "voice-recordings",
  recordingKey: "latest-recording",
} as const;

export const jsonCacheConfig = {
  cacheName: "manage-frabrics-demo-cache-v1",
  cacheKey: `/__demo-cache/${demoFeatureSlugs.inputTextJsonCache}.json`,
  storageBucketName: "JSON files",
  storageObjectFolder: "demos",
  storageFileNamePrefix: demoFeatureSlugs.inputTextJsonCache,
} as const;
