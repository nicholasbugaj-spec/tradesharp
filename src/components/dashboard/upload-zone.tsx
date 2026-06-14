"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnalysisResult } from "@/types";

interface UploadZoneProps {
  onResult: (result: AnalysisResult) => void;
  uploadsUsed: number;
  uploadsLimit: number | null;
  plan: string;
}

export function UploadZone({
  onResult,
  uploadsUsed,
  uploadsLimit,
  plan,
}: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLimitReached =
    uploadsLimit !== null && uploadsUsed >= uploadsLimit;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (!f) return;
      setError(null);
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLimitReached || loading,
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === "file-too-large") {
        setError("File is too large. Maximum size is 10MB.");
      } else if (err?.code === "file-invalid-type") {
        setError("Invalid file type. Please upload a JPG, PNG, or WebP image.");
      } else {
        setError("Failed to upload file. Please try again.");
      }
    },
  });

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      onResult(data);
      clearFile();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Usage indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {uploadsLimit === null ? (
            <span className="text-success font-medium">Unlimited analyses</span>
          ) : (
            <>
              <span className={cn(
                "font-medium",
                isLimitReached ? "text-danger" : uploadsUsed >= uploadsLimit * 0.75 ? "text-warning" : "text-text-primary"
              )}>
                {uploadsUsed}/{uploadsLimit}
              </span>
              {" "}analyses used today
            </>
          )}
        </p>
        {plan === "basic" && (
          <a href="/pricing" className="text-xs text-primary hover:underline">
            Upgrade for more
          </a>
        )}
      </div>

      {/* Progress bar */}
      {uploadsLimit !== null && (
        <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isLimitReached ? "bg-danger" : uploadsUsed / uploadsLimit >= 0.75 ? "bg-warning" : "bg-primary"
            )}
            style={{
              width: `${Math.min(100, (uploadsUsed / uploadsLimit) * 100)}%`,
            }}
          />
        </div>
      )}

      {/* Limit reached warning */}
      {isLimitReached && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
          <AlertCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-danger font-medium">Daily limit reached</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Upgrade to Pro for 50 analyses/day or Elite for unlimited.
            </p>
            <a href="/pricing" className="text-xs text-primary hover:underline mt-1 block">
              View upgrade options →
            </a>
          </div>
        </div>
      )}

      {/* Drop zone */}
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
            isDragActive
              ? "border-primary bg-primary/5"
              : isLimitReached
              ? "border-border bg-surface opacity-50 cursor-not-allowed"
              : "border-border hover:border-primary/50 hover:bg-surface-2 bg-surface"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                isDragActive
                  ? "bg-primary/20"
                  : "bg-surface-2"
              )}
            >
              <Upload
                className={cn(
                  "h-7 w-7 transition-colors",
                  isDragActive ? "text-primary" : "text-muted"
                )}
              />
            </div>
            <div>
              <p className="text-text-primary font-medium">
                {isDragActive
                  ? "Drop your screenshot here"
                  : "Drag & drop your screenshot"}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                or{" "}
                <span className="text-primary hover:underline">
                  browse files
                </span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted">
              <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border">⚽ Sportsbooks</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border">🔮 Prediction Markets</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border">₿ Crypto Charts</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border">📈 Stock Charts</span>
            </div>
            <p className="text-xs text-muted">
              JPG, PNG, WebP — max 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-surface">
          {/* Preview */}
          <div className="relative">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Upload preview"
                className="w-full max-h-64 object-contain bg-surface-2"
              />
            )}
            <button
              onClick={clearFile}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* File info + action */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              loading={loading}
              disabled={loading}
              className="flex-shrink-0"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20">
          <AlertCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}
    </div>
  );
}
