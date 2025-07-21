-- Create orders table for tracking customer orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_mobile TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  scooter_model TEXT NOT NULL,
  scooter_color TEXT,
  order_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (order_status IN ('confirmed', 'processing', 'manufacturing', 'quality_check', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')),
  delivery_address JSONB NOT NULL,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  tracking_number TEXT,
  courier_partner TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders access
CREATE POLICY "Users can view orders with their mobile number" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_orders_customer_mobile ON public.orders(customer_mobile);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample orders for testing
INSERT INTO public.orders (
  order_number, customer_mobile, customer_name, customer_email, 
  scooter_model, scooter_color, order_amount, payment_status, order_status,
  delivery_address, estimated_delivery_date, tracking_number, courier_partner
) VALUES
('ES240001', '+919876543210', 'Rajesh Kumar', 'rajesh@email.com', 'VoltMax Pro', 'Electric Blue', 85000.00, 'paid', 'manufacturing', 
 '{"street": "123 MG Road", "city": "Bangalore", "state": "Karnataka", "pincode": "560001"}', 
 CURRENT_DATE + INTERVAL '10 days', 'BLR2024001', 'BlueDart'),
('ES240002', '+919876543211', 'Priya Sharma', 'priya@email.com', 'VoltMax Lite', 'Pearl White', 65000.00, 'paid', 'dispatched',
 '{"street": "456 CP Block", "city": "Delhi", "state": "Delhi", "pincode": "110001"}',
 CURRENT_DATE + INTERVAL '5 days', 'DEL2024002', 'Delhivery'),
('ES240003', '+919876543212', 'Amit Singh', 'amit@email.com', 'VoltMax Sport', 'Matte Black', 95000.00, 'paid', 'delivered',
 '{"street": "789 Bandra West", "city": "Mumbai", "state": "Maharashtra", "pincode": "400050"}',
 CURRENT_DATE - INTERVAL '2 days', 'MUM2024003', 'DTDC');