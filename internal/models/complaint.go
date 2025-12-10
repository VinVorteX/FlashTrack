package models

import "time"

type Complaint struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	ResidentID  uint      `json:"resident_id"`
	StaffID     *uint     `json:"staff_id,omitempty"`
	SocietyID   uint      `json:"society_id"`
	CategoryID  uint      `json:"category_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
