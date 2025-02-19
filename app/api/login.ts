import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const filePath = path.join(process.cwd(), "data", "db.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const user = data.users.find(
      (user: any) => user.username === username && user.password === password
    );

    if (user) {
      return NextResponse.json({ message: "Login successful" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
    }
  } catch (err) {
    console.error("Error processing login request:", err); // Now 'err' is used
    return NextResponse.json({ message: "Server error", error: String(err) }, { status: 500 });
  }
}