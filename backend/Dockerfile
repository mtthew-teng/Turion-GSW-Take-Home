FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o server ./cmd/server/main.go

EXPOSE 3000
EXPOSE 8089/udp

CMD ["./server"]