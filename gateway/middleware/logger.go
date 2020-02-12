package middleware

import (
	"log"
	"net/http"
)

func Logger(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("[" + r.RemoteAddr + "] " + r.Method + " " + r.URL.Path)
		h.ServeHTTP(w, r)
	})
}
