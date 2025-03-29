import React from "react";
import { auth } from "../../firebase";

export default function Home() {
  const user = auth.currentUser;

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-white">👤 Account Overview</h2>
      {user ? (
        <div className="space-y-4 text-gray-200">
          <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.uid}</p>
          <p><strong>Joined:</strong> {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
        </div>
      ) : (
        <p className="text-red-500">User not logged in.</p>
      )}
    </div>
  );
}
