import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Não roda no npm run dev para não atrapalhar
  register: true,
 
  // Mantém os ficheiros do navegador cacheados
  cacheOnFrontEndNav: true, 
  aggressiveFrontEndNavCaching: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mantenha as configurações que já tinha aqui dentro (se houver alguma)
  reactStrictMode: true,
};

export default withPWA(nextConfig);