import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Turn an unexpected throw inside an API route into a logged 500.
 *
 * Without this, a Prisma or Redis failure bubbles to Next's default handler,
 * which logs a raw stack and returns an HTML error page — the client's fetch
 * wrapper then reports it as a parse failure instead of a server error. With it,
 * every route fails the same way: one structured log line with the route name,
 * and a JSON `{ error }` the UI can show as-is.
 *
 * Auth and validation errors never reach here — those handlers return their own
 * NextResponse before any throw can occur.
 */
export function withApiErrors<Args extends unknown[]>(
  route: string,
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      logger.error(`${route} failed`, { route, error });
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 },
      );
    }
  };
}
