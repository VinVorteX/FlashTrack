# Notification System - API Documentation

## 🚀 Features Implemented

### 1. **Admin Staff Assignment with Notifications**

- Only admins can assign staff to complaints
- Staff receives instant notification when assigned
- Notifications sent via WebSocket (real-time) and stored in database

### 2. **Real-time WebSocket Notifications**

- Staff can connect via WebSocket to receive instant alerts
- Automatically sends unread notifications on connection

### 3. **Notification Management**

- View all notifications
- Mark notifications as read
- Notifications include complaint details

---

## 📡 API Endpoints

### **WebSocket Connection** (Real-time Notifications)

```
GET /api/ws/notifications
Headers: Authorization: Bearer <JWT_TOKEN>
```

Connect from frontend using WebSocket client to receive real-time notifications.

### **Get All Notifications**

```
GET /api/notifications
Headers: Authorization: Bearer <JWT_TOKEN>

Response:
{
  "notifications": [
    {
      "id": 1,
      "user_id": 3,
      "title": "New Task Assigned",
      "message": "You have been assigned to complaint #5: Water Leakage",
      "type": "assignment",
      "is_read": false,
      "complaint_id": 5,
      "created_at": "2025-12-09T10:30:00Z"
    }
  ]
}
```

### **Mark Notification as Read**

```
POST /api/notifications/read
Headers: Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "notification_id": 1
}

Response:
{
  "message": "notification marked as read"
}
```

### **Assign Staff to Complaint** (Admin Only)

```
PUT /api/admin/assign
Headers: Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "complaint_id": 5,
  "staff_id": 3
}

Response:
{
  "complaint": {
    "id": 5,
    "title": "Water Leakage",
    "status": "in-progress",
    "staff_id": 3,
    ...
  },
  "message": "staff assigned and notified successfully"
}
```

---

## 🧪 Testing Flow

### Step 1: Register Users

```bash
# Register Admin
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@society.com",
    "password": "admin123",
    "role": "admin",
    "society_id": 1
  }'

# Register Staff
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staff Member",
    "email": "staff@society.com",
    "password": "staff123",
    "role": "staff",
    "society_id": 1
  }'

# Register User (to create complaint)
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Resident User",
    "email": "user@society.com",
    "password": "user123",
    "role": "user",
    "society_id": 1
  }'
```

### Step 2: Login and Get Tokens

```bash
# Login as User
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@society.com",
    "password": "user123"
  }'
# Save the token as USER_TOKEN

# Login as Admin
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@society.com",
    "password": "admin123"
  }'
# Save the token as ADMIN_TOKEN

# Login as Staff
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@society.com",
    "password": "staff123"
  }'
# Save the token as STAFF_TOKEN
```

### Step 3: Create Complaint (as User)

```bash
curl -X POST http://localhost:8081/api/complaints \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Water Leakage in Flat 101",
    "description": "Water leaking from ceiling",
    "category_id": 1
  }'
# Note the complaint ID
```

### Step 4: Assign Staff (as Admin) - This Triggers Notification

```bash
curl -X PUT http://localhost:8081/api/admin/assign \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "complaint_id": 1,
    "staff_id": 2
  }'
```

### Step 5: Check Notifications (as Staff)

```bash
# Get all notifications
curl -X GET http://localhost:8081/api/notifications \
  -H "Authorization: Bearer <STAFF_TOKEN>"

# Mark notification as read
curl -X POST http://localhost:8081/api/notifications/read \
  -H "Authorization: Bearer <STAFF_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "notification_id": 1
  }'
```

---

## 🌐 Frontend WebSocket Integration

```javascript
// Connect to WebSocket
const token = localStorage.getItem("token");
const ws = new WebSocket(`ws://localhost:8081/api/ws/notifications`);

// Set auth header (send after connection opens)
ws.onopen = () => {
  console.log("WebSocket connected");
  // Send auth token
  ws.send(JSON.stringify({ token: token }));
};

// Receive real-time notifications
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log("New notification:", notification);

  // Show toast/alert
  showNotificationToast(notification);

  // Update notification badge
  updateNotificationCount();
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("WebSocket disconnected");
  // Reconnect logic
};
```

---

## 🔒 Security Features

1. **Role-based Access Control**

   - Only admins can assign staff
   - Users can only create complaints
   - Staff/Admin cannot create complaints

2. **Multi-tenant Isolation**

   - Admins can only assign staff from their own society
   - Cannot assign staff to complaints from other societies

3. **Authentication Required**
   - All notification endpoints require JWT authentication
   - WebSocket connections require valid tokens

---

## 📱 Mobile Push Notifications (Future Enhancement)

The `User` model now includes `fcm_token` field for Firebase Cloud Messaging integration:

```json
{
  "fcm_token": "device_token_here"
}
```

To implement:

1. Update user's FCM token on login (frontend)
2. Use Firebase Admin SDK to send push notifications
3. Send both WebSocket + FCM notifications simultaneously

---

## ✅ What's Working

- ✅ Admin can assign staff to complaints
- ✅ Staff receives instant database notification
- ✅ Real-time WebSocket notifications
- ✅ Notification history retrieval
- ✅ Mark notifications as read
- ✅ Role-based access control
- ✅ Multi-tenant security
