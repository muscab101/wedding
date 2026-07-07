import React from 'react'
import Navbar from '../_components/Navbar'
import HeroSection from '../_components/Hero'
import EventDetails from '../_components/EventDetails'

function page() {
  return (
    // Soft, full-height page background
    <div className="min-h-screen w-full bg-[#FFF0F5]/30">
      <Navbar />
      <HeroSection />
      <EventDetails />
    </div>
  )
}

export default page