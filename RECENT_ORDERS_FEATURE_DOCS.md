# Recent Orders Feature Documentation

## Overview

The Recent Orders section on the dashboard displays the latest orders with enhanced functionality and a detailed view drawer.

---

## Features

### 1. **Enhanced Orders Table** 📊

**Improvements:**
- ✅ Clean, modern design with better spacing
- ✅ Status badges with icons and color coding
- ✅ Customer information display (name + username)
- ✅ Event name with truncation and tooltip
- ✅ Payment method display
- ✅ Discount amount indication (when applicable)
- ✅ Free ticket quantity display (when applicable)
- ✅ Formatted amounts with currency symbol
- ✅ Better date/time formatting
- ✅ Row hover effects
- ✅ Clickable rows to open details
- ✅ View details action button

**Columns:**
1. Order ID (with creation date)
2. Event (with tooltip for long names)
3. Customer (name + username)
4. Quantity
5. Amount (with discount shown)
6. Payment Method
7. Status (color-coded badge with icon)
8. Paid At (date + time)
9. Action (view details button)

---

### 2. **Payment Status Indicators** 🎨

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| **Paid** | Green (success) | ✓ CheckCircle | Payment completed successfully |
| **Pending** | Yellow (warning) | ⏱ Clock | Payment is being processed |
| **Failed** | Red (error) | ✗ XCircle | Payment failed |
| **Refunded** | Blue (primary) | ↻ RotateCcw | Payment was refunded |
| **Cancelled** | Gray (neutral) | ⊘ Ban | Order was cancelled |

---

### 3. **Order Details Drawer** 📝

**Opens from the right side** when clicking:
- The "View Details" action button
- Anywhere on the order row

**Sections Displayed:**

#### 💳 Payment Information
- Order ID (UUID)
- Payment Reference
- Payment Status (badge)
- Payment Method

#### 💰 Amount Details
- Quantity (number of tickets)
- Subtotal
- Discount (if applicable)
- Free Tickets (if applicable)
- **Total Amount** (bold)

#### 👤 Customer Information
- Avatar (with fallback initials)
- Full Name
- Username
- Email
- Phone

#### 🎫 Event & Ticket Details
- Event name
- Ticket type
- Event location (city + address)
- Ticket code

#### 📅 Timeline
- Created timestamp
- Paid timestamp (if paid)
- Refunded timestamp (if refunded)
- Last updated timestamp

---

## File Structure

```
features/home/recent-orders/
├── index.tsx                      # Main component with drawer state
├── orders-table.tsx               # Enhanced table with new schema
├── order-details-drawer.tsx       # NEW: Drawer component
├── table-actions/
│   ├── index.tsx                  # Updated: Simple view button
│   └── view-details.tsx           # (can be removed - no longer used)
├── table-header/                  # (existing - not modified)
│   └── ...
services/orders/
├── index.ts                       # NEW: Service exports
└── get-order-details.ts           # NEW: Fetch order details API
```

---

## Breaking Changes Fixed ✅

### Old Order Type (Breaking)
```typescript
type Order = {
  id: string;
  username: string;          // ❌ Removed
  user_name: string;         // ❌ Removed
  event_name: string;        // ❌ Removed
  status: OrderStatus;       // ❌ Changed to payment_status
  // ...
};
```

### New Order Type (Current)
```typescript
type Order = {
  id: string;
  user_ticket_id: string;    // ✅ New
  amount: number;
  discount_amount: number | null;  // ✅ New
  free_ticket_quantity: number | null;  // ✅ New
  quantity: number;          // ✅ New
  payment_method?: string | null;
  payment_status: PaymentStatus;  // ✅ Changed (5 statuses)
  payment_reference?: string | null;
  paid_at?: string | null;
  refunded_at?: string | null;  // ✅ New
  created_at: string;
  updated_at: string;
  user_ticket?: UserTicket;  // ✅ New relationship
};
```

### Key Changes:
1. **Removed direct fields**: `username`, `user_name`, `event_name`
2. **Now uses relationships**: Access via `order.user_ticket?.user?.name` and `order.user_ticket?.ticket?.event?.title`
3. **Added**: `discount_amount`, `free_ticket_quantity`, `refunded_at`
4. **Renamed**: `status` → `payment_status`
5. **Expanded statuses**: Added `refunded` and `cancelled` options

---

## Usage

### Opening Order Details

