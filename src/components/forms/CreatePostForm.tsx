"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Image, Link2, AlignLeft, Bold, Italic, Code,
  X, Hash, ChevronDown, ExternalLink, CheckCircle2, UploadCloud
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn, shortenAddress } from "@/lib/utils";

type PostTab = "text" | "image" | "link";

interface Community {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultCommunity?: string;
}

// ─── tiny markdown helpers ────────────────────────────────────────────────────
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
  setter: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const next =
    textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
  setter(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
  });
}

export default function CreatePostForm({ onSuccess, onCancel, defaultCommunity }: Props = {}) {
  const router = useRouter();
  const { walletAddress, username, userId, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<PostTab>("text");

  // Fields
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkBody, setLinkBody] = useState("");

  // Tags
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Community
  const [communitySearch, setCommunitySearch] = useState(defaultCommunity ?? "");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [commDropdown, setCommDropdown] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  // State
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [linkValid, setLinkValid] = useState<boolean | null>(null);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const commRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Fetch communities ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/communities")
      .then((r) => r.json())
      .then((d) => {
        const list: Community[] = (d.communities ?? []).map((c: { id?: string; _id?: string; name: string; slug: string; icon?: string; iconUrl?: string }) => ({
          id: c.id ?? c._id ?? "",
          name: c.name,
          slug: c.slug,
          icon: c.icon ?? c.iconUrl ?? "🌐",
        }));
        setCommunities(list);
        if (defaultCommunity) {
          const match = list.find(
            (c) => c.slug === defaultCommunity || c.name.toLowerCase() === defaultCommunity.toLowerCase()
          );
          if (match) { setSelectedCommunity(match); setCommunitySearch(match.name); }
        }
      })
      .catch(() => {});
  }, [defaultCommunity]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (commRef.current && !commRef.current.contains(e.target as Node)) {
        setCommDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Validate link URL ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!linkUrl.trim()) { setLinkValid(null); return; }
    try { new URL(linkUrl); setLinkValid(true); } catch { setLinkValid(false); }
  }, [linkUrl]);

  // ── Reset image preview error on URL change ────────────────────────────────
  useEffect(() => { setImagePreviewError(false); setUploadError(null); }, [imageUrl]);

  // ── File upload helpers ───────────────────────────────────────────────────
  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

  const uploadFile = async (file: File) => {
    setUploadError(null);
    setUploadProgress(0);
    const fd = new FormData();
    fd.append("file", file);
    try {
      // Use XMLHttpRequest for real progress events
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 95));
        };
        xhr.onload = () => {
          if (xhr.status === 201) {
            const data = JSON.parse(xhr.responseText);
            setUploadProgress(100);
            resolve(data.url as string);
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error ?? "Upload failed"));
            } catch {
              reject(new Error("Upload failed"));
            }
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(fd);
      });
      setImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  // ── Tag helpers ────────────────────────────────────────────────────────────
  const addTag = (raw: string) => {
    const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
  };
  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  // ── Filtered communities ───────────────────────────────────────────────────
  const filteredComms = communities
    .filter(
      (c) =>
        c.name.toLowerCase().includes(communitySearch.toLowerCase()) ||
        c.slug.toLowerCase().includes(communitySearch.toLowerCase())
    )
    .slice(0, 8);

  // ── Compute community slug for submission ──────────────────────────────────
  const communitySlug =
    selectedCommunity?.slug ??
    communitySearch
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "");

  // ── Can submit ─────────────────────────────────────────────────────────────
  const canSubmit =
    isAuthenticated &&
    !submitting &&
    uploadProgress === null &&
    title.trim().length >= 3 &&
    communitySlug.length > 0 &&
    (activeTab === "image" ? imageUrl.trim().length > 0 : activeTab === "link" ? linkValid === true : true);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = {
      title: title.trim(),
      content:
        activeTab === "text"
          ? body.trim()
          : activeTab === "image"
          ? imageCaption.trim()
          : linkBody.trim(),
      postType: activeTab,
      communitySlug,
      tags,
      imageUrl: activeTab === "image" ? imageUrl.trim() : undefined,
      linkUrl: activeTab === "link" ? linkUrl.trim() : undefined,
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) { setError("Please sign in to create a post."); setSubmitting(false); return; }
      if (res.status === 422) {
        const issues = data.issues as Record<string, string[]> | undefined;
        setError(issues ? Object.values(issues).flat()[0] : data.error ?? "Validation failed.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) { setError(data.error ?? "Failed to create post."); setSubmitting(false); return; }

      setDone(true);
      router.refresh();
      if (onSuccess) onSuccess();
      else router.push(communitySlug ? `/p/${communitySlug}` : "/");
    } catch {
      setError("Network error. Please check your connection.");
      setSubmitting(false);
    }
  };

  // ── Auth loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full" />
      </div>
    );
  }

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-xl border gap-3"
        style={{ borderColor: "var(--border)" }}>
        <p className="text-3xl">🔒</p>
        <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
          Sign in to create a post
        </h2>
        <p className="text-sm text-center max-w-xs" style={{ color: "var(--muted)" }}>
          Connect your wallet or sign in with Google first.
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 px-5 py-2 rounded-xl text-sm border hover:bg-white/5 transition-all"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            Close
          </button>
        )}
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <CheckCircle2 size={48} className="text-green-400" />
        <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Post published!</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Your post is live.</p>
      </div>
    );
  }

  const authorDisplay =
    username ?? (walletAddress ? shortenAddress(walletAddress) : userId ? "User" : "Anonymous");
  const authorInitials = (username ?? walletAddress ?? userId ?? "?").slice(0, 2).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Author strip */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
          {authorInitials}
        </div>
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {authorDisplay}
        </span>
      </div>

      {/* Community selector */}
      <div ref={commRef} className="relative">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-text transition-colors"
          style={{
            background: "var(--surface-2)",
            borderColor: commDropdown ? "#7c3aed" : "var(--border)",
          }}
          onClick={() => setCommDropdown(true)}>
          {selectedCommunity ? (
            <span className="text-base leading-none">{selectedCommunity.icon}</span>
          ) : (
            <div
              className="w-5 h-5 rounded-full border-2 border-dashed flex-shrink-0"
              style={{ borderColor: "var(--muted)" }}
            />
          )}
          <input
            type="text"
            placeholder="Choose a community"
            value={communitySearch}
            onChange={(e) => {
              setCommunitySearch(e.target.value);
              setSelectedCommunity(null);
              setCommDropdown(true);
            }}
            onFocus={() => setCommDropdown(true)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--foreground)" }}
          />
          <ChevronDown size={14} style={{ color: "var(--muted)" }} />
        </div>

        {commDropdown && filteredComms.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-1 rounded-xl border shadow-2xl z-50 overflow-hidden py-1"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            {filteredComms.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSelectedCommunity(c);
                  setCommunitySearch(c.name);
                  setCommDropdown(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: "var(--foreground)" }}>
                <span className="text-base">{c.icon}</span>
                <div>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>
                    🍐/{c.slug}
                  </span>
                </div>
              </button>
            ))}
            {communitySearch.trim() &&
              !filteredComms.find((c) => c.slug === communitySlug) && (
                <div
                  className="px-3 py-2 text-xs border-t"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                  Will post as <span style={{ color: "#a78bfa" }}>🍐/{communitySlug}</span>
                </div>
              )}
          </div>
        )}
        {selectedCommunity && (
          <p className="mt-1 px-1 text-xs" style={{ color: "#a78bfa" }}>
            🍐/{selectedCommunity.slug}
          </p>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {(
          [
            { id: "text" as PostTab, label: "Post", icon: <AlignLeft size={14} /> },
            { id: "image" as PostTab, label: "Images & Video", icon: <Image size={14} /> },
            { id: "link" as PostTab, label: "Link", icon: <Link2 size={14} /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px"
            )}
            style={{
              borderBottomColor: activeTab === tab.id ? "#a78bfa" : "transparent",
              color: activeTab === tab.id ? "#a78bfa" : "var(--muted)",
            }}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 300))}
          maxLength={300}
          className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none text-base font-medium focus:border-purple-500 transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <div className="flex justify-between mt-1 px-1">
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {title.trim().length < 3 && title.length > 0 ? "At least 3 characters required" : ""}
          </span>
          <span
            className="text-xs"
            style={{ color: title.length > 270 ? "#f87171" : "var(--muted)" }}>
            {title.length}/300
          </span>
        </div>
      </div>

      {/* ── TEXT TAB ───────────────────────────────── */}
      {activeTab === "text" && (
        <div
          className="flex flex-col rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)" }}>
          <div
            className="flex items-center gap-0.5 px-2 py-1.5 border-b"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
            {[
              {
                icon: <Bold size={13} />,
                action: () =>
                  bodyRef.current &&
                  wrapSelection(bodyRef.current, "**", "**", "bold text", setBody),
                title: "Bold",
              },
              {
                icon: <Italic size={13} />,
                action: () =>
                  bodyRef.current &&
                  wrapSelection(bodyRef.current, "*", "*", "italic text", setBody),
                title: "Italic",
              },
              {
                icon: <Code size={13} />,
                action: () =>
                  bodyRef.current &&
                  wrapSelection(bodyRef.current, "`", "`", "code", setBody),
                title: "Inline code",
              },
              {
                icon: <Link2 size={13} />,
                action: () =>
                  bodyRef.current &&
                  wrapSelection(bodyRef.current, "[", "](url)", "link text", setBody),
                title: "Link",
              },
            ].map((btn) => (
              <button
                key={btn.title}
                type="button"
                title={btn.title}
                onClick={btn.action}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
                style={{ color: "var(--muted)" }}>
                {btn.icon}
              </button>
            ))}
            <div className="h-4 w-px mx-1" style={{ background: "var(--border)" }} />
            <span className="text-xs px-1" style={{ color: "var(--muted)" }}>
              Markdown supported
            </span>
          </div>
          <textarea
            ref={bodyRef}
            placeholder="Text (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-transparent outline-none text-sm leading-relaxed resize-none"
            style={{ color: "var(--foreground)" }}
          />
        </div>
      )}

      {/* ── IMAGE TAB ──────────────────────────────── */}
      {activeTab === "image" && (
        <div className="flex flex-col gap-3">
          {/* Drop zone */}
          <div
            className={cn(
              "rounded-xl border-2 border-dashed transition-all",
              dragging && "scale-[1.005]",
              !imageUrl && "cursor-pointer"
            )}
            style={{
              borderColor: dragging
                ? "#7c3aed"
                : imageUrl && !imagePreviewError
                ? "#7c3aed"
                : "var(--border)",
              background: dragging ? "rgba(124,58,237,0.05)" : "transparent",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => { if (!imageUrl && uploadProgress === null) fileInputRef.current?.click(); }}
          >
            {uploadProgress !== null ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 px-6">
                <span className="animate-spin w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full" />
                <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%`, background: "var(--accent)" }}
                  />
                </div>
              </div>
            ) : imageUrl && !imagePreviewError ? (
              isVideoUrl(imageUrl) ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={imageUrl}
                  controls
                  className="w-full max-h-64 rounded-xl"
                  style={{ background: "#000" }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-64 w-full object-contain rounded-xl"
                  onError={() => setImagePreviewError(true)}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
                <UploadCloud size={36} style={{ color: "var(--muted)", opacity: 0.5 }} />
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Drag & drop or{" "}
                  <span
                    className="underline cursor-pointer"
                    style={{ color: "#a78bfa" }}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    browse
                  </span>
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  Images (JPG, PNG, GIF, WebP) · Videos (MP4, WebM) · up to 50 MB
                </p>
                {imagePreviewError && (
                  <p className="text-xs text-red-400">Could not load image — check the URL</p>
                )}
              </div>
            )}
          </div>

          {/* File upload error */}
          {uploadError && (
            <p className="text-xs text-red-400 px-1">{uploadError}</p>
          )}

          {/* Actions when file selected */}
          {imageUrl && uploadProgress === null && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-white/5 transition-all"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                <UploadCloud size={11} /> Replace
              </button>
              <button
                type="button"
                onClick={() => { setImageUrl(""); setImagePreviewError(false); setUploadError(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-white/5 transition-all"
                style={{ borderColor: "var(--border)", color: "#f87171" }}>
                <X size={11} /> Remove
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Divider + URL fallback */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--muted)" }}>or paste a URL</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <input
            type="text"
            placeholder="https://i.imgur.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none text-sm focus:border-purple-500 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value.slice(0, 200))}
            className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none text-sm focus:border-purple-500 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      )}

      {/* ── LINK TAB ───────────────────────────────── */}
      {activeTab === "link" && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="url"
              placeholder="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border bg-transparent outline-none text-sm focus:border-purple-500 transition-colors"
              style={{
                borderColor:
                  linkValid === false
                    ? "#f87171"
                    : linkValid === true
                    ? "#22c55e"
                    : "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <ExternalLink
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: linkValid === true ? "#22c55e" : "var(--muted)" }}
            />
            {linkValid === true && (
              <CheckCircle2
                size={14}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400"
              />
            )}
          </div>
          {linkValid === false && (
            <p className="text-xs text-red-400 -mt-2 px-1">
              Please enter a valid URL (include https://)
            </p>
          )}
          {linkValid === true && (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.2)" }}>
                <ExternalLink size={14} style={{ color: "#a78bfa" }} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--foreground)" }}>
                  {(() => {
                    try { return new URL(linkUrl).hostname; } catch { return linkUrl; }
                  })()}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                  {linkUrl}
                </p>
              </div>
            </div>
          )}
          <textarea
            placeholder="Comment / description (optional)"
            value={linkBody}
            onChange={(e) => setLinkBody(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none text-sm leading-relaxed resize-none focus:border-purple-500 transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      )}

      {/* Tags */}
      <div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: "rgba(124,58,237,0.15)",
                  color: "#a78bfa",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}>
                <Hash size={10} />
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="ml-0.5 hover:opacity-70">
                  <X size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
        {tags.length < 5 && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
            <Hash size={13} style={{ color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Add a tag and press Enter (up to 5)"
              value={tagInput}
              onChange={(e) =>
                setTagInput(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
                if (e.key === "," || e.key === " ") { e.preventDefault(); addTag(tagInput); }
              }}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--foreground)" }}
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm border"
          style={{
            background: "rgba(239,68,68,0.1)",
            borderColor: "rgba(239,68,68,0.3)",
            color: "#f87171",
          }}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel ?? (() => router.back())}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-white/5 transition-all"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
            canSubmit ? "hover:opacity-90 active:scale-[0.98]" : "opacity-40 cursor-not-allowed"
          )}
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
          {submitting ? (
            <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <Send size={14} />
              Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
