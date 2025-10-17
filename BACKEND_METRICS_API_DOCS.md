# Metrics Chart API Documentation

## Endpoint: Get Metrics Data

**URL:** `/v1/dashboard/metrics/chart`

**Method:** `GET`

**Query Parameters:**

| Parameter | Type   | Required | Values                                       | Description                  |
| --------- | ------ | -------- | -------------------------------------------- | ---------------------------- |
| `type`    | string | Yes      | `ticket_sales`, `participants`, `activities` | The metric type to retrieve  |
| `period`  | string | Yes      | `1y`, `6m`, `1m`, `1w`, `1d`                 | The time period for the data |

---

## Period Definitions

### 1. `1y` - One Year

- **Data Points:** 12 (monthly)
- **Labels:** Month names (Jan, Feb, Mar, ..., Dec)
- **Comparison:** Current year vs Previous year
- **Example:** If current year is 2025, shows 2025 vs 2024

### 2. `6m` - Six Months

- **Data Points:** 6 (monthly)
- **Labels:** Month names for last 6 months
- **Comparison:** Last 6 months vs Previous 6 months
- **Example:** If current month is Oct 2025, shows May-Oct 2025 vs Nov 2024-Apr 2025

### 3. `1m` - One Month

- **Data Points:** 4 (weekly)
- **Labels:** Week 1, Week 2, Week 3, Week 4
- **Comparison:** Current month vs Previous month
- **Example:** Shows 4 weeks of current month vs 4 weeks of previous month

### 4. `1w` - One Week

- **Data Points:** 7 (daily)
- **Labels:** Day names (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- **Comparison:** Current week vs Previous week
- **Example:** Shows Mon-Sun of current week vs Mon-Sun of previous week

### 5. `1d` - One Day

- **Data Points:** 12 (2-hour intervals)
- **Labels:** Hour format (00:00, 02:00, 04:00, ..., 22:00)
- **Comparison:** Today vs Yesterday
- **Example:** Shows 12 data points at 2-hour intervals for today vs yesterday

---

## Response Format

```json
{
	"success": true,
	"data": {
		"period": "1y",
		"type": "participants",
		"period_label": {
			"current": "2025",
			"previous": "2024"
		},
		"current": [
			{ "label": "Jan", "value": 1200 },
			{ "label": "Feb", "value": 1350 },
			{ "label": "Mar", "value": 1100 },
			{ "label": "Apr", "value": 1450 },
			{ "label": "May", "value": 1600 },
			{ "label": "Jun", "value": 1550 },
			{ "label": "Jul", "value": 1700 },
			{ "label": "Aug", "value": 1800 },
			{ "label": "Sep", "value": 1750 },
			{ "label": "Oct", "value": 1900 },
			{ "label": "Nov", "value": 2000 },
			{ "label": "Dec", "value": 2100 }
		],
		"previous": [
			{ "label": "Jan", "value": 1000 },
			{ "label": "Feb", "value": 1150 },
			{ "label": "Mar", "value": 900 },
			{ "label": "Apr", "value": 1250 },
			{ "label": "May", "value": 1400 },
			{ "label": "Jun", "value": 1350 },
			{ "label": "Jul", "value": 1500 },
			{ "label": "Aug", "value": 1600 },
			{ "label": "Sep", "value": 1550 },
			{ "label": "Oct", "value": 1700 },
			{ "label": "Nov", "value": 1800 },
			{ "label": "Dec", "value": 1900 }
		],
		"summary": {
			"current_total": 19000,
			"previous_total": 16100,
			"percentage_change": 18.01,
			"trend": "up"
		}
	}
}
```

---

## Response Fields

### Main Response Object

| Field          | Type   | Description                                         |
| -------------- | ------ | --------------------------------------------------- |
| `period`       | string | The requested period (`1y`, `6m`, `1m`, `1w`, `1d`) |
| `type`         | string | The requested metric type                           |
| `period_label` | object | Labels for current and previous periods             |
| `current`      | array  | Data points for the current period                  |
| `previous`     | array  | Data points for the previous period                 |
| `summary`      | object | Summary statistics                                  |

### period_label Object

| Field      | Type   | Description                                                                          |
| ---------- | ------ | ------------------------------------------------------------------------------------ |
| `current`  | string | Label for current period (e.g., "2025", "October 2025", "This Week", "Today")        |
| `previous` | string | Label for previous period (e.g., "2024", "September 2025", "Last Week", "Yesterday") |

### Data Point Object (in current/previous arrays)

| Field   | Type   | Description                                               |
| ------- | ------ | --------------------------------------------------------- |
| `label` | string | The label for this data point (month, week, day, or hour) |
| `value` | number | The metric value for this data point                      |

### summary Object

| Field               | Type   | Description                                      |
| ------------------- | ------ | ------------------------------------------------ |
| `current_total`     | number | Sum of all current period values                 |
| `previous_total`    | number | Sum of all previous period values                |
| `percentage_change` | number | Absolute percentage change between periods       |
| `trend`             | string | Trend direction: `"up"`, `"down"`, or `"stable"` |

**Trend Calculation:**

- `"up"`: percentage_change > 5%
- `"down"`: percentage_change < -5%
- `"stable"`: percentage_change between -5% and 5%

---

## Label Format Examples by Period

### 1y (Year)

```javascript
["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
```

### 6m (Six Months)

```javascript
["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
```

### 1m (Month)

```javascript
["Week 1", "Week 2", "Week 3", "Week 4"];
```

### 1w (Week)

```javascript
["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
```

### 1d (Day)

```javascript
[
	"00:00",
	"02:00",
	"04:00",
	"06:00",
	"08:00",
	"10:00",
	"12:00",
	"14:00",
	"16:00",
	"18:00",
	"20:00",
	"22:00",
];
```

---

## Example Requests

### Get Yearly Participant Data

```
GET /v1/dashboard/metrics/chart?type=participants&period=1y
```

### Get Weekly Ticket Sales

```
GET /v1/dashboard/metrics/chart?type=ticket_sales&period=1w
```

### Get Daily Activities

```
GET /v1/dashboard/metrics/chart?type=activities&period=1d
```

---

## Error Responses

### 400 Bad Request

```json
{
	"success": false,
	"error": {
		"code": "INVALID_PARAMETERS",
		"message": "Invalid type or period parameter"
	}
}
```

### 500 Internal Server Error

```json
{
	"success": false,
	"error": {
		"code": "INTERNAL_ERROR",
		"message": "An error occurred while fetching metrics data"
	}
}
```

---

## Notes

1. **Data Alignment:** Ensure `current` and `previous` arrays have the same length and corresponding labels
2. **Time Zones:** All times should be in UTC or the organization's timezone
3. **Week Start:** Weeks start on Monday and end on Sunday
4. **Month Weeks:** For the `1m` period, distribute days into 4 weeks (approximately 7 days each)
5. **Caching:** Consider caching responses for at least 5-10 minutes to reduce database load
