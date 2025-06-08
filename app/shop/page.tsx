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
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
  });

  useEffect(() => {
    fetch("/shop-data.json")
      .then((res) => res.json())
      .then((data) => setItems(data.items))
      .catch((err) => console.error("Failed to load shop data", err));
  }, []);

  const handleBuy = (item: Item) => {
    alert(`You bought ${item.name} for ${item.price} points!`);
  };

  const handleAddItem = () => {
    const itemToAdd: Item = {
      id: Date.now().toString(),
      ...newItem,
    };
    setItems([...items, itemToAdd]);
    setShowModal(false);
    setNewItem({ name: "", description: "", price: 0, image: "" });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Shop</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Add Item
        </button>
      </div>

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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Item</h2>
            <input
              type="text"
              placeholder="Title"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
              className="border p-2 rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