**From Orders Table:**
```typescript
<OrdersTable 
  data={orders}
  isEmpty={false}
  onViewDetails={(orderId) => {
    // Opens drawer with order details
  }}
/>
```

**In Main Component:**
```typescript
const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
const [drawerOpen, setDrawerOpen] = useState(false);

const handleViewDetails = (orderId: string) => {
  setSelectedOrderId(orderId);
  setDrawerOpen(true);
};

<OrderDetailsDrawer
  orderId={selectedOrderId}
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
/>
```

---

## API Integration

### Endpoints Used

1. **Dashboard Recent Orders** (existing)
   ```
   GET /v1/dashboard/data
   ```
   Returns `recent_orders` array in dashboard data.

2. **Order Details** (NEW)
   ```
   GET /v1/orders/:id/details
   ```
   Returns complete order with all relationships.

See `BACKEND_ORDER_DETAILS_API_DOCS.md` for full API specification.

---

## Data Relationships

```
Order
  └─ user_ticket
      ├─ user (Customer)
      │   ├─ name
      │   ├─ username
      │   ├─ email
      │   └─ avatar_url
      └─ ticket (Ticket Type)
          ├─ name
          ├─ price
          └─ event (Event)
              ├─ title
              ├─ address
              └─ city
```

---

## Styling & UX

### Colors Used

**Status Colors:**
- Success (Green): `bg-success-100 text-success-500 border-success-200`
- Warning (Yellow): `bg-warning-100 text-warning-500 border-warning-200`
- Error (Red): `bg-error-100 text-error-500 border-error-200`
- Primary (Blue): `bg-primary-100 text-primary-500 border-primary-200`
- Neutral (Gray): `bg-neutral-200 text-neutral-600 border-neutral-300`

**Interactive Elements:**
- Hover on rows: `hover:bg-neutral-50 transition-colors`
- Clickable cursor: `cursor-pointer`
- Action buttons: Icon-only with tooltip

### Loading States
- Skeleton loaders for drawer content
- Smooth transitions when opening/closing drawer
- 300ms delay before clearing order ID (allows animation to complete)

---

## Responsive Design

- **Desktop**: Full table with all columns visible
- **Tablet**: Columns may wrap, drawer stays full-width
- **Mobile**: Table scrolls horizontally, drawer fills screen

---

## Performance Optimizations

1. **Lazy Loading**: Order details only fetched when drawer opens
2. **Query Caching**: `@tanstack/react-query` caches order details
3. **Memoization**: `TableActions` uses `React.memo`
4. **Conditional Rendering**: Relationships checked before accessing nested data

---

## Error Handling

**Drawer Errors:**
- Shows error icon and message if order details fail to load
- Graceful fallback for missing relationships
- Null checks for all optional fields

**Table Display:**
- Shows "Unknown Event" if event data missing
- Shows "Guest" if user data missing
- Shows "N/A" for null payment methods
- Shows "-" for missing paid date

---

## Testing Scenarios

### Test Case 1: View Order Details
1. Click on any order row
2. **Expected**: Drawer opens from right with full order details

### Test Case 2: Payment Status Display
1. Check orders with different statuses
2. **Expected**: Each status shows correct icon and color

### Test Case 3: Discount Display
1. Find order with discount_amount > 0
2. **Expected**: Discount shown in green below subtotal

### Test Case 4: Missing Data
1. Order with no payment_method
2. **Expected**: Shows "N/A" in payment method column

### Test Case 5: Close Drawer
1. Open drawer, then click outside or close button
2. **Expected**: Drawer closes smoothly

---

## Future Enhancements (Optional)

1. **Export Orders**: Download as CSV/PDF
2. **Quick Filters**: Filter by status in recent orders
3. **Refund Action**: Direct refund from drawer
4. **Print Receipt**: Generate printable receipt
5. **Order Timeline**: Visual timeline of order events
6. **Email Customer**: Direct email link from drawer
7. **Related Orders**: Show other orders from same customer

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Troubleshooting

### Drawer Not Opening
- Check `selectedOrderId` is not null
- Verify `drawerOpen` state is true
- Check console for API errors

### Missing Data in Drawer
- Verify backend returns all relationships
- Check API response includes nested objects
- Ensure frontend types match backend schema

### Status Colors Not Showing
- Check `payment_status` value matches enum
- Verify Tailwind classes are not purged
- Check `getStatusConfig` function logic


