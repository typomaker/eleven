package session

import (
	"context"
	"log"
	"net/http"
	"time"

	"wservergg/entity"
	"wservergg/ggapi"
)

const (
	ctxUset  = "session.user"
	ctxGGApi = "session.ggapi"
)

type Session struct {
	user      entity.User
	ggapi     ggapi.Client
	expiredAt time.Time
}

var storage = map[string]Session{}

func flush() {
	cnt := 0
	now := time.Now()
	for t, i := range storage {
		if i.expiredAt.Before(now) {
			delete(storage, t)
			cnt++
		}
	}

	if cnt > 0 {
		log.Printf("Flushed %d sessions...", cnt)
	}
}

func ContextUser(ctx context.Context) (user entity.User, ok bool) {
	user, ok = ctx.Value(ctxUset).(entity.User);
	return
}

func ContextGGApi(ctx context.Context) (ggclient ggapi.Client, ok bool) {
	ggclient, ok = ctx.Value(ctxGGApi).(ggapi.Client);
	return
}

func Middleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		var ok bool
		var err error
		var ci Session

		flush()
		rToken := r.Header.Get("X-Token")
		if rToken == "" {
			http.Error(w, "X-Token is required", http.StatusBadRequest)
			return
		}

		if ci, ok = storage[rToken]; !ok {

			var usr entity.User
			rSign := r.Header.Get("X-App-Version")
			if rSign == "" {
				http.Error(w, "X-App-Version is required", http.StatusBadRequest)
				return
			}

			sign := ggapi.NewSignString(rSign)
			header := ggapi.NewHeader(sign)
			header.SetToken(rToken)
			ggclient := ggapi.New(header)

			usr, err = ggclient.FetchCurrentUser()

			if err != nil {
				log.Println(err)
				switch err {
				case ggapi.ErrStaticVersion:
				case ggapi.ErrInvalidSign:
					http.Error(w, err.Error(), http.StatusBadRequest)
				case ggapi.ErrForbidden:
					http.Error(w, err.Error(), http.StatusForbidden)
				default:
					http.Error(w, "Internal error", http.StatusInternalServerError)
				}
				return
			}
			log.Printf("current user: %s", usr.String())

			ci = Session{
				ggapi:     ggclient,
				user:      usr,
				expiredAt: time.Now().Add(time.Hour),
			}
			storage[rToken] = ci
		}
		ctx := context.WithValue(r.Context(), ctxUset, ci.user)
		ctx = context.WithValue(ctx, ctxGGApi, ci.ggapi)

		h.ServeHTTP(w, r.WithContext(ctx))
	})
}
