package main

import (
	"context"
	"log"
	"net"
	"strings"

	// Import the generated code
	pb "finstream/audit/proto"

	"google.golang.org/grpc"
)

// 1. Define our "Fake Database" of Budgets
var categoryBudgets = map[string]float32{
	"Groceries":     150.00, // Monthly Limit
	"Baby Supplies": 50.00,  // Monthly Limit
	"Clothing":      60.00,  // Monthly Limit
	"Tech/Home":     100.00, // Monthly Limit
	"Unknown":       20.00,  // Slush fund
}

type server struct {
	pb.UnimplementedBudgetServiceServer
}

// 2. The Logic: Categorize and Check Budget
func (s *server) EvaluateItem(ctx context.Context, in *pb.ItemRequest) (*pb.BudgetResponse, error) {
	name := strings.ToUpper(in.GetName())
	price := in.GetPrice()
	
	// A. Categorize based on keywords
	category := "Unknown"
	if containsAny(name, []string{"WIPES", "PAMPERS", "BABY", "DR SMITH"}) {
		category = "Baby Supplies"
	} else if containsAny(name, []string{"SOCK", "SHIRT", "PANT", "HAIR"}) {
		category = "Clothing"
	} else if containsAny(name, []string{"TV", "GAME", "COM", "OPU", "NETWORK"}) {
		category = "Tech/Home"
	} else if containsAny(name, []string{"APPLE", "BREAD", "MILK", "MEAT", "PAW PATROL"}) {
		category = "Groceries"
	}

	// B. Check the Budget
	limit, exists := categoryBudgets[category]
	if !exists {
		limit = 20.00
	}

	suggestion := "✅ Approved"
	if price > limit {
		suggestion = "❌ OVER BUDGET"
	} else if price > (limit * 0.8) {
		suggestion = "⚠️ Watch Out (80% Used)"
	}

	// Log it so we can see it in the terminal
	log.Printf("Analyzing: %s ($%.2f) -> %s", name, price, category)

	return &pb.BudgetResponse{
		Category:       category,
		Suggestion:     suggestion,
		RemainingLimit: limit - price, // Simple math for demo
	}, nil
}

// Helper function to check multiple keywords
func containsAny(text string, keywords []string) bool {
	for _, k := range keywords {
		if strings.Contains(text, k) {
			return true
		}
	}
	return false
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	
	s := grpc.NewServer()
	pb.RegisterBudgetServiceServer(s, &server{})
	
	log.Printf("🧠 Smart Budget Engine listening on :50051")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}