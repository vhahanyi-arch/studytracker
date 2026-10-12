import { clerkMiddleware } from '@clerk/nextjs/server';
import { previewClerkSecretKey } from '@/lib/preview-env';

// A preview signs in with its own key name (PREVIEW_CLERK_SECRET_KEY), which
// older code ignores; everywhere else Clerk reads CLERK_SECRET_KEY as before.
const previewSecretKey = previewClerkSecretKey();
export default previewSecretKey ? clerkMiddleware({ secretKey: previewSecretKey }) : clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
