// app/shop/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Item {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function ShopPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/shop-data.json")
      .then((res) => res.json())
      .then((data) => setItems(data.items))
      .catch((err) => console.error("Failed to load shop data", err));
  }, []);

  const handleBuy = (item: Item) => {
    alert(`You bought ${item.name} for ${item.price} points!`);
    // Implement actual purchase logic here
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg shadow-md p-4 flex flex-col items-center"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={150}
              height={150}
              className="rounded mb-2"
            />
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-sm text-gray-600 mb-2 text-center">
              {item.description}
            </p>
            <p className="font-bold text-blue-700 mb-2">{item.price} Points</p>
            <button
              onClick={() => handleBuy(item)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}