package main

import (
	"log"

	"github.com/VinVorteX/flashtrack/config"
	"github.com/VinVorteX/flashtrack/internal/controllers"
	"github.com/VinVorteX/flashtrack/internal/middleware"
	"github.com/VinVorteX/flashtrack/pkg/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	cfg := config.LoadConfig()
	database.Connect(*cfg)

	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	auth := r.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(), middleware.TenantMiddleware())

	// WebSocket endpoint for real-time notifications
	api.GET("/ws/notifications", controllers.WebSocketHandler)

	// Notification routes
	api.GET("/notifications", controllers.GetNotifications)
	api.POST("/notifications/read", controllers.MarkNotificationRead)

	// Complaint routes - accessible to all authenticated users
	api.GET("/complaints", controllers.GetComplaints)

	// User-only routes
	userRoutes := api.Group("")
	userRoutes.Use(middleware.RoleMiddleware("user"))
	{
		userRoutes.POST("/complaints", controllers.CreateComplaint)
	}

	// Staff routes
	staffRoutes := api.Group("/staff")
	staffRoutes.Use(middleware.RoleMiddleware("staff"))
	{
		staffRoutes.PUT("/resolve/:id", controllers.ResolveComplaint)
		staffRoutes.GET("/points", controllers.GetStaffPoints)
	}

	// Feedback routes
	api.POST("/feedback", controllers.SubmitFeedback)
	api.POST("/feedback/check", controllers.CheckPendingFeedback)
	api.GET("/feedback", middleware.RoleMiddleware("admin"), controllers.GetFeedbackForAdmin)

	// Admin/Staff routes
	adminRoutes := api.Group("/admin")
	adminRoutes.Use(middleware.RoleMiddleware("admin", "staff"))
	{
		adminRoutes.PUT("/assign", controllers.AssignStaff)
	}

	// Staff list endpoint for admins
	api.GET("/staff", controllers.GetStaffMembers)

	r.Run(":8080")
}
