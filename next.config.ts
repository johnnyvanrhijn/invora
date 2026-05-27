import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Middleware op Node.js runtime i.p.v. Edge — Edge ondersteunt geen
  // __dirname dat door @supabase/ssr (transient) wordt aangeraakt.
  // Vercel raadt Node.js runtime voor middleware aan (Fluid Compute).
  experimental: {
    // @ts-expect-error — `nodeMiddleware` is experimental in Next 15.5, types lopen achter
    nodeMiddleware: true,
  },
}

export default nextConfig
