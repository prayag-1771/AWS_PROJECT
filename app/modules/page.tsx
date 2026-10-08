import Link from "next/link";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import ModulesBrowser from "./ModulesBrowser";
import { listModules } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const modules = await listModules();

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Modules"
        subtitle="The building blocks of every project, each with its own architecture design."
      >
        <Link className="primary-button" href="/modules/new">
          <Icon name="plus" size={16} />
          New Module
        </Link>
      </PageHeader>

      {modules.length === 0 ? (
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="modules" size={22} />
            </div>
            <strong>No modules yet</strong>
            <span>
              Add a module to a project and choose how it is deployed, secured
              and scaled.
            </span>
            <div className="empty-actions">
              <Link className="primary-button" href="/modules/new">
                <Icon name="plus" size={16} />
                New Module
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ModulesBrowser modules={modules} />
      )}
    </>
  );
}
