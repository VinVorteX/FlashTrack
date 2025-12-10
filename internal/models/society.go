package models

type Society struct {
    ID      uint   `gorm:"primaryKey"`
    Name    string
    Address string
    Plan    string
}