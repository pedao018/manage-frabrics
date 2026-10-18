"use client";

import { useState } from "react";

const CACHE_NAME = "manage-frabrics-demo-cache-v1";
const CACHE_KEY = "/__demo-cache/input-text-json-cache.json";

export default function JsonCacheDemo({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [cachedJson, setCachedJson] = useState<string | null>(null);

  async function saveToCache() {
    setMessage("");
    setCachedJson(null);

    try {
      if (!("caches" in window)) {
        throw new Error("The Cache API is not available in this browser.");
      }

      const cache = await window.caches.open(CACHE_NAME);
      const json = JSON.stringify({ value: input });

      await cache.put(
        CACHE_KEY,
        new Response(json, {
          headers: { "Content-Type": "application/json" },
        }),
      );

      setMessage("Saved your input as JSON in this browser's cache.");
    } catch (error) {
      setMessage(
        `Could not save to cache: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
      );
    }
  }

  async function readFromCache() {
    setMessage("");
    setCachedJson(null);

    try {
      if (!("caches" in window)) {
        throw new Error("The Cache API is not available in this browser.");
      }

      const cache = await window.caches.open(CACHE_NAME);
      const response = await cache.match(CACHE_KEY);

      if (!response) {
        setMessage("There is no saved JSON in the cache yet.");
        return;
      }

      const data: unknown = await response.json();
      setCachedJson(JSON.stringify(data, null, 2));
      console.log("Cached JSON read from cache:", data);  
    } catch (error) {
      setMessage(
        `Could not read from cache: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
      );
    }
  }

  async function clearCache() {
    setMessage("");
    setCachedJson(null);

    try {
      if (!("caches" in window)) {
        throw new Error("The Cache API is not available in this browser.");
      }

      const cache = await window.caches.open(CACHE_NAME);
      const wasDeleted = await cache.delete(CACHE_KEY);

      setMessage(
        wasDeleted
          ? "Cleared the saved JSON from cache."
          : "There is no saved JSON in the cache to clear.",
      );
    } catch (error) {
      setMessage(
        `Could not clear cache: ${error instanceof Error ? error.message : "An unknown error occurred."}`,
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-neutral-900">
      <h1 className="text-center text-3xl font-semibold">{title}</h1>

      <div className="flex w-full max-w-xl flex-col gap-4">
        <label className="flex flex-col gap-2 font-medium" htmlFor="cache-input">
          Input text
          <textarea
            className="min-h-32 resize-y rounded-md border border-neutral-300 p-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            id="cache-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Enter any text, number, or symbols"
            value={input}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-md bg-neutral-900 px-5 py-3 font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            onClick={saveToCache}
            type="button"
          >
            Save to cache
          </button>
          <button
            className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            onClick={readFromCache}
            type="button"
          >
            Read from cache
          </button>
          <button
            className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            onClick={clearCache}
            type="button"
          >
            Clear cache
          </button>
        </div>

        <div aria-live="polite" className="break-words text-sm">
          {message && <p>{message}</p>}
          {cachedJson !== null && (
            <pre className="overflow-x-auto rounded-md bg-neutral-100 p-4 text-left">
              {cachedJson}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
