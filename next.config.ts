import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/inicio', // Cambia la ruta de inicio a '/nueva-ruta'
        permanent: true, // El redireccionamiento es permanente
      },
    ];
  },
};

export default nextConfig;
