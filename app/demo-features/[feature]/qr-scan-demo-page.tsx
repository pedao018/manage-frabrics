"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

export default function QrScanDemo({ title }: { title: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = cameraStreamRef.current;

    if (isCameraOpen && video && stream) {
      video.srcObject = stream;
      void video.play().catch((error: unknown) => {
        setMessage(
          `Could not start the camera preview: ${error instanceof Error ? error.message : "Playback was blocked by the browser."}`,
        );
      });
    }
  }, [isCameraOpen]);

  function loadSelectedImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      event.target.value = "";
      return;
    }

    setMessage("");
    setImageUrl(URL.createObjectURL(file));
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });

      cameraStreamRef.current = stream;
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

  function closeCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setIsCameraOpen(false);
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

      setImageUrl(URL.createObjectURL(blob));
      setMessage("");
      closeCamera();
    }, "image/jpeg");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-neutral-900">
      <h1 className="text-center text-3xl font-semibold">{title}</h1>

      <div
        aria-label="Selected image preview"
        className="relative flex min-h-64 w-full max-w-xl items-center justify-center overflow-hidden rounded-md border border-neutral-300 bg-neutral-50"
      >
        {isCameraOpen ? (
          <video
            aria-label="Live camera preview"
            autoPlay
            className="h-full max-h-[28rem] w-full object-contain"
            playsInline
            ref={videoRef}
          />
        ) : imageUrl ? (
          <Image
            alt="Selected QR image"
            className="h-full max-h-[28rem] w-full object-contain"
            height={768}
            src={imageUrl}
            unoptimized
            width={1024}
          />
        ) : (
          <p className="px-4 text-center text-sm text-neutral-500">
            Captured or chosen image will appear here.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          disabled={isOpeningCamera}
          onClick={isCameraOpen ? capturePhoto : openCamera}
          type="button"
        >
          {isOpeningCamera
            ? "Opening camera..."
            : isCameraOpen
              ? "Take photo"
              : "Capture"}
        </button>
        {isCameraOpen && (
          <button
            className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            onClick={closeCamera}
            type="button"
          >
            Cancel
          </button>
        )}

        <input
          accept="image/*"
          className="sr-only"
          onChange={loadSelectedImage}
          ref={fileInputRef}
          tabIndex={-1}
          type="file"
        />
        <button
          className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Choose QR image
        </button>
      </div>

      <p aria-live="polite" className="text-sm text-neutral-600">
        {message}
      </p>
    </main>
  );
}
