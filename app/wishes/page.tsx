"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import type { Wish, VideoItem } from "@/lib/types";
import {
  MessageSquareHeart,
  Heart,
  Video,
  Send,
  UploadCloud,
  Film,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  Pencil,
  Trash2,
  Check,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "../_components/Navbar";
import { useI18n } from "@/lib/i18n";

interface CustomToast {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export default function WishesAndVideosPage() {
  const { t } = useI18n();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toastNotification, setToastNotification] = useState<CustomToast | null>(null);

  const showToast = ({ title, description, variant = "default" }: CustomToast) => {
    setToastNotification({ title, description, variant });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [wishesLoading, setWishesLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);

  const [formData, setFormData] = useState({ name: "", relation: "", text: "" });
  const [submittingWish, setSubmittingWish] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [updatingWish, setUpdatingWish] = useState(false);

  const [likedWishes, setLikedWishes] = useState<Set<string>>(new Set());
  useEffect(() => {
    const saved = localStorage.getItem("liked_wishes");
    if (saved) setLikedWishes(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setCurrentUser(data.session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setCurrentUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("wishes").select("*").order("created_at", { ascending: false });
      setWishes((data ?? []) as Wish[]);
      setWishesLoading(false);
    };
    load();
    const channel = supabase
      .channel("wishes-feed-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishes" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
      setVideos((data ?? []) as VideoItem[]);
      setVideosLoading(false);
    };
    load();
    const channel = supabase
      .channel("videos-feed-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) {
      showToast({ title: "Error", description: "Please fill in your name and message.", variant: "destructive" });
      return;
    }
    setSubmittingWish(true);
    try {
      const { error } = await supabase.from("wishes").insert({
        name: formData.name,
        relation: formData.relation || "Guest",
        text: formData.text,
      });
      if (error) throw error;
      setFormData({ name: "", relation: "", text: "" });
      showToast({ title: "Success!", description: "Your beautiful wish has been sent." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to send wish. Try again.", variant: "destructive" });
    } finally {
      setSubmittingWish(false);
    }
  };

  const handleUpdateWish = async (id: string) => {
    if (!editText.trim()) {
      showToast({ title: "Error", description: "Message cannot be empty.", variant: "destructive" });
      return;
    }
    setUpdatingWish(true);
    try {
      const { error } = await supabase.from("wishes").update({ text: editText }).eq("id", id);
      if (error) throw error;
      setEditingWishId(null);
      showToast({ title: "Updated!", description: "Wish message updated successfully." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to update wish.", variant: "destructive" });
    } finally {
      setUpdatingWish(false);
    }
  };

  // One like per wish per device — optimistic bump + atomic DB increment.
  const handleLikeWish = async (id: string) => {
    if (likedWishes.has(id)) return;
    const nextLiked = new Set(likedWishes).add(id);
    setLikedWishes(nextLiked);
    localStorage.setItem("liked_wishes", JSON.stringify([...nextLiked]));
    setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, likes: (w.likes ?? 0) + 1 } : w)));

    const { error } = await supabase.rpc("increment_wish_likes", { wish_id: id });
    if (error) {
      console.error("Failed to like wish:", error);
      const reverted = new Set(nextLiked);
      reverted.delete(id);
      setLikedWishes(reverted);
      localStorage.setItem("liked_wishes", JSON.stringify([...reverted]));
      setWishes((prev) => prev.map((w) => (w.id === id ? { ...w, likes: Math.max(0, (w.likes ?? 1) - 1) } : w)));
    }
  };

  const handleDeleteWish = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const { error } = await supabase.from("wishes").delete().eq("id", id);
      if (error) throw error;
      showToast({ title: "Deleted", description: "Wish has been removed." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to delete wish.", variant: "destructive" });
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);
      if (error) throw error;
      showToast({ title: "Deleted", description: "Video clip has been removed." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to delete video.", variant: "destructive" });
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;
    setUploadingVideo(true);
    try {
      const filePath = `${Date.now()}_${videoFile.name.replace(/\s+/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("wedding-videos")
        .upload(filePath, videoFile, { contentType: videoFile.type });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("wedding-videos").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("videos").insert({
        name: currentUser?.email?.split("@")[0] || "Anonymous Guest",
        video_url: publicUrl,
      });
      if (insertError) throw insertError;

      setVideoFile(null);
      showToast({ title: "Video Shared!", description: "Your video clip is now live on the wall." });
    } catch (error) {
      console.error(error);
      showToast({ title: "Upload Failed", description: "Something went wrong during video upload.", variant: "destructive" });
    } finally {
      setUploadingVideo(false);
    }
  };

  const tabTrigger =
    "flex items-center gap-2 rounded-full px-6 h-10 text-sm font-medium transition data-[state=active]:bg-brand data-[state=active]:text-white";

  return (
    <>
      <Navbar />
      <main className="relative mx-auto min-h-screen w-full max-w-6xl space-y-10 px-5 py-14 sm:px-8">
        {toastNotification && (
          <div
            className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg ${
              toastNotification.variant === "destructive"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-border bg-card text-foreground"
            }`}
          >
            {toastNotification.variant === "destructive" ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            ) : (
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            )}
            <div className="flex-1 space-y-1">
              <h5 className="text-sm font-semibold">{toastNotification.title}</h5>
              <p className="text-xs opacity-90">{toastNotification.description}</p>
            </div>
            <button onClick={() => setToastNotification(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <header className="space-y-3 text-center">
          <span className="eyebrow">{t("wishes.eyebrow")}</span>
          <h1 className="font-serif text-4xl tracking-tight text-brand sm:text-5xl">{t("wishes.title")}</h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            {t("wishes.subtitle")}
          </p>
        </header>

        <Tabs defaultValue="wishes" className="w-full space-y-12">
          <div className="flex justify-center">
            <TabsList className="h-12 rounded-full border border-border bg-card p-1">
              <TabsTrigger value="wishes" className={tabTrigger}>
                <MessageSquareHeart className="h-4 w-4" /> {t("wishes.tabWishes")}
              </TabsTrigger>
              <TabsTrigger value="videos" className={tabTrigger}>
                <Video className="h-4 w-4" /> {t("wishes.tabVideos")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* WISHES */}
          <TabsContent value="wishes" className="grid grid-cols-1 gap-8 outline-none lg:grid-cols-12">
            <div className="h-fit space-y-6 rounded-3xl border border-border bg-card p-6 md:p-8 lg:col-span-5">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-semibold text-brand">{t("wishes.writeBlessing")}</h3>
                <p className="text-xs text-muted-foreground">{t("wishes.writeSub")}</p>
              </div>
              <form onSubmit={handleWishSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("wishes.yourName")}</label>
                  <Input
                    placeholder="e.g., Ahmed Mohamed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("wishes.relation")}</label>
                  <Input
                    placeholder={t("wishes.relationPlaceholder")}
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">{t("wishes.message")}</label>
                  <Textarea
                    placeholder={t("wishes.messagePlaceholder")}
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="resize-none rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingWish}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-60"
                >
                  {submittingWish ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t("wishes.send")}
                </button>
              </form>
            </div>

            <div className="space-y-6 lg:col-span-7">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                {t("wishes.liveFeed")}
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-normal text-brand">
                  {wishes.length} {t("wishes.messages")}
                </span>
              </h3>

              {wishesLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-32 animate-pulse rounded-2xl border border-border bg-card" />
                  ))}
                </div>
              ) : wishes.length > 0 ? (
                <div className="custom-scrollbar grid max-h-[560px] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2">
                  {wishes.map((wish) => (
                    <div key={wish.id} className="group relative space-y-3 rounded-2xl border border-border bg-card p-5">
                      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        {editingWishId !== wish.id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingWishId(wish.id);
                                setEditText(wish.text);
                              }}
                              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-brand"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteWish(wish.id)}
                              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-bold uppercase text-brand">
                          {wish.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{wish.name}</h4>
                          <p className="text-[10px] font-medium text-muted-foreground">{wish.relation}</p>
                        </div>
                      </div>

                      {editingWishId === wish.id ? (
                        <div className="space-y-2 pt-1">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="resize-none rounded-lg text-xs"
                            rows={3}
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingWishId(null)}
                              className="flex h-7 items-center gap-1 rounded-lg border border-border px-2.5 text-xs text-foreground"
                            >
                              <XCircle className="h-3 w-3" /> Cancel
                            </button>
                            <button
                              disabled={updatingWish}
                              onClick={() => handleUpdateWish(wish.id)}
                              className="flex h-7 items-center gap-1 rounded-lg bg-brand px-2.5 text-xs text-white"
                            >
                              {updatingWish ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed text-muted-foreground">&ldquo;{wish.text}&rdquo;</p>
                      )}

                      <div className="flex items-center pt-1">
                        <motion.button
                          type="button"
                          onClick={() => handleLikeWish(wish.id)}
                          whileTap={{ scale: 0.8 }}
                          disabled={likedWishes.has(wish.id)}
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                            likedWishes.has(wish.id)
                              ? "bg-accent text-brand"
                              : "text-muted-foreground hover:bg-accent hover:text-brand"
                          }`}
                          aria-label="Like this wish"
                        >
                          <Heart className={`h-3.5 w-3.5 transition-all ${likedWishes.has(wish.id) ? "fill-brand text-brand" : ""}`} />
                          <span>{wish.likes ?? 0}</span>
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
                  <MessageSquareHeart className="mb-2 h-8 w-8 text-brand/30" />
                  <h4 className="text-sm font-medium text-foreground">{t("wishes.noWishes")}</h4>
                  <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">{t("wishes.beFirstWish")}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* VIDEOS */}
          <TabsContent value="videos" className="space-y-8 outline-none">
            <div className="mx-auto max-w-xl space-y-4 rounded-3xl border border-border bg-card p-6 text-center">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-semibold text-brand">{t("wishes.uploadTitle")}</h3>
                <p className="text-xs text-muted-foreground">{t("wishes.uploadSub")}</p>
              </div>
              <form onSubmit={handleVideoUpload} className="space-y-4">
                <div className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 transition hover:bg-muted/60">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    disabled={uploadingVideo}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <UploadCloud className="h-8 w-8 text-muted-foreground transition group-hover:text-brand" />
                  <span className="text-xs font-medium text-foreground">
                    {videoFile ? videoFile.name : t("wishes.uploadHint")}
                  </span>
                </div>
                {uploadingVideo && (
                  <div className="w-full space-y-1.5">
                    <div className="text-xs font-semibold text-muted-foreground">{t("wishes.uploading")}</div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-full animate-pulse bg-brand" />
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!videoFile || uploadingVideo}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50"
                >
                  {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                  {t("wishes.shareVideo")}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground md:justify-start">
                {t("wishes.videoStream")}
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-normal text-brand">{videos.length} {t("wishes.clips")}</span>
              </h3>
              {videosLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="aspect-[4/3] animate-pulse rounded-2xl border border-border bg-card" />
                  ))}
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {videos.map((vid) => (
                    <div key={vid.id} className="group relative space-y-2 rounded-2xl border border-border bg-card p-3">
                      <div className="absolute right-5 top-5 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="rounded-md bg-card/90 p-1.5 text-muted-foreground shadow-sm transition hover:text-red-600"
                          title="Delete Video"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-black">
                        <video src={vid.video_url} controls className="h-full w-full object-cover" preload="metadata" />
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="truncate text-xs font-semibold text-foreground">From: {vid.name}</span>
                        <span className="text-[10px] text-muted-foreground">Shared Live</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
                  <Film className="mb-2 h-8 w-8 text-brand/30" />
                  <h4 className="text-sm font-medium text-foreground">{t("wishes.noVideos")}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("wishes.beFirstVideo")}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
