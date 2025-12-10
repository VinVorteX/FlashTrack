package controllers

import (
	"log"
	"net/http"

	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/VinVorteX/flashtrack/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var (
	notificationService = &services.NotificationService{}
	upgrader            = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			// Allow connections from frontend origins
			origin := r.Header.Get("Origin")
			return origin == "http://localhost:3000" || origin == "http://localhost:5173"
		},
	}
)

// WebSocketHandler handles WebSocket connections for real-time notifications
func WebSocketHandler(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	// Register connection
	notificationService.RegisterConnection(user.ID, conn)

	// Send unread notifications immediately
	notifications, err := notificationService.GetUserNotifications(user.ID)
	if err == nil {
		for _, notif := range notifications {
			if !notif.IsRead {
				conn.WriteJSON(notif)
			}
		}
	}

	// Keep connection alive and handle disconnect
	defer func() {
		notificationService.RemoveConnection(user.ID)
		conn.Close()
	}()

	// Listen for client messages (like ping/pong)
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			break
		}
	}
}

// GetNotifications retrieves all notifications for logged-in user
func GetNotifications(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	notifications, err := notificationService.GetUserNotifications(user.ID)
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch notifications"})
		return
	}

	c.JSON(200, gin.H{"notifications": notifications})
}

// MarkNotificationRead marks a notification as read
func MarkNotificationRead(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var body struct {
		NotificationID uint `json:"notification_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}

	if err := notificationService.MarkAsRead(body.NotificationID, user.ID); err != nil {
		c.JSON(500, gin.H{"error": "failed to mark notification as read"})
		return
	}

	c.JSON(200, gin.H{"message": "notification marked as read"})
}
