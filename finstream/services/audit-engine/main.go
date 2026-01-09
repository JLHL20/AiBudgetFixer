package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"strings"

	// Import the generated code
	"google.golang.org/grpc"
	pb "finstream/audit/proto"

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
func (s *server) EvaluateItem(ctx context.Context, req *pb.ItemRequest) (*pb.BudgetResponse, error) {
    name := strings.ToUpper(req.Name)
    price := req.Price
    
    category := "Unknown"
    suggestion := "Review this"

    // --- EXPANDED RULES ---
    
    // 1. Transaction Meta-data (Not real items)
    if strings.Contains(name, "CASH") || strings.Contains(name, "CHANGE") || strings.Contains(name, "SUBTOTAL") || strings.Contains(name, "TOTAL") {
        category = "Transaction Info"
        suggestion = "Info"
    
    // 2. Groceries (Expanded List)
    } else if strings.Contains(name, "BREAD") || strings.Contains(name, "BAKERY") || strings.Contains(name, "BAGEL") {
        category = "Groceries"
        suggestion = "Approved"
    } else if strings.Contains(name, "MILK") || strings.Contains(name, "DAIRY") || strings.Contains(name, "CHEESE") || strings.Contains(name, "EGG") {
        category = "Groceries"
        suggestion = "Approved"
    } else if strings.Contains(name, "POTATO") || strings.Contains(name, "BANANA") || strings.Contains(name, "FRUIT") || strings.Contains(name, "VEG") || strings.Contains(name, "ZUCHINNI") || strings.Contains(name, "BROCCOLI") || strings.Contains(name, "LETTUCE") || strings.Contains(name, "TOMATO") || strings.Contains(name, "GRAPE") || strings.Contains(name, "SPROUTS") || strings.Contains(name, "APPLE") || strings.Contains(name, "ONION") || strings.Contains(name, "GARLIC") {
        category = "Groceries"
        suggestion = "Healthy Choice!"
    
    // 3. Generic/Other
    } else if strings.Contains(name, "SPECIAL") {
        category = "Groceries" // Usually a discount item
        suggestion = "Deal Found"
    } else if price > 100.00 {
        category = "Big Purchase"
        suggestion = "Warning: High Cost"
    }

    // Print to console
    fmt.Printf("Analyzing: %s ($%.2f) -> %s\n", req.Name, req.Price, category)

    return &pb.BudgetResponse{
        Category:      category,
        Suggestion:    suggestion,
        RemainingLimit: 500.00 - price,
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