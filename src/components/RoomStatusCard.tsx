import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Room {
  id: string;
  number: string;
  type: string;
  status: "available" | "occupied" | "maintenance" | "cleaning";
  guest?: string;
  checkOut?: string;
}

interface RoomStatusCardProps {
  rooms: Room[];
}

const statusStyles = {
  available: "bg-success/10 text-success border-success/20",
  occupied: "bg-primary/10 text-primary border-primary/20",
  maintenance: "bg-destructive/10 text-destructive border-destructive/20",
  cleaning: "bg-warning/20 text-warning border-warning/20",
};

const statusLabels = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Maintenance",
  cleaning: "Cleaning",
};

const RoomStatusCard = ({ rooms }: RoomStatusCardProps) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Room Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">{room.number}</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{room.type}</p>
                {room.guest && (
                  <p className="text-sm text-muted-foreground">{room.guest}</p>
                )}
                {room.checkOut && (
                  <p className="text-xs text-muted-foreground">
                    Check-out: {room.checkOut}
                  </p>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn("font-medium", statusStyles[room.status])}
            >
              {statusLabels[room.status]}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RoomStatusCard;
