import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Calculator } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  price_per_night: number;
  status: string;
}

const guestSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
});

const BookingForm = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    idType: 'passport',
    idNumber: '',
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available')
      .order('room_number');

    if (!error) {
      setRooms(data || []);
    }
  };

  const calculateTotal = () => {
    if (!selectedRoom || !checkIn || !checkOut) return 0;
    const nights = differenceInDays(checkOut, checkIn);
    return nights > 0 ? nights * selectedRoom.price_per_night : 0;
  };

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(checkOut, checkIn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = guestSchema.safeParse({
      firstName: guestForm.firstName,
      lastName: guestForm.lastName,
      email: guestForm.email,
      phone: guestForm.phone,
    });

    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (!selectedRoom || !checkIn || !checkOut) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a room and dates',
      });
      return;
    }

    if (getNights() <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Dates',
        description: 'Check-out must be after check-in',
      });
      return;
    }

    setLoading(true);

    // Create or find guest
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('email', guestForm.email)
      .single();

    let guestId = existingGuest?.id;

    if (!guestId) {
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert({
          first_name: guestForm.firstName,
          last_name: guestForm.lastName,
          email: guestForm.email,
          phone: guestForm.phone || null,
          address: guestForm.address || null,
          id_type: guestForm.idType,
          id_number: guestForm.idNumber || null,
        })
        .select('id')
        .single();

      if (guestError) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to create guest' });
        setLoading(false);
        return;
      }
      guestId = newGuest.id;
    }

    // Create booking
    const { error: bookingError } = await supabase.from('bookings').insert({
      room_id: selectedRoom.id,
      guest_id: guestId,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      adults,
      children,
      total_amount: calculateTotal(),
      status: 'confirmed',
      special_requests: specialRequests || null,
    });

    if (bookingError) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create booking' });
    } else {
      // Update room status
      await supabase.from('rooms').update({ status: 'occupied' }).eq('id', selectedRoom.id);

      toast({ title: 'Success', description: 'Booking created successfully!' });
      
      // Reset form
      setGuestForm({ firstName: '', lastName: '', email: '', phone: '', address: '', idType: 'passport', idNumber: '' });
      setSelectedRoom(null);
      setCheckIn(undefined);
      setCheckOut(undefined);
      setAdults(1);
      setChildren(0);
      setSpecialRequests('');
      fetchAvailableRooms();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">New Booking</h2>
        <p className="text-muted-foreground mt-1">Create a new reservation</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Guest Information */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={guestForm.firstName}
                    onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={guestForm.lastName}
                    onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={guestForm.address}
                  onChange={(e) => setGuestForm({ ...guestForm, address: e.target.value })}
                  placeholder="123 Main St, City, Country"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ID Type</Label>
                  <Select value={guestForm.idType} onValueChange={(v) => setGuestForm({ ...guestForm, idType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="national_id">National ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ID Number</Label>
                  <Input
                    value={guestForm.idNumber}
                    onChange={(e) => setGuestForm({ ...guestForm, idNumber: e.target.value })}
                    placeholder="ID Number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Room *</Label>
                <Select 
                  value={selectedRoom?.id || ''} 
                  onValueChange={(v) => setSelectedRoom(rooms.find(r => r.id === v) || null)}
                >
                  <SelectTrigger><SelectValue placeholder="Choose a room" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.room_number} - {room.room_type} (${room.price_per_night}/night)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Check-in Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn('w-full justify-start text-left font-normal', !checkIn && 'text-muted-foreground')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkIn ? format(checkIn, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn('w-full justify-start text-left font-normal', !checkOut && 'text-muted-foreground')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOut ? format(checkOut, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus disabled={(date) => date <= (checkIn || new Date())} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <Input type="number" min={1} value={adults} onChange={(e) => setAdults(parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Children</Label>
                  <Input type="number" min={0} value={children} onChange={(e) => setChildren(parseInt(e.target.value))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Requests</Label>
                <Textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requests..."
                  rows={2}
                />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Room Rate:</span>
                  <span>${selectedRoom?.price_per_night || 0}/night</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Nights:</span>
                  <span>{getNights()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total:</span>
                  <span className="text-primary">${calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Booking
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
