export const demoFeatureSlugs = {
  inputTextJsonCache: "input-text-json-cache",
} as const;

export const demoFeatures = [
  {
    slug: demoFeatureSlugs.inputTextJsonCache,
    title: "Input text -> JSON Cache. Read cache",
  },
  {
    slug: "qr-scan-local-image",
    title: "QR Scan. Read QR image from file local",
  },
  {
    slug: "capture-recording-picture-video",
    title: "Capture. Recording. Open picture, open video",
  },
  {
    slug: "recording-local-storage",
    title: "Recording. Save and Read from local",
  },
] as const;

export const jsonCacheConfig = {
  cacheName: "manage-frabrics-demo-cache-v1",
  cacheKey: `/__demo-cache/${demoFeatureSlugs.inputTextJsonCache}.json`,
  storageBucketName: "JSON files",
  storageObjectFolder: "demos",
  storageFileNamePrefix: demoFeatureSlugs.inputTextJsonCache,
} as const;
