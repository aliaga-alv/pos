# Restaurant POS System - Implementation Guide

**Project**: AI-Assisted Restaurant POS
**Timeline**: 2 months (1 full-stack developer)
**Last Updated**: December 18, 2025

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [System Architecture](#system-architecture)
3. [Project Setup](#project-setup)
4. [Database Schema](#database-schema)
5. [Folder Structure](#folder-structure)
6. [Authentication Setup](#authentication-setup)
7. [Feature Implementation Order](#feature-implementation-order)
8. [API Endpoints](#api-endpoints)
9. [Component Architecture](#component-architecture)
10. [State Management](#state-management)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **date-fns** - Date utilities

### Backend
- **Next.js API Routes** - API endpoints
- **Prisma ORM** - Database client & migrations
- **Supabase** - PostgreSQL database + Authentication

### Dev Tools
- **TypeScript** (strict mode)
- **ESLint** + **Prettier** - Code quality
- **Prisma Studio** - Database GUI

### Deployment
- **Vercel** - Frontend & API hosting
- **Supabase** - Database & Auth hosting


## System Architecture

### Four Interface System

This POS system serves **both staff and customers** through 4 distinct interfaces:

#### 1. **Admin Panel** (`/admin/*`)
- **Users**: Restaurant managers and administrators
- **Access**: Requires login with ADMIN role
- **Features**:
  - Inventory management (ingredients, stock tracking)
  - Product management (menu items with recipes)
  - Category management
  - User management
  - Reports and analytics (sales, popular items, inventory costs)
  - Table configuration
- **Key Pages**:
  - `/admin/inventory` - Ingredient CRUD and stock transactions
  - `/admin/products` - Product CRUD with recipe linking
  - `/admin/categories` - Category management
  - `/admin/users` - Staff management
  - `/admin/reports` - Sales and inventory reports

#### 2. **POS Terminal** (`/pos/*`)
- **Users**: Waiters, cashiers, front desk staff
- **Access**: Requires login with WAITER or CASHIER role
- **Features**:
  - Product grid with category filtering
  - Shopping cart management
  - Counter service orders (quick takeaway)
  - Table service orders (dine-in with table assignment)
  - Payment processing (cash, card, split bills)
  - Receipt printing/generation
  - Order history and status tracking
- **Key Pages**:
  - `/pos` - Main POS interface (product grid + cart)
  - `/pos/tables` - Table management view
  - `/pos/orders` - Order history and tracking

#### 3. **Kitchen Display** (`/kitchen`)
- **Users**: Kitchen staff, chefs
- **Access**: Requires login with KITCHEN role
- **Features**:
  - Real-time order queue (PENDING → PREPARING → READY)
  - Order details with item quantities and special notes
  - Status update workflow (mark as preparing/ready)
  - Order filtering and search
  - Audio/visual notifications for new orders
- **Key Pages**:
  - `/kitchen` - Kitchen display system (order queue)

#### 4. **Customer Menu** (`/menu/*`)
- **Users**: Restaurant customers (public access)
- **Access**: No login required (public)
- **Features**:
  - Browse menu by categories
  - View product details (image, description, price)
  - QR code table assignment (scan QR at table)
  - Shopping cart and order placement
  - Order tracking (via order number or session)
  - Waiter notification system
- **Key Pages**:
  - `/menu` - Public menu browsing
  - `/menu/cart` - Customer cart and checkout
  - `/menu/[tableId]` - Table-specific menu (via QR code)
  - `/menu/order/[orderId]` - Order status tracking

### Service Type Support

The system supports **both service models**:

1. **Counter Service (Takeaway/Quick Service)**:
   - Orders created without table assignment
   - Fast checkout flow
   - Order number for pickup
   - Used via POS Terminal interface

2. **Table Service (Dine-in)**:
   - Orders assigned to specific tables
   - Table status tracking (AVAILABLE, OCCUPIED, RESERVED)
   - Order aggregation per table
   - Split bills support
   - Can be created via POS Terminal OR Customer Menu (QR ordering)

### Authentication & Authorization

| Interface | Role Required | Protected |
|-----------|---------------|-----------|
| Admin Panel | ADMIN | ✅ Yes |
| POS Terminal | WAITER, CASHIER, ADMIN | ✅ Yes |
| Kitchen Display | KITCHEN, ADMIN | ✅ Yes |
| Customer Menu | None (Public) | ❌ No |

**Middleware Protection**: Routes under `/admin/*`, `/pos/*`, and `/kitchen` are protected by authentication middleware and role-based access control.

### User Roles

```typescript
enum UserRole {
  ADMIN    // Full access to all interfaces
  WAITER   // POS Terminal access
  KITCHEN  // Kitchen Display access
  CASHIER  // POS Terminal access (payment-focused)
}
```

---
---

## Project Setup

### Step 1: Initialize Next.js Project

```bash
npx create-next-app@latest aildpos --typescript --tailwind --app --use-npm
cd aildpos
```

**Options to select:**
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ `src/` directory
- ✅ App Router
- ❌ Import alias (use default `@/*`)

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @prisma/client @supabase/supabase-js
npm install @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install date-fns lucide-react

# Dev dependencies
npm install -D prisma
npm install -D @types/node

# shadcn/ui setup
npx shadcn-ui@latest init
```

**shadcn/ui configuration:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Step 3: Install shadcn Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add avatar
```

### Step 4: Environment Setup

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Copy API keys from Settings → API
5. Update `.env.local`

### Step 6: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma`
- `.env` file (merge with `.env.local`)

---

## Database Schema

### Complete Prisma Schema

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole @default(WAITER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
}

enum UserRole {
  ADMIN
  WAITER
  KITCHEN
  CASHIER
}

// ============================================
// PRODUCT CATALOG
// ============================================

model Category {
  id        String    @id @default(uuid())
  name      String
  order     Int       @default(0)
  active    Boolean   @default(true)
  createdAt DateTime  @default(now())
  products  Product[]
}

model Product {
  id          String      @id @default(uuid())
  name        String
  description String?
  price       Decimal     @db.Decimal(10, 2)
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  imageUrl    String?
  available   Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]

  @@index([categoryId])
}

// ============================================
// TABLE MANAGEMENT
// ============================================

model Table {
  id        String      @id @default(uuid())
  number    Int         @unique
  seats     Int         @default(4)
  status    TableStatus @default(AVAILABLE)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  orders    Order[]
}

enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
}

// ============================================
// ORDER MANAGEMENT
// ============================================

model Order {
  id           String      @id @default(uuid())
  orderNumber  Int         @unique @default(autoincrement())
  type         OrderType
  tableId      String?
  table        Table?      @relation(fields: [tableId], references: [id])
  customerName String?
  status       OrderStatus @default(PENDING)
  items        OrderItem[]
  subtotal     Decimal     @db.Decimal(10, 2)
  tax          Decimal     @db.Decimal(10, 2) @default(0)
  total        Decimal     @db.Decimal(10, 2)
  notes        String?
  userId       String
  user         User        @relation(fields: [userId], references: [id])
  payment      Payment?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@index([tableId])
}

enum OrderType {
  COUNTER
  TABLE
}

enum OrderStatus {
  PENDING
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  notes     String?

  @@index([orderId])
  @@index([productId])
}

// ============================================
// PAYMENT
// ============================================

model Payment {
  id        String        @id @default(uuid())
  orderId   String        @unique
  order     Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  amount    Decimal       @db.Decimal(10, 2)
  method    PaymentMethod
  paidAt    DateTime      @default(now())
}

enum PaymentMethod {
  CASH
  CARD
  OTHER
}
```

### Database Migration Commands

```bash
# Create migration
npx prisma migrate dev --name init

# Push schema without migration (dev)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

---

## Folder Structure

```
aildpos/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                    # Seed data for categories, tables
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Staff login page
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/                 # 🔒 ADMIN ONLY
│   │   │   ├── layout.tsx         # Admin layout with nav
│   │   │   ├── page.tsx           # Admin dashboard
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx       # Ingredient list + stock tracking
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Add ingredient
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Edit ingredient
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Product list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Add product with recipe
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Edit product
│   │   │   ├── categories/
│   │   │   │   └── page.tsx       # Category management
│   │   │   ├── users/
│   │   │   │   └── page.tsx       # Staff management
│   │   │   └── reports/
│   │   │       ├── page.tsx       # Reports dashboard
│   │   │       ├── sales/
│   │   │       │   └── page.tsx
│   │   │       └── inventory/
│   │   │           └── page.tsx
│   │   │
│   │   ├── pos/                   # 🔒 WAITER, CASHIER, ADMIN
│   │   │   ├── layout.tsx         # POS layout
│   │   │   ├── page.tsx           # Main POS terminal (grid + cart)
│   │   │   ├── tables/
│   │   │   │   └── page.tsx       # Table management
│   │   │   └── orders/
│   │   │       ├── page.tsx       # Order history
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Order details
│   │   │
│   │   ├── kitchen/               # 🔒 KITCHEN, ADMIN
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx           # Kitchen display system
│   │   │
│   │   ├── menu/                  # 🌐 PUBLIC (Customer facing)
│   │   │   ├── layout.tsx         # Public menu layout
│   │   │   ├── page.tsx           # Browse menu
│   │   │   ├── cart/
│   │   │   │   └── page.tsx       # Customer cart + checkout
│   │   │   ├── [tableId]/
│   │   │   │   └── page.tsx       # Table-specific menu (QR)
│   │   │   └── order/
│   │   │       └── [orderId]/
│   │   │           └── page.tsx   # Order tracking
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...]/route.ts
│   │   │   ├── ingredients/       # Inventory API
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET, PUT, DELETE
│   │   │   ├── stock/
│   │   │   │   └── route.ts       # Stock transactions
│   │   │   ├── products/
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET, PUT, DELETE
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts       # GET, POST (create order)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts   # GET, PUT, DELETE
│   │   │   │       └── status/
│   │   │   │           └── route.ts # PATCH (update status)
│   │   │   ├── tables/
│   │   │   │   ├── route.ts       # GET tables
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # Update table status
│   │   │   ├── payments/
│   │   │   │   └── route.ts       # POST payment
│   │   │   ├── users/
│   │   │   │   ├── route.ts       # GET, POST (staff)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET, PUT, DELETE
│   │   │   └── reports/
│   │   │       ├── sales/
│   │   │       │   └── route.ts   # Daily sales
│   │   │       └── inventory/
│   │   │           └── route.ts   # Stock levels
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing/redirect to /pos
│   │   └── providers.tsx          # React Query + Toaster
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── admin/
│   │   │   ├── inventory/
│   │   │   │   ├── ingredient-form.tsx
│   │   │   │   ├── ingredient-table.tsx
│   │   │   │   ├── stock-adjustment-dialog.tsx
│   │   │   │   └── stock-history.tsx
│   │   │   ├── products/
│   │   │   │   ├── product-form.tsx
│   │   │   │   ├── product-table.tsx
│   │   │   │   └── recipe-builder.tsx  # Link ingredients
│   │   │   ├── category-form.tsx
│   │   │   └── user-form.tsx
│   │   ├── pos/
│   │   │   ├── product-grid.tsx
│   │   │   ├── cart.tsx
│   │   │   ├── cart-item.tsx
│   │   │   ├── order-type-selector.tsx  # Counter vs Table
│   │   │   ├── table-selector.tsx
│   │   │   ├── checkout-dialog.tsx
│   │   │   └── payment-form.tsx
│   │   ├── kitchen/
│   │   │   ├── order-queue.tsx
│   │   │   ├── order-card.tsx
│   │   │   └── status-update-buttons.tsx
│   │   ├── menu/                  # Customer-facing components
│   │   │   ├── menu-grid.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── category-filter.tsx
│   │   │   ├── customer-cart.tsx
│   │   │   └── order-tracker.tsx
│   │   ├── tables/
│   │   │   ├── table-grid.tsx
│   │   │   └── table-card.tsx
│   │   ├── orders/
│   │   │   ├── order-list.tsx
│   │   │   └── order-status-badge.tsx
│   │   └── layout/
│   │       ├── navbar.tsx
│   │       ├── sidebar.tsx
│   │       └── mobile-nav.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts              # Prisma singleton
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser client
│   │   │   └── server.ts          # Server client
│   │   ├── utils.ts               # cn() utility
│   │   ├── validations/
│   │   │   ├── product.ts         # Zod schemas
│   │   │   ├── ingredient.ts
│   │   │   ├── order.ts
│   │   │   └── user.ts
│   │   └── constants.ts           # TAX_RATE, enums
│   │
│   ├── hooks/
│   │   ├── use-cart.ts            # Zustand cart hook
│   │   ├── use-products.ts        # TanStack Query
│   │   ├── use-ingredients.ts
│   │   ├── use-orders.ts
│   │   ├── use-tables.ts
│   │   └── use-current-user.ts
│   │
│   ├── store/
│   │   └── cart-store.ts          # Zustand cart store
│   │
│   ├── types/
│   │   └── index.ts               # Type exports from Prisma
│   │
│   └── middleware.ts              # Auth + role-based routing
│
├── public/
│   ├── images/
│   └── qr/                        # QR codes for tables
│
├── .env.local
├── .gitignore
├── package.json
├── prisma.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── components.json
├── IMPLEMENTATION.md
└── README.md
```

---

## Authentication Setup

### 1. Supabase Auth Configuration

File: `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

File: `src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

### 2. User Management & Auth Sync

**Creating Users:**
- Users are created in both Supabase Auth AND the database
- Password is required for new users
- User metadata (name, role) is stored in Supabase Auth user_metadata
- Role is also stored in database for efficient queries

**Login Flow:**
- User authenticates with Supabase
- On successful login, role is synced from database to auth metadata via `/api/auth/sync-role`
- This ensures middleware has access to role for permission checks

**User Updates:**
- Password changes sync to Supabase Auth
- If user doesn't exist in Supabase Auth, they're created during update
- Role/name changes update both database and auth metadata

### 3. Role-Based Access Control (RBAC)

File: `src/lib/permissions.ts`

```typescript
export type UserRole = 'ADMIN' | 'WAITER' | 'KITCHEN' | 'CASHIER'

export const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['/pos', '/kitchen', '/admin'],
  WAITER: ['/pos'],
  KITCHEN: ['/kitchen'],
  CASHIER: ['/pos'],
}

export const apiPermissions: Record<string, UserRole[]> = {
  // Admin-only APIs
  '/api/users': ['ADMIN'],
  '/api/ingredients': ['ADMIN'],
  '/api/stock': ['ADMIN'],
  '/api/products': ['ADMIN'], // Write operations
  '/api/categories': ['ADMIN'], // Write operations
  '/api/tables': ['ADMIN'], // Write operations
  
  // Multi-role APIs
  '/api/orders': ['ADMIN', 'WAITER', 'CASHIER', 'KITCHEN'],
  '/api/payments': ['ADMIN', 'WAITER', 'CASHIER'],
  '/api/auth/me': ['ADMIN', 'WAITER', 'CASHIER', 'KITCHEN'],
}

// Special rules: GET requests for products/categories/tables accessible by WAITER/CASHIER
```

### 4. Middleware for Route Protection

File: `src/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rolePermissions, canAccessApi, type UserRole } from '@/lib/permissions'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Use getUser() instead of getSession() for security
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = request.nextUrl.pathname.startsWith('/menu')
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  // Protect API routes with authentication and role-based access
  if (isApiRoute) {
    const isPublicApi = 
      request.nextUrl.pathname === '/api/auth/logout' ||
      request.nextUrl.pathname === '/api/auth/sync-role' ||
      request.nextUrl.pathname.startsWith('/api/auth/callback')
    
    if (!user && !isPublicApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user && !isPublicApi) {
      const userRole = user.user_metadata?.role as UserRole | undefined
      const apiPath = request.nextUrl.pathname
      const method = request.method

      if (!canAccessApi(userRole, apiPath, method)) {
        return NextResponse.json(
          { error: 'Forbidden - insufficient permissions' },
          { status: 403 }
        )
      }
    }
  }

  // Redirect to login if not authenticated
  if (!user && !isLoginPage && !isPublicRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users from login page
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/pos', request.url))
  }

  // Role-based page access control
  if (user && !isApiRoute && !isLoginPage && !isPublicRoute) {
    const userRole = user.user_metadata?.role as UserRole | undefined
    const pathname = request.nextUrl.pathname

    const allowedPaths = rolePermissions[userRole || 'WAITER'] || []
    const hasAccess = allowedPaths.some(path => pathname.startsWith(path))

    if (!hasAccess) {
      const defaultPages: Record<string, string> = {
        ADMIN: '/admin',
        WAITER: '/pos',
        KITCHEN: '/kitchen',
        CASHIER: '/pos',
      }
      
      const defaultPage = defaultPages[userRole || ''] || '/pos'
      return NextResponse.redirect(new URL(defaultPage, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Key Features:**
- Uses `getUser()` for secure authentication (validates against Supabase server)
- Protects both page routes and API routes
- Returns 401 for unauthenticated API requests
- Returns 403 for insufficient permissions
- Redirects users to appropriate default pages based on role
- Special handling for public routes (/menu) and auth endpoints

### 5. Navigation Components

**NavLinks Component** (`src/components/layout/nav-links.tsx`)
- Client component that fetches user role
- Conditionally renders navigation links based on permissions
- Used in POS, Kitchen, and Order History pages

**AdminNavLinks Component** (`src/components/layout/admin-nav-links.tsx`)
- Renders admin panel navigation
- Shows "Go to POS" or "Go to Kitchen" buttons based on role
- Server component receiving role as prop

**UserMenu Component** (`src/components/layout/user-menu.tsx`)
- Displays user avatar with initials
- Shows name, email, and role in dropdown
- Logout button that clears session and redirects to login

---

## Feature Implementation Order

### Phase 1: Foundation & Authentication (Week 1)
✅ **Completed**:
- [x] Initialize Next.js project with TypeScript, Tailwind
- [x] Install all dependencies (Prisma, Supabase, TanStack Query, Zustand, shadcn/ui)
- [x] Setup Supabase project and configure environment variables
- [x] Design and create database schema (10 tables + 7 enums)
- [x] Create all tables via Supabase MCP
- [x] Generate Prisma Client
- [x] Setup Prisma singleton
- [x] Implement Supabase auth integration
- [x] Build login page with Supabase Auth
- [x] Setup middleware for route protection
- [x] Create admin user (admin@restaurant.com)
- [x] Setup providers (React Query + Toaster)
- [x] Create basic folder structure

### Phase 2: Inventory Management (Week 2) - ✅ **COMPLETED**

**2.1: Ingredient Management** ✅
- [x] Create ingredient validation schema (Zod)
- [x] Build Ingredients API routes:
  - [x] `GET /api/ingredients` - List all ingredients with pagination
  - [x] `POST /api/ingredients` - Create ingredient
  - [x] `GET /api/ingredients/[id]` - Get single ingredient
  - [x] `PUT /api/ingredients/[id]` - Update ingredient
  - [x] `DELETE /api/ingredients/[id]` - Delete ingredient (check dependencies)
- [x] Create TanStack Query hooks:
  - [x] `useIngredients` - Fetch ingredients
  - [x] `useCreateIngredient` - Create mutation
  - [x] `useUpdateIngredient` - Update mutation
  - [x] `useDeleteIngredient` - Delete mutation
- [x] Build Admin UI pages:
  - [x] `/admin/inventory` - Ingredient list with table, search, filter
  - [x] `/admin/inventory/new` - Add ingredient form
  - [x] `/admin/inventory/[id]` - Edit ingredient form

**2.2: Stock Tracking** ✅
- [x] Create stock transaction validation schema
- [x] Build Stock API routes:
  - [x] `POST /api/stock` - Create stock transaction (IN/OUT/ADJUSTMENT)
  - [x] `GET /api/stock` - Get transaction history for ingredient
- [x] Build Stock UI components:
  - [x] Stock adjustment dialog (increase/decrease quantity)
  - [x] Stock history table with transaction log
  - [x] Low stock warnings (when quantity < minStock)
- [x] Add real-time stock display to ingredient list

### Phase 3: Product Management (Week 3) - ✅ **COMPLETED**

**3.1: Category Management** ✅
- [x] Create category validation schema
- [x] Build Categories API:
  - [x] `GET /api/categories` - List categories
  - [x] `POST /api/categories` - Create category
  - [x] `PUT /api/categories/[id]` - Update category
  - [x] `DELETE /api/categories/[id]` - Delete (check products)
- [x] Build Category UI:
  - [x] `/admin/categories` - Category management page
  - [x] Category form dialog
  - [x] Drag-and-drop reordering (manual order field)

**3.2: Product Management** ✅
- [x] Create product validation schema with recipe support
- [x] Build Products API:
  - [x] `GET /api/products` - List products with ingredients
  - [x] `POST /api/products` - Create product with ProductIngredient relations
  - [x] `GET /api/products/[id]` - Get product with full recipe
  - [x] `PUT /api/products/[id]` - Update product and recipe
  - [x] `DELETE /api/products/[id]` - Delete product
- [x] Build Product UI:
  - [x] `/admin/products` - Product list with category filter
  - [x] `/admin/products/new` - Product creation form
  - [x] `/admin/products/[id]` - Product edit form
  - [x] Recipe builder component (select ingredients + quantities)
  - [x] Automatic cost calculation from ingredients (can be calculated)
  - [x] Image upload support (URL field)

### Phase 4: POS Terminal & Orders (Week 4-5) - ✅ **COMPLETED**

**4.1: Product Display & Cart** ✅
- [x] Build POS product grid with category tabs
- [x] Implement cart functionality (Zustand store)
- [x] Build cart UI component with item list
- [x] Add quantity controls and item removal
- [x] Display cart subtotal, tax, and total
- [x] Implement product search/filter
- [x] Add special notes per item

**4.2: Order Creation** ✅
- [x] Build order type selector (Counter vs Table)
- [x] Create table selector dialog for dine-in orders
- [x] Build order validation schema
- [x] Create Orders API:
  - [x] `POST /api/orders` - Create order with items
  - [x] `GET /api/orders` - List orders with filters
  - [x] `GET /api/orders/[id]` - Get order details
  - [x] `PATCH /api/orders/[id]` - Update order status
- [x] Build checkout dialog with order confirmation
- [x] Implement order submission flow
- [x] Auto-update table status (AVAILABLE → OCCUPIED)

**4.3: Payment Processing** ✅
- [x] Build payment form (cash/card selection)
- [x] Create Payment API:
  - [x] `POST /api/payments` - Record payment and complete order
- [x] Implement cash change calculation
- [x] Handle immediate payment for counter orders
- [x] Deferred payment for dine-in orders
- [x] Clear cart after successful order
- [x] Auto-release table when order completed

**4.4: Order History** ✅ **COMPLETED**
- [x] Build `/pos/orders` - Order history page with filters
- [x] Add filters (status, type, search by order#/customer/table)
- [x] Display order details with items and totals
- [x] Implement order search
- [x] Process payments for unpaid READY orders
- [x] Payment dialog with cash change calculation
- [x] Highlight READY orders with green border

### Phase 5: Kitchen Display System (Week 5) - ✅ **COMPLETED**

**5.1: Kitchen Queue** ✅
- [x] Build `/kitchen` page - Order queue display
- [x] Fetch orders with status PENDING/PREPARING
- [x] Display order cards with:
  - [x] Order number and table
  - [x] Items with quantities
  - [x] Special notes
  - [x] Order timestamp (time ago)
  - [x] Status badge
- [x] Tab-based filtering (Pending/Preparing/All)
- [x] Responsive grid layout

**5.2: Status Management** ✅
- [x] Build status update buttons (Mark as Preparing/Ready)
- [x] Implement optimistic updates with TanStack Query
- [x] Auto-refresh via query invalidation
- [x] Order filtering by status tabs
- [x] Visual status indicators (color-coded cards)

**5.3: Real-time Updates (Optional Enhancement)** ⏳
- [ ] Integrate Supabase Realtime subscriptions
- [ ] Listen to Order table changes
- [ ] Update UI automatically on new orders
- [ ] Add audio/visual notifications

### Phase 6: Customer Menu (Public QR Ordering) (Week 6) - ✅ **COMPLETED**

**6.1: Public Menu Display** ✅
- [x] Build `/menu` - Public menu browsing page
- [x] Display products grouped by categories
- [x] Show product images, descriptions, prices
- [x] Implement category filtering
- [x] Product cards with add to cart functionality

**6.2: QR Code Table Assignment** ✅
- [x] Generate QR codes for each table (static assets)
- [x] Build `/menu/[tableId]` - Table-specific menu
- [x] Display table number on page
- [x] Validate table exists and is available
- [x] QR code generation scripts (JS & TypeScript)
- [x] Comprehensive QR documentation

**6.3: Customer Cart & Ordering** ✅
- [x] Implement customer cart (separate from POS cart with localStorage)
- [x] Build `/menu/cart` - Customer cart page
- [x] Create public order submission:
  - [x] `POST /api/public/orders` - Accept public orders (no auth)
  - [x] Associate order with table
  - [x] Price validation from database
- [x] Display order confirmation with order number
- [x] Notify kitchen (automatic via order creation)

**6.4: Order Tracking** ✅
- [x] Build `/menu/order/[orderId]` - Order status page
- [x] Display order items and total
- [x] Show order status (Pending → Preparing → Ready → Completed)
- [x] Progress visualization with steps
- [x] Auto-refresh every 10 seconds

### Phase 7: Admin Panel & Reports (Week 7) - ✅ **COMPLETED**

**7.1: User Management** ✅ **COMPLETED**
- [x] Build `/admin/users` - Staff management page
- [x] Create Users API:
  - [x] `GET /api/users` - List staff with order counts
  - [x] `POST /api/users` - Create staff user with Supabase Auth integration
  - [x] `GET /api/users/[id]` - Get single user
  - [x] `PATCH /api/users/[id]` - Update user role/status/password
  - [x] `DELETE /api/users/[id]` - Deactivate user
- [x] Build user form with role selection
- [x] Password management (required on create, optional on update)
- [x] User metadata sync between database and Supabase Auth
- [x] Role-based badges (ADMIN, WAITER, KITCHEN, CASHIER)
- [x] Active/Inactive status toggle

**7.2: Table Management** ✅ **COMPLETED** (Already existed)
- [x] `/admin/tables` - Table configuration page
- [x] Table CRUD operations
- [x] Table status display

**7.3: Reports & Analytics** ✅ **COMPLETED**
- [x] Build `/admin/reports` - Reports dashboard with tabs
- [x] Create Reports API:
  - [x] `GET /api/reports/sales` - Daily/weekly/monthly sales
  - [x] `GET /api/reports/inventory` - Stock levels and costs
  - [x] `GET /api/reports/popular` - Best-selling products
- [x] Display sales breakdown by day
- [x] Show inventory cost analysis
- [x] Export data to CSV functionality
- [x] Popular items ranking with revenue
- [x] Low stock warnings
- [x] Period filtering (daily/weekly/monthly)

**7.4: Admin Dashboard** ✅ **COMPLETED**
- [x] Build `/admin` - Dashboard overview page
- [x] Display key metrics:
  - [x] Total sales today with average order value
  - [x] Active orders count
  - [x] Low stock alerts with product details
  - [x] Popular items with revenue
  - [x] Week revenue summary
  - [x] Monthly revenue summary
- [x] Recent orders list with status
- [x] Quick action links to main sections
- [x] Real-time data via TanStack Query

### Phase 8: Polish & Deployment (Week 8) ✅

**8.1: UI/UX Improvements** ✅
- [x] Add loading states to all data fetching
- [x] Implement error boundaries
- [x] Add toast notifications for actions (Sonner already integrated)
- [x] Improve mobile responsiveness (responsive design throughout)
- [x] Add keyboard shortcuts for POS
- [x] Implement print styles for receipts

**8.2: Testing**
- [ ] Test all user flows end-to-end
- [ ] Test role-based access control
- [ ] Test payment processing
- [ ] Test inventory deduction (optional feature)
- [ ] Test QR ordering flow
- [ ] Cross-browser testing

**8.3: Deployment** ✅
- [x] Setup Vercel project configuration (vercel.json)
- [x] Configure environment variables (DEPLOYMENT.md)
- [ ] Deploy to production
- [ ] Test production database connection
- [ ] Generate production QR codes

**8.4: Documentation** ✅
- [x] Write user guide for staff (README.md)
- [x] Document API endpoints (in code comments)
- [x] Create setup instructions for restaurant (DEPLOYMENT.md)
- [x] Document QR code generation process (public/qr/README.md)

---
- [ ] Logout functionality

**Phase 1.3: Base UI**
- [ ] Root layout with providers
- [ ] Dashboard layout with sidebar
- [ ] Navbar component
- [ ] Responsive navigation
- [ ] Basic theme setup

**Phase 1.4: Product Management**
- [ ] Category CRUD API
- [ ] Product CRUD API
- [ ] Product list page
- [ ] Product form (create/edit)
- [ ] Category management
- [ ] Image upload (optional)

### Week 3-4: Core POS

**Phase 2.1: Shopping Cart**
- [ ] Cart Zustand store
- [ ] Add to cart logic
- [ ] Cart component UI
- [ ] Update quantities
- [ ] Remove items
- [ ] Clear cart

**Phase 2.2: POS Interface**
- [ ] Product grid display
- [ ] Category filter
- [ ] Search products
- [ ] Order type selector (counter/table)
- [ ] Customer name input (counter)
- [ ] Table selector (table service)
- [ ] Add item notes

**Phase 2.3: Order Creation**
- [ ] Create order API
- [ ] Calculate subtotal/tax/total
- [ ] Submit order from cart
- [ ] Order confirmation
- [ ] Print receipt template
- [ ] Browser print integration

### Week 5-6: Table & Order Management

**Phase 3.1: Table Management**
- [ ] Table CRUD API
- [ ] Table grid view
- [ ] Table status updates
- [ ] Assign order to table
- [ ] View table's active orders
- [ ] Transfer orders between tables
- [ ] Close table

**Phase 3.2: Order Status**
- [ ] Update order status API
- [ ] Order status workflow
- [ ] Order history page
- [ ] Search/filter orders
- [ ] Order details view
- [ ] Cancel/void orders

**Phase 3.3: Kitchen Display**
- [ ] Kitchen view page
- [ ] Order queue display
- [ ] Filter by status
- [ ] Update status buttons
- [ ] Real-time updates (polling)
- [ ] Order timer display

### Week 7-8: Payments & Reports

**Phase 4.1: Payment Processing**
- [ ] Payment API
- [ ] Payment dialog
- [ ] Record cash payment
- [ ] Record card payment
- [ ] Split bill (basic)
- [ ] Payment confirmation
- [ ] Receipt generation

**Phase 4.2: Reporting**
- [ ] Daily sales report API
- [ ] Popular items API
- [ ] Sales by category
- [ ] Payment method breakdown
- [ ] Date range filter
- [ ] Export to CSV (optional)

**Phase 4.3: User Management**
- [ ] User CRUD API
- [ ] User list page
- [ ] Create user
- [ ] Role assignment
- [ ] Deactivate user
- [ ] User permissions

**Phase 4.4: Polish**
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Form validation
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

## API Endpoints

### Products

```
GET    /api/products              # List all products
POST   /api/products              # Create product
GET    /api/products/[id]         # Get product
PUT    /api/products/[id]         # Update product
DELETE /api/products/[id]         # Delete product
```

### Categories

```
GET    /api/categories            # List all categories
POST   /api/categories            # Create category
PUT    /api/categories/[id]       # Update category
DELETE /api/categories/[id]       # Delete category
```

### Orders

```
GET    /api/orders                # List orders (with filters)
POST   /api/orders                # Create order
GET    /api/orders/[id]           # Get order details
PUT    /api/orders/[id]           # Update order
DELETE /api/orders/[id]           # Cancel order
PATCH  /api/orders/[id]/status    # Update order status
```

### Tables

```
GET    /api/tables                # List all tables
POST   /api/tables                # Create table
PUT    /api/tables/[id]           # Update table
DELETE /api/tables/[id]           # Delete table
PATCH  /api/tables/[id]/status    # Update table status
```

### Payments

```
POST   /api/payments              # Record payment
GET    /api/payments/[orderId]    # Get payment for order
```

### Reports

```
GET    /api/reports/daily         # Daily sales report
GET    /api/reports/popular       # Popular items
GET    /api/reports/by-category   # Sales by category
```

### Users

```
GET    /api/users                 # List users
POST   /api/users                 # Create user
PUT    /api/users/[id]            # Update user
DELETE /api/users/[id]            # Delete user
```

---

## Component Architecture

### Key Components

#### POS Components

**ProductGrid**
- Displays products in grid layout
- Filters by category
- Search functionality
- Add to cart button

**Cart**
- Shows cart items
- Update quantities
- Remove items
- Shows totals
- Checkout button

**CheckoutDialog**
- Order type selection
- Customer/table input
- Order notes
- Submit order

#### Kitchen Components

**OrderQueue**
- Lists pending orders
- Filters by status
- Sort by time

**OrderCard**
- Shows order details
- Items list
- Status update buttons
- Timer display

#### Table Components

**TableGrid**
- Shows all tables
- Color-coded by status
- Click to view/assign

**TableCard**
- Table number
- Status
- Current orders
- Action buttons

---

## State Management

### Server State (TanStack Query)

File: `src/hooks/use-products.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      return res.json()
    },
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
### Remaining Features

**Phase 6: Customer Menu (QR Ordering)** - High Priority
- Public menu at `/menu` and `/menu/[tableId]`
- Browse products by category without authentication
- Customer cart (separate from POS cart)
- Place orders directly from table via QR code
- Order status tracking for customers
- QR code generation for tables

**Phase 7.3: Reports & Analytics** - Business Intelligence
- Daily/weekly/monthly sales reports
- Revenue breakdowns by product and category
- Inventory cost analysis
- Popular items and trends
- Staff performance metrics
- Export data to CSV

**Phase 7.4: Admin Dashboard** - Overview Page
- Today's sales summary with charts
- Active orders count by status
- Low stock alerts and notifications
- Recent activity feed
- Quick stats cards (revenue, orders, items sold)
- Links to common actions

**Phase 8: Polish & Optimization**
- Comprehensive error boundaries
- Enhanced loading states and skeletons
- Performance optimization (code splitting, lazy loading)
- Mobile responsiveness improvements
- PWA support for offline POS
- Keyboard shortcuts for faster POS operations
- Receipt printing customization
- Deployment and production optimization

### Current System Status

**✅ Fully Functional:**
- Authentication with Supabase
- Role-based access control (RBAC) for pages and APIs
- User management with password support
- Inventory management (ingredients, stock tracking)
- Product and category management
- POS terminal (cart, checkout, orders)
- Kitchen display system with status updates
- Order history and payment processing
- Table management
- Navigation components with role-based visibility

**🔧 Technical Highlights:**
- Next.js 15 with App Router and TypeScript
- Prisma ORM with PostgreSQL (Supabase)
- TanStack Query v5 for server state
- Zustand for client cart state
- Comprehensive middleware protection
- Supabase Auth integration with admin API
- Real-time role sync between database and auth

---

## Development Guidelines

1. **Review this document** before starting new features
2. **Test thoroughly** after each implementation
3. **Follow the folder structure** for consistency
4. **Use TypeScript strictly** - leverage type safety
5. **Implement error handling** in all API routes and mutations
6. **Query naming**: Use consistent naming for React Query keys
7. **Role permissions**: Always check permissions in middleware and components
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

### Client State (Zustand)

File: `src/store/cart-store.ts`

```typescript
import { create } from 'zustand'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.productId === item.productId)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
    }
    return { items: [...state.items, item] }
  }),
  
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.productId !== productId)
  })),
  
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.productId === productId ? { ...i, quantity } : i
    )
  })),
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  },
}))
```

---

## Testing Strategy

### Manual Testing Checklist

**Product Management:**
- [ ] Create product
- [ ] Edit product
- [ ] Delete product
- [ ] Upload image
- [ ] Toggle availability

**POS Flow:**
- [ ] Add items to cart
- [ ] Update quantities
- [ ] Remove items
- [ ] Create counter order
- [ ] Create table order
- [ ] Print receipt

**Table Management:**
- [ ] View all tables
- [ ] Assign order to table
- [ ] View table orders
- [ ] Transfer order
- [ ] Close table

**Kitchen:**
- [ ] View pending orders
- [ ] Update order status
- [ ] Filter orders

**Payment:**
- [ ] Record cash payment
- [ ] Record card payment
- [ ] Complete order

**Reports:**
- [ ] View daily sales
- [ ] View popular items
- [ ] Filter by date

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables (Vercel)

Add to Vercel project settings:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Database Migration (Production)

```bash
# Run migrations on production database
npx prisma migrate deploy
```

---

## Next Steps

1. **Review this document**
2. **Setup Supabase project**
3. **Run project initialization commands**
4. **Start with Week 1 tasks**
5. **Build incrementally, test frequently**

---

## Notes for AI Agent Collaboration

**When working with AI assistants:**

1. **Be specific**: Reference exact file paths and line numbers
2. **One feature at a time**: Complete each phase before moving on
3. **Test after each change**: Run the app and verify functionality
4. **Use TypeScript strictly**: Leverage type safety
5. **Follow the folder structure**: Keep components organized
6. **Query naming**: Use consistent naming for React Query keys
7. **Error handling**: Always handle errors in API routes and mutations

**Common patterns to follow:**

- Server Components for data fetching
- Client Components for interactivity
- API routes return JSON with proper status codes
- Use Zod for validation on both client and server
- Prisma queries in API routes, not components
- TanStack Query for all server data
- Zustand only for UI state

---

**End of Implementation Guide**
