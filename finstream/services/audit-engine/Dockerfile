# Use Golang image
FROM golang:1.24-alpine

# Set working directory
WORKDIR /app

# Copy mod files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o server .

# Expose the gRPC port
EXPOSE 50051

# Run the binary
CMD ["./server"]