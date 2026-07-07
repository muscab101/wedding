"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, CheckCircle, Clock, Calendar } from "lucide-react";
import { AdminSidebar } from "../_components/admin-sidebar";
import type { Rsvp } from "@/lib/types";

export default function GuestsAdminPage() {
  const { loading } = useAdminAuth();
  const [guests, setGuests] = useState<Rsvp[]>([]);

  useEffect(() => {
    if (loading) return;

    // Fetch guests (newest first), then live-update on any change.
    const load = async () => {
      const { data } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });
      setGuests((data ?? []) as Rsvp[]);
    };
    load();

    const channel = supabase
      .channel("rsvps-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvps" },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this guest?")) {
      await supabase.from("rsvps").delete().eq("id", id);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex bg-[#FFF0F5]/20 min-h-screen text-black">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-6xl">
        <Card className="bg-white border-[#8B4F58]/10 shadow-xl shadow-[#8B4F58]/5 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-xl font-serif text-[#8B4F58]">Guest Master Records</CardTitle>
            <CardDescription>Manage all guest information, remove records, or monitor entry status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-xs font-bold uppercase text-gray-400 tracking-wider">
                    <th className="p-5 pl-8">Name</th>
                    <th className="p-5">Pass ID</th>
                    <th className="p-5 text-center">Party Size</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Created At</th>
                    <th className="p-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-[#FFF0F5]/10 transition-colors">
                      <td className="p-5 pl-8 font-semibold text-gray-800">{guest.name}</td>
                      <td className="p-5 font-mono text-xs text-gray-500">{guest.pass_id}</td>
                      <td className="p-5 text-center font-medium">{guest.total_guests || 1}</td>
                      <td className="p-5">
                        {guest.scanned ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
                            <CheckCircle className="h-3 w-3" /> Scanned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-100">
                            <Clock className="h-3 w-3" /> Waiting
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-gray-500 text-xs font-medium flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {guest.created_at && new Date(guest.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="p-5 text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(guest.id)} 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}