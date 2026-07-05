/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage — replace YOUR_PROJECT_REF once your project exists
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
