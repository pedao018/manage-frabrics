"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";

type MediaKind = "image" | "video";

const videoMimeTypes = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

export default function CaptureMediaDemo({ title }: { title: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const discardRecordingRef = useRef(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);
  const [message, setMessage] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    return () => {
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (isCameraOpen && video && stream) {
      video.srcObject = stream;
      void video.play().catch((error: unknown) => {
        setMessage(
          `Could not start the camera preview: ${error instanceof Error ? error.message : "Playback was blocked by the browser."}`,
        );
      });
    }
  }, [isCameraOpen]);

  function loadSelectedMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const kind = file.type.startsWith("image/")
      ? "image"
      : file.type.startsWith("video/")
        ? "video"
        : null;

    if (!kind) {
      setMessage("Please choose an image or video file.");
      event.target.value = "";
      return;
    }

    setMessage("");
    setMediaKind(kind);
    setMediaUrl(URL.createObjectURL(file));
    event.target.value = "";
  }

  async function openCamera() {
    setMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage(
        "Camera access is unavailable. Open this page over HTTPS on a supported browser and allow camera access.",
      );
      return;
    }

    setIsOpeningCamera(true);

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      setIsCameraOpen(true);
    } catch (error) {
      const cameraError = error instanceof DOMException ? error : null;
      const reason =
        cameraError?.name === "NotAllowedError"
          ? "Allow camera access in your browser settings, then try again."
          : cameraError?.name === "NotFoundError"
            ? "No camera was found on this device."
            : error instanceof Error
              ? error.message
              : "An unknown error occurred.";
      setMessage(`Could not open the camera: ${reason}`);
    } finally {
      setIsOpeningCamera(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
    setIsRecording(false);
  }

  function closeCamera() {
    discardRecordingRef.current = true;
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    stopCamera();
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setMessage("The camera is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      setMessage("Could not capture an image from the camera.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setMessage("Could not create an image from the camera capture.");
        return;
      }

      setMediaKind("image");
      setMediaUrl(URL.createObjectURL(blob));
      setMessage("");
      stopCamera();
    }, "image/jpeg");
  }

  function startRecording() {
    const stream = streamRef.current;

    if (!stream) {
      setMessage("Open the camera before starting a recording.");
      return;
    }

    if (!("MediaRecorder" in window)) {
      setMessage("Video recording is not supported by this browser.");
      return;
    }

    try {
      const mimeType = videoMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      const chunks: BlobPart[] = [];
      discardRecordingRef.current = false;
      recorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        if (!discardRecordingRef.current && chunks.length > 0) {
          const videoBlob = new Blob(chunks, {
            type: recorder.mimeType || "video/webm",
          });
          setMediaKind("video");
          setMediaUrl(URL.createObjectURL(videoBlob));
          setMessage("");
        }
        recorderRef.current = null;
        discardRecordingRef.current = false;
        stopCamera();
      });

      recorder.addEventListener("error", () => {
        setMessage("The video recording failed. Please try again.");
        recorderRef.current = null;
        stopCamera();
      });

      recorder.start();
      setIsRecording(true);
      setMessage("Recording video...");
    } catch (error) {
      setMessage(
        `Could not start video recording: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
      );
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-neutral-900">
      <h1 className="text-center text-3xl font-semibold">{title}</h1>

      <div
        aria-label="Image or video preview"
        className="relative flex min-h-64 w-full max-w-xl items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-neutral-50"
      >
        {isCameraOpen ? (
          <video
            aria-label="Live camera preview"
            autoPlay
            className="h-full max-h-[28rem] w-full object-contain"
            muted
            playsInline
            ref={videoRef}
          />
        ) : mediaUrl && mediaKind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Captured or selected"
            className="max-h-[28rem] w-full object-contain"
            src={mediaUrl}
          />
        ) : mediaUrl && mediaKind === "video" ? (
          <video
            aria-label="Captured or selected video"
            className="max-h-[28rem] w-full object-contain"
            controls
            playsInline
            src={mediaUrl}
          />
        ) : (
          <p className="px-4 text-center text-sm text-neutral-500">
            Captured or chosen image or video will appear here.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {!isCameraOpen ? (
          <button
            className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isOpeningCamera}
            onClick={openCamera}
            type="button"
          >
            {isOpeningCamera ? "Opening camera..." : "Capture"}
          </button>
        ) : (
          <>
            <button
              className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              onClick={capturePhoto}
              type="button"
            >
              Capture image
            </button>
            <button
              className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              onClick={isRecording ? stopRecording : startRecording}
              type="button"
            >
              {isRecording ? "Stop recording" : "Record video"}
            </button>
            <button
              className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              onClick={closeCamera}
              type="button"
            >
              Cancel
            </button>
          </>
        )}

        <input
          accept="image/*,video/*"
          className="sr-only"
          onChange={loadSelectedMedia}
          ref={fileInputRef}
          tabIndex={-1}
          type="file"
        />
        <button
          className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Open image/video
        </button>
      </div>

      <p aria-live="polite" className="text-sm text-neutral-600">
        {message}
      </p>
    </main>
  );
}
