import { redirect } from "next/navigation";
import Icon from "../components/Icon";
import AuthForm from "./AuthForm";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const features = [
  "Sign-in and sign-up with Amazon Cognito",
  "Courses and progress stored in Amazon RDS",
  "Study materials kept in private Amazon S3",
  "Runs as containers on Amazon ECS Fargate",
];

// Only redirect to paths inside the app, never to another site.
function safeNext(value: string | string[] | undefined) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = safeNext((await searchParams).next);

  if (await getUser()) {
    redirect(next);
  }

  return (
    <div className="auth">
      <section className="auth-brand">
        <div className="auth-logo">
          <div className="brand-icon">
            <Icon name="cloud" />
          </div>
          CloudNativeHub
        </div>

        <div>
          <h1>Plan every course. Track every topic.</h1>
          <p>
            A cloud-native study planner for courses, modules, deadlines and
            study materials, running on AWS.
          </p>

          <ul className="auth-features">
            {features.map((feature) => (
              <li key={feature}>
                <span className="tick">
                  <Icon name="check" size={15} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-credit">
          Developed by <strong>Prayag Sharma</strong> · Reg. No. 24BCE1243
        </p>
      </section>

      <section className="auth-panel">
        <AuthForm next={next} />
      </section>
    </div>
  );
}
