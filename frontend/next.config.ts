import type { NextConfig } from "next";
import { createAdminAccount } from "./scripts/createAdminAccount";

const nextConfig: NextConfig = {
  reactStrictMode: process.env.NODE_ENV !== "development",  // 🔄 開發模式關閉，生產模式開啟
  async headers() {
    if (process.env.NODE_ENV === "development") {
      await createAdminAccount();
    }
    return [];
  },
};

export default nextConfig;
