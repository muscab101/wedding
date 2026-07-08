"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Trash2, Loader2, Film, Calendar, Video } from "lucide-react";
import type { VideoItem } from "@/lib/types";

export default function VideosAdminPage() {
  const { loading } = useAdminAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (loading) return;
    const load = async () => {
      const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
      setVideos((data ?? []) as VideoItem[]);
    };
    load();
    const channel = supabase
      .channel("videos-admin-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "videos" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this video?")) {
      await supabase.from("videos").delete().eq("id", id);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );

  return (
    <main className="flex-1 space-y-6 p-6 md:p-10">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-brand">Video Greetings</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review and moderate the clips shared by your guests.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-brand">
            <Video className="h-3.5 w-3.5" /> {videos.length} clips
          </span>
        </header>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-16 text-center">
            <Film className="mb-3 h-10 w-10 text-brand/25" />
            <h4 className="text-sm font-medium text-foreground">No video clips shared yet</h4>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              When guests upload greetings from the Wishes page, they appear here for review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((vid) => (
              <div key={vid.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                <div className="absolute right-3 top-3 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(vid.id)}
                    className="rounded-md bg-card/90 p-1.5 text-muted-foreground shadow-sm transition hover:text-red-600"
                    title="Delete Video"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="aspect-video bg-black">
                  <video src={vid.video_url} controls preload="metadata" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="truncate text-sm font-semibold text-foreground">From: {vid.name}</span>
                  {vid.created_at && (
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(vid.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </main>
  );
}
