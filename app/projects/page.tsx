import Link from "next/link";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import ProjectsBrowser from "./ProjectsBrowser";
import { listProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <>
      <PageHeader
        eyebrow="Applications"
        title="Projects"
        subtitle="Every application managed on the platform."
      >
        <Link className="primary-button" href="/projects/new">
          <Icon name="plus" size={16} />
          New Project
        </Link>
      </PageHeader>

      <ProjectsBrowser projects={projects} />
    </>
  );
}
