import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'oh9c1spu5k.ufs.sh',
				port: '',
				pathname: '/f/**',
			},
		],
	},
};

export default nextConfig;
