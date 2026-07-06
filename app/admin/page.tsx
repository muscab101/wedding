"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, MessageSquare, Video, Loader2 } from "lucide-react";
import { AdminSidebar } from "./_components/admin-sidebar";

export default function AdminDashboard() {
  const { loading } = useAdminAuth();
  const [stats, setStats] = useState({
    guests: 0,
    scanned: 0,
    messages: 0,
    videos: 0,
  });

  useEffect(() => {
    if (loading) return;

    // Waxaan ka soo qaadeynaa xogta collections-ka
    const fetchData = async () => {
      const guestsSnap = await getDocs(collection(db, "rsvps"));
      const messagesSnap = await getDocs(collection(db, "messages"));
      const videosSnap = await getDocs(collection(db, "videos"));

      setStats({
        guests: guestsSnap.size,
        scanned: guestsSnap.docs.filter((d) => d.data().scanned).length,
        messages: messagesSnap.size,
        videos: videosSnap.size,
      });
    };

    fetchData();
  }, [loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex bg-[#FFF0F5]/20 min-h-screen text-black">
      <AdminSidebar />
      <main className="flex-1 p-8 space-y-6 max-w-6xl">
        <header>
          <h1 className="text-3xl font-serif text-[#8B4F58]">System Dashboard</h1>
          <p className="text-gray-500">Real-time overview of wedding analytics.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { title: "Total Guests", value: stats.guests, icon: Users, color: "text-[#8B4F58]" },
            { title: "Checked In", value: stats.scanned, icon: CheckCircle2, color: "text-green-600" },
            { title: "Messages", value: stats.messages, icon: MessageSquare, color: "text-blue-600" },
            { title: "Rendered Clips", value: stats.videos, icon: Video, color: "text-amber-600" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-lg shadow-[#8B4F58]/5 border-[#8B4F58]/10 rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase text-gray-400">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}