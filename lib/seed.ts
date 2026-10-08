import pool from "./db";
import { createCourse } from "./courses";
import { createDeadline } from "./deadlines";
import { createModule } from "./modules";
import { today } from "./progress";
import type { CourseInput } from "./validate";

type Sample = {
  course: CourseInput;
  // Each module: name, planned hours, topics, and how many of them are done.
  modules: [string, number, string[], number][];
  // Each deadline: title, type, days from today, done.
  deadlines: [string, string, number, boolean][];
};

const samples: Sample[] = [
  {
    course: {
      name: "Cloud Computing",
      code: "CC-401",
      instructor: "Dr. A. Menon",
      semester: "Fall Semester",
      credits: 4,
      status: "Ongoing",
      description:
        "Cloud service models, virtualisation, containers and cloud-native architecture on AWS.",
    },
    modules: [
      [
        "Introduction to Cloud Computing",
        6,
        ["Service models: IaaS, PaaS, SaaS", "Deployment models", "Shared responsibility model"],
        3,
      ],
      [
        "Virtualisation and Containers",
        8,
        ["Hypervisors", "Docker images and containers", "Container registries", "Orchestration with ECS"],
        3,
      ],
      [
        "Cloud Networking and Security",
        8,
        ["VPC, subnets and route tables", "Security groups and NACLs", "IAM roles and policies", "Load balancing"],
        1,
      ],
      [
        "Scalability and Reliability",
        7,
        ["Auto Scaling", "Monitoring with CloudWatch", "Backup and disaster recovery"],
        0,
      ],
    ],
    deadlines: [
      ["Cloud architecture assignment", "Assignment", 4, false],
      ["Lab 3: Deploy a container", "Lab", -2, true],
      ["Mid-term examination", "Exam", 16, false],
    ],
  },
  {
    course: {
      name: "Database Management Systems",
      code: "DB-302",
      instructor: "Prof. R. Iyer",
      semester: "Fall Semester",
      credits: 4,
      status: "Ongoing",
      description:
        "Relational modelling, SQL, normalisation, transactions and indexing.",
    },
    modules: [
      [
        "Relational Model and SQL",
        8,
        ["ER diagrams", "Relational algebra", "SQL queries and joins", "Views and subqueries"],
        4,
      ],
      [
        "Normalisation",
        6,
        ["Functional dependencies", "1NF, 2NF and 3NF", "BCNF"],
        1,
      ],
      [
        "Transactions and Concurrency",
        7,
        ["ACID properties", "Locking protocols", "Deadlocks", "Recovery"],
        0,
      ],
    ],
    deadlines: [
      ["SQL quiz", "Quiz", 1, false],
      ["Mini project: library database", "Project", 9, false],
      ["ER diagram assignment", "Assignment", -1, false],
    ],
  },
  {
    course: {
      name: "Computer Networks",
      code: "CN-303",
      instructor: "Dr. S. Kapoor",
      semester: "Fall Semester",
      credits: 3,
      status: "Ongoing",
      description: "Layered network architecture from the physical layer to applications.",
    },
    modules: [
      [
        "Network Models",
        5,
        ["OSI model", "TCP/IP model", "Network devices"],
        3,
      ],
      [
        "Network Layer",
        8,
        ["IPv4 addressing and subnetting", "Routing algorithms", "IPv6"],
        1,
      ],
      [
        "Transport and Application Layers",
        8,
        ["TCP and UDP", "Congestion control", "DNS and HTTP"],
        0,
      ],
    ],
    deadlines: [
      ["Subnetting worksheet", "Assignment", 6, false],
      ["Packet tracing lab", "Lab", 12, false],
    ],
  },
];

function plusDays(days: number) {
  const date = new Date(`${today()}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

export async function seedSampleData() {
  for (const sample of samples) {
    const courseId = await createCourse(sample.course);

    for (const [index, [name, hours, topics, done]] of sample.modules.entries()) {
      const moduleId = await createModule({
        course_id: courseId,
        position: index + 1,
        name,
        description: "",
        planned_hours: hours,
      });

      for (const [position, title] of topics.entries()) {
        await pool.query(
          "INSERT INTO topics (module_id, title, done) VALUES ($1, $2, $3)",
          [moduleId, title, position < done]
        );
      }
    }

    for (const [title, type, days, done] of sample.deadlines) {
      await createDeadline({
        course_id: courseId,
        title,
        type,
        due_date: plusDays(days),
        done,
      });
    }
  }
}
