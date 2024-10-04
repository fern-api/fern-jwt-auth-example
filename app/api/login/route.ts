import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

interface FernUser {
  type: "user";
  partner: "custom";
  name?: string;
  email?: string;
}

function getJwtTokenSecret(): Uint8Array {
  if (!process.env.JWT_TOKEN_SECRET) {
    throw new Error("JWT_TOKEN_SECRET is not set");
  }
  return new TextEncoder().encode(process.env.JWT_TOKEN_SECRET);
}

export function signFernJWT(fern: FernUser): Promise<string> {
  return new SignJWT({ fern })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setIssuer("https://test-jwt-auth-smoky.vercel.app")
    .sign(getJwtTokenSecret());
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(
    "https://test-jwt-auth-smoky.docs.buildwithfern.com/api/fern-docs/auth/jwt/callback"
  );

  const state = req.nextUrl.searchParams.get("state");
  if (state) {
    url.searchParams.set("state", state);
  }

  const fern_token = await signFernJWT({ type: "user", partner: "custom" });

  url.searchParams.set("fern_token", fern_token);

  return NextResponse.redirect(url);
}
