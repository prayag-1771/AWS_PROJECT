import PageHeader from "../../components/PageHeader";
import CourseForm from "../CourseForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Create Course"
        subtitle="Add a course, then break it into modules and topics."
        back={{ href: "/courses", label: "Courses" }}
      />

      <CourseForm
        defaults={{
          semester: settings.default_semester,
          credits: settings.default_credits,
        }}
      />
    </>
  );
}
