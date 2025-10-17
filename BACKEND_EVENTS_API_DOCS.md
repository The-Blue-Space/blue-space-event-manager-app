# Upcoming Events API Documentation

## Endpoint: Get Upcoming Events

**URL:** `/v1/events/upcoming`

**Method:** `GET`

**Description:** Retrieves a list of all upcoming events for the manager's dashboard.

---

## Response Format

```json
{
	"success": true,
	"data": [
		{
			"id": "evt_001",
			"title": "Summer Music Festival 2025",
			"description": "Join us for an amazing summer music festival featuring top artists.",
			"startDate": "2025-07-15",
			"endDate": "2025-07-17",
			"startAt": "18:00",
			"endAt": "23:00",
			"location": "Central Park, New York",
			"ticket_sold": 2456,
			"attendees": 3000,
			"event_category": "Music",
			"image": "https://example.com/event-image.jpg",
			"status": "active",
			"createdAt": "2025-01-10T10:00:00Z",
			"updatedAt": "2025-10-10T15:30:00Z"
		}
		// ... more events
	]
}
```

---

## Response Fields

### Event Object

| Field            | Type   | Required | Description                                                    |
| ---------------- | ------ | -------- | -------------------------------------------------------------- |
| `id`             | string | Yes      | Unique identifier for the event                                |
| `title`          | string | Yes      | Event title/name                                               |
| `description`    | string | Yes      | Detailed description of the event                              |
| `startDate`      | string | Yes      | Event start date in ISO format (YYYY-MM-DD)                    |
| `endDate`        | string | Yes      | Event end date in ISO format (YYYY-MM-DD)                      |
| `startAt`        | string | Yes      | Event start time in 24-hour format (HH:MM)                     |
| `endAt`          | string | Yes      | Event end time in 24-hour format (HH:MM)                       |
| `location`       | string | Yes      | Physical location or venue of the event                        |
| `ticket_sold`    | number | Yes      | Number of tickets sold for the event                           |
| `attendees`      | number | Yes      | Total number of attendees registered                           |
| `event_category` | string | Yes      | Category/type of event (e.g., Music, Technology, Sports, etc.) |
| `image`          | string | Yes      | URL to the event's featured image                              |
| `status`         | string | Yes      | Event status (active, published, draft, cancelled)             |
| `createdAt`      | string | Yes      | Timestamp when the event was created (ISO 8601)                |
| `updatedAt`      | string | Yes      | Timestamp when the event was last updated (ISO 8601)           |

---

## Event Status Values

| Status      | Description                                  |
| ----------- | -------------------------------------------- |
| `active`    | Event is live and accepting registrations    |
| `published` | Event is published and visible to the public |
| `draft`     | Event is in draft mode and not yet published |
| `cancelled` | Event has been cancelled                     |
| `completed` | Event has been completed (past events)       |

---

## Sorting & Filtering

**Expected Behavior:**

- Return only upcoming events (events with `startDate` >= current date)
- Sort by `startDate` in ascending order (nearest events first)
- Exclude cancelled or deleted events (optional based on business logic)

---

## Example Request

```bash
GET /v1/events/upcoming
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

### 500 Internal Server Error

```json
{
	"success": false,
	"error": {
		"code": "INTERNAL_ERROR",
		"message": "An error occurred while fetching upcoming events"
	}
}
```

---

## Notes

1. **Authentication:** This endpoint requires authentication. Only authenticated managers should be able to view their events.
2. **Pagination:** If the number of upcoming events is large, consider implementing pagination (optional enhancement).
3. **Image URLs:** Ensure image URLs are absolute and accessible.
4. **Timezone:** All dates and times should be in UTC or the organization's configured timezone.
5. **Performance:** Consider caching this endpoint for 5-10 minutes to reduce database load.

---

## Frontend Usage

The frontend uses this data to:

- Display upcoming events in a scrollable list on the dashboard
- Show event thumbnails, titles, dates, locations, and metrics
- Navigate to event detail pages when clicked
- Display real-time ticket sales and attendee counts
