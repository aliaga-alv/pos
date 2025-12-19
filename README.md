# AI-Assisted Restaurant POS System

A comprehensive, modern Point of Sale system for restaurants featuring POS Terminal, Kitchen Display System, Admin Panel, and Customer Menu with QR ordering capabilities.

## ✨ Features

### 🎯 Multi-Role System
- **Admin Panel**: Complete restaurant management dashboard
- **POS Terminal**: Fast order entry for waitstaff and cashiers
- **Kitchen Display**: Real-time order tracking for kitchen staff
- **Customer Menu**: Self-service ordering via QR codes

### 📦 Core Functionality
- **Inventory Management**: Track ingredients, stock levels, and suppliers
- **Product Management**: Organize menu items with categories and pricing
- **Order Processing**: Create, track, and fulfill orders in real-time
- **Table Management**: Manage dine-in tables and reservations
- **User Management**: Role-based access control (Admin, Waiter, Kitchen, Cashier)
- **Reports & Analytics**: Sales reports, popular items, inventory insights
- **QR Ordering**: Customer self-service ordering system

### 🎨 Technical Highlights
- **Modern Stack**: Next.js 15, TypeScript, Prisma, PostgreSQL
- **Real-time Updates**: TanStack Query with optimistic updates
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication**: Supabase Auth with role-based permissions
- **State Management**: Zustand for cart and client state
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Print Support**: Thermal receipt printing support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Supabase account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aildpos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```
   
   See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

4. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Seed the database** (optional)
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create an admin user**: Sign up at `/login`
2. **Set admin role**: Update the user role in your database:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```
3. **Configure your restaurant**:
   - Add categories at `/admin/categories`
   - Create products at `/admin/products`
   - Set up tables at `/admin/tables`
   - Add staff at `/admin/users`

## 📱 User Roles & Access

| Role | Access |
|------|--------|
| **ADMIN** | Full system access, reports, user management |
| **WAITER** | POS terminal, order creation, table management |
| **CASHIER** | POS terminal, payment processing |
| **KITCHEN** | Kitchen display system, order status updates |
| **Customer** | Public menu, QR ordering (no login required) |

## 🗺️ System Routes

### Public Routes
- `/` - Landing page with system overview
- `/login` - Authentication page
- `/menu` - Customer menu (browse products)
- `/menu/[tableId]` - Table-specific menu
- `/menu/cart` - Customer cart and checkout
- `/menu/order/[orderId]` - Order tracking

### Protected Routes
- `/admin` - Admin dashboard
  - `/admin/categories` - Category management
  - `/admin/products` - Product management
  - `/admin/inventory` - Inventory management
  - `/admin/tables` - Table management
  - `/admin/users` - User management
  - `/admin/reports` - Sales and inventory reports
- `/pos` - POS terminal for order entry
- `/kitchen` - Kitchen display system

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **State**: Zustand (client), TanStack Query (server)
- **Forms**: React Hook Form + Zod validation

### Backend
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Validation**: Zod schemas

### DevOps
- **Hosting**: Vercel (recommended)
- **Database**: Supabase Postgres
- **Version Control**: Git

## 📊 Database Schema

Key entities:
- **User** - Staff accounts with role-based access
- **Category** - Product categories
- **Product** - Menu items
- **Ingredient** - Inventory items
- **ProductIngredient** - Recipe relationships
- **Order** - Customer orders
- **OrderItem** - Individual order items
- **Payment** - Payment transactions
- **Table** - Restaurant tables
- **Stock** - Inventory tracking

See [prisma/schema.prisma](prisma/schema.prisma) for the complete schema.

## 🎯 Key Features Explained

### POS Terminal
Fast order entry interface for staff:
- Quick product search and categorization
- Table assignment for dine-in orders
- Real-time cart updates
- Multiple payment methods (Cash, Card, UPI)
- Order notes and customization

### Kitchen Display System
Optimized for kitchen workflow:
- Color-coded order status (pending, preparing, ready)
- Order age tracking
- One-tap status updates
- Real-time order synchronization

### Customer QR Ordering
Self-service ordering system:
- Scan QR code at table
- Browse menu with categories
- Add items to cart
- Submit order to kitchen
- Track order status in real-time

### Admin Panel
Complete restaurant management:
- Dashboard with key metrics
- User and role management
- Product and category management
- Inventory tracking with low stock alerts
- Sales reports and analytics

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run generate-qr  # Generate QR codes for tables
```

### Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── admin/          # Admin panel routes
│   ├── pos/            # POS terminal routes
│   ├── kitchen/        # Kitchen display routes
│   ├── menu/           # Customer menu routes
│   └── api/            # API routes
├── components/         # React components
│   ├── admin/         # Admin-specific components
│   ├── pos/           # POS components
│   ├── kitchen/       # Kitchen components
│   ├── menu/          # Customer menu components
│   └── ui/            # Shared UI components (shadcn)
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
│   ├── supabase/     # Supabase client setup
│   └── validations/  # Zod schemas
├── store/             # Zustand stores
└── types/             # TypeScript type definitions
```

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:
1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy!

## 📝 Implementation Status

✅ **Completed Features**:
- Foundation & Authentication
- Inventory Management System
- Product Management System
- POS Terminal & Order Processing
- Kitchen Display System
- Customer Menu (QR Ordering)
- User Management
- Table Management
- Reports & Analytics
- Admin Dashboard
- Error Boundaries & Loading States
- Print Receipt Functionality

📋 **Nice to Have** (Optional):
- Real-time updates with WebSockets
- Push notifications for kitchen
- Multi-language support
- Dark mode
- Mobile apps (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📧 Support

For support and questions:
- Open an issue on GitHub
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) for setup help
- Review [IMPLEMENTATION.md](IMPLEMENTATION.md) for architecture details

---

Built with ❤️ using Next.js and modern web technologies

