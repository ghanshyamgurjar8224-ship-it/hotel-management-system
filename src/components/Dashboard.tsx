import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BedDouble, Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import StatsCard from './StatsCard';
import RoomStatusCard from './RoomStatusCard';
import RecentBookings from './RecentBookings';

const Dashboard = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [roomsRes, bookingsRes] = await Promise.all([
      supabase.from('rooms').select('*').order('room_number'),
      supabase.from('bookings').select('*, rooms(room_number), guests(first_name, last_name)').order('created_at', { ascending: false }).limit(5),
    ]);

    if (!roomsRes.error) setRooms(roomsRes.data || []);
    if (!bookingsRes.error) setBookings(bookingsRes.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const formattedRooms = rooms.slice(0, 5).map(r => ({
    id: r.id,
    number: r.room_number,
    type: r.room_type,
    status: r.status,
  }));

  const formattedBookings = bookings.map(b => ({
    id: b.id,
    guestName: b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Unknown',
    roomNumber: b.rooms?.room_number || 'N/A',
    checkIn: new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    checkOut: new Date(b.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: b.status,
    totalAmount: b.total_amount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Rooms" value={rooms.length} subtitle={`${availableRooms} available`} icon={BedDouble} variant="default" />
        <StatsCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={TrendingUp} trend={{ value: 12, isPositive: true }} variant="success" />
        <StatsCard title="Active Guests" value={occupiedRooms} subtitle="Currently staying" icon={Users} variant="accent" />
        <StatsCard title="Recent Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentBookings bookings={formattedBookings} />
        </div>
        <div>
          <RoomStatusCard rooms={formattedRooms} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
