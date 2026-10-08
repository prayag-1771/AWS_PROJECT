import { NextResponse } from "next/server";
import { ApiError, handle } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { listProjects } from "@/lib/projects";
import { seedSampleData } from "@/lib/seed";

// Sample data is only offered for an empty platform, so it can never be
// mixed into real projects.
export const POST = handle(async () => {
  if ((await listProjects()).length > 0) {
    throw new ApiError("Sample data can only be loaded when there are no projects", 409);
  }

  await seedSampleData();
  await logActivity("loaded", "sample data", "3 projects and 8 modules");

  return NextResponse.json({ seeded: true }, { status: 201 });
});
