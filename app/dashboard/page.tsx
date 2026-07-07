import React from "react";
import Navbar from "../_components/Navbar";
import HeroSection from "../_components/Hero";
import EventDetails from "../_components/EventDetails";

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <HeroSection />
      <EventDetails />
    </div>
  );
}
