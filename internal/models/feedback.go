package models

import "time"

type Feedback struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ComplaintID uint      `json:"complaint_id"`
	UserID      uint      `json:"user_id"`
	StaffID     uint      `json:"staff_id"`
	Rating      int       `json:"rating"` // 1-5 stars
	Comment     string    `json:"comment"`
	Points      int       `json:"points"` // Points awarded to staff
	CreatedAt   time.Time `json:"created_at"`
}

type StaffPoints struct {
	ID          uint `gorm:"primaryKey" json:"id"`
	StaffID     uint `gorm:"uniqueIndex" json:"staff_id"`
	TotalPoints int  `gorm:"default:0" json:"total_points"`
	TasksCompleted int `gorm:"default:0" json:"tasks_completed"`
}
