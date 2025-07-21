import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle, ArrowLeft } from "lucide-react";
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
  
  // Extract mentioned product names and order numbers
  const mentionedProducts = orders.filter(order => 
    queryLower.includes(order.productName.toLowerCase()) ||
    queryLower.includes(order.model.toLowerCase()) ||
    queryLower.includes(order.orderNumber.toLowerCase()) ||
    order.productName.toLowerCase().split(' ').some(word => queryLower.includes(word)) ||
    order.model.toLowerCase().split(' ').some(word => queryLower.includes(word))
  );
  
  // If specific product is mentioned, focus on that order
  const targetOrder = mentionedProducts.length > 0 ? mentionedProducts[0] : 
                     orders.find(order => order.status !== "delivered") || orders[0];
  
  if (!targetOrder) {
    return "I couldn't find any orders associated with your account. Please contact support if you believe this is an error.";
  }
  
  // Location and tracking queries
  if (queryLower.includes("where") || queryLower.includes("location") || queryLower.includes("reached")) {
    if (targetOrder.status === "delivered") {
      return `Your ${targetOrder.productName} ${targetOrder.model} (Order #${targetOrder.orderNumber}) was successfully delivered on ${new Date(targetOrder.trackingSteps.find(step => step.status === "Delivered")?.timestamp || targetOrder.estimatedDelivery).toLocaleDateString('en-IN')}.`;
    } else if (targetOrder.status === "shipped" || targetOrder.status === "out_for_delivery") {
      return `Your ${targetOrder.productName} ${targetOrder.model} in ${targetOrder.color} (Order #${targetOrder.orderNumber}) is currently ${targetOrder.currentLocation ? `at ${targetOrder.currentLocation}` : 'in transit'}. Expected delivery: ${new Date(targetOrder.estimatedDelivery).toLocaleDateString('en-IN')}.`;
    } else {
      return `Your ${targetOrder.productName} ${targetOrder.model} (Order #${targetOrder.orderNumber}) is currently in our ${targetOrder.status === 'processing' ? 'preparation facility' : 'warehouse'} being ${targetOrder.status === 'processing' ? 'prepared for dispatch' : 'processed'}. Expected delivery: ${new Date(targetOrder.estimatedDelivery).toLocaleDateString('en-IN')}.`;
    }
  }
  
  // Delivery time queries
  if (queryLower.includes("when") || queryLower.includes("deliver") || queryLower.includes("arrive") || queryLower.includes("expect")) {
    if (targetOrder.status === "delivered") {
      return `Your ${targetOrder.productName} ${targetOrder.model} was delivered on ${new Date(targetOrder.trackingSteps.find(step => step.status === "Delivered")?.timestamp || targetOrder.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    } else {
      const daysLeft = Math.ceil((new Date(targetOrder.estimatedDelivery).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return `Your ${targetOrder.productName} ${targetOrder.model} in ${targetOrder.color} is expected to be delivered on ${new Date(targetOrder.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${daysLeft > 0 ? ` (in ${daysLeft} day${daysLeft > 1 ? 's' : ''})` : ''}.`;
    }
  }
  
  // Status and tracking queries
  if (queryLower.includes("status") || queryLower.includes("track") || queryLower.includes("progress")) {
    const completedSteps = targetOrder.trackingSteps.filter(step => step.completed).length;
    const currentStep = targetOrder.trackingSteps.find(step => !step.completed);
    const nextStep = currentStep ? currentStep.status : "Delivered";
    
    if (targetOrder.status === "delivered") {
      return `Your ${targetOrder.productName} ${targetOrder.model} (Order #${targetOrder.orderNumber}) has been successfully delivered! All ${targetOrder.trackingSteps.length} tracking steps completed.`;
    } else {
      return `Your ${targetOrder.productName} ${targetOrder.model} (Order #${targetOrder.orderNumber}) is currently "${targetOrder.status.replace('_', ' ')}" (Step ${completedSteps}/${targetOrder.trackingSteps.length}). Next step: "${nextStep}". ${targetOrder.currentLocation ? `Currently at: ${targetOrder.currentLocation}.` : ''}`;
    }
  }
  
  // Product-specific information queries
  if (queryLower.includes("color") || queryLower.includes("model") || queryLower.includes("variant")) {
    return `Your order includes the ${targetOrder.productName} ${targetOrder.model} in ${targetOrder.color} color (Order #${targetOrder.orderNumber}). Purchase price: ₹${targetOrder.price.toLocaleString('en-IN')}. Current status: ${targetOrder.status.replace('_', ' ')}.`;
  }
  
  // Price and payment queries
  if (queryLower.includes("price") || queryLower.includes("cost") || queryLower.includes("amount") || queryLower.includes("paid")) {
    return `Your ${targetOrder.productName} ${targetOrder.model} (Order #${targetOrder.orderNumber}) was purchased for ₹${targetOrder.price.toLocaleString('en-IN')}. Order placed on ${new Date(targetOrder.orderDate).toLocaleDateString('en-IN')}.`;
  }
  
  // Cancellation and modification queries
  if (queryLower.includes("cancel") || queryLower.includes("modify") || queryLower.includes("change")) {
    if (targetOrder.status === "delivered") {
      return `Your ${targetOrder.productName} has already been delivered. For returns or exchanges, please contact customer support at 1800-123-4567 within 7 days of delivery.`;
    } else if (targetOrder.status === "shipped" || targetOrder.status === "out_for_delivery") {
      return `Your ${targetOrder.productName} ${targetOrder.model} (Order #${targetOrder.orderNumber}) is already shipped and cannot be cancelled. For delivery changes, contact support at 1800-123-4567.`;
    } else {
      return `Your ${targetOrder.productName} ${targetOrder.model} (Order #${targetOrder.orderNumber}) may still be cancellable as it's in "${targetOrder.status}" status. Please contact customer support immediately at 1800-123-4567.`;
    }
  }
  
  // Warranty and service queries
  if (queryLower.includes("warranty") || queryLower.includes("service") || queryLower.includes("support")) {
    return `Your ${targetOrder.productName} ${targetOrder.model} comes with manufacturer warranty. For service support, contact customer care at 1800-123-4567 or visit your nearest authorized service center.`;
  }
  
  // Default response with order summary
  if (orders.length === 1) {
    return `You have one order: ${targetOrder.productName} ${targetOrder.model} in ${targetOrder.color} (Order #${targetOrder.orderNumber}), currently "${targetOrder.status.replace('_', ' ')}". Ask me "where is my order?", "when will it deliver?", or "what's the status?" for specific details.`;
  } else {
    const activeOrders = orders.filter(order => order.status !== "delivered");
    return `You have ${orders.length} total orders${activeOrders.length > 0 ? `, ${activeOrders.length} active` : ', all delivered'}. Ask me about specific products like "Where is my ${targetOrder.productName}?" or "When will my Ather deliver?" for detailed information.`;
  }
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
              <h1 className="text-xl md:text-2xl font-bold">My Orders</h1>
              <p className="text-primary-foreground/80 text-sm md:text-base">
                <Phone className="w-4 h-4 inline mr-1" />
                {userMobile}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/")} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2 md:hidden" />
              <span className="hidden md:inline">Back to Home</span>
              <span className="md:hidden">Back</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* AI Query Section */}
        <Card className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg md:text-xl font-semibold">Ask about your delivery</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder='Ask me "Where is my order?" or "When will it be delivered?"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleQuery} className="w-full sm:w-auto">Ask</Button>
            </div>
            
            {response && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">{response}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Orders List */}
        <div className="grid gap-6 lg:grid-cols-2">
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