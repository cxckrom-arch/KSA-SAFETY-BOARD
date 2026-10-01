import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFIGURATION_REQUIRED"
  | "DEPENDENCY_UNAVAILABLE";

export function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
