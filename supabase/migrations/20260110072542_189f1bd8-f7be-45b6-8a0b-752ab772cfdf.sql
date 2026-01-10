-- Create profiles table for staff users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  price_per_night DECIMAL(10,2) NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rooms" ON public.rooms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete rooms" ON public.rooms FOR DELETE TO authenticated USING (true);

-- Create guests table
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

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view guests" ON public.guests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert guests" ON public.guests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update guests" ON public.guests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete guests" ON public.guests FOR DELETE TO authenticated USING (true);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view bookings" ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update bookings" ON public.bookings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete bookings" ON public.bookings FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample rooms
INSERT INTO public.rooms (room_number, room_type, floor, price_per_night, max_occupancy, amenities, status, description) VALUES
('101', 'Standard Room', 1, 120.00, 2, ARRAY['WiFi', 'TV', 'AC'], 'available', 'Cozy standard room with city view'),
('102', 'Standard Room', 1, 120.00, 2, ARRAY['WiFi', 'TV', 'AC'], 'available', 'Comfortable standard room'),
('103', 'Deluxe Suite', 1, 220.00, 3, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'], 'available', 'Spacious deluxe suite with balcony'),
('201', 'Premium Suite', 2, 350.00, 4, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Ocean View'], 'available', 'Luxurious suite with ocean view'),
('202', 'Standard Room', 2, 130.00, 2, ARRAY['WiFi', 'TV', 'AC'], 'maintenance', 'Standard room under renovation'),
('203', 'Family Suite', 2, 280.00, 5, ARRAY['WiFi', 'TV', 'AC', 'Kitchen', 'Living Area'], 'available', 'Perfect for families'),
('301', 'Deluxe Suite', 3, 240.00, 3, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'City View'], 'available', 'Elegant suite with panoramic views'),
('302', 'Presidential Suite', 3, 500.00, 4, ARRAY['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Private Terrace', 'Butler Service'], 'available', 'Ultimate luxury experience');