"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Database } from "lucide-react";
import { AdminSidebar } from "../_components/admin-sidebar";

export default function SettingsAdminPage() {
  const { loading } = useAdminAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex bg-[#FFF0F5]/20 min-h-screen text-black">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-[#8B4F58]">System Gateway Parameters</h1>
          <p className="text-sm text-gray-500">Configure global authorization parameters and security layers.</p>
        </div>

        <Card className="bg-white border-[#8B4F58]/10 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#8B4F58]"><ShieldCheck className="h-5 w-5" /> Security Context</CardTitle>
            <CardDescription>Authentication parameters are actively strictly assigned to admin@gmail.com.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
              Encryption is enforced across all dynamic real-time Firestore synchronization endpoints.
            </div>
            <Button className="bg-[#8B4F58] hover:bg-[#723E46] text-white rounded-xl font-medium">
              Refresh Node Cryptography
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}