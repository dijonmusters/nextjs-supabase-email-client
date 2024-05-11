import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './app/utils/supabase/middleware'

// Add more public paths that do not require authentication
const publicPaths = ["/login", "/"]

/**
 * middleware to refresh the user's session before loading Server Component routes. 
 * This ensures that the session is up-to-date and the user is authenticated
 */
export async function middleware(req: NextRequest) {
    try {
        const { supabase, response } = createClient(req)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user && !publicPaths.includes(req.nextUrl.pathname)) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        return response
    } catch (e) {
        return NextResponse.next({
            request: {
                headers: req.headers,
            },
        })
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
