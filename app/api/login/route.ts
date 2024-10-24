import { createCallbackUrl, signFernJWT } from '@/auth/utils'
import { NextRequest, NextResponse } from 'next/server'

// Please reach out to the Fern Team if you have any questions about this setup.
// In this example, we show how you can write a lambda handler (or cloudflare worker) can be setup after the user logs in via your identity provider
// and mint a JWT (which we refer to as the `fern_token`) which will give users access to VIEW your docs.

export const dynamic = 'force-dynamic'

// After the user has either signed up or logged in, they will be redirected back to a `/callback` url.
// This is where you will mint a session token for
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Step 1. mint the fern_token
  const fern_token = await signFernJWT({
    // audience?: [] <-- set audience filters here
  })

  // Step 2. preserve the state
  const state = req.nextUrl.searchParams.get('state')

  // Step 3. redirect to the callback url in fern docs, which will set the cookie to the "docs.yourdomain.com" domain.
  // after which, the callback url will redirect the user to the homepage, or return to the URL contained in the state query parameter.
  const response = NextResponse.redirect(createCallbackUrl(fern_token, state))

  // Alternatively, if you've minted your own cookie for your own platform, you can set it here:
  // response.cookies.set("access_token", mintAccessToken(req));
  // response.cookies.set("refresh_token", mintRefreshToken(req));

  return response
}
