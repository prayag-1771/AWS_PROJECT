import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureDatabase } from "@/lib/init-db";
import { listProjects } from "@/lib/projects";

export async function GET() {
  try {
    return NextResponse.json(await listProjects());
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, environment, architecture, region } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    await ensureDatabase();

    const result = await pool.query(
      `INSERT INTO projects
       (name, environment, architecture, region, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name,
        environment,
        architecture,
        region,
        "Active",
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
