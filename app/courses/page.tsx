import Link from "next/link";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
import SeedButton from "../components/SeedButton";
import CoursesBrowser from "./CoursesBrowser";
import { listCourses } from "@/lib/courses";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await listCourses();

  return (
    <>
      <PageHeader
        eyebrow="Learning"
        title="Courses"
        subtitle="Every course you are studying, with its progress."
      >
        <Link className="primary-button" href="/courses/new">
          <Icon name="plus" size={16} />
          New Course
        </Link>
      </PageHeader>

      {courses.length === 0 ? (
        <div className="panel" style={{ marginTop: 0 }}>
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="courses" size={22} />
            </div>
            <strong>No courses yet</strong>
            <span>
              Add your first course, or load sample data to explore the planner.
            </span>
            <div className="empty-actions">
              <Link className="primary-button" href="/courses/new">
                <Icon name="plus" size={16} />
                New Course
              </Link>
              <SeedButton />
            </div>
          </div>
        </div>
      ) : (
        <CoursesBrowser courses={courses} />
      )}
    </>
  );
}
