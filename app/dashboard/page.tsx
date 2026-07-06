import React from 'react'
import Navbar from '../_components/Navbar'
import HeroSection from '../_components/Hero'
import EventDetails from '../_components/EventDetails'

function page() {
  return (
    // Halkan waxaa lagu daray bg-ga weyn ee soft-ka ah iyo dhererka buuxa ee shaashada
    <div className="min-h-screen w-full bg-[#FFF0F5]/30">
      <Navbar />
      <HeroSection />
      <EventDetails />
    </div>
  )
}

export default page