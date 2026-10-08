import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );

    return NextResponse.json(result.rows);
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
