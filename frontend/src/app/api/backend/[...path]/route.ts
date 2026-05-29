import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.BACKEND_URL ?? "http://localhost:3000";

type RouteContext = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

function buildBackendUrl(pathSegments: string[], search: string) {
  const cleanPath = pathSegments.join("/");
  return `${backendBaseUrl.replace(/\/$/, "")}/${cleanPath}${search}`;
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path = [] } = await Promise.resolve(context.params);
  const token = request.cookies.get("token")?.value;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  if (token && !path.join("/").startsWith("api/auth/login")) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const backendResponse = await fetch(buildBackendUrl(path, new URL(request.url).search), {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
  });

  const responseText = await backendResponse.text();
  const contentType = backendResponse.headers.get("content-type") || "application/json";
  const nextResponse = new NextResponse(responseText, {
    status: backendResponse.status,
    headers: {
      "content-type": contentType,
    },
  });

  const normalizedPath = path.join("/");
  if (normalizedPath === "api/auth/login" && backendResponse.ok) {
    try {
      const payload = JSON.parse(responseText) as { token?: string };
      if (payload.token) {
        nextResponse.cookies.set("token", payload.token, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        });
      }
    } catch {
      // Ignore malformed auth payloads and keep the raw response intact.
    }
  }

  if (normalizedPath === "api/auth/logout" && backendResponse.ok) {
    nextResponse.cookies.set("token", "", { path: "/", maxAge: 0 });
  }

  return nextResponse;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context);
}