"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Logo Image on top of webpage
import Image from "next/image";
import logo from "@/data/PointSiteLogo.png"; // Adjust the path if needed

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  interface Transaction {
    timestamp: string;
    type: string;
    amount: number;
    from?: string;
    to?: string;
    reason?: string;
  }
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [hasMounted, setHasMounted] = useState(false); // ✅ Prevent SSR issues
  const router = useRouter();


  //Send points
  const [showSendModal, setShowSendModal] = useState(false);
  const [memo, setMemo] = useState(() => "");

  // Admin credit state
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState(() => "");
  interface User {
    username: string;
    privilege: string;
  }

  const [user, setUser] = useState<User | null>(null);

  // reset password
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setHasMounted(true); // ✅ Ensures safe hydration
  }, []);
  
  useEffect(() => {
    if (!hasMounted) return; // ✅ Prevent SSR issues
  
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      router.push("/login");
      return;
    }
  
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // ✅ Ensure full user object is stored
  
      setUsername(parsedUser.username);
      fetchTransactions(parsedUser.username);
      fetchUsers();
    } catch (error) {
      console.error("Failed to load user data:", error);
      router.push("/login");
    }
  }, [hasMounted, router]); //Code produces an error in the terminal: 
  // ./app/dashboard/page.tsx
  // 76:6  Warning: React Hook useEffect has a missing dependency: 'router'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps


  
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
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

const handleCredit = async () => {
  if (!selectedUser || !creditAmount) {
    alert("Please select a user and enter an amount.");
    return;
  }

  if (!user || user.privilege !== "admin") {
    alert("Unauthorized: You must be an admin to credit accounts.");
    return;
  }

  try {
    const response = await fetch("/api/credit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminUser: user.username, // Ensure admin username is valid
        targetUser: selectedUser,
        amount: Number(creditAmount), // Ensure numeric amount
        reason: creditReason,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(`Successfully credited ${creditAmount} points to ${selectedUser}!`);
      setShowCreditModal(false);
      fetchTransactions(username); // Refresh balance after crediting
    } else {
      alert("Error: " + data.error);
    }
  } catch (error) {
    console.error("Error crediting account:", error);
    alert("Failed to process credit request.");
  }
};

// reset password function
const resetPassword = async () => {
  if (!newPassword) return alert("Please enter a new password.");

  try {
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user?.username || "",
        newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Password reset failed");

    alert("Password successfully reset!");
    setShowResetModal(false);
    setNewPassword(""); // Clear input
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("An unknown error occurred");
    }
  }
};

  if (!hasMounted) return null; // ✅ Prevents hydration mismatch

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

{/* Actions Section */}
<h2 className="text-xl font-semibold mt-6 text-center">Actions</h2>

<div className="flex flex-wrap justify-center gap-4 mt-2 ">
  <button
    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
    onClick={() => setShowSendModal(true)}
  >
    Send Points
  </button>

  {user && user.privilege === "admin" && (
    <button
      onClick={() => setShowCreditModal(true)}
      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-700"
    >
      Credit Account
    </button>
  )}

  <button
    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
    onClick={() => setShowResetModal(true)}
  >
    Change Password
  </button>
</div>

{/* Transaction History Box */}
<h2 className="text-xl font-semibold mb-2 mt-6">Transaction History</h2>
<div className="bg-gray-100 rounded-md shadow-md max-h-72 overflow-y-auto">
<div className="p-2"> {/* Added padding to the sides */}

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
  </div> {/*Padding /div*/}
</div>



{/* Send Points Section */}
{/* <h2 className="text-xl font-semibold mt-6">Send Points</h2>

  <button
    className="bg-green-500 text-white px-4 py-2 rounded"
    onClick={() => setShowSendModal(true)}
  >
    Send Points
  </button> */}


{showSendModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-md shadow-md w-96">
      <h2 className="text-xl font-bold mb-4">Send Points</h2>
      <select
        className="border p-2 rounded w-full mb-2"
        onChange={(e) => setRecipient(e.target.value)}
        value={recipient}
      >
        <option value="">Select User</option>
        {users.map((user) =>
          user.username !== username ? (
            <option key={user.username} value={user.username}>
              {user.username}
            </option>
          ) : null
        )}
      </select>
      <input
        type="number"
        placeholder="Amount"
        className="border p-2 rounded w-full mb-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="text"
        placeholder="Memo"
        className="border p-2 rounded w-full mb-2"
        value={memo} //?
        onChange={(e) => setMemo(e.target.value)} //?
      />
      <div className="flex justify-end">
        <button
          onClick={() => setShowSendModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
        >
          Cancel
        </button>
        <button
          onClick={sendPoints}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}

{/* Reset Password Section */}
{/* <h2 className="text-xl font-semibold mt-6">Reset Password</h2>

<button
  className="bg-red-500 text-white px-4 py-2 rounded"
  onClick={() => setShowResetModal(true)}
>
  Reset Password
</button> */}

{showResetModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-md shadow-md w-96">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>
      <input
        type="password"
        placeholder="New Password"
        className="border p-2 rounded w-full mb-2"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          onClick={() => setShowResetModal(false)}
          className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
        >
          Cancel
        </button>
        <button
          onClick={resetPassword}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
)}


      {/* {user && user.privilege === "admin" && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Admin Controls</h3>
          <button 
            onClick={() => setShowCreditModal(true)}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Credit Account
          </button>
        </div>
      )} */}

      {showCreditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-orange-100 p-6 rounded-md shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">Credit an Account</h2>
            <select
              className="border p-2 rounded w-full mb-2"
              onChange={(e) => setSelectedUser(e.target.value)}
              value={selectedUser}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.username} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              className="border p-2 rounded w-full mb-2"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
            />
            <input
              type="text"
              placeholder="Reason"
              className="border p-2 rounded w-full mb-2"
              value={creditReason} //hydration fails here
              onChange={(e) => setCreditReason(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreditModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCredit}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Credit
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}