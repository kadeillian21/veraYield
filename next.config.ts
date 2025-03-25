import type { NextConfig } from "next";

// Disable dotenv-vault by removing DOTENV_KEY from environment
try {
  delete process.env.DOTENV_KEY;
} catch (error) {
  console.warn("Failed to delete DOTENV_KEY", error);
}

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'googleusercontent.com',
      'avatars.githubusercontent.com'
    ],
  },
};

export default nextConfig;
