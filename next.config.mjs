/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://3.6.230.54:4003/api/:path*',
      },
    ];
  },
};

export default nextConfig;
