import { BedDouble, Users, DollarSign, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";
import RoomStatusCard, { Room } from "./RoomStatusCard";
import RecentBookings, { Booking } from "./RecentBookings";

const mockRooms: Room[] = [
  { id: "1", number: "101", type: "Deluxe Suite", status: "occupied", guest: "Michael Chen", checkOut: "Jan 12" },
  { id: "2", number: "102", type: "Standard Room", status: "available" },
  { id: "3", number: "103", type: "Family Suite", status: "cleaning" },
  { id: "4", number: "201", type: "Deluxe Suite", status: "occupied", guest: "Sarah Johnson", checkOut: "Jan 15" },
  { id: "5", number: "202", type: "Standard Room", status: "maintenance" },
  { id: "6", number: "203", type: "Premium Suite", status: "available" },
];

const mockBookings: Booking[] = [
  { id: "1", guestName: "Emily Watson", roomNumber: "301", checkIn: "Jan 10", checkOut: "Jan 14", status: "confirmed", totalAmount: 1200 },
  { id: "2", guestName: "James Miller", roomNumber: "105", checkIn: "Jan 11", checkOut: "Jan 13", status: "pending", totalAmount: 450 },
  { id: "3", guestName: "Michael Chen", roomNumber: "101", checkIn: "Jan 8", checkOut: "Jan 12", status: "checked-in", totalAmount: 980 },
  { id: "4", guestName: "Sarah Johnson", roomNumber: "201", checkIn: "Jan 10", checkOut: "Jan 15", status: "checked-in", totalAmount: 1500 },
  { id: "5", guestName: "David Brown", roomNumber: "108", checkIn: "Jan 5", checkOut: "Jan 9", status: "checked-out", totalAmount: 720 },
];

const Dashboard = () => {
  const availableRooms = mockRooms.filter(r => r.status === "available").length;
  const occupiedRooms = mockRooms.filter(r => r.status === "occupied").length;
  const occupancyRate = Math.round((occupiedRooms / mockRooms.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Rooms"
          value={mockRooms.length}
          subtitle={`${availableRooms} available`}
          icon={BedDouble}
          variant="default"
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Active Guests"
          value={occupiedRooms}
          subtitle="Currently staying"
          icon={Users}
          variant="accent"
        />
        <StatsCard
          title="Revenue Today"
          value="$4,850"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookings bookings={mockBookings} />
        </div>
        <div>
          <RoomStatusCard rooms={mockRooms.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
