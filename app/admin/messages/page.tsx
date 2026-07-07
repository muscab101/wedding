"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, MessageSquareText, Calendar } from "lucide-react";
import { AdminSidebar } from "../_components/admin-sidebar";
import type { Wish } from "@/lib/types";

export default function MessagesAdminPage() {
  const { loading } = useAdminAuth();
  const [messages, setMessages] = useState<Wish[]>([]);

  useEffect(() => {
    if (loading) return;

    // Guests submit blessings to the `wishes` table (see /wishes).
    const load = async () => {
      const { data } = await supabase
        .from("wishes")
        .select("*")
        .order("created_at", { ascending: false });
      setMessages((data ?? []) as Wish[]);
    };
    load();

    const channel = supabase
      .channel("wishes-admin-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wishes" },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this message?")) {
      await supabase.from("wishes").delete().eq("id", id);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex bg-[#FFF0F5]/20 min-h-screen text-black">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-[#8B4F58]">Guest Congratulatory Logs</h1>
          <p className="text-sm text-gray-500">Read and audit messages sent by wedding guests.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {messages.map((msg) => (
            <Card key={msg.id} className="bg-white border-[#8B4F58]/10 rounded-2xl shadow-xl shadow-[#8B4F58]/5 relative overflow-hidden">
              <CardContent className="p-6 flex justify-between items-start gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#8B4F58]">
                    <MessageSquareText className="h-4 w-4" />
                    <span className="font-bold text-sm uppercase tracking-wide">{msg.name || "Anonymous Guest"}</span>
                    {msg.relation && (
                      <span className="text-xs font-normal text-gray-400 normal-case">
                        · {msg.relation}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm italic">"{msg.text}"</p>
                  
                  {msg.created_at && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(msg.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(msg.id)} 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}