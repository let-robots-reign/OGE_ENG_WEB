import { handlers } from "@/server/auth";
import { type NextRequest } from "next/server";

const nextAuthGet = handlers.GET;

const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/api/auth/callback/vk")) {
    const deviceId = url.searchParams.get("device_id");
    if (deviceId) {
      request.cookies.set("vk_device_id", deviceId);
    }
  }
  return nextAuthGet(request);
};

export { GET };
export const { POST } = handlers;
