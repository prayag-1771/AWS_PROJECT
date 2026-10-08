import { NextResponse } from "next/server";
import { ApiError, handle } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { listCourses } from "@/lib/courses";
import { seedSampleData } from "@/lib/seed";

// Sample data is only offered for an empty planner, so it can never be
// mixed into real courses.
export const POST = handle(async () => {
  if ((await listCourses()).length > 0) {
    throw new ApiError(
      "Sample data can only be loaded when there are no courses",
      409
    );
  }

  await seedSampleData();
  await logActivity("loaded", "sample data", "3 sample courses");

  return NextResponse.json({ seeded: true }, { status: 201 });
});
