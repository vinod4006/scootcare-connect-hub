import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  order_number: string;
  customer_mobile: string;
  customer_name: string;
  customer_email?: string;
  scooter_model: string;
  scooter_color?: string;
  order_amount: number;
  payment_status: string;
  order_status: string;
  delivery_address: any;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  tracking_number?: string;
  courier_partner?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export const useOrderTracking = () => {
  const [loading, setLoading] = useState(false);

  const findOrderByMobile = async (mobileNumber: string): Promise<Order[]> => {
    setLoading(true);
    try {
      // Clean mobile number (remove spaces, hyphens, +91 prefix)
      const cleanMobile = mobileNumber.replace(/[\s\-\+]/g, '');
      const searchPatterns = [
        cleanMobile,
        `+91${cleanMobile}`,
        `91${cleanMobile}`,
        cleanMobile.startsWith('91') ? cleanMobile.substring(2) : cleanMobile
      ];

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(searchPatterns.map(pattern => `customer_mobile.like.%${pattern}%`).join(','))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Order lookup error:', error);
        throw new Error(`Failed to find orders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error finding orders by mobile:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const findOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.toUpperCase())
        .maybeSingle();

      if (error) {
        console.error('Order lookup error:', error);
        throw new Error(`Failed to find order: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error finding order by number:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusMessage = (order: Order): string => {
    const statusMessages = {
      confirmed: `✅ **Order Confirmed** - Your ${order.scooter_model} in ${order.scooter_color} has been confirmed and is being prepared for manufacturing.`,
      processing: `⚙️ **Processing** - Your order is being processed. Manufacturing will begin shortly.`,
      manufacturing: `🏭 **Manufacturing** - Your scooter is currently being manufactured. Expected completion in 2-3 days.`,
      quality_check: `🔍 **Quality Check** - Your scooter has completed manufacturing and is undergoing final quality checks.`,
      dispatched: `📦 **Dispatched** - Great news! Your scooter has been dispatched and is on its way to you.`,
      in_transit: `🚛 **In Transit** - Your scooter is currently in transit and will reach you soon.`,
      out_for_delivery: `🏠 **Out for Delivery** - Your scooter is out for delivery and will be delivered today!`,
      delivered: `✅ **Delivered** - Your scooter has been successfully delivered. Enjoy your ride!`,
      cancelled: `❌ **Cancelled** - This order has been cancelled. Refund will be processed according to our policy.`
    };

    let message = statusMessages[order.order_status] || `📋 **Status**: ${order.order_status}`;
    
    message += `\n\n**Order Details:**`;
    message += `\n• Order Number: ${order.order_number}`;
    message += `\n• Model: ${order.scooter_model}`;
    if (order.scooter_color) message += `\n• Color: ${order.scooter_color}`;
    message += `\n• Amount: ₹${order.order_amount.toLocaleString('en-IN')}`;
    message += `\n• Payment: ${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}`;
    
    if (order.estimated_delivery_date) {
      const deliveryDate = new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      message += `\n• Expected Delivery: ${deliveryDate}`;
    }

    if (order.tracking_number && order.courier_partner) {
      message += `\n\n**Shipping Details:**`;
      message += `\n• Tracking Number: ${order.tracking_number}`;
      message += `\n• Courier Partner: ${order.courier_partner}`;
    }

    if (order.delivery_address) {
      message += `\n\n**Delivery Address:**`;
      message += `\n${order.delivery_address.street}`;
      message += `\n${order.delivery_address.city}, ${order.delivery_address.state}`;
      message += `\n${order.delivery_address.pincode}`;
    }

    // Add helpful next steps based on status
    if (order.order_status === 'dispatched' || order.order_status === 'in_transit') {
      message += `\n\n💡 **Track your shipment**: Use tracking number ${order.tracking_number} on ${order.courier_partner} website`;
    } else if (order.order_status === 'out_for_delivery') {
      message += `\n\n💡 **Be ready**: Keep your ID and order confirmation ready for delivery`;
    } else if (order.order_status === 'delivered') {
      message += `\n\n💡 **Next steps**: Download our app for service bookings and support`;
    }

    message += `\n\n*Need help? Call us at 1800-123-4567*`;

    return message;
  };

  const formatMultipleOrdersMessage = (orders: Order[]): string => {
    if (orders.length === 0) {
      return `❌ **No orders found** with this mobile number. Please check:
      
• Make sure you're using the same mobile number used during ordering
• Try providing your order number (format: ES240XXX)
• Contact us at 1800-123-4567 if you need assistance

*You can also ask me "track order ES240XXX" with your specific order number.*`;
    }

    if (orders.length === 1) {
      return getOrderStatusMessage(orders[0]);
    }

    let message = `📋 **Multiple orders found** for this mobile number:\n\n`;
    
    orders.forEach((order, index) => {
      message += `**${index + 1}. Order ${order.order_number}**\n`;
      message += `• ${order.scooter_model} (${order.scooter_color})\n`;
      message += `• Status: ${order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}\n`;
      message += `• Amount: ₹${order.order_amount.toLocaleString('en-IN')}\n`;
      if (order.estimated_delivery_date) {
        const deliveryDate = new Date(order.estimated_delivery_date).toLocaleDateString('en-IN');
        message += `• Expected Delivery: ${deliveryDate}\n`;
      }
      message += `\n`;
    });

    message += `*Ask me "track order [ORDER_NUMBER]" for detailed status of any specific order.*`;
    
    return message;
  };

  return {
    loading,
    findOrderByMobile,
    findOrderByNumber,
    getOrderStatusMessage,
    formatMultipleOrdersMessage
  };
};