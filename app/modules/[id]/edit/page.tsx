import { notFound } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import ModuleForm from "../../ModuleForm";
import { listCourses } from "@/lib/courses";
import { getModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  const current = Number.isInteger(id) && id > 0 ? await getModule(id) : null;

  if (!current) {
    notFound();
  }

  const courses = await listCourses();

  return (
    <>
      <PageHeader
        eyebrow="Syllabus"
        title="Edit Module"
        back={{ href: `/modules/${current.id}`, label: current.name }}
      />

      <ModuleForm
        courses={courses.map(({ id, name }) => ({ id, name }))}
        current={current}
      />
    </>
  );
}
