import { notFound } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import CourseForm from "../../CourseForm";
import { getCourse } from "@/lib/courses";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const id = Number((await params).id);
  const course = Number.isInteger(id) && id > 0 ? await getCourse(user.sub, id) : null;

  if (!course) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Edit Course"
        back={{ href: `/courses/${course.id}`, label: course.name }}
      />

      <CourseForm course={course} />
    </>
  );
}
