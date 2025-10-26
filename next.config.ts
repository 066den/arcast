import type { NextConfig } from 'next'

// Dynamically extend allowed remote image hosts from env for next/image
// Use URL objects to match Next.js types (URL | RemotePattern)
const extraRemotePatterns = (() => {
  const patterns: URL[] = []
  const add = (url?: string) => {
    if (!url) return
    try {
      const u = new URL(url)
      patterns.push(u)
    } catch {
      // ignore invalid URLs
    }
  }
  add(process.env.NEXT_PUBLIC_S3_PUBLIC_ENDPOINT)
  add(process.env.NEXT_PUBLIC_S3_CDN_ENDPOINT || process.env.S3_CDN_ENDPOINT)
  return patterns
})()

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  // Configure for large file uploads
  experimental: {
    optimizeCss: false, // Disable CSS optimization for TailwindCSS v4 compatibility
  },
  images: {
    // IMPORTANT: Disable image optimization when NEXT_IMAGE_UNOPTIMIZED=true
    // In Docker, the Next.js image optimizer fetches the "remote" URL server-side.
    // URLs like http://localhost:9000/... (MinIO) are NOT reachable from inside the Next container,
    // causing 400 from /_next/image.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
    // Allow loading from local paths and uploads directory
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      // Cloudinary (existing)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // DigitalOcean Spaces CDN (wildcard region)
      {
        protocol: 'https',
        hostname: '*.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      // Allow local MinIO/path-style during development:
      // - http://localhost:9000/bucket/key
      // - http://arcast-s3.localhost:9000/key (bucket subdomain dev DNS)
      // - http://minio:9000/bucket/key (inside docker)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*.localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'minio',
        port: '9000',
        pathname: '/**',
      },
      // Extra endpoints from env (PUBLIC/CDN)
      ...extraRemotePatterns,
    ],
  },
  serverExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-presigned-post'],
  // Ensure proper CSS handling for TailwindCSS v4
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }

    // Add support for video files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      type: 'asset/resource',
    })

    return config
  },
}

export default nextConfig
