
# Thassos Enterprise - LAN Backend

This backend replaces the browser's `localStorage` with a robust SQLite database, enabling multiple users on the same office network to sync data in real-time.

## Installation

1. Install [Node.js](https://nodejs.org/).
2. Place the `/server` folder on a reliable PC (the "Server").
3. Open terminal in `/server` and run:
   ```bash
   npm install
   ```

## Running the Server

Start the server:
```bash
node server.js
```

The console will show the port (default 3000). To find your LAN IP:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr`

## API Usage Examples

### 1. Sync Changes
**GET** `http://[IP]:3000/api/changes?since=2023-10-01T12:00:00Z`
Returns all records updated after the specified timestamp.

### 2. Save a Record (Optimistic)
**POST** `http://[IP]:3000/api/upsert`
Headers: `x-user-id: Moataz`
Body:
```json
{
  "entity": "kpi_entries",
  "record": {
    "id": "KPI-PROD-202310-01",
    "ym": "2023-10",
    "dept": "production",
    "employee_id": " محمد زهران",
    "kpi_key": "wasteRate",
    "value": 4.5,
    "version": 1
  }
}
```
*Note: If server version is 2 and you send 1, it returns 409 Conflict.*

### 3. Locking a Month
**POST** `http://[IP]:3000/api/lock-month`
Body:
```json
{
  "ym": "2023-09",
  "reason": "Final audit complete by GM"
}
```

## Security
This backend is designed for **Trusted LAN usage**. It uses Header-based identification. For high-security environments, implement JWT or VPN access.
