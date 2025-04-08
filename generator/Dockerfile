FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod ./
RUN go mod tidy || go mod download

COPY . .

RUN go build -o generator ./cmd/generator/main.go

CMD ["./generator"]