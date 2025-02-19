import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface User {
  username: string;
  password: string;
  privilege?: string;
}

const dbPath = path.join(process.cwd(), "data", "db.json");

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.username || !body.password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    const { username, password } = body;

    // Read database
    const data = fs.readFileSync(dbPath, "utf-8");
    const users: User[] = JSON.parse(data).users;

    // Validate user credentials
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
    }

    // ✅ Return full user data, including privilege
    return NextResponse.json({
      success: true,
      username: user.username,
      privilege: user.privilege || "user", // Default to "user" if undefined
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}