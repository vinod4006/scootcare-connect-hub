import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  model: string;
  color: string;
  price: number;
  orderDate: string;
  estimatedDelivery: string;
  status: "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered";
  currentLocation?: string;
  trackingSteps: {
    status: string;
    description: string;
    timestamp: string;
    completed: boolean;
  }[];
}

// Mock order data
const generateMockOrders = (mobile: string): Order[] => [
  {
    id: "1",
    orderNumber: "EV2024001",
    productName: "Ather 450X",
    model: "450X Gen 3",
    color: "Cosmic Black",
    price: 145000,
    orderDate: "2024-07-15T10:30:00Z",
    estimatedDelivery: "2024-07-25T00:00:00Z",
    status: "shipped",
    currentLocation: "Mumbai Distribution Center",
    trackingSteps: [
      { status: "Order Confirmed", description: "Your order has been confirmed", timestamp: "2024-07-15T10:30:00Z", completed: true },
      { status: "Processing", description: "Your scooter is being prepared", timestamp: "2024-07-16T09:00:00Z", completed: true },
      { status: "Quality Check", description: "Pre-delivery inspection completed", timestamp: "2024-07-18T14:00:00Z", completed: true },
      { status: "Shipped", description: "Your scooter has been dispatched", timestamp: "2024-07-20T08:00:00Z", completed: true },
      { status: "Out for Delivery", description: "Your scooter is out for delivery", timestamp: "", completed: false },
      { status: "Delivered", description: "Delivery completed", timestamp: "", completed: false }
    ]
  },
  {
    id: "2",
    orderNumber: "EV2024002", 
    productName: "TVS iQube Electric",
    model: "iQube ST",
    color: "Titanium Grey",
    price: 112000,
    orderDate: "2024-06-20T14:15:00Z",
    estimatedDelivery: "2024-06-30T00:00:00Z",
    status: "delivered",
    trackingSteps: [
      { status: "Order Confirmed", description: "Your order has been confirmed", timestamp: "2024-06-20T14:15:00Z", completed: true },
      { status: "Processing", description: "Your scooter is being prepared", timestamp: "2024-06-21T10:00:00Z", completed: true },
      { status: "Quality Check", description: "Pre-delivery inspection completed", timestamp: "2024-06-23T11:30:00Z", completed: true },
      { status: "Shipped", description: "Your scooter has been dispatched", timestamp: "2024-06-25T09:00:00Z", completed: true },
      { status: "Out for Delivery", description: "Your scooter is out for delivery", timestamp: "2024-06-29T08:00:00Z", completed: true },
      { status: "Delivered", description: "Delivery completed", timestamp: "2024-06-29T16:30:00Z", completed: true }
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
    case "processing":
      return <Clock className="w-4 h-4" />;
    case "shipped":
    case "out_for_delivery":
      return <Truck className="w-4 h-4" />;
    case "delivered":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-blue-500";
    case "processing":
      return "bg-yellow-500";
    case "shipped":
      return "bg-purple-500";
    case "out_for_delivery":
      return "bg-orange-500";
    case "delivered":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const getDeliveryResponse = (query: string, orders: Order[]): string => {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes("where") && (queryLower.includes("order") || queryLower.includes("delivery"))) {
    const activeOrder = orders.find(order => order.status !== "delivered");
    if (activeOrder) {
      if (activeOrder.status === "shipped" || activeOrder.status === "out_for_delivery") {
        return `Your ${activeOrder.productName} (Order #${activeOrder.orderNumber}) is currently ${activeOrder.currentLocation ? `at ${activeOrder.currentLocation}` : 'in transit'}. Expected delivery: ${new Date(activeOrder.estimatedDelivery).toLocaleDateString('en-IN')}.`;
      } else {
        return `Your ${activeOrder.productName} (Order #${activeOrder.orderNumber}) is currently being ${activeOrder.status === 'processing' ? 'prepared' : 'processed'}. Expected delivery: ${new Date(activeOrder.estimatedDelivery).toLocaleDateString('en-IN')}.`;
      }
    }
    return "All your orders have been delivered successfully!";
  }
  
  if (queryLower.includes("when") && (queryLower.includes("deliver") || queryLower.includes("arrive"))) {
    const activeOrder = orders.find(order => order.status !== "delivered");
    if (activeOrder) {
      return `Your ${activeOrder.productName} is expected to be delivered on ${new Date(activeOrder.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }
    return "All your orders have been delivered successfully!";
  }
  
  if (queryLower.includes("status") || queryLower.includes("track")) {
    const activeOrder = orders.find(order => order.status !== "delivered");
    if (activeOrder) {
      const currentStep = activeOrder.trackingSteps.find(step => !step.completed);
      const nextStep = currentStep ? currentStep.status : "Delivered";
      return `Your order #${activeOrder.orderNumber} is currently "${activeOrder.status.replace('_', ' ')}" and the next step is "${nextStep}".`;
    }
    return "All your orders have been delivered successfully!";
  }
  
  if (queryLower.includes("cancel") || queryLower.includes("modify")) {
    return "For order cancellations or modifications, please contact our customer support at 1800-123-4567 or visit your nearest showroom.";
  }
  
  return `I can help you track your electric scooter orders. Try asking "Where is my order?", "When will it be delivered?", or "What's my order status?". For other inquiries, contact support at 1800-123-4567.`;
};

const Orders = () => {
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const mobile = sessionStorage.getItem("userMobile");
    if (!mobile) {
      navigate("/login");
      return;
    }
    setUserMobile(mobile);
    setOrders(generateMockOrders(mobile));
  }, [navigate]);

  const handleQuery = () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a question",
        description: "Ask me about your order delivery status",
        variant: "destructive",
      });
      return;
    }
    
    const aiResponse = getDeliveryResponse(query, orders);
    setResponse(aiResponse);
    setQuery("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQuery();
    }
  };

  if (!userMobile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Orders</h1>
              <p className="text-primary-foreground/80">
                <Phone className="w-4 h-4 inline mr-1" />
                {userMobile}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* AI Query Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Ask about your delivery</h2>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder='Ask me "Where is my order?" or "When will it be delivered?"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleQuery}>Ask</Button>
            </div>
            
            {response && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">{response}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Orders List */}
        <div className="grid gap-6 md:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="space-y-4">
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{order.productName}</h3>
                    <p className="text-sm text-muted-foreground">{order.model} • {order.color}</p>
                    <p className="text-sm text-muted-foreground">Order #{order.orderNumber}</p>
                  </div>
                  <Badge variant="secondary" className={`${getStatusColor(order.status)} text-white`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </Badge>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Date</p>
                    <p>{new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expected Delivery</p>
                    <p>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p>₹{order.price.toLocaleString('en-IN')}</p>
                  </div>
                  {order.currentLocation && (
                    <div>
                      <p className="text-muted-foreground">Current Location</p>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.currentLocation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Track Order Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                >
                  {selectedOrder?.id === order.id ? "Hide Tracking" : "Track Order"}
                </Button>

                {/* Tracking Details */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-4 space-y-3">
                    {order.trackingSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.status}
                          </p>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.timestamp && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(step.timestamp).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">You haven't placed any electric scooter orders yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Orders;