import fs from "fs";
import path from "path";
import { NextRequest } from 'next/server';

const dbPath = path.join(process.cwd(), "data/db.json");

// new code?
// Define the User interface to match your JSON structure
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  privilege: string; // Can be "admin" or other roles
}
// interface Database {
//   users: User[];
// }
// new code?

export async function POST(req: NextRequest) {
  try {
    const { username, newPassword } = await req.json();

    if (!username || !newPassword) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Read and parse database
    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    const user = db.users.find((u: User) => u.username === username);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Update password
    user.password = newPassword;

    // Save back to db.json
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");

    return new Response(JSON.stringify({ message: "Password updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error); // ✅ Log the error
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
