import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import LiquidBackground from "../components/LiquidBackground";
import Navbar from "../components/Navbar";

import Sidebar from "../components/Sidebar";
import Home from "../components/AccountTabs/HomeTab";
import Billing from "../components/AccountTabs/BillingTab";
import Repositories from "../components/AccountTabs/RepoTab";

export default function Account() {
  const [activeTab, setActiveTab] = useState("home");

  const renderTab = () => {

    switch (activeTab) {
        case "home":
            return <Home/>
        case "billing":
            return <Billing/>
        default:
            return <Repositories/>
    }

  };

  
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-8">{renderTab()}</main>
      </div>
    </div>
  );
}
