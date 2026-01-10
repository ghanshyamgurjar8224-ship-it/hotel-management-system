import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
}

interface Booking {
  id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  status: string;
  guests: {
    first_name: string;
    last_name: string;
  } | null;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-success text-success-foreground',
  pending: 'bg-warning text-warning-foreground',
  'checked-in': 'bg-primary text-primary-foreground',
  'checked-out': 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

interface BookingBarProps {
  booking: Booking;
  isStart: boolean;
  isEnd: boolean;
  dayWidth: number;
}

const DraggableBooking = ({ booking, isStart, isEnd, dayWidth }: BookingBarProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: booking.id,
    data: { booking },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'absolute top-1 h-6 px-2 text-xs font-medium flex items-center cursor-grab active:cursor-grabbing z-10 transition-opacity',
        statusColors[booking.status],
        isStart && 'rounded-l-md',
        isEnd && 'rounded-r-md',
        isDragging && 'opacity-50'
      )}
      style={{
        left: 0,
        right: 0,
        minWidth: dayWidth - 4,
      }}
    >
      {isStart && booking.guests && (
        <span className="truncate">{booking.guests.first_name} {booking.guests.last_name}</span>
      )}
    </div>
  );
};

interface DroppableCellProps {
  roomId: string;
  date: Date;
  children: React.ReactNode;
  isToday: boolean;
  isCurrentMonth: boolean;
}

const DroppableCell = ({ roomId, date, children, isToday, isCurrentMonth }: DroppableCellProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${roomId}-${format(date, 'yyyy-MM-dd')}`,
    data: { roomId, date },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative border-r border-b border-border min-h-[32px] transition-colors',
        isToday && 'bg-accent/50',
        !isCurrentMonth && 'bg-muted/30',
        isOver && 'bg-primary/20'
      )}
    >
      {children}
    </div>
  );
};

const BookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    
    const [roomsRes, bookingsRes] = await Promise.all([
      supabase.from('rooms').select('id, room_number, room_type').order('room_number'),
      supabase
        .from('bookings')
        .select('id, room_id, check_in, check_out, status, guests(first_name, last_name)')
        .gte('check_out', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
        .lte('check_in', format(endOfMonth(currentMonth), 'yyyy-MM-dd')),
    ]);

    if (!roomsRes.error) setRooms(roomsRes.data || []);
    if (!bookingsRes.error) setBookings(bookingsRes.data || []);
    
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBooking(null);

    if (!over) return;

    const booking = (active.data.current as { booking: Booking })?.booking;
    const [newRoomId, newDateStr] = (over.id as string).split('-').slice(0, 2);
    const targetData = over.data.current as { roomId: string; date: Date };

    if (!booking || !targetData) return;

    const checkInDate = parseISO(booking.check_in);
    const checkOutDate = parseISO(booking.check_out);
    const daysDiff = Math.round((targetData.date.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    const newCheckIn = new Date(checkInDate);
    newCheckIn.setDate(newCheckIn.getDate() + daysDiff);
    const newCheckOut = new Date(checkOutDate);
    newCheckOut.setDate(newCheckOut.getDate() + daysDiff);

    const { error } = await supabase
      .from('bookings')
      .update({
        room_id: targetData.roomId,
        check_in: format(newCheckIn, 'yyyy-MM-dd'),
        check_out: format(newCheckOut, 'yyyy-MM-dd'),
      })
      .eq('id', booking.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to move booking' });
    } else {
      toast({ title: 'Success', description: 'Booking moved successfully' });
      fetchData();
    }
  };

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const getBookingForCell = (roomId: string, date: Date) => {
    return filteredBookings.find(b => {
      if (b.room_id !== roomId) return false;
      const checkIn = parseISO(b.check_in);
      const checkOut = parseISO(b.check_out);
      return isWithinInterval(date, { start: checkIn, end: checkOut }) || isSameDay(date, checkIn);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Booking Calendar</h2>
          <p className="text-muted-foreground mt-1">Drag and drop to reschedule bookings</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusColors).map(([status, color]) => (
          <Badge key={status} className={cn(color, 'capitalize')}>{status.replace('-', ' ')}</Badge>
        ))}
      </div>

      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <DndContext
            onDragStart={(event) => {
              const booking = (event.active.data.current as { booking: Booking })?.booking;
              setActiveBooking(booking);
            }}
            onDragEnd={handleDragEnd}
          >
            <div className="min-w-[900px]">
              {/* Header */}
              <div className="flex border-b border-border bg-muted/50">
                <div className="w-32 min-w-[128px] p-2 font-semibold text-sm border-r border-border">Room</div>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'flex-1 min-w-[40px] p-1 text-center text-xs border-r border-border',
                      isSameDay(day, new Date()) && 'bg-accent font-bold'
                    )}
                  >
                    <div className="font-medium">{format(day, 'd')}</div>
                    <div className="text-muted-foreground">{format(day, 'EEE')}</div>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {rooms.map((room) => (
                <div key={room.id} className="flex">
                  <div className="w-32 min-w-[128px] p-2 text-sm border-r border-b border-border bg-card">
                    <div className="font-semibold">{room.room_number}</div>
                    <div className="text-xs text-muted-foreground truncate">{room.room_type}</div>
                  </div>
                  {days.map((day) => {
                    const booking = getBookingForCell(room.id, day);
                    const isStart = booking && isSameDay(parseISO(booking.check_in), day);
                    const isEnd = booking && isSameDay(parseISO(booking.check_out), day);

                    return (
                      <DroppableCell
                        key={day.toISOString()}
                        roomId={room.id}
                        date={day}
                        isToday={isSameDay(day, new Date())}
                        isCurrentMonth={isSameMonth(day, currentMonth)}
                      >
                        {booking && isStart && (
                          <DraggableBooking
                            booking={booking}
                            isStart={isStart}
                            isEnd={isEnd}
                            dayWidth={40}
                          />
                        )}
                      </DroppableCell>
                    );
                  })}
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeBooking && (
                <div className={cn('px-2 py-1 rounded text-xs font-medium', statusColors[activeBooking.status])}>
                  {activeBooking.guests?.first_name} {activeBooking.guests?.last_name}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
