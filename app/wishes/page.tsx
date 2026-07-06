"use client";

import React, { useState, useEffect } from "react";
import { db, storage, auth } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

// Lucide Icons
import { 
  MessageSquareHeart, 
  Video, 
  Sparkles, 
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
  XCircle 
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "../_components/Navbar";

interface Wish {
  id: string;
  name: string;
  relation: string;
  text: string;
  createdAt?: any;
}

interface VideoItem {
  id: string;
  name: string;
  videoUrl: string;
  createdAt?: any;
}

interface CustomToast {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export default function WishesAndVideosPage() {
  const [activeTab, setActiveTab] = useState("wishes");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Custom Inline Toast State
  const [toastNotification, setToastNotification] = useState<CustomToast | null>(null);

  const showToast = ({ title, description, variant = "default" }: CustomToast) => {
    setToastNotification({ title, description, variant });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  // Loading & Data States
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [wishesLoading, setWishesLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);

  // Form States
  const [formData, setFormData] = useState({ name: "", relation: "", text: "" });
  const [submittingWish, setSubmittingWish] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Edit State for Wishes
  const [editingWishId, setEditingWishId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [updatingWish, setUpdatingWish] = useState<boolean>(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Wishes (Real-time)
  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWishes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Wish[]);
      setWishesLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Videos (Real-time)
  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VideoItem[]);
      setVideosLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle Wish Submission
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) {
      showToast({ title: "Error", description: "Please fill in your name and message.", variant: "destructive" });
      return;
    }

    setSubmittingWish(true);
    try {
      await addDoc(collection(db, "wishes"), {
        name: formData.name,
        relation: formData.relation || "Guest",
        text: formData.text,
        createdAt: serverTimestamp(),
      });
      setFormData({ name: "", relation: "", text: "" });
      showToast({ title: "Success!", description: "Your beautiful wish has been sent." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to send wish. Try again.", variant: "destructive" });
    } finally {
      setSubmittingWish(false);
    }
  };

  // Update Wish Function
  const handleUpdateWish = async (id: string) => {
    if (!editText.trim()) {
      showToast({ title: "Error", description: "Message cannot be empty.", variant: "destructive" });
      return;
    }
    setUpdatingWish(true);
    try {
      const wishDocRef = doc(db, "wishes", id);
      await updateDoc(wishDocRef, { text: editText });
      setEditingWishId(null);
      showToast({ title: "Updated!", description: "Wish message updated successfully." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to update wish.", variant: "destructive" });
    } finally {
      setUpdatingWish(false);
    }
  };

  // Delete Wish Function
  const handleDeleteWish = async (id: string) => {
    if (!window.confirm("Ma hubtaa inaad tirto fariintan?")) return;
    try {
      await deleteDoc(doc(db, "wishes", id));
      showToast({ title: "Deleted", description: "Wish has been removed." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to delete wish.", variant: "destructive" });
    }
  };

  // Delete Video Function
  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Ma hubtaa inaad tirto muuqaalkan?")) return;
    try {
      await deleteDoc(doc(db, "videos", id));
      showToast({ title: "Deleted", description: "Video clip has been removed." });
    } catch (err) {
      console.error(err);
      showToast({ title: "Error", description: "Failed to delete video.", variant: "destructive" });
    }
  };

  // Handle Video Upload
  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return;

    setUploadingVideo(true);
    const storageRef = ref(storage, `wedding_videos/${Date.now()}_${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error(error);
        showToast({ title: "Upload Failed", description: "Something went wrong during video upload.", variant: "destructive" });
        setUploadingVideo(false);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "videos"), {
          name: currentUser?.email?.split("@")[0] || "Anonymous Guest",
          videoUrl: downloadUrl,
          createdAt: serverTimestamp(),
        });
        setVideoFile(null);
        setUploadProgress(0);
        setUploadingVideo(false);
        showToast({ title: "Video Shared!", description: "Your video clip is now live on the wall." });
      }
    );
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen py-12 px-4 max-w-6xl mx-auto space-y-10 relative">
        
        {/* Custom Tailwind Floating Toast Notification */}
        {toastNotification && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            toastNotification.variant === "destructive" 
              ? "bg-red-50 border-red-200 text-red-800" 
              : "bg-white border-gray-100 text-gray-800"
          }`}>
            {toastNotification.variant === "destructive" ? (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <h5 className="text-sm font-semibold">{toastNotification.title}</h5>
              <p className="text-xs opacity-90">{toastNotification.description}</p>
            </div>
            <button onClick={() => setToastNotification(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8B4F58]/10 bg-white/50 text-xs font-medium uppercase tracking-widest text-[#8B4F58]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Guest Interaction Wall
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#8B4F58] tracking-tight">Wishes &amp; Videos</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Share your love, blessing messages, or a short video clip with the happy couple.
          </p>
        </div>

        {/* Tabs Control Panel */}
        <Tabs defaultValue="wishes" className="w-full space-y-12" onValueChange={setActiveTab}>
          <div className="flex justify-center">
            <TabsList className="bg-white/60 border border-[#8B4F58]/10 p-1 rounded-full h-12 shadow-sm">
              <TabsTrigger value="wishes" className="rounded-full px-6 h-10 data-[state=active]:bg-[#8B4F58] data-[state=active]:text-white font-medium text-sm flex items-center gap-2 transition-all">
                <MessageSquareHeart className="w-4 h-4" /> Warm Wishes
              </TabsTrigger>
              <TabsTrigger value="videos" className="rounded-full px-6 h-10 data-[state=active]:bg-[#8B4F58] data-[state=active]:text-white font-medium text-sm flex items-center gap-2 transition-all">
                <Video className="w-4 h-4" /> Video Clips
              </TabsTrigger>
            </TabsList>
          </div>

          {/* =========================================================================
              TAB 1: WARM WISHES
              ========================================================================= */}
          <TabsContent value="wishes" className="grid grid-cols-1 lg:grid-cols-12 gap-8 outline-none">
            
            {/* Wish Submission Form */}
            <div className="lg:col-span-5 bg-white/60 backdrop-blur-sm border border-[#8B4F58]/10 p-6 md:p-8 rounded-[32px] shadow-sm h-fit space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-serif text-[#8B4F58] font-semibold">Write a Blessing</h3>
                <p className="text-xs text-gray-400">Your message will appear instantly on the live public wall.</p>
              </div>

              <form onSubmit={handleWishSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Your Full Name</label>
                  <Input 
                    placeholder="e.g., Ahmed Mohamed" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-gray-200 bg-white focus-visible:ring-[#8B4F58]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Relation (Optional)</label>
                  <Input 
                    placeholder="e.g., Groom's Cousin, Friend" 
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="rounded-xl border-gray-200 bg-white focus-visible:ring-[#8B4F58]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">Message</label>
                  <Textarea 
                    placeholder="Write your beautiful congrats message here..." 
                    rows={4}
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="rounded-xl border-gray-200 bg-white focus-visible:ring-[#8B4F58] resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingWish}
                  className="w-full bg-[#8B4F58] hover:bg-[#723E46] text-white rounded-xl h-11 transition-all flex items-center justify-center gap-2"
                >
                  {submittingWish ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Wish
                </Button>
              </form>
            </div>

            {/* Wishes Grid Wall */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                Live Feed <span className="text-xs font-normal bg-[#8B4F58]/10 text-[#8B4F58] px-2 py-0.5 rounded-full">{wishes.length} messages</span>
              </h3>

              {wishesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(n => <div key={n} className="bg-white/40 h-32 rounded-2xl animate-pulse border border-gray-100" />)}
                </div>
              ) : wishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[560px] overflow-y-auto pr-2 custom-scrollbar">
                  {wishes.map((wish) => (
                    <div key={wish.id} className="bg-white border border-[#8B4F58]/5 p-5 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-all relative group">
                      
                      {/* Edit / Delete Buttons for Wishes */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingWishId !== wish.id ? (
                          <>
                            <button 
                              onClick={() => { setEditingWishId(wish.id); setEditText(wish.text); }}
                              className="p-1.5 rounded-md text-gray-400 hover:text-[#8B4F58] hover:bg-gray-50 transition-colors"
                              title="Edit Message"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteWish(wish.id)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-50 transition-colors"
                              title="Delete Message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#8B4F58]/5 flex items-center justify-center text-xs font-bold text-[#8B4F58] uppercase">
                          {wish.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800">{wish.name}</h4>
                          <p className="text-[10px] text-gray-400 font-medium">{wish.relation}</p>
                        </div>
                      </div>

                      {/* Inline Wish Edit View */}
                      {editingWishId === wish.id ? (
                        <div className="space-y-2 pt-1">
                          <Textarea 
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-xs bg-white border-gray-200 focus-visible:ring-[#8B4F58] resize-none"
                            rows={3}
                          />
                          <div className="flex items-center gap-1.5 justify-end">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setEditingWishId(null)}
                              className="h-7 px-2.5 rounded-lg text-xs gap-1"
                            >
                              <XCircle className="w-3 h-3" /> Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              disabled={updatingWish}
                              onClick={() => handleUpdateWish(wish.id)}
                              className="h-7 px-2.5 rounded-lg bg-[#8B4F58] hover:bg-[#723E46] text-white text-xs gap-1"
                            >
                              {updatingWish ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600 leading-relaxed">"{wish.text}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#8B4F58]/10 rounded-[24px] bg-white/20">
                  <MessageSquareHeart className="w-8 h-8 text-[#8B4F58]/20 mb-2" />
                  <h4 className="text-sm font-medium text-gray-600">No wishes yet</h4>
                  <p className="text-xs text-gray-400 max-w-xs mt-0.5">Be the first to leave a permanent blessing message.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* =========================================================================
              TAB 2: VIDEO CLIPS
              ========================================================================= */}
          <TabsContent value="videos" className="space-y-8 outline-none">
            
            {/* Upload Widget */}
            <div className="max-w-xl mx-auto bg-white/60 border border-[#8B4F58]/10 rounded-[28px] p-6 text-center space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-serif text-[#8B4F58] font-semibold">Upload a Video Greeting</h3>
                <p className="text-xs text-gray-400">Record a short selfie video or clip (Max 50MB, MP4/WebM).</p>
              </div>

              <form onSubmit={handleVideoUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-white/50 hover:bg-white transition-all relative flex flex-col items-center justify-center gap-2 cursor-pointer group">
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    disabled={uploadingVideo}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#8B4F58] transition-colors" />
                  <span className="text-xs font-medium text-gray-600">
                    {videoFile ? videoFile.name : "Click to browse or drop your video file"}
                  </span>
                </div>

                {uploadingVideo && (
                  <div className="space-y-1.5 w-full">
                    <div className="flex justify-between text-xs font-semibold text-gray-500">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#8B4F58] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={!videoFile || uploadingVideo}
                  className="bg-[#8B4F58] hover:bg-[#723E46] text-white rounded-xl px-6 h-10 shadow-sm w-full sm:w-auto transition-all"
                >
                  {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Film className="w-4 h-4 mr-2" />}
                  Share Video Clip
                </Button>
              </form>
            </div>

            {/* Videos Grid Wall */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 justify-center md:justify-start">
                Video Stream <span className="text-xs font-normal bg-[#8B4F58]/10 text-[#8B4F58] px-2 py-0.5 rounded-full">{videos.length} clips</span>
              </h3>

              {videosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(n => <div key={n} className="bg-white/40 aspect-[4/3] rounded-2xl animate-pulse border border-gray-100" />)}
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {videos.map((vid) => (
                    <div key={vid.id} className="bg-white border border-[#8B4F58]/5 p-3 rounded-2xl shadow-sm space-y-2 group hover:shadow-md transition-all relative">
                      
                      {/* Delete Button for Videos */}
                      <div className="absolute top-5 right-5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 rounded-md bg-white/80 text-gray-500 hover:text-red-600 shadow-xs hover:bg-white transition-all"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black relative">
                        <video 
                          src={vid.videoUrl} 
                          controls 
                          className="w-full h-full object-cover" 
                          preload="metadata"
                        />
                      </div>
                      <div className="px-1 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700 truncate">From: {vid.name}</span>
                        <span className="text-[10px] text-gray-400">Shared Live</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-[#8B4F58]/10 rounded-[32px] bg-white/20 max-w-md mx-auto">
                  <Film className="w-8 h-8 text-[#8B4F58]/20 mb-2" />
                  <h4 className="text-sm font-medium text-gray-600">No video clips shared yet</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Be the first to record and share a celebratory clip with everyone!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}