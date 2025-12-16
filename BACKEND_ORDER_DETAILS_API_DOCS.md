# Backend API Documentation - Order Details

## Endpoint: Get Order Details

**URL:** `/v1/orders/:id/details`  
**Method:** `GET`  
**Authentication:** Required (Bearer Token)

### Description

Fetches complete details of a specific order, including all related information (user ticket, event, customer, ticket type).

---

### Path Parameters

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `id`      | string | Yes      | Unique order ID (UUID) |

---

### Response Format

```json
{
	"success": true,
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"user_ticket_id": "660e8400-e29b-41d4-a716-446655440001",
		"amount": 150,
		"discount_amount": 15,
		"free_ticket_quantity": null,
		"quantity": 2,
		"payment_method": "Credit Card",
		"payment_status": "paid",
		"payment_reference": "PAY-ABC123XYZ",
		"paid_at": "2025-01-15T10:32:00Z",
		"refunded_at": null,
		"created_at": "2025-01-15T10:30:00Z",
		"updated_at": "2025-01-15T10:32:00Z",
		"user_ticket": {
			"id": "660e8400-e29b-41d4-a716-446655440001",
			"user_id": "770e8400-e29b-41d4-a716-446655440002",
			"ticket_id": "880e8400-e29b-41d4-a716-446655440003",
			"ticket_promo_id": null,
			"is_used": false,
			"used_at": null,
			"qr_code": "QR-ABC123DEF456",
			"ticket_code": "TKT-XYZ789",
			"ticket_status": "paid",
			"created_at": "2025-01-15T10:30:00Z",
			"updated_at": "2025-01-15T10:32:00Z",
			"user": {
				"id": "770e8400-e29b-41d4-a716-446655440002",
				"name": "John Doe",
				"username": "johndoe",
				"email": "john@example.com",
				"phone": "+1234567890",
				"avatar_url": "https://example.com/avatars/john.jpg",
				"is_verified": true,
				"is_admin": false,
				"account_status": "active",
				"status_changed_at": "2025-01-01T00:00:00Z",
				"deleted_at": null,
				"created_at": "2024-06-01T00:00:00Z",
				"updated_at": "2025-01-15T10:32:00Z"
			},
			"ticket": {
				"id": "880e8400-e29b-41d4-a716-446655440003",
				"event_id": "990e8400-e29b-41d4-a716-446655440004",
				"name": "VIP Pass",
				"description": "Full access to VIP areas",
				"price": 75,
				"currency_id": "usd",
				"ticket_promo_id": null,
				"total_quantity": 100,
				"sold_quantity": 45,
				"perks": ["VIP Lounge Access", "Free Drink", "Meet & Greet"],
				"is_active": true,
				"sales_start": "2024-12-01T00:00:00Z",
				"sales_end": "2025-02-01T00:00:00Z",
				"expires_at": null,
				"created_at": "2024-11-15T00:00:00Z",
				"updated_at": "2025-01-15T00:00:00Z",
				"event": {
					"id": "990e8400-e29b-41d4-a716-446655440004",
					"title": "Summer Music Festival",
					"description": "The biggest music festival of the year",
					"location_id": null,
					"city": "Los Angeles",
					"address": "456 Park Ave",
					"google_map_url": "https://maps.google.com/?q=456+Park+Ave",
					"longitude": "-118.2437",
					"latitude": "34.0522",
					"event_category_id": "cat-music-001",
					"tags": "music,festival,summer,outdoor",
					"event_start_date": "2025-06-20T00:00:00Z",
					"event_end_date": "2025-06-22T00:00:00Z",
					"event_start_time": "14:00",
					"event_end_time": "23:00",
					"event_ticket_id": null,
					"is_private": false,
					"access_type": "ticket-based",
					"access_code": null,
					"qr_code": null,
					"enable_downloads": true,
					"allow_individual_upload": true,
					"allow_professional_upload": true,
					"is_active": true,
					"is_duplicated": false,
					"event_plan_id": null,
					"event_shot_quota_id": null,
					"created_by_id": "creator-001",
					"previous_event_id": null,
					"max_participants": 5000,
					"first_accessed_at": "2025-01-10T00:00:00Z",
					"total_accessed_count": 1250,
					"last_accessed_at": "2025-01-15T10:00:00Z",
					"deleted_at": null,
					"created_at": "2024-11-01T00:00:00Z",
					"updated_at": "2025-01-15T00:00:00Z"
				}
			}
		}
	}
}
```

