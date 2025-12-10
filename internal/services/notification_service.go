package services

import (
	"fmt"
	"log"
	"sync"

	"github.com/VinVorteX/flashtrack/internal/models"
	"github.com/VinVorteX/flashtrack/pkg/database"
	"github.com/gorilla/websocket"
)

var (
	// Store active WebSocket connections
	wsConnections = make(map[uint]*websocket.Conn)
	wsMutex       sync.RWMutex
)

// NotificationService handles notification operations
type NotificationService struct{}

// CreateNotification creates a new notification in database
func (ns *NotificationService) CreateNotification(userID uint, title, message, notifType string, complaintID *uint) (*models.Notification, error) {
	notification := models.Notification{
		UserID:      userID,
		Title:       title,
		Message:     message,
		Type:        notifType,
		ComplaintID: complaintID,
		IsRead:      false,
	}

	if err := database.DB.Create(&notification).Error; err != nil {
		return nil, err
	}

	// Send real-time notification via WebSocket
	ns.SendWebSocketNotification(userID, &notification)

	return &notification, nil
}

// SendWebSocketNotification sends notification via WebSocket
func (ns *NotificationService) SendWebSocketNotification(userID uint, notification *models.Notification) {
	wsMutex.RLock()
	conn, exists := wsConnections[userID]
	wsMutex.RUnlock()

	if exists {
		if err := conn.WriteJSON(notification); err != nil {
			log.Printf("Error sending WebSocket notification to user %d: %v", userID, err)
			// Remove dead connection
			ns.RemoveConnection(userID)
		}
	}
}

// RegisterConnection registers a WebSocket connection for a user
func (ns *NotificationService) RegisterConnection(userID uint, conn *websocket.Conn) {
	wsMutex.Lock()
	wsConnections[userID] = conn
	wsMutex.Unlock()
	log.Printf("WebSocket connection registered for user %d", userID)
}

// RemoveConnection removes a WebSocket connection
func (ns *NotificationService) RemoveConnection(userID uint) {
	wsMutex.Lock()
	delete(wsConnections, userID)
	wsMutex.Unlock()
	log.Printf("WebSocket connection removed for user %d", userID)
}

// GetUserNotifications retrieves all notifications for a user
func (ns *NotificationService) GetUserNotifications(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	if err := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

// MarkAsRead marks a notification as read
func (ns *NotificationService) MarkAsRead(notificationID uint, userID uint) error {
	return database.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("is_read", true).Error
}

// NotifyStaffAssignment sends notification when staff is assigned to complaint
func (ns *NotificationService) NotifyStaffAssignment(staffID uint, complaint *models.Complaint) error {
	var staff models.User
	if err := database.DB.First(&staff, staffID).Error; err != nil {
		return err
	}

	title := "New Task Assigned"
	message := fmt.Sprintf("You have been assigned to complaint #%d: %s", complaint.ID, complaint.Title)

	_, err := ns.CreateNotification(staffID, title, message, "assignment", &complaint.ID)
	return err
}
