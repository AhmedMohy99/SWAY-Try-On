/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // بتأمر السيرفر يتخطى أي تحذيرات ويرفع الموقع فوراً
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
