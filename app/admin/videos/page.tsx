"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Film, Calendar, Video } from "lucide-react";
import { AdminSidebar } from "../_components/admin-sidebar";
import type { VideoItem } from "@/lib/types";

export default function VideosAdminPage() {
  const { loading } = useAdminAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (loading) return;

    // Guests upload clips from /wishes into the `videos` table.
    const load = async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });
      setVideos((data ?? []) as VideoItem[]);
    };
    load();

    const channel = supabase
      .channel("videos-admin-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        load
      )
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="flex bg-[#FFF0F5]/20 min-h-screen text-black">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif text-[#8B4F58]">Video Greetings</h1>
            <p className="text-sm text-gray-500">
              Review and moderate the video clips shared by your guests.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[#8B4F58]/10 text-[#8B4F58] px-3 py-1.5 rounded-full text-xs font-medium">
            <Video className="h-3.5 w-3.5" /> {videos.length} clips
          </span>
        </div>

        {videos.length === 0 ? (
          <Card className="bg-white border-[#8B4F58]/10 rounded-2xl shadow-xl shadow-[#8B4F58]/5">
            <CardContent className="flex flex-col items-center justify-center text-center p-16">
              <Film className="w-10 h-10 text-[#8B4F58]/20 mb-3" />
              <h4 className="text-sm font-medium text-gray-600">
                No video clips shared yet
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                When guests upload greetings from the Wishes page, they will
                appear here for you to review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <Card
                key={vid.id}
                className="bg-white border-[#8B4F58]/10 rounded-2xl shadow-xl shadow-[#8B4F58]/5 overflow-hidden group relative"
              >
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(vid.id)}
                    className="p-1.5 rounded-md bg-white/90 text-gray-500 hover:text-red-600 shadow-sm hover:bg-white transition-all"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="aspect-video bg-black">
                  <video
                    src={vid.video_url}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 truncate">
                    From: {vid.name}
                  </span>
                  {vid.created_at && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {new Date(vid.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
