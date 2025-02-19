"use client";

import { useState, useEffect } from "react";

interface User {
  username: string;
  balance: number;
  transactions: string[];
}

export default function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensures hydration happens after the component has mounted

    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (!isMounted) return null; // **Fixes the hydration issue!**
  if (loading) return <p className="text-center">Loading...</p>;
  if (!user) return <p className="text-center">No user data found.</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Dashboard</h2>
        <p className="text-center">Welcome, {user.username}!</p>

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Your Balance:</h3>
          <p className="text-xl font-bold">{user.balance} Points</p>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Transaction History:</h3>
          <ul className="list-disc pl-5">
            {user.transactions.map((tx: string, index: number) => (
              <li key={index}>{tx}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-green-500 text-white p-2 rounded">Send Points</button>
          <button className="flex-1 bg-purple-500 text-white p-2 rounded">Redeem Code</button>
        </div>
      </div>


      





      
    </div>
  );
}