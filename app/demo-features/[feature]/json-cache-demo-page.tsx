"use client";

import { useState } from "react";
import { jsonCacheConfig } from "@/config/demo-features";
import { createClient } from "@/utils/supabase/client";

export default function JsonCacheDemo({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [cachedJson, setCachedJson] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReadingServer, setIsReadingServer] = useState(false);

  async function saveToCache() {
    setMessage("");
    setCachedJson(null);

    try {
      if (!("caches" in window)) {
        throw new Error("The Cache API is not available in this browser.");
      }

      const cache = await window.caches.open(jsonCacheConfig.cacheName);
      const json = JSON.stringify({ value: input });

      await cache.put(
        jsonCacheConfig.cacheKey,
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

      const cache = await window.caches.open(jsonCacheConfig.cacheName);
      const response = await cache.match(jsonCacheConfig.cacheKey);

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

      const cache = await window.caches.open(jsonCacheConfig.cacheName);
      const wasDeleted = await cache.delete(jsonCacheConfig.cacheKey);

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

  async function saveJsonToServer() {
    setMessage("");
    setIsUploading(true);

    try {
      const supabase = createClient();
      const json = JSON.stringify({ value: input }, null, 2);
      const fileName = `${jsonCacheConfig.storageFileNamePrefix}-${crypto.randomUUID()}.json`;
      const objectPath = `${jsonCacheConfig.storageObjectFolder}/${fileName}`;
      const file = new File([json], fileName, { type: "application/json" });
      const { error } = await supabase.storage
        .from(jsonCacheConfig.storageBucketName)
        .upload(objectPath, file, {
          contentType: "application/json",
        });

      if (error) {
        throw error;
      }

      setMessage(
        `Saved JSON to Supabase Storage: ${jsonCacheConfig.storageBucketName}/${objectPath}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";

      setMessage(
        errorMessage === "Bucket not found"
          ? `Could not save JSON to Supabase Storage: the "${jsonCacheConfig.storageBucketName}" bucket does not exist. Create it in Supabase Storage or update storageBucketName in config/demo-features.ts to match an existing bucket.`
          : errorMessage.includes("row-level security policy")
            ? `Could not save JSON to Supabase Storage: this app has no sign-in flow, so the request uses the anon role. Add an INSERT policy for anon on the "${jsonCacheConfig.storageBucketName}" bucket and "${jsonCacheConfig.storageObjectFolder}/" folder, or add sign-in and authorize authenticated users.`
            : `Could not save JSON to Supabase Storage: ${errorMessage}`,
      );
      console.error("Error saving JSON to Supabase Storage:", error);
    } finally {
      setIsUploading(false);
    }
  }

  async function readJsonFromServer() {
    setMessage("");
    setCachedJson(null);
    setIsReadingServer(true);

    try {
      const supabase = createClient();
      const bucket = supabase.storage.from(jsonCacheConfig.storageBucketName);
      const { data: files, error: listError } = await bucket.list(
        jsonCacheConfig.storageObjectFolder,
        {
          limit: 100,
          search: `${jsonCacheConfig.storageFileNamePrefix}-`,
          sortBy: { column: "created_at", order: "desc" },
        },
      );

      if (listError) {
        throw listError;
      }

      const latestFile = files.find(
        (file) =>
          file.name.startsWith(`${jsonCacheConfig.storageFileNamePrefix}-`) &&
          file.name.endsWith(".json"),
      );

      if (!latestFile) {
        setMessage("There are no saved JSON files in Supabase Storage yet.");
        return;
      }

      const objectPath = `${jsonCacheConfig.storageObjectFolder}/${latestFile.name}`;
      const { data: file, error: downloadError } =
        await bucket.download(objectPath);

      if (downloadError) {
        throw downloadError;
      }

      const data: unknown = JSON.parse(await file.text());
      setCachedJson(JSON.stringify(data, null, 2));
      setMessage(`Read JSON from Supabase Storage: ${objectPath}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";

      setMessage(
        errorMessage.includes("row-level security policy")
          ? `Could not read JSON from Supabase Storage: add a SELECT policy for the current role on the "${jsonCacheConfig.storageBucketName}" bucket and "${jsonCacheConfig.storageObjectFolder}/" folder.`
          : `Could not read JSON from Supabase Storage: ${errorMessage}`,
      );
      console.error("Error reading JSON from Supabase Storage:", error);
    } finally {
      setIsReadingServer(false);
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
          <button
            className="rounded-md border border-neutral-300 px-5 py-3 font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUploading}
            onClick={saveJsonToServer}
            type="button"
          >
            {isUploading ? "Saving JSON..." : "Save JSON to Server"}
          </button>
          <button
            className="rounded-md border border-neutral-300 px-5 py-3 font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isReadingServer}
            onClick={readJsonFromServer}
            type="button"
          >
            {isReadingServer ? "Reading JSON..." : "Read JSON from Server"}
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
