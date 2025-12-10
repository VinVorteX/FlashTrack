package utils

import "golang.org/x/crypto/bcrypt"

func HashPassword(p string) string {
    hash, _ := bcrypt.GenerateFromPassword([]byte(p), 12)
    return string(hash)
}

func CheckPassword(hash, password string) bool {
    return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
