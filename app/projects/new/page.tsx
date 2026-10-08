import PageHeader from "../../components/PageHeader";
import ProjectForm from "../ProjectForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Project Management"
        title="Create Project"
        subtitle="Register an application, then design its modules."
        back={{ href: "/projects", label: "Projects" }}
      />

      <ProjectForm
        defaults={{
          environment: settings.default_environment,
          region: settings.default_region,
        }}
      />
    </>
  );
}
