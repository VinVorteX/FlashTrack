package models

import "time"

type Notification struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `json:"user_id"`
	Title       string    `json:"title"`
	Message     string    `json:"message"`
	Type        string    `json:"type"` // assignment, status_update, etc.
	IsRead      bool      `gorm:"default:false" json:"is_read"`
	ComplaintID *uint     `json:"complaint_id,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}
