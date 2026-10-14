import { NextResponse } from "next/server";
import { ApiError, handle } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { apiUser } from "@/lib/auth";
import { listCourses } from "@/lib/courses";
import { seedSampleData } from "@/lib/seed";

// Sample data is only offered while a student has no courses, so it can
// never be mixed into real ones.
export const POST = handle(async () => {
  const user = await apiUser();

  if ((await listCourses(user.sub)).length > 0) {
    throw new ApiError(
      "Sample data can only be loaded when there are no courses",
      409
    );
  }

  await seedSampleData(user.sub);
  await logActivity(user.sub, "loaded", "sample data", "3 sample courses");

  return NextResponse.json({ seeded: true }, { status: 201 });
});
