import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import { BedDouble, CalendarCheck, Users, Settings } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "rooms":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BedDouble className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Room Management</h3>
            <p className="text-muted-foreground mt-2">Manage all hotel rooms and their status</p>
          </div>
        );
      case "bookings":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CalendarCheck className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Booking Management</h3>
            <p className="text-muted-foreground mt-2">View and manage all reservations</p>
          </div>
        );
      case "guests":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Guest Directory</h3>
            <p className="text-muted-foreground mt-2">Access guest information and history</p>
          </div>
        );
      case "settings":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Settings className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-semibold text-foreground">Settings</h3>
            <p className="text-muted-foreground mt-2">Configure your hotel management system</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
