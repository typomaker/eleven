package server

import (
	"log"
	"net/http"
	"wservergg/entity"
	"wservergg/ggapi"
	"wservergg/middleware/session"
	"wservergg/server/ws"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

func (s *Server) handleWS(w http.ResponseWriter, r *http.Request) {
	var user entity.User
	var ggclient ggapi.Client
	var ok bool

	if user, ok = session.ContextUser(r.Context()); !ok {
		log.Println("error, context not contain 'user'")
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	if ggclient, ok = session.ContextGGApi(r.Context()); !ok {
		log.Println("error, context not contain 'ggapi'")
		http.Error(w, "Internal error", http.StatusInternalServerError)
		return
	}

	c, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Println(err)
		return
	}

	userStr := user.String()
	log.Println(userStr, "init ws...")

	ws.NewConn(
		c,
		user,
		ggclient,
	)

	log.Println(userStr, "init ws success")
}
