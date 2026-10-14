import { notFound } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import ModuleForm from "../../ModuleForm";
import { listCourses } from "@/lib/courses";
import { getModule } from "@/lib/modules";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const id = Number((await params).id);
  const current = Number.isInteger(id) && id > 0 ? await getModule(user.sub, id) : null;

  if (!current) {
    notFound();
  }

  const courses = await listCourses(user.sub);

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
