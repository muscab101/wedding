"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Loader2, Camera, LogOut, Calendar, User, Hash, Clock, Users } from "lucide-react";

export default function ScannerPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [guestData, setGuestData] = useState<any>(null);
  const [status, setStatus] = useState<"ready" | "found" | "success" | "warning" | "error">("ready");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.email !== "scanner@gmail.com") {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const findGuestByPass = async (passId: string) => {
    try {
      const q = query(collection(db, "rsvps"), where("passId", "==", passId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus("error");
      } else {
        const docSnap = querySnapshot.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() };
        setGuestData(data);
        setStatus("found");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const confirmVerification = async () => {
    if (!guestData) return;
    await updateDoc(doc(db, "rsvps", guestData.id), {
      scanned: true,
      scannedAt: new Date()
    });
    setStatus("success");
  };

  const handleScan = (result: string | null) => {
    if (result && !scannedResult) {
      setScannedResult(result);
      findGuestByPass(result);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader><CardTitle className="text-center text-[#8B4F58]">Gate Control</CardTitle></CardHeader>
        <CardContent>
          {!scannedResult && <Scanner onResult={(text) => handleScan(text || "")} constraints={{ facingMode: "environment" }} />}
          
          {/* Halkan waa Card-ka xogta martida */}
          {status === "found" && guestData && (
            <div className="bg-white border-2 border-[#8B4F58] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-400 uppercase tracking-widest">Guest Details</p>
                <h2 className="text-2xl font-serif text-[#8B4F58]">{guestData.name}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4" /> {guestData.totalGuests} Guests</div>
                <div className="flex items-center gap-2 text-sm font-mono"><Hash className="w-4 h-4" /> {guestData.passId}</div>
                <div className="col-span-2 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" /> 
                  Registered: {guestData.createdAt?.toDate ? guestData.createdAt.toDate().toLocaleString() : "N/A"}
                </div>
              </div>

              {guestData.scanned ? (
                <div className="text-red-500 font-bold text-center">⚠️ Already Used!</div>
              ) : (
                <Button onClick={confirmVerification} className="w-full bg-[#8B4F58] hover:bg-[#723E46]">
                  Verify & Approve Entry
                </Button>
              )}
            </div>
          )}

          {status === "success" && <div className="text-green-600 text-center font-bold p-4 bg-green-50 rounded-xl">✅ Access Granted!</div>}
          {status === "error" && <div className="text-red-600 text-center p-4">❌ Invalid Pass ID</div>}
          
          {scannedResult && (
            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full mt-4">Scan Next</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}