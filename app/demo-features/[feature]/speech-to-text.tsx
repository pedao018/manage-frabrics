"use client";

import { useEffect, useRef, useState } from "react";

type SpeechRecognitionResultLike = ArrayLike<{
  transcript: string;
}> & {
  isFinal: boolean;
};

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = Event & {
  error: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const speechLanguages = [
  { label: "English", locale: "en-US" },
  { label: "Vietnamese", locale: "vi-VN" },
] as const;

type SpeechLanguage = (typeof speechLanguages)[number]["locale"];

function isSpeechLanguage(value: string): value is SpeechLanguage {
  return speechLanguages.some((language) => language.locale === value);
}

const speechRecognitionErrors: Record<string, string> = {
  "not-allowed":
    "Microphone permission was denied. Allow microphone access in your browser settings, then try again.",
  "service-not-allowed":
    "Speech recognition is unavailable in this browser or is blocked by browser settings.",
  "audio-capture":
    "The browser could not access a microphone. Check your microphone connection and permissions.",
  network:
    "The browser speech recognition service is unavailable or could not connect. Check your connection or try another supported browser.",
  "language-not-supported":
    "Speech recognition does not support the selected browser language.",
  "no-speech": "No speech was detected. Try speaking closer to the microphone.",
  aborted: "Speech recognition was stopped.",
};

export default function SpeechToTextDemo({ title }: { title: string }) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const errorMessageRef = useRef("");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<SpeechLanguage>("en-US");
  const [message, setMessage] = useState("");

  useEffect(
    () => () => {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    },
    [],
  );

  function startListening() {
    setTranscript("");
    finalTranscriptRef.current = "";
    errorMessageRef.current = "";
    setMessage("");

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setMessage(
        "Speech recognition is not supported in this browser. Try another browser that supports Web Speech Recognition.",
      );
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognitionRef.current = recognition;
    isListeningRef.current = true;
    setIsListening(true);

    recognition.onstart = () => {
      setIsListening(true);
      setMessage(`Listening in ${recognition.lang}. Speak to see live transcription.`);
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const resultText = result[0]?.transcript.trim();
        if (!resultText) {
          continue;
        }

        if (result.isFinal) {
          finalTranscriptRef.current = [
            finalTranscriptRef.current,
            resultText,
          ]
            .filter(Boolean)
            .join(" ");
        } else {
          interimTranscript = [interimTranscript, resultText]
            .filter(Boolean)
            .join(" ");
        }
      }

      setTranscript(
        [finalTranscriptRef.current, interimTranscript].filter(Boolean).join(" "),
      );
      setMessage("Live transcription is active.");
    };

    recognition.onerror = (event) => {
      isListeningRef.current = false;
      setIsListening(false);
      errorMessageRef.current =
        speechRecognitionErrors[event.error] ??
        `Speech recognition is unavailable or failed${event.error ? ` (${event.error})` : ""}.`;
      setMessage(errorMessageRef.current);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);

      if (isListeningRef.current) {
        isListeningRef.current = false;
        setMessage(
          errorMessageRef.current ||
            "Speech recognition stopped unexpectedly. Press Start listening to try again.",
        );
      }
    };

    try {
      recognition.start();
    } catch (error) {
      isListeningRef.current = false;
      recognitionRef.current = null;
      setIsListening(false);
      setMessage(
        `Could not start speech recognition: ${error instanceof Error ? error.message : "the browser rejected the request."}`,
      );
    }
  }

  function stopListening() {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setMessage("Speech recognition stopped.");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-neutral-900">
      <h1 className="text-center text-3xl font-semibold">{title}</h1>

      <section
        aria-labelledby="speech-result-heading"
        className="min-h-48 w-full max-w-xl rounded-md border border-neutral-300 bg-neutral-50 p-6"
      >
        <h2 className="text-lg font-medium" id="speech-result-heading">
          Live transcription
        </h2>
        <p aria-live="polite" className="mt-3 min-h-6 whitespace-pre-wrap text-sm">
          {transcript || "Your recognized speech will appear here."}
        </p>
      </section>

      <label className="flex items-center gap-3 text-sm" htmlFor="speech-language">
        Recognition language
        <select
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 disabled:opacity-60"
          disabled={isListening}
          id="speech-language"
          onChange={(event) => {
            if (isSpeechLanguage(event.target.value)) {
              setLanguage(event.target.value);
            }
          }}
          value={language}
        >
          {speechLanguages.map((option) => (
            <option key={option.locale} value={option.locale}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        onClick={isListening ? stopListening : startListening}
        type="button"
      >
        {isListening ? "Stop listening" : "Start listening"}
      </button>

      <p
        aria-live="polite"
        className={`max-w-xl text-center text-sm ${
          message === "Live transcription is active."
            ? "speech-status-active"
            : "text-neutral-600"
        }`}
      >
        {message}
      </p>
      <p className="max-w-xl text-center text-xs text-neutral-500">
        Recognition is provided by your browser. Availability and network
        requirements vary between browsers and devices. Only the selected
        language is recognized during each listening session.
      </p>
    </main>
  );
}
