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
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-white">
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
                  <div
                      className="text-xl font-bold text-text-primary flex items-center gap-2"
                      style={{ fontFamily: 'Consolas, monospace' }}
                  >
                      <svg color={"black"} width="100" height="20" viewBox="0 0 406 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.999 14.0091V0.0101531H55.9959V14.0091H69.9949V42.0071H55.9959V56.0061H69.9949V84.0041H55.9959V98.003H13.999V84.0041H0V70.0051H13.999V84.0041H55.9959V56.0061H27.998V42.0071H55.9959V14.0091H13.999V28.0081H0V14.0091H13.999ZM83.9939 14.0091V0.0101531H153.989V28.0081H139.99V56.0061H125.991V98.003H111.992V56.0061H125.991V28.0081H139.99V14.0091H83.9939ZM181.987 14.0091V0.0101531H223.984V14.0091H237.983V84.0041H223.984V98.003H181.987V84.0041H223.984V70.0051H181.987V56.0061H167.988V14.0091H181.987ZM223.984 56.0061V14.0091H181.987V56.0061H223.984ZM251.982 14.0091V0.0101531H321.977V14.0091H293.979V98.003H279.98V14.0091H251.982ZM335.976 98.003V0.0101531H349.975V14.0091H363.974V28.0081H377.973V14.0091H391.972V0.0101531H405.971V98.003H391.972V28.0081H377.973V56.0061H363.974V28.0081H349.975V98.003H335.976Z" fill="currentColor"/>
                      </svg>

                  </div>
              </div>
              <div className="text-black/80 text-sm">таск-менеджер</div>
              <div className="flex items-center gap-3">
                <Link
                  href="/tm"
                  className="px-4 py-2 rounded-md border-2 border-black/30 text-black/90 hover:text-black hover:border-black/60 transition-colors"
                >
                  подробнее
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 transition-colors whitespace-nowrap"
                >
                  в систему
                </Link>
              </div>
            </div>

            {/* 379SEO Card */}
            <div className="flex flex-col items-center gap-4">
              <div className="scale-125 md:scale-150">
                  <div
                      className="text-xl font-bold text-text-primary flex items-center gap-2"
                      style={{ fontFamily: 'Consolas, monospace' }}
                  >
                      <svg color={"black"} width="100" height="20" viewBox="0 0 490 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.999 14.0091V0.0101531H55.9959V14.0091H69.9949V42.0071H55.9959V56.0061H69.9949V84.0041H55.9959V98.003H13.999V84.0041H0V70.0051H13.999V84.0041H55.9959V56.0061H27.998V42.0071H55.9959V14.0091H13.999V28.0081H0V14.0091H13.999ZM83.9939 14.0091V0.0101531H153.989V28.0081H139.99V56.0061H125.991V98.003H111.992V56.0061H125.991V28.0081H139.99V14.0091H83.9939ZM181.987 14.0091V0.0101531H223.984V14.0091H237.983V84.0041H223.984V98.003H181.987V84.0041H223.984V70.0051H181.987V56.0061H167.988V14.0091H181.987ZM223.984 56.0061V14.0091H181.987V56.0061H223.984ZM265.981 14.0091V0.0101531H307.978V14.0091H321.977V28.0081H307.978V14.0091H265.981V42.0071H307.978V56.0061H321.977V84.0041H307.978V98.003H265.981V84.0041H251.982V70.0051H265.981V84.0041H307.978V56.0061H265.981V42.0071H251.982V14.0091H265.981ZM335.976 98.003V0.0101531H405.971V14.0091H349.975V42.0071H377.973V56.0061H349.975V84.0041H405.971V98.003H335.976ZM433.968 14.0091V0.0101531H475.965V14.0091H489.964V84.0041H475.965V98.003H433.968V84.0041H419.97V14.0091H433.968ZM475.965 84.0041V14.0091H433.968V84.0041H475.965Z" fill="currentColor"/>
                      </svg>

                  </div>
              </div>
              <div className="text-black/80 text-sm">seo аналитика</div>
              <div className="flex items-center gap-3">
                <Link
                  href="/seo"
                  className="px-4 py-2 rounded-md border-2 border-black/30 text-black/90 hover:text-black hover:border-black/60 transition-colors"
                >
                  подробнее
                </Link>
                <Link
                  href="/seo-stats"
                  className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 transition-colors whitespace-nowrap !text-white"
                >
                  <span className="!text-white">в систему</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
