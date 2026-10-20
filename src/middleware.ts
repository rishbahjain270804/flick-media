import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const pathname = url.pathname;

  // Skip Next.js internal static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // static files like favicon.ico, images, etc.
  ) {
    return NextResponse.next();
  }

  // Detect forms.buildwithrex.me or forms.localhost
  const isFormsSubdomain =
    host.startsWith('forms.buildwithrex.me') ||
    host.startsWith('forms.localhost') ||
    host.startsWith('forms.');

  if (isFormsSubdomain) {
    // If accessing root of forms subdomain: forms.buildwithrex.me/
    if (pathname === '/') {
      // Rewrite to default active form or portal
      url.pathname = '/f/flk2026';
      return NextResponse.rewrite(url);
    }

    // If accessing forms.buildwithrex.me/{hash}
    // (and not already prefixed with /f/)
    if (!pathname.startsWith('/f/')) {
      const hash = pathname.substring(1); // remove leading slash
      url.pathname = `/f/${hash}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