---

### Response Fields (Top Level)

| Field                  | Type    | Description                                       |
| ---------------------- | ------- | ------------------------------------------------- |
| `id`                   | string  | Unique order ID (UUID)                            |
| `user_ticket_id`       | string  | ID of associated user ticket                      |
| `amount`               | number  | Total order amount (in cents/smallest currency unit) |
| `discount_amount`      | number\|null | Discount applied (in cents), null if no discount |
| `free_ticket_quantity` | number\|null | Number of free tickets included                 |
| `quantity`             | number  | Total number of tickets purchased                 |
| `payment_method`       | string\|null | Payment method used (e.g., "Credit Card")      |
| `payment_status`       | string  | Payment status: `paid`, `pending`, `failed`, `refunded`, `cancelled` |
| `payment_reference`    | string\|null | External payment reference/transaction ID      |
| `paid_at`              | string\|null | ISO 8601 timestamp when payment completed      |
| `refunded_at`          | string\|null | ISO 8601 timestamp when refund processed       |
| `created_at`           | string  | ISO 8601 timestamp when order created             |
| `updated_at`           | string  | ISO 8601 timestamp when order last updated        |

---

### Nested Relationships

#### `user_ticket` Object
Contains information about the user's ticket(s).

**Key Fields:**
- `qr_code` - QR code for ticket validation
- `ticket_code` - Human-readable ticket code
- `is_used` - Whether ticket has been used/checked-in
- `ticket_status` - Ticket payment status

#### `user_ticket.user` Object
Contains customer information.

**Key Fields:**
- `name` - Customer's full name
- `username` - Customer's username
- `email` - Customer's email address
- `phone` - Customer's phone number
- `avatar_url` - URL to customer's avatar image

#### `user_ticket.ticket` Object
Contains ticket type information.

**Key Fields:**
- `name` - Ticket type name (e.g., "VIP Pass")
- `description` - Ticket description
- `price` - Price per ticket
- `perks` - Array of perks included with ticket

#### `user_ticket.ticket.event` Object
Contains event information.

**Key Fields:**
- `title` - Event name
- `description` - Event description
- `city` - Event city
- `address` - Event address
- `event_start_date` - Event start date/time
- `event_end_date` - Event end date/time

---

### Example Request

```bash
GET /v1/orders/550e8400-e29b-41d4-a716-446655440000/details
Authorization: Bearer <token>
```

---

### Error Responses

**404 Not Found**
```json
{
	"success": false,
	"error": {
		"code": "ORDER_NOT_FOUND",
		"message": "Order not found or you don't have permission to view it"
	}
}
```

**401 Unauthorized**
```json
{
	"success": false,
	"error": {
		"code": "UNAUTHORIZED",
		"message": "Authentication required"
	}
}
```

**403 Forbidden**
```json
{
	"success": false,
	"error": {
		"code": "FORBIDDEN",
		"message": "You don't have permission to view this order"
	}
}
```

---

### Notes for Backend Implementation

1. **Include ALL relationships** in the response:
   - `user_ticket` → `user`, `ticket`
   - `ticket` → `event`

2. **Use JOIN queries** to fetch all related data in a single query for performance

3. **Authorization**: Ensure the requesting manager has permission to view this order (it should be from their event)

4. **Nullable fields**: Return `null` for optional fields that don't have values (don't omit them)

5. **Amount formatting**: Store amounts in smallest currency unit (cents) as integers

6. **Timestamps**: Use ISO 8601 format for all timestamps (UTC timezone)

7. **Privacy**: Only return orders for events managed by the authenticated manager

---

### Database Query Example (Pseudocode)

```sql
SELECT 
  orders.*,
  user_tickets.*,
  users.*,
  event_tickets.*,
  events.*
FROM orders
JOIN user_tickets ON orders.user_ticket_id = user_tickets.id
JOIN users ON user_tickets.user_id = users.id
JOIN event_tickets ON user_tickets.ticket_id = event_tickets.id
JOIN events ON event_tickets.event_id = events.id
WHERE orders.id = ? 
  AND events.created_by_id = ? -- Ensure manager owns the event
```

---

### Performance Considerations

- Cache frequently accessed order details
- Use database indexes on `orders.id` and `events.created_by_id`
- Consider pagination for managers with high order volumes
- Optimize JOIN queries to minimize database round-trips


