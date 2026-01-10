import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarDays, User } from "lucide-react";

export interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "checked-in" | "checked-out";
  totalAmount: number;
}

interface RecentBookingsProps {
  bookings: Booking[];
}

const statusStyles = {
  confirmed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/20 text-warning border-warning/20",
  "checked-in": "bg-primary/10 text-primary border-primary/20",
  "checked-out": "bg-muted text-muted-foreground border-muted",
};

const RecentBookings = ({ bookings }: RecentBookingsProps) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Bookings</CardTitle>
          <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Guest</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Room</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Check-in</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Check-out</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{booking.guestName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-foreground">{booking.roomNumber}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-sm">{booking.checkIn}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-sm">{booking.checkOut}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <Badge
                      variant="outline"
                      className={cn("font-medium capitalize", statusStyles[booking.status])}
                    >
                      {booking.status.replace("-", " ")}
                    </Badge>
                  </td>
                  <td className="py-4 px-2 text-right font-semibold text-foreground">
                    ${booking.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentBookings;
