# VoltAssist - Electric Scooter Support Platform

A comprehensive React-based customer support platform for electric scooter users with AI-powered chat assistance, order tracking, and intelligent FAQ matching.

## 🚀 Features

### ✅ **Authentication System**
- OTP-based mobile authentication
- Session management with mobile number linking
- Secure user profiles storage

### 💬 **Intelligent Chat Assistant**
- Natural language FAQ matching with 40+ pre-loaded questions
- Context-aware responses for electric scooter queries
- File upload support (images, PDFs up to 10MB)
- Chat history preservation
- "Not helpful" feedback system with human support escalation

### 📦 **Order Management**
- Order tracking with real-time status updates
- Natural language order inquiries ("Where is my order?", "When will it deliver?")
- Mock order data with realistic Indian market context
- Mobile-responsive order cards with detailed tracking

### 🆘 **Support System**
- Escalated support request form
- Context preservation (original question + chatbot response)
- Backend storage for support team review
- User feedback collection

### 📱 **Mobile-First Design**
- Fully responsive across all screen sizes
- Touch-friendly interfaces
- Mobile-optimized navigation
- Progressive web app ready

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Icons**: Lucide React
- **State Management**: React hooks with context
- **File Storage**: Supabase Storage with public access

## 📋 Prerequisites

- Node.js 18+ installed
- Git for version control
- Modern web browser

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open the development server URL in your browser.

### 4. Build for Production
```bash
npm run build
```

## 🧪 Testing the Application

### Login System
1. Navigate to `/login`
2. Enter any 10-digit mobile number (e.g., 9503466896)
3. Use any 6-digit number as OTP (e.g., 123456)

### Chat Functionality
1. Click "Start Chat" from homepage
2. Ask electric scooter questions like:
   - "How long does charging take?"
   - "What's the range of electric scooters?"
   - "Do I need a license?"
3. Upload images or PDFs to test file functionality
4. Click "Not helpful?" to test support escalation

### Order Tracking
1. Click "My Orders" from homepage
2. View mock orders for Ather 450X and TVS iQube
3. Ask natural language questions:
   - "Where is my Ather?"
   - "When will my order deliver?"
   - "What's the status of my TVS?"

## 📊 Database Schema

### Tables Created:
- `profiles` - User mobile numbers and metadata
- `chat_conversations` - User chat sessions
- `chat_messages` - All chat interactions with file support
- `faqs` - Knowledge base with 40+ electric scooter FAQs
- `support_requests` - Escalated support tickets with full context

### Storage Buckets:
- `chat-files` - Public bucket for uploaded files

## 🌐 Deployment Options

### Option 1: Lovable (Recommended)
Simply open [Lovable](https://lovable.dev/projects/b01df4a5-6653-475f-abe0-630e0337e23a) and click on Share -> Publish.

### Option 2: Vercel
```bash
npm i -g vercel
vercel --prod
```

### Option 3: Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🔧 Configuration

### FAQ Categories Covered:
1. Battery and Charging (4 FAQs)
2. Range and Performance (4 FAQs)  
3. Safety and Handling (4 FAQs)
4. Mobile App and Connectivity (4 FAQs)
5. Maintenance and Repairs (4 FAQs)
6. Delivery and Orders (4 FAQs)
7. Warranty and Returns (4 FAQs)
8. Licensing and Legal Requirements (4 FAQs)
9. Software Updates and Notifications (4 FAQs)
10. Troubleshooting Common Issues (5 FAQs)

### Indian Market Context:
- ARAI certification references
- FAME II scheme information
- RTO procedures and state regulations
- Monsoon season considerations
- Local charging networks (ChargeZone, Tata Power, Ather Grid)
- Indian pricing in ₹ (Rupees)

## 🐛 Troubleshooting

### Common Issues:

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Authentication Issues**
- Try different 6-digit OTP
- Check browser storage is enabled
- Clear browser cache

**Chat Not Responding**
- Check console for errors
- Try refreshing the page
- Verify FAQ data loaded correctly

## 📱 Mobile App Development

This project is ready for mobile app development using Capacitor. For detailed instructions, refer to the [Lovable Mobile Development Guide](https://lovable.dev/blogs/TODO).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For technical support or questions:
- Create an issue in this repository
- Contact: support@voltassist.com
- Phone: 1800-123-4567

---

**Live Demo**: [https://b01df4a5-6653-475f-abe0-630e0337e23a.lovableproject.com](https://b01df4a5-6653-475f-abe0-630e0337e23a.lovableproject.com)
