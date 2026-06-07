import type { ReactNode } from 'react'

interface BlurredBackgroundProps {
  blurAmount?: number
  overlayOpacity?: number
  children?: ReactNode
}

export default function BlurredBackground({
  blurAmount = 8,
  overlayOpacity = 0.3,
  children,
}: BlurredBackgroundProps) {
  // Correct way to import static assets in Vite
  const backgroundImage = new URL('../../assets/background.png', import.meta.url).href

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Blurred Background Image - Military Background */}
      <div
        style={{
          position: 'fixed',
          top: -24,
          left: -24,
          right: -24,
          bottom: -24,
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: `blur(${blurAmount}px)`,
          transform: 'translateZ(0)',
          willChange: 'transform, filter',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Dark Overlay for Better Readability */}
      <div
        style={{
          position: 'fixed',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          transform: 'translateZ(0)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  )
}
