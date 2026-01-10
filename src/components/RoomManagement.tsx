import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, BedDouble, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  floor: number;
  price_per_night: number;
  max_occupancy: number;
  amenities: string[];
  status: string;
  description: string | null;
}

const statusStyles: Record<string, string> = {
  available: 'bg-success/10 text-success border-success/20',
  occupied: 'bg-primary/10 text-primary border-primary/20',
  maintenance: 'bg-destructive/10 text-destructive border-destructive/20',
  cleaning: 'bg-warning/20 text-warning border-warning/20',
};

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard Room',
    floor: 1,
    price_per_night: 100,
    max_occupancy: 2,
    amenities: 'WiFi, TV, AC',
    status: 'available',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number');

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load rooms' });
    } else {
      setRooms(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArray = formData.amenities.split(',').map(a => a.trim());

    if (editingRoom) {
      const { error } = await supabase
        .from('rooms')
        .update({
          room_number: formData.room_number,
          room_type: formData.room_type,
          floor: formData.floor,
          price_per_night: formData.price_per_night,
          max_occupancy: formData.max_occupancy,
          amenities: amenitiesArray,
          status: formData.status,
          description: formData.description,
        })
        .eq('id', editingRoom.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update room' });
      } else {
        toast({ title: 'Success', description: 'Room updated successfully' });
        fetchRooms();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from('rooms').insert({
        room_number: formData.room_number,
        room_type: formData.room_type,
        floor: formData.floor,
        price_per_night: formData.price_per_night,
        max_occupancy: formData.max_occupancy,
        amenities: amenitiesArray,
        status: formData.status,
        description: formData.description,
      });

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
        toast({ title: 'Success', description: 'Room created successfully' });
        fetchRooms();
        setIsDialogOpen(false);
      }
    }
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      floor: room.floor,
      price_per_night: room.price_per_night,
      max_occupancy: room.max_occupancy,
      amenities: room.amenities?.join(', ') || '',
      status: room.status,
      description: room.description || '',
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      room_type: 'Standard Room',
      floor: 1,
      price_per_night: 100,
      max_occupancy: 2,
      amenities: 'WiFi, TV, AC',
      status: 'available',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const updateRoomStatus = async (roomId: string, newStatus: string) => {
    const { error } = await supabase
      .from('rooms')
      .update({ status: newStatus })
      .eq('id', roomId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status' });
    } else {
      fetchRooms();
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Room Management</h2>
          <p className="text-muted-foreground mt-1">Manage all hotel rooms and their status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="w-4 h-4 mr-2" /> Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    placeholder="101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={formData.room_type} onValueChange={(v) => setFormData({ ...formData, room_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Room">Standard Room</SelectItem>
                    <SelectItem value="Deluxe Suite">Deluxe Suite</SelectItem>
                    <SelectItem value="Premium Suite">Premium Suite</SelectItem>
                    <SelectItem value="Family Suite">Family Suite</SelectItem>
                    <SelectItem value="Presidential Suite">Presidential Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price/Night ($)</Label>
                  <Input
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Occupancy</Label>
                  <Input
                    type="number"
                    value={formData.max_occupancy}
                    onChange={(e) => setFormData({ ...formData, max_occupancy: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amenities (comma-separated)</Label>
                <Input
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="WiFi, TV, AC"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Room description..."
                />
              </div>
              <Button type="submit" className="w-full">
                {editingRoom ? 'Update Room' : 'Create Room'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BedDouble className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{room.room_type}</span>
                <span className="font-semibold text-foreground">${room.price_per_night}/night</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max: {room.max_occupancy} guests</span>
                <Badge variant="outline" className={cn('font-medium capitalize', statusStyles[room.status])}>
                  {room.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {room.amenities?.slice(0, 3).map((amenity, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {room.amenities && room.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs">+{room.amenities.length - 3}</Badge>
                )}
              </div>
              <Select value={room.status} onValueChange={(v) => updateRoomStatus(room.id, v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoomManagement;
