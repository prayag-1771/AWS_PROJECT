import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import ModuleForm from "../ModuleForm";
import { listCourses } from "@/lib/courses";

export const dynamic = "force-dynamic";

export default async function NewModulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const courses = await listCourses();
  const requested = Number((await searchParams).course);
  const course = courses.find((item) => item.id === requested);

  return (
    <>
      <PageHeader
        eyebrow="Syllabus"
        title="Create Module"
        subtitle="Name the module, then add its topics."
        back={
          course
            ? { href: `/courses/${course.id}`, label: course.name }
            : { href: "/modules", label: "Modules" }
        }
      />

      {courses.length === 0 ? (
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="empty-state">
            <strong>Create a course first</strong>
            <span>Every module belongs to a course.</span>
            <div className="empty-actions">
              <Link className="primary-button" href="/courses/new">
                New Course
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ModuleForm
          courses={courses.map(({ id, name }) => ({ id, name }))}
          courseId={course?.id}
          nextPosition={(course?.module_count ?? 0) + 1}
        />
      )}
    </>
  );
}
