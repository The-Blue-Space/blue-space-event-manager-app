# Active Events & Activities API Documentation

## Endpoint 1: Get Active Events

**URL:** `/v1/events/active`

**Method:** `GET`

**Description:** Retrieves all currently active events for the manager's dashboard.

---

### Response Format

```json
{
	"success": true,
	"data": [
		{
			"id": "evt_active_001",
			"title": "Tech Summit 2025",
			"description": "Join industry leaders and innovators for three days of inspiring talks.",
			"startDate": "2025-10-20",
			"endDate": "2025-10-22",
			"startAt": "09:00",
			"endAt": "18:00",
			"location": "Convention Center, San Francisco",
			"ticket_sold": 1250,
			"attendees": 1500,
			"event_category": "Technology",
			"image": "https://example.com/event-image.jpg",
			"status": "active",
			"createdAt": "2025-08-01T10:00:00Z",
			"updatedAt": "2025-10-14T15:30:00Z"
		}
	]
}
```

---

## Endpoint 2: Get Event Activities

**URL:** `/v1/events/{eventId}/activities`

**Method:** `GET`

**Description:** Retrieves the activity feed/audit trail for a specific event.

**URL Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `eventId` | string | Yes      | The unique identifier of the event |

---

### Response Format

```json
{
	"success": true,
	"data": [
		{
			"id": "act_001",
			"event_id": "evt_active_001",
			"type": "ticket_purchase",
			"action": "Ticket Purchased",
			"details": "2 VIP tickets purchased",
			"user": {
				"id": "user_001",
				"name": "Sarah Johnson",
				"avatar": "https://example.com/avatar.jpg"
			},
			"timestamp": "2025-10-14T14:30:00Z",
			"metadata": {
				"quantity": 2,
				"ticket_type": "VIP",
				"amount": 500
			}
		}
	]
}
```

---

## Activity Types

| Type              | Description                 | Example                      |
| ----------------- | --------------------------- | ---------------------------- |
| `ticket_purchase` | User purchases tickets      | "2 VIP tickets purchased"    |
| `check_in`        | Attendee checks in to event | "Checked in at gate A"       |
| `event_update`    | Event details updated       | "Event description updated"  |
| `comment`         | User posts a comment        | "Looking forward to this!"   |
| `refund`          | Ticket refund processed     | "Refund issued for 1 ticket" |
| `registration`    | User registers for event    | "Registered for the event"   |

---

## Activity Object Fields

| Field       | Type   | Required | Description                                   |
| ----------- | ------ | -------- | --------------------------------------------- |
| `id`        | string | Yes      | Unique identifier for the activity            |
| `event_id`  | string | Yes      | ID of the event this activity belongs to      |
| `type`      | string | Yes      | Activity type (see Activity Types table)      |
| `action`    | string | Yes      | Short description of the action               |
| `details`   | string | Yes      | Detailed description of what happened         |
| `user`      | object | Yes      | User who performed the action                 |
| `timestamp` | string | Yes      | ISO 8601 timestamp when activity occurred     |
| `metadata`  | object | No       | Additional data specific to the activity type |

### User Object

| Field    | Type   | Required | Description                |
| -------- | ------ | -------- | -------------------------- |
| `id`     | string | Yes      | User's unique identifier   |
| `name`   | string | Yes      | User's full name           |
| `avatar` | string | No       | URL to user's avatar image |

---

## Sorting & Filtering

### Active Events

- Return only events with status "active"
- Sort by `startDate` (upcoming first)

### Activities

- Return activities in reverse chronological order (newest first)
- Frontend handles filtering by activity type
- Consider pagination for events with many activities

---

## Example Requests

### Get Active Events

```bash
GET /v1/events/active
Authorization: Bearer <token>
```

### Get Event Activities

```bash
GET /v1/events/evt_active_001/activities
Authorization: Bearer <token>
```

---

## Error Responses

### 401 Unauthorized

```json
{
	"success": false,
	"error": {
		"code": "UNAUTHORIZED",
		"message": "Authentication required"
	}
}
```

### 404 Not Found

```json
{
	"success": false,
	"error": {
		"code": "EVENT_NOT_FOUND",
		"message": "Event not found"
	}
}
```

### 500 Internal Server Error

```json
{
	"success": false,
	"error": {
		"code": "INTERNAL_ERROR",
		"message": "An error occurred while fetching data"
	}
}
```

---

## Notes

1. **Authentication:** Both endpoints require authentication
2. **Performance:** Consider caching active events for 1-2 minutes
3. **Activity Metadata:** Metadata structure varies by activity type
4. **Timestamps:** All timestamps should be in ISO 8601 format (UTC)
5. **Avatar URLs:** Ensure avatar URLs are absolute and accessible
6. **Activity Limit:** Consider limiting activities to last 100-200 entries per event
7. **Real-time Updates:** Consider WebSocket support for live activity updates (optional enhancement)

---

## Frontend Usage

### Active Events Display:

- Shows one active event at a time with navigation
- Tab toggle between event details and activities
- Navigation persists across both tabs

### Activity Filters:

- Users can filter activities by type
- All types shown by default
- Filters are client-side (checkboxes)
- Activity feed updates based on selected filters

