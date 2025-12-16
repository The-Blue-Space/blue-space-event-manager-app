# Backend API Documentation - Revenue Data

## Endpoint: Get Revenue Data

**URL:** `/v1/dashboard/revenue`  
**Method:** `GET`  
**Authentication:** Required (Bearer Token)

### Description

Fetches revenue data (inflow, outflow, and net balance) for a specific period, including comparison with the previous period.

---

### Query Parameters

| Parameter | Type   | Required | Description                  | Valid Values                 |
| --------- | ------ | -------- | ---------------------------- | ---------------------------- |
| `period`  | string | Yes      | Time period for revenue data | `1y`, `6m`, `1m`, `1w`, `1d` |

---

### Response Format

```json
{
	"success": true,
	"data": {
		"period": "1y",
		"period_label": {
			"current": "2025",
			"previous": "2024"
		},
		"inflow": {
			"current": 285000,
			"previous": 230000,
			"percentage_change": 23.91
		},
		"outflow": {
			"current": 112000,
			"previous": 95000
		},
		"net_balance": 173000,
		"trend": "up"
	}
}
```

---

### Response Fields

| Field                      | Type   | Description                                           |
| -------------------------- | ------ | ----------------------------------------------------- |
| `period`                   | string | The requested period (`1y`, `6m`, `1m`, `1w`, `1d`)   |
| `period_label.current`     | string | Label for current period (e.g., "2025", "This Week")  |
| `period_label.previous`    | string | Label for previous period (e.g., "2024", "Last Week") |
| `inflow.current`           | number | Total revenue inflow for current period               |
| `inflow.previous`          | number | Total revenue inflow for previous period              |
| `inflow.percentage_change` | number | Percentage change between periods (absolute value)    |
| `outflow.current`          | number | Total revenue outflow for current period              |
| `outflow.previous`         | number | Total revenue outflow for previous period             |
| `net_balance`              | number | Net balance (inflow - outflow) for current period     |
| `trend`                    | string | Revenue trend: `"up"`, `"down"`, or `"stable"`        |

---

### Period Label Examples

#### 1 Year (`1y`)

```json
{
	"current": "2025",
	"previous": "2024"
}
```

#### 6 Months (`6m`)

```json
{
	"current": "Last 6 Months",
	"previous": "Previous 6 Months"
}
```

#### 1 Month (`1m`)

```json
{
	"current": "January 2025",
	"previous": "December 2024"
}
```

#### 1 Week (`1w`)

```json
{
	"current": "This Week",
	"previous": "Last Week"
}
```

#### 1 Day (`1d`)

```json
{
	"current": "Today",
	"previous": "Yesterday"
}
```

---

### Business Logic

**Trend Calculation:**

- `"up"`: `percentage_change > 5%`
- `"down"`: `percentage_change < -5%`
- `"stable"`: `-5% <= percentage_change <= 5%`

**Percentage Change Formula:**

```
percentage_change = ((current - previous) / previous) * 100
```

---

### Example Request

```bash
GET /v1/dashboard/revenue?period=1y
Authorization: Bearer <token>
```

---

### Example Response

```json
{
	"success": true,
	"data": {
		"period": "1y",
		"period_label": {
			"current": "2025",
			"previous": "2024"
		},
		"inflow": {
			"current": 285000,
			"previous": 230000,
			"percentage_change": 23.91
		},
		"outflow": {
			"current": 112000,
			"previous": 95000
		},
		"net_balance": 173000,
		"trend": "up"
	}
}
```

---

### Error Responses

**400 Bad Request**

```json
{
	"success": false,
	"error": {
		"code": "INVALID_PERIOD",
		"message": "Invalid period parameter. Must be one of: 1y, 6m, 1m, 1w, 1d"
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

---

### Notes for Backend Implementation

1. **Inflow** represents all revenue coming into the manager's account (ticket sales, registrations, etc.)
2. **Outflow** represents all withdrawals or expenses taken out by the manager
3. **Net Balance** = Inflow - Outflow
4. The `percentage_change` in the inflow object should be calculated based on inflow comparison between current and previous periods
5. Ensure proper aggregation based on the period:
   - `1y`: Aggregate data for 12 months vs previous 12 months
   - `6m`: Aggregate data for 6 months vs previous 6 months
   - `1m`: Aggregate data for current month vs previous month
   - `1w`: Aggregate data for current week vs previous week
   - `1d`: Aggregate data for today vs yesterday

