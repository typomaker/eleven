package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
	"wservergg/server"
)

func env(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {

	srv := server.NewServer(":80")

	stop := make(chan os.Signal, 1)

	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("listening on http://0.0.0.0:80\n")

		if err := srv.ListenAndServe(); err != nil {
			log.Fatalln(err)
		}
	}()

	<-stop

	log.Println("shutting down the server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

	if err := srv.Shutdown(ctx); err != nil {
		cancel()
		log.Fatal(err)
	}

	log.Println("sever gracefully stopped")
}
