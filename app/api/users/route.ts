import { NextResponse } from "next/server";
import fs from "fs";
// import path from "path"; 

const dbPath = "data/db.json";

export async function GET() {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(data);

    const users = db.users.map((user: any) => ({ username: user.username }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}