import PageHeader from "../../components/PageHeader";
import ProjectForm from "../ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        eyebrow="Project Management"
        title="Create Project"
        subtitle="Register an application, then design its modules."
        back={{ href: "/projects", label: "Projects" }}
      />

      <ProjectForm />
    </>
  );
}
