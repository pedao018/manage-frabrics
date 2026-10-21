"use client";

import { useEffect, useRef, useState } from "react";
import { voiceRecordingConfig } from "@/config/demo-features";

type SavedRecording = {
  audio: Blob;
  savedAt: number;
};

function openRecordingDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(voiceRecordingConfig.databaseName, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(voiceRecordingConfig.storeName)) {
        database.createObjectStore(voiceRecordingConfig.storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open local recording storage."));
  });
}

async function saveRecording(recording: SavedRecording): Promise<void> {
  const database = await openRecordingDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        voiceRecordingConfig.storeName,
        "readwrite",
      );
      transaction.objectStore(voiceRecordingConfig.storeName).put(
        recording,
        voiceRecordingConfig.recordingKey,
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Could not save the recording."));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Saving the recording was aborted."));
    });
  } finally {
    database.close();
  }
}

async function loadRecording(): Promise<SavedRecording | undefined> {
  const database = await openRecordingDatabase();

  try {
    return await new Promise<SavedRecording | undefined>((resolve, reject) => {
      const transaction = database.transaction(
        voiceRecordingConfig.storeName,
        "readonly",
      );
      const request = transaction
        .objectStore(voiceRecordingConfig.storeName)
        .get(voiceRecordingConfig.recordingKey);
      request.onsuccess = () =>
        resolve(request.result as SavedRecording | undefined);
      request.onerror = () =>
        reject(request.error ?? new Error("Could not read the saved recording."));
    });
  } finally {
    database.close();
  }
}

export default function VoiceRecordingDemo({ title }: { title: string }) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    void loadRecording()
      .then((recording) => {
        if (cancelled || !recording) {
          return;
        }
        const url = URL.createObjectURL(recording.audio);
        audioUrlRef.current = url;
        setAudioUrl(url);
        setMessage("Loaded the saved recording from this device.");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(
            `Could not load the local recording: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
          );
        }
      });

    return () => {
      cancelled = true;
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  function setRecordingUrl(blob: Blob) {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }
    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;
    setAudioUrl(url);
  }

  async function startRecording() {
    setMessage("");

    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
      const error =
        "Audio recording is unavailable in this browser. Use a supported browser over HTTPS or localhost.";
      setMessage(error);
      return;
    }

    setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const audio = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);

        if (audio.size === 0) {
          setMessage("No audio was captured. Please record again.");
          return;
        }

        setRecordingUrl(audio);
        setIsSaving(true);
        void saveRecording({
          audio,
          savedAt: Date.now(),
        })
          .then(() => setMessage("Recording saved on this device."))
          .catch((error: unknown) =>
            setMessage(
              `Recording captured but could not be saved locally: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
            ),
          )
          .finally(() => setIsSaving(false));
      });

      recorder.addEventListener("error", () => {
        setMessage("The audio recording failed. Please try again.");
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
      });

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMessage(
        `Could not start recording: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
      );
    } finally {
      setIsStarting(false);
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

      <section
        aria-labelledby="recording-audio-heading"
        className="flex min-h-40 w-full max-w-xl flex-col items-center justify-center gap-4 rounded-md border border-neutral-300 bg-neutral-50 p-6"
      >
        <h2 className="text-lg font-medium" id="recording-audio-heading">
          Voice recording
        </h2>
        {audioUrl ? (
          <audio className="w-full" controls src={audioUrl}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p className="text-sm text-neutral-500">
            Your saved voice recording will appear here.
          </p>
        )}
      </section>

      <button
        className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSaving || isStarting}
        onClick={isRecording ? stopRecording : startRecording}
        type="button"
      >
        {isStarting
          ? "Requesting microphone..."
          : isSaving
          ? "Saving recording..."
          : isRecording
            ? "Stop recording"
            : "Recording voice"}
      </button>

      <p aria-live="polite" className="text-center text-sm text-neutral-600">
        {message}
      </p>
    </main>
  );
}
