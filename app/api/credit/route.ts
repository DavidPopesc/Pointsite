import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db.json");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminUser, targetUser, amount, reason } = body;

    if (!adminUser || !targetUser || !amount || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Load database
    const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    console.log("File content:", data);
    const users = data.users;
    const transactions = data.transactions || [];

    // Check if admin user exists and has admin privileges
    const admin = users.find((user: { username: any; }) => user.username === adminUser);
    if (!admin || admin.privilege !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Ensure target user exists
    const target = users.find((user: { username: any; }) => user.username === targetUser);
    if (!target) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Create credit transaction
    const newTransaction = {
      // from: adminUser,
      to: targetUser,
      amount: Number(amount),
      type: "Credit",
      reason,
      timestamp: new Date().toISOString(),
    };

    // Save transaction
    transactions.push(newTransaction);
    fs.writeFileSync(dbPath, JSON.stringify({ ...data, transactions }, null, 2));

    return NextResponse.json({ success: true, transaction: newTransaction });
  } catch (error) {
    console.error("Credit API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}