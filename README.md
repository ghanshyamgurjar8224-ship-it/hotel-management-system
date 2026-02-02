# Hotel Companion - Hotel Management System

A modern, full-stack hotel management dashboard built with React, TypeScript, and Supabase. This application enables hotel staff to manage rooms, bookings, guests, and view real-time analytics.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Project Architecture](#project-architecture)
4. [Database Design](#database-design)
5. [Features & Modules](#features--modules)
6. [Authentication System](#authentication-system)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Key Implementation Details](#key-implementation-details)
10. [How to Run](#how-to-run)
11. [API Operations](#api-operations)
12. [Viva Questions & Answers](#viva-questions--answers)

---

## Project Overview

**Hotel Companion** is a Single Page Application (SPA) that serves as a comprehensive hotel management system. It allows hotel staff to:

- Monitor hotel occupancy and revenue through an interactive dashboard
- Manage room inventory (add, edit, update status)
- Create and manage bookings with automatic price calculation
- Maintain a guest directory with search functionality
- View and reschedule bookings via a drag-and-drop calendar

### Why This Project?

Hotels need efficient systems to manage their operations. This project demonstrates:
- Modern frontend development with React and TypeScript
- Backend-as-a-Service (BaaS) integration with Supabase
- Real-world CRUD operations with relational data
- Responsive UI design with component libraries
- Authentication and authorization patterns

---

## Technologies Used

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for building component-based interfaces |
| **TypeScript** | 5.8.3 | Type-safe JavaScript for better developer experience |
| **Vite** | 7.3.1 | Fast build tool and development server |
| **React Router DOM** | 6.30.1 | Client-side routing for SPA navigation |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework for styling |
| **shadcn/ui** | - | Pre-built accessible UI components (built on Radix UI) |
| **Lucide React** | 0.462.0 | Icon library with 1000+ SVG icons |
| **date-fns** | 3.6.0 | Modern date utility library |
| **@dnd-kit/core** | 6.3.1 | Drag and drop toolkit for React |
| **React Hook Form** | 7.61.1 | Form state management |
| **Zod** | 3.25.76 | Schema validation library |
| **TanStack React Query** | 5.83.0 | Server state management |
| **Sonner** | 1.7.4 | Toast notification library |

### Backend Stack (Supabase)

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service platform |
| **PostgreSQL** | Relational database (hosted by Supabase) |
| **Supabase Auth** | Authentication service |
| **Row Level Security (RLS)** | Database-level authorization |
| **Supabase JS SDK** | Client library for database operations |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and quality |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |

---

## Project Architecture

```
hotel-companion/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components (50+ components)
│   │   ├── Dashboard.tsx    # Main dashboard with stats
│   │   ├── RoomManagement.tsx    # Room CRUD operations
│   │   ├── BookingForm.tsx       # Create bookings
│   │   ├── BookingCalendar.tsx   # Calendar with drag-drop
│   │   ├── GuestDirectory.tsx    # Guest management
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── StatsCard.tsx         # KPI display cards
│   │   ├── RecentBookings.tsx    # Bookings table
│   │   └── RoomStatusCard.tsx    # Room status display
│   │
│   ├── pages/               # Route components
│   │   ├── Index.tsx        # Main dashboard (protected)
│   │   ├── Auth.tsx         # Login/Signup page
│   │   └── NotFound.tsx     # 404 page
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication context & hook
│   │   ├── use-mobile.tsx   # Mobile detection hook
│   │   └── use-toast.ts     # Toast notification hook
│   │
│   ├── integrations/        # External service integrations
│   │   └── supabase/
│   │       ├── client.ts    # Supabase client initialization
│   │       └── types.ts     # Auto-generated database types
│   │
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn for classnames)
│   │
│   ├── App.tsx              # Root component with providers
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles & Tailwind config
│
├── supabase/
│   ├── config.toml          # Supabase project configuration
│   └── migrations/          # Database migration files
│       └── *.sql            # SQL schema definitions
│
├── public/                  # Static assets
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── .env                     # Environment variables
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Application (Vite)                │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │           React Router DOM                   │    │   │
│  │  │    /  (Index)    /auth (Auth)    /* (404)   │    │   │
│  │  ├─────────────────────────────────────────────┤    │   │
│  │  │           Context Providers                  │    │   │
│  │  │  QueryClient → AuthProvider → TooltipProvider│    │   │
│  │  ├─────────────────────────────────────────────┤    │   │
│  │  │           Feature Components                 │    │   │
│  │  │  Dashboard | Rooms | Bookings | Calendar    │    │   │
│  │  ├─────────────────────────────────────────────┤    │   │
│  │  │           shadcn/ui Components              │    │   │
│  │  │  Card | Button | Input | Select | Dialog    │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Supabase JS SDK)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Authentication Service                  │   │
│  │         Email/Password | Session Management          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │              PostgreSQL Database                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │profiles │ │  rooms  │ │ guests  │ │bookings │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │           Row Level Security (RLS)                   │   │
│  │      Policies enforce authenticated access           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Design

### Entity Relationship Diagram (ERD)

```
┌──────────────────┐       ┌──────────────────┐
│     profiles     │       │      rooms       │
├──────────────────┤       ├──────────────────┤
│ id (PK, FK)      │       │ id (PK)          │
│ full_name        │       │ room_number (UK) │
│ role             │       │ room_type        │
│ avatar_url       │       │ floor            │
│ created_at       │       │ price_per_night  │
│ updated_at       │       │ max_occupancy    │
└──────────────────┘       │ amenities[]      │
        │                  │ status           │
        │                  │ description      │
        │                  │ created_at       │
        │ FK to auth.users │ updated_at       │
        ▼                  └────────┬─────────┘
┌──────────────────┐                │
│    auth.users    │                │ FK (room_id)
│   (Supabase)     │                │
└──────────────────┘                ▼
                          ┌──────────────────┐
┌──────────────────┐      │     bookings     │
│      guests      │      ├──────────────────┤
├──────────────────┤      │ id (PK)          │
│ id (PK)          │◄─────│ room_id (FK)     │
│ first_name       │      │ guest_id (FK)    │
│ last_name        │      │ check_in         │
│ email            │      │ check_out        │
│ phone            │      │ adults           │
│ address          │      │ children         │
│ id_type          │      │ total_amount     │
│ id_number        │      │ status           │
│ notes            │      │ special_requests │
│ created_at       │      │ created_at       │
│ updated_at       │      │ updated_at       │
└──────────────────┘      └──────────────────┘
```

### Table Definitions

#### 1. profiles
```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```
**Purpose:** Stores additional user information linked to Supabase Auth users.

#### 2. rooms
```sql
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  price_per_night DECIMAL(10,2) NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```
**Purpose:** Stores hotel room inventory with pricing, amenities, and status.

#### 3. guests
```sql
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  id_type TEXT,
  id_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```
**Purpose:** Stores guest information for bookings.

#### 4. bookings
```sql
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```
**Purpose:** Stores reservation records linking rooms and guests.

### Database Triggers

```sql
-- Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp on modifications
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Row Level Security (RLS) Policies

All tables have RLS enabled with policies that:
- Allow all authenticated users to SELECT, INSERT, UPDATE, DELETE
- Profiles table restricts UPDATE to own profile only

```sql
-- Example policy for rooms table
CREATE POLICY "Authenticated users can view rooms"
  ON public.rooms FOR SELECT TO authenticated USING (true);
```

---

## Features & Modules

### 1. Dashboard (`Dashboard.tsx`)

**Purpose:** Displays key performance indicators and recent activity.

**Features:**
- **Stats Cards:** Total Rooms, Occupancy Rate, Active Guests, Recent Revenue
- **Recent Bookings:** Last 5 bookings with guest names and amounts
- **Room Status:** Visual overview of room availability

**Key Code:**
```typescript
// Parallel data fetching for performance
const [roomsRes, bookingsRes] = await Promise.all([
  supabase.from('rooms').select('*').order('room_number'),
  supabase.from('bookings').select('*, rooms(room_number), guests(first_name, last_name)')
]);

// Calculate occupancy rate
const occupancyRate = rooms.length > 0
  ? Math.round((occupiedRooms / rooms.length) * 100)
  : 0;
```

### 2. Room Management (`RoomManagement.tsx`)

**Purpose:** CRUD operations for hotel rooms.

**Features:**
- Add new rooms with dialog form
- Edit existing room details
- Update room status (available/occupied/maintenance/cleaning)
- Display rooms in responsive grid layout
- Show amenities as badges

**Key Code:**
```typescript
// Create room
await supabase.from('rooms').insert({
  room_number: formData.room_number,
  room_type: formData.room_type,
  floor: formData.floor,
  price_per_night: formData.price_per_night,
  amenities: amenitiesArray, // TEXT[] array type
  status: formData.status,
});

// Update room status
await supabase.from('rooms').update({ status: newStatus }).eq('id', roomId);
```

### 3. Booking Form (`BookingForm.tsx`)

**Purpose:** Create new reservations with guest information.

**Features:**
- Guest information form with validation (Zod)
- Room selection dropdown (available rooms only)
- Date pickers for check-in/check-out
- Automatic price calculation (nights × rate)
- Creates guest record if new email

**Key Code:**
```typescript
// Zod validation schema
const guestSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
});

// Calculate total price
const calculateTotal = () => {
  const nights = differenceInDays(checkOut, checkIn);
  return nights > 0 ? nights * selectedRoom.price_per_night : 0;
};
```

### 4. Booking Calendar (`BookingCalendar.tsx`)

**Purpose:** Visual calendar for viewing and rescheduling bookings.

**Features:**
- Monthly view with all rooms as rows
- Drag-and-drop booking rescheduling (@dnd-kit)
- Status filtering (all/confirmed/pending/checked-in)
- Color-coded status badges
- Today's date highlighting

**Key Code:**
```typescript
// Drag and drop handler
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  const booking = active.data.current?.booking;
  const targetData = over.data.current;

  // Calculate new dates based on drag offset
  const daysDiff = Math.round((targetData.date - checkInDate) / (1000 * 60 * 60 * 24));

  await supabase.from('bookings').update({
    room_id: targetData.roomId,
    check_in: format(newCheckIn, 'yyyy-MM-dd'),
    check_out: format(newCheckOut, 'yyyy-MM-dd'),
  }).eq('id', booking.id);
};
```

### 5. Guest Directory (`GuestDirectory.tsx`)

**Purpose:** Manage guest records.

**Features:**
- List all guests in table format
- Search by name or email
- Add new guests manually
- Display guest count

---

## Authentication System

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│  Auth Page  │────▶│   Supabase  │
│  (Browser)  │     │   /auth     │     │    Auth     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           │  signInWithPassword
                           │◀───────────────────┤
                           │                    │
                    ┌──────▼──────┐       ┌─────▼─────┐
                    │   Session   │       │  JWT Token │
                    │  Created    │       │  Returned  │
                    └──────┬──────┘       └───────────┘
                           │
                    ┌──────▼──────┐
                    │ localStorage │
                    │   Storage    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Redirect   │
                    │  to /       │
                    └─────────────┘
```

### useAuth Hook Implementation

```typescript
// src/hooks/useAuth.tsx

// Context type definition
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Route Protection

```typescript
// src/pages/Index.tsx
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) return <Loader2 className="animate-spin" />;
  if (!user) return null;

  return <Dashboard />;
};
```

---

## Component Architecture

### Provider Hierarchy (App.tsx)

```typescript
const App = () => (
  <QueryClientProvider client={queryClient}>  {/* Server state */}
    <AuthProvider>                              {/* Auth context */}
      <TooltipProvider>                         {/* UI tooltips */}
        <Toaster />                             {/* Toast notifications */}
        <Sonner />                              {/* Sonner notifications */}
        <BrowserRouter>                         {/* Routing */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

### Component Hierarchy

```
App
├── QueryClientProvider (TanStack Query)
│   └── AuthProvider (Custom Auth Context)
│       └── TooltipProvider (Radix UI)
│           └── BrowserRouter (React Router)
│               └── Routes
│                   ├── Index (Protected Route)
│                   │   ├── Sidebar
│                   │   │   └── NavLink[]
│                   │   └── Main Content (switch-based)
│                   │       ├── Dashboard
│                   │       │   ├── StatsCard[]
│                   │       │   ├── RecentBookings
│                   │       │   └── RoomStatusCard
│                   │       ├── RoomManagement
│                   │       │   └── Card[] + Dialog
│                   │       ├── BookingForm
│                   │       │   └── Card + Calendar
│                   │       ├── BookingCalendar
│                   │       │   └── DndContext
│                   │       └── GuestDirectory
│                   │           └── Table + Dialog
│                   ├── Auth (Public Route)
│                   └── NotFound
```

---

## State Management

### 1. Global State (Context API)

**Authentication State:**
```typescript
// Managed by AuthProvider
{
  user: User | null,      // Current user object
  session: Session | null, // JWT session
  loading: boolean,        // Auth loading state
  signIn: Function,
  signUp: Function,
  signOut: Function
}
```

### 2. Server State (Direct Supabase Calls)

Each component fetches its own data using Supabase client:

```typescript
// Dashboard.tsx
const fetchData = async () => {
  const [roomsRes, bookingsRes] = await Promise.all([
    supabase.from('rooms').select('*'),
    supabase.from('bookings').select('*, rooms(*), guests(*)'),
  ]);
  setRooms(roomsRes.data);
  setBookings(bookingsRes.data);
};
```

### 3. Local Component State (useState)

```typescript
// BookingForm.tsx
const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
const [checkIn, setCheckIn] = useState<Date>();
const [checkOut, setCheckOut] = useState<Date>();
const [guestForm, setGuestForm] = useState({
  firstName: '',
  lastName: '',
  email: '',
});
```

---

## Key Implementation Details

### 1. Supabase Client Initialization

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
  }
});
```

### 2. Database Queries with Joins

```typescript
// Fetching bookings with related room and guest data
const { data } = await supabase
  .from('bookings')
  .select(`
    *,
    rooms(room_number, room_type),
    guests(first_name, last_name)
  `)
  .order('created_at', { ascending: false });
```

### 3. Form Validation with Zod

```typescript
import { z } from 'zod';

const guestSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
});

// Validation
const validation = guestSchema.safeParse(formData);
if (!validation.success) {
  toast({ variant: 'destructive', description: validation.error.errors[0].message });
}
```

### 4. Date Manipulation with date-fns

```typescript
import { format, differenceInDays, addMonths, startOfMonth, endOfMonth } from 'date-fns';

// Calculate nights
const nights = differenceInDays(checkOut, checkIn);

// Format date for display
format(date, 'PPP'); // "January 15, 2026"
format(date, 'yyyy-MM-dd'); // "2026-01-15"

// Get month boundaries
const days = eachDayOfInterval({
  start: startOfMonth(currentMonth),
  end: endOfMonth(currentMonth)
});
```

### 5. Drag and Drop Implementation

```typescript
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

// Draggable component
const DraggableBooking = ({ booking }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: booking.id,
    data: { booking },
  });
  return <div ref={setNodeRef} {...listeners} {...attributes}>...</div>;
};

// Droppable component
const DroppableCell = ({ roomId, date }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${roomId}-${format(date, 'yyyy-MM-dd')}`,
    data: { roomId, date },
  });
  return <div ref={setNodeRef}>...</div>;
};
```

### 6. Conditional Styling with cn()

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'primary-class' : 'secondary-class'
)} />
```

---

## How to Run

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for backend)

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd hotel-companion

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create .env file with:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# 4. Run development server
npm run dev

# 5. Open browser at http://localhost:5000
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## API Operations

### Supabase Client Operations Used

| Operation | Method | Example |
|-----------|--------|---------|
| **Select All** | `.select('*')` | `supabase.from('rooms').select('*')` |
| **Select with Join** | `.select('*, table(*)')` | `supabase.from('bookings').select('*, rooms(*)')` |
| **Filter** | `.eq('column', value)` | `.eq('status', 'available')` |
| **Insert** | `.insert({})` | `supabase.from('rooms').insert({...})` |
| **Update** | `.update({}).eq()` | `supabase.from('rooms').update({status}).eq('id', id)` |
| **Delete** | `.delete().eq()` | `supabase.from('rooms').delete().eq('id', id)` |
| **Order** | `.order('column')` | `.order('room_number')` |
| **Limit** | `.limit(n)` | `.limit(5)` |
| **Range Filter** | `.gte()`, `.lte()` | `.gte('check_out', date).lte('check_in', date)` |

---

## Viva Questions & Answers

### General Questions

**Q1: What is this project about?**
> This is a Hotel Management System that allows hotel staff to manage rooms, bookings, and guests. It features a dashboard for monitoring occupancy and revenue, room management with CRUD operations, booking creation with automatic price calculation, a drag-and-drop calendar for rescheduling, and a guest directory.

**Q2: Why did you choose React for this project?**
> React is ideal because:
> - Component-based architecture makes UI reusable
> - Virtual DOM provides efficient updates
> - Large ecosystem with libraries like React Router, React Query
> - TypeScript support for type safety
> - Easy integration with Supabase

**Q3: Why Supabase instead of building a custom backend?**
> Supabase provides:
> - Instant PostgreSQL database with RESTful API
> - Built-in authentication
> - Row Level Security for authorization
> - Real-time subscriptions (optional)
> - Faster development without building API endpoints

### Technical Questions

**Q4: Explain the authentication flow.**
> 1. User enters credentials on /auth page
> 2. `signInWithPassword()` sends request to Supabase Auth
> 3. Supabase validates and returns JWT token
> 4. Token stored in localStorage via Supabase client
> 5. `onAuthStateChange()` listener updates React context
> 6. User redirected to protected route
> 7. All subsequent API calls include JWT in headers

**Q5: What is Row Level Security (RLS)?**
> RLS is PostgreSQL's built-in security feature that:
> - Enforces access control at the database level
> - Each table has policies that define who can SELECT/INSERT/UPDATE/DELETE
> - In this project, policies require authenticated users
> - Example: `USING (auth.uid() = id)` restricts users to their own data

**Q6: How does the Context API work in useAuth?**
> - `createContext()` creates a context object
> - `AuthProvider` component wraps the app and maintains state
> - `useEffect` subscribes to Supabase auth changes
> - `useContext(AuthContext)` lets components access auth state
> - When auth state changes, all consumers re-render

**Q7: Explain the drag-and-drop implementation.**
> Using @dnd-kit library:
> - `DndContext` wraps the calendar component
> - `useDraggable` hook makes bookings draggable
> - `useDroppable` hook makes calendar cells droppable
> - `onDragEnd` handler calculates new dates based on drop position
> - Updates database and refreshes data

**Q8: How is form validation implemented?**
> Using Zod library:
> - Define schema with validation rules: `z.string().email()`
> - Call `schema.safeParse(data)` to validate
> - If validation fails, show error via toast notification
> - Prevents form submission with invalid data

**Q9: What is the difference between useState and useEffect?**
> - `useState`: Declares reactive state variables that cause re-renders when updated
> - `useEffect`: Runs side effects (data fetching, subscriptions) after render
> - useState is synchronous, useEffect is for async operations

**Q10: How do you fetch related data in Supabase?**
> Using embedded selects:
> ```typescript
> supabase.from('bookings').select(`
>   *,
>   rooms(room_number, room_type),
>   guests(first_name, last_name)
> `)
> ```
> This performs a JOIN and returns nested objects.

### Architecture Questions

**Q11: Why use Vite instead of Create React App?**
> - Vite is faster (ES modules, no bundling in dev)
> - Hot Module Replacement is instant
> - Smaller production bundles
> - Native TypeScript support
> - Better plugin ecosystem

**Q12: What are the advantages of TypeScript?**
> - Compile-time error catching
> - Better IDE autocompletion
> - Self-documenting code with types
> - Easier refactoring
> - Interfaces define data shapes

**Q13: Explain the component structure.**
> - `pages/`: Route-level components (Index, Auth)
> - `components/`: Feature components (Dashboard, RoomManagement)
> - `components/ui/`: Reusable UI primitives (Button, Card)
> - `hooks/`: Custom logic (useAuth, useToast)
> - `integrations/`: External service clients

**Q14: What is the purpose of the cn() utility?**
> `cn()` merges Tailwind classes intelligently:
> - Uses `clsx` for conditional classes
> - Uses `tailwind-merge` to resolve conflicts
> - Example: `cn('p-4 p-2')` returns `'p-2'`

### Database Questions

**Q15: Explain the database relationships.**
> - `profiles` → `auth.users`: 1:1 (extends user data)
> - `bookings` → `rooms`: Many:1 (many bookings per room)
> - `bookings` → `guests`: Many:1 (many bookings per guest)
> - Foreign keys with ON DELETE CASCADE

**Q16: What are database triggers used for?**
> Two types of triggers:
> 1. `on_auth_user_created`: Auto-creates profile when user signs up
> 2. `update_*_updated_at`: Auto-updates timestamp on record modification

**Q17: Why use UUID for primary keys?**
> - Globally unique without central coordination
> - Can be generated client-side
> - Better for distributed systems
> - Harder to guess (security)

### UI/UX Questions

**Q18: What is shadcn/ui?**
> - Collection of accessible, customizable React components
> - Built on Radix UI primitives
> - Components are copied into your project (not npm dependency)
> - Styled with Tailwind CSS
> - Full control over component code

**Q19: How is dark mode implemented?**
> - Tailwind's `class` strategy: `darkMode: 'class'`
> - CSS variables define colors in HSL format
> - `next-themes` library manages theme switching
> - Classes like `dark:bg-slate-900` apply in dark mode

**Q20: How is the app responsive?**
> Tailwind breakpoint classes:
> - `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
> - Mobile-first approach
> - Components adapt from 1 to 4 columns

---

## Future Enhancements

1. **Real-time Updates:** Supabase subscriptions for live data
2. **Pagination:** Handle large datasets efficiently
3. **Reports:** Revenue reports, occupancy analytics
4. **Role-based Access:** Admin vs Staff permissions
5. **Payment Integration:** Stripe/PayPal for online payments
6. **Email Notifications:** Booking confirmations
7. **Multi-language Support:** i18n implementation

---

## Conclusion

This Hotel Management System demonstrates proficiency in:
- Modern React development with hooks and functional components
- TypeScript for type-safe development
- Backend-as-a-Service integration with Supabase
- Responsive UI design with Tailwind CSS
- Authentication and authorization patterns
- Complex UI interactions (drag-and-drop)
- Form validation and error handling
- State management strategies

The project serves as a practical implementation of a real-world hotel management scenario, showcasing full-stack development skills.

---

**Author:** Hariom
**Project Type:** Minor Project
**Technologies:** React, TypeScript, Supabase, Tailwind CSS
