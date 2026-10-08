import { NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { systemChecks } from "@/lib/status";

export const GET = handle(async () => {
  const checks = await systemChecks();

  return NextResponse.json({
    status: checks.every((check) => check.healthy) ? "healthy" : "degraded",
    checks,
  });
});
