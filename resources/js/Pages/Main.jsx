import { Head, Link } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import { SpiralAnimation } from '@/Components/ui/spiral-animation'
import ApplicationLogo from '@/Components/ApplicationLogo'
import ApplicationLogoSeo from '@/Components/ApplicationLogoSeo'

export default function Main({ auth }) {
  const [logosVisible, setLogosVisible] = useState(false)
  
  // Показываем логотипы через секунду
  useEffect(() => {
    const timer = setTimeout(() => {
      setLogosVisible(true)
    }, 1000)
    
    return () => {
      clearTimeout(timer)
    }
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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          {/* Service Cards */}
          <div
            className={`
              grid grid-cols-1 sm:grid-cols-2 gap-8
              transition-all duration-1000 ease-out
              ${logosVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            {/* 379TM Card */}
            <div className="flex flex-col items-center gap-4">
              <div className="scale-125 md:scale-150">
                <ApplicationLogo className="text-white" />
              </div>
              <div className="text-white/80 text-sm">таск-менеджер</div>
              <div className="flex items-center gap-3">
                <Link
                  href="/tm"
                  className="px-4 py-2 rounded-md border border-white/30 text-white/90 hover:text-white hover:border-white/60 transition-colors"
                >
                  подробнее
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-md bg-white/90 text-black hover:bg-white transition-colors whitespace-nowrap"
                >
                  в систему
                </Link>
              </div>
            </div>

            {/* 379SEO Card */}
            <div className="flex flex-col items-center gap-4">
              <div className="scale-125 md:scale-150">
                <ApplicationLogoSeo className="text-white" />
              </div>
              <div className="text-white/80 text-sm">сео аналитика</div>
              <div className="flex items-center gap-3">
                <Link
                  href="/seo"
                  className="px-4 py-2 rounded-md border border-white/30 text-white/90 hover:text-white hover:border-white/60 transition-colors"
                >
                  подробнее
                </Link>
                <Link
                  href="/seo-stats"
                  className="px-4 py-2 rounded-md bg-white/90 text-black hover:bg-white transition-colors whitespace-nowrap"
                >
                  в систему
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
