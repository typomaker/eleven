package server

import (
	"net/http"
	"wservergg/middleware"
	"wservergg/middleware/session"

	"github.com/gorilla/mux"
	"github.com/justinas/alice"
)

type Server struct {
	*http.Server
}

func NewServer(addr string) *Server {
	router := mux.NewRouter()

	srv := new(Server)
	srv.Server = &http.Server{
		Addr:    addr,
		Handler: router,
	}

	var MWClientAuth = alice.New(middleware.Logger, session.Middleware)

	router.StrictSlash(true)
	router.Handle("/ws", MWClientAuth.ThenFunc(srv.handleWS))

	v1 := router.PathPrefix("/v1").Subrouter()

	subscribe := v1.Path("/token").Subrouter()
	subscribe.
		Methods("POST").
		Handler(alice.New(middleware.Logger).ThenFunc(srv.createToken))

	subscribe.
		Methods("DELETE").
		Handler(alice.New(middleware.Logger).ThenFunc(srv.deleteToken))

	return srv

}

func (s *Server) createToken(w http.ResponseWriter, r *http.Request) {
	// var err error

	// targets := []string{}
	// defer r.Body.Close()

	// decoder := json.NewDecoder(r.Body)

	// err = decoder.Decode(&targets)

	// if err != nil {
	// 	log.Println(err)
	// 	http.Error(w, "Bad index body", http.StatusBadRequest)
	// 	return
	// }

	// if len(targets) < 1 {
	// 	http.Error(w, "target channel list should contain two or more topic identifiers", http.StatusBadRequest)
	// 	return
	// }

	// params := mux.Vars(r)

	// log.Printf("subscribe %s to %v ...", params["id"], targets)
	// for _, t := range targets {
	// 	s.pubsub.Subscribe(params["id"], t)
	// }
}

func (s *Server) deleteToken(w http.ResponseWriter, r *http.Request) {
	// var err error

	// targets := []string{}
	// defer r.Body.Close()

	// decoder := json.NewDecoder(r.Body)

	// err = decoder.Decode(&targets)

	// if err != nil {
	// 	log.Println(err)
	// 	http.Error(w, "Bad index body", http.StatusBadRequest)
	// 	return
	// }

	// if len(targets) < 1 {
	// 	http.Error(w, "target channel list should contain two or more topic identifiers", http.StatusBadRequest)
	// 	return
	// }
	// params := mux.Vars(r)

	// log.Printf("unsubscribe %s from %v ...", params["id"], targets)
	// for _, t := range targets {
	// 	s.pubsub.Unsubscribe(params["id"], t)
	// }
}
