/** @type {import('next').NextConfig} */


const nextConfig = {
    // Self-contained server bundle for the Docker runtime image
    output: 'standalone',
    images: {
        domains: ['portfolios.nith.ac.in', 'res.cloudinary.com'],
    }
}

export default nextConfig
