import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "i.pravatar.cc",
			},
			{
				protocol: "https",
				hostname: "flagcdn.com",
			},
			{
				protocol: "https",
				hostname: "file-examples.com",
			},
			{
				protocol: "https",
				hostname: "api.dicebear.com",
			},
			{
				protocol: "https",
				hostname: "api.qrserver.com",
			},
		],
	},
};

export default nextConfig;
