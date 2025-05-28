// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/data/PointSiteLogo.png"; // Adjust path if needed

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  const [showSendModal, setShowSendModal] = useState(false);
  const [memo, setMemo] = useState(() => "");
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState(() => "");
  const [user, setUser] = useState<User | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  interface Transaction {
    timestamp: string;
    type: string;
    amount: number;
    from?: string;
    to?: string;
    reason?: string;
  }

  interface User {
    username: string;
    privilege: string;
  }

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUsername(parsedUser.username);
      fetchTransactions(parsedUser.username);
      fetchUsers();
    } catch (error) {
      console.error("Failed to load user data:", error);
      router.push("/login");
    }
  }, [hasMounted, router]);

  const fetchTransactions = async (username: string) => {
    try {
      const res = await fetch(`/api/transactions?username=${username}`);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      console.error(error);
    }
  };

  const sendPoints = async () => {
    if (!recipient || !amount) return alert("Enter recipient and amount");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: username, recipient, amount: Number(amount), memo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaction failed");

      alert("Transaction successful!");
      fetchTransactions(username);
    } catch (error) {
      alert(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  const handleCredit = async () => {
    if (!selectedUser || !creditAmount) return alert("Select a user and enter an amount.");
    if (!user || user.privilege !== "admin") return alert("Unauthorized: Admins only.");

    try {
      const response = await fetch("/api/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUser: user.username,
          targetUser: selectedUser,
          amount: Number(creditAmount),
          reason: creditReason,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Credited ${creditAmount} points to ${selectedUser}`);
        setShowCreditModal(false);
        fetchTransactions(username);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Error processing credit.");
      console.error(error);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) return alert("Please enter a new password.");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user?.username || "", newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");

      alert("Password reset!");
      setShowResetModal(false);
      setNewPassword("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unknown error");
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Point Account</h1>
      <div className="flex justify-center mb-4">
        <Image src={logo} alt="PointSite Logo" width={100} height={100} />
      </div>
      <h1 className="text-2xl font-bold mb-4">Welcome, {username}!</h1>

      <div className="bg-blue-100 p-4 rounded-md shadow-md mb-6">
        <h2 className="text-xl font-semibold">Current Balance:</h2>
        <p className="text-2xl font-bold text-blue-600">{balance} Points</p>
      </div>

      <h2 className="text-xl font-semibold mt-6 text-center">Actions</h2>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => setShowSendModal(true)}>
          Send Points
        </button>

        {user && user.privilege === "admin" && (
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-700" onClick={() => setShowCreditModal(true)}>
            Credit Account
          </button>
        )}

        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700" onClick={() => setShowResetModal(true)}>
          Change Password
        </button>

        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => router.push("/shop")}>Go to Shop</button>
      </div>

      {/* Remaining transaction history and modal code remains unchanged */}
            <h2 className="text-xl font-semibold mt-6 text-center">Transaction History</h2>
      <div className="bg-gray-100 rounded-md shadow-md max-h-72 overflow-y-auto">
        <div className="p-2">
          <table className="w-full text-left border-collapse">
            <thead className="sticky -top-1 w-full bg-gray-100 border-b-2 border-gray-300">
              <tr className="sticky top-0 bg-gray-100 border-b-2 border-gray-500">
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Memo</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.slice().reverse().map((tx, index) => {
                  let transactionType = "";
                  let transactionColor = "";
                  let transactionDetail = "";

                  if (tx.type === "Credit") {
                    transactionType = "Credit";
                    transactionColor = "text-yellow-600 font-semibold";
                    transactionDetail = `${tx.reason || "No reason"}`;
                  } else if (tx.to === username) {
                    transactionType = "Received";
                    transactionColor = "text-green-600 font-semibold";
                    transactionDetail = `From ${tx.from || "Unknown"}${tx.reason ? ", \"" + tx.reason + "\"" : ""}`;
                  } else if (tx.from === username) {
                    transactionType = "Sent";
                    transactionColor = "text-red-600 font-semibold";
                    transactionDetail = `To ${tx.to || "Unknown"}${tx.reason ? ", \"" + tx.reason + "\"" : ""}`;
                  } else if (tx.type === "debit") {
                    transactionType = "Withdrawal";
                    transactionColor = "text-red-600 font-semibold";
                  } else {
                    transactionType = "Unknown";
                    transactionColor = "text-gray-600";
                  }

                  return (
                    <tr key={index} className="border-b">
                      <td className="p-2">{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className={`p-2 ${transactionColor}`}>{transactionType}</td>
                      <td className="p-2">{tx.amount} points</td>
                      <td className="p-2">{transactionDetail}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="p-2 text-center" colSpan={4}>No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
