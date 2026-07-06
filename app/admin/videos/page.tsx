"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, PlayCircle } from "lucide-react";
import { AdminSidebar } from "../_components/admin-sidebar";

export default function VideosAdminPage() {
  const { loading } = useAdminAuth();
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    return onSnapshot(collection(db, "videos"), (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [loading]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this generated video asset?")) {
      await deleteDoc(doc(db, "videos", id));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex bg-[#FFF0F5]/20 min-h-screen text-black">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-[#8B4F58]">DevToon Media Assets</h1>
          <p className="text-sm text-gray-500">Monitor and view code-to-video render distributions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((vid) => (
            <Card key={vid.id} className="bg-white border-[#8B4F58]/10 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-black aspect-video relative flex items-center justify-center">
                {vid.videoUrl ? (
                  <video src={vid.videoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center gap-2 text-xs">
                    <PlayCircle className="h-8 w-8 text-gray-600" /> [ Missing Video Source Stream ]
                  </div>
                )}
              </div>
              <CardHeader className="p-4 flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base truncate max-w-[200px]">{vid.title || "Untitled Sequence"}</CardTitle>
                  <CardDescription className="text-xs">Pass ID Association: {vid.associatedPass || "None"}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(vid.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}