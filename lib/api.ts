import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// Wraps a route handler so validation errors become 4xx responses and
// anything unexpected is logged and returned as a generic 500.
export function handle<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>
) {
  return async (...args: A) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }

      console.error(error);

      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}

export function parseId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError("Not found", 404);
  }

  return id;
}

export async function readJson(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError("Request body must be a JSON object");
  }

  return body as Record<string, unknown>;
}

// A foreign-key failure on insert or update means the parent row is gone.
export function missingParent(label: string) {
  return (error: unknown): never => {
    if ((error as { code?: string })?.code === "23503") {
      throw new ApiError(`${label} not found`);
    }

    throw error;
  };
}
