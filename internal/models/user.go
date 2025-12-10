package models

type User struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Email     string `gorm:"unique" json:"email"`
	Password  string `json:"password,omitempty"`
	Role      string `json:"role"`
	SocietyID uint   `json:"society_id"`
	FCMToken  string `json:"fcm_token,omitempty"` // For push notifications
}
