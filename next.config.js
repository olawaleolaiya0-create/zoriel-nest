/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Supabase Storage public-bucket URLs look like
        // https://<project-ref>.supabase.co/storage/v1/object/public/...
        // Using a wildcard subdomain keeps this working across
        // Supabase projects without hardcoding your project ref here.
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
