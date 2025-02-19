import { NextResponse } from "next/server";
import fs from "fs";
// import path from "path";// this might need to be commented out

const dbPath = "data/db.json";

// Function to calculate user balance from transactions ledger
const calculateBalance = (username: string, transactions: any[]) => {
  return transactions.reduce((balance, tx) => {
    if (tx.to === username) return balance + tx.amount;  // Incoming points
    if (tx.from === username) return balance - tx.amount; // Outgoing points
    return balance;
  }, 0);
};

export async function POST(req: Request) {
  try {
    const { sender, recipient, amount, memo} = await req.json();
    const transferAmount = Number(amount);
    const memoText = memo; //maybe this will work?


    if (!sender || !recipient || isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: "Invalid transaction details" }, { status: 400 });
    }
    if (!Number.isInteger(transferAmount)) {
        return NextResponse.json({ error: "Transfer amount must be a whole number." }, { status: 400 });
      }
  

    // Read database
    const data = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(data);

    // Check if sender and recipient exist
    const senderExists = db.users.some((user: any) => user.username === sender);
    const recipientExists = db.users.some((user: any) => user.username === recipient);

    if (!senderExists || !recipientExists) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Get sender's current balance
    const senderBalance = calculateBalance(sender, db.transactions);

    // Prevent overdraft (balance below 0)
    if (senderBalance < transferAmount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Append transaction to ledger
    const newTransaction = {
      from: sender,
      to: recipient,
      amount: transferAmount,
      type: "transfer",
      reason: memoText, //bleep if no worky
      timestamp: new Date().toISOString(),
    };
    db.transactions.push(newTransaction);

    // Save back to db.json
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true, transaction: newTransaction });
  } catch (error) {
    console.error("Send API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}