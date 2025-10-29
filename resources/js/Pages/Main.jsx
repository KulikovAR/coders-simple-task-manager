import { Head } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { SpiralAnimation } from '@/Components/ui/spiral-animation'
import ApplicationLogo from '@/Components/ApplicationLogo'
import ApplicationLogoSeo from '@/Components/ApplicationLogoSeo'

export default function Main({ auth }) {
  const [startVisible, setStartVisible] = useState(false)
  
  // Handle navigation to personal site
  const navigateToPersonalSite = () => {
    window.location.href = "https://xubh.top/"
  }
  
  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <>
      <Head title="Main" />
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
        {/* Spiral Animation */}
        <div className="absolute inset-0">
          <SpiralAnimation />
        </div>
        
        {/* Main Content */}
        <div 
          className={`
            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
            flex flex-col items-center gap-8
            transition-all duration-1500 ease-out
            ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* Button 379 */}
          <button 
            onClick={navigateToPersonalSite}
            className="
              text-white text-2xl tracking-[0.2em] uppercase font-extralight
              transition-all duration-700
              hover:tracking-[0.3em] animate-pulse
            "
          >
            379
          </button>
          
          {/* Service Links */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="
                transition-all duration-300
                opacity-70 hover:opacity-100
                hover:scale-110
                cursor-pointer
              "
            >
              <ApplicationLogo className="text-white" />
            </a>
            <a
              href="#"
              className="
                transition-all duration-300
                opacity-70 hover:opacity-100
                hover:scale-110
                cursor-pointer
              "
            >
              <ApplicationLogoSeo className="text-white" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
