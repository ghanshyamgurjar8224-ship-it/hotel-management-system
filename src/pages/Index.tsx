import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import RoomManagement from '@/components/RoomManagement';
import BookingForm from '@/components/BookingForm';
import BookingCalendar from '@/components/BookingCalendar';
import GuestDirectory from '@/components/GuestDirectory';
import { Settings, Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'rooms':
        return <RoomManagement />;
      case 'bookings':
        return <BookingForm />;
      case 'calendar':
        return <BookingCalendar />;
      case 'guests':
        return <GuestDirectory />;
      case 'settings':
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
      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
