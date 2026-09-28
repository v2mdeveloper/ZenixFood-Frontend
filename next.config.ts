import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Não roda no modo local para não atrapalhar
  register: true,
  cacheOnFrontEndNav: true, 
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    skipWaiting: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 🔥 Corrige o erro de conflito do Vercel com o Turbopack
  turbopack: {},
};

export default withPWA(nextConfig);