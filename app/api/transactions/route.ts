import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db.json");

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Missing username parameter" }, { status: 400 });
    }

    // Read database
    const data = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(data);

    // Filter transactions related to the user
    const userTransactions = db.transactions.filter(
      (tx: any) => tx.username === username || tx.to === username || tx.from === username
    );

    // Calculate balance dynamically
    let balance = 0;
    userTransactions.forEach((tx: any) => {
      if (tx.username === username && tx.type === "credit") balance += tx.amount;
      if (tx.username === username && tx.type === "debit") balance -= tx.amount;
      if (tx.to === username) balance += tx.amount;
      if (tx.from === username) balance -= tx.amount;
    });

    return NextResponse.json({ balance, transactions: userTransactions });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}