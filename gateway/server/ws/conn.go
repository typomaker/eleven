package ws

import (
	"bytes"
	"log"
	"sync"
	"time"

	"wservergg/entity"
	"wservergg/ggapi"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second
	// Maximum message size allowed from peer.
	readLimit = 512
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// input pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

type Conn struct {
	*websocket.Conn
	mtx      *sync.RWMutex
	log      *log.Logger
	user     entity.User
	ggclient ggapi.Client
	in       chan []byte
	out      chan []byte
}

func NewConn(
	conn *websocket.Conn,
	user entity.User,
	ggc ggapi.Client,
) *Conn {
	c := new(Conn)
	c.mtx = &sync.RWMutex{}
	c.in = make(chan []byte, 32)
	c.out = make(chan []byte, 32)
	c.Conn = conn
	c.user = user
	c.ggclient = ggc

	go c.manage()
	go c.reading()
	go c.writing()
	return c
}

func (c *Conn) manage() {
	// go c.subscribe()
	// ticker := time.NewTicker(time.Minute)
	// defer func() {
	// 	ticker.Stop()
	// 	close(c.out)
	// 	c.unsubscribe()
	// 	log.Println("manager stopped")
	// }()

	// consumer := c.pubsub.Consumer(c.user.UUID)
	// for {
	// 	select {
	// 	case <-ticker.C:
	// 		go c.subscribe()
	// 		go c.ggclient.SetCoordinates(c.user)
	// 	case data, ok := <-c.in:
	// 		if !ok {
	// 			return
	// 		}
	// 		msg, err := message.UnmarshalJSON(data)
	// 		if err != nil {
	// 			log.Println(c.user.UUID, "reading bad message", )
	// 			continue
	// 		}

	// 		switch tmsg := msg.(type) {
	// 		case message.Status:
	// 			c.output(message.Status{
	// 				Time: time.Now().Unix(),
	// 			})
	// 		case message.Location:
	// 			location := entity.Location{
	// 				tmsg.Latitude,
	// 				tmsg.Longitude,
	// 			}
	// 			c.mtx.Lock()
	// 			c.user.Location = location
	// 			c.mtx.Unlock()

	// 			if c.user.Kind == entity.UserKindMaster {
	// 				c.mtx.RLock()
	// 				orders := make([]entity.Order, len(c.user.Orders))
	// 				copy(orders, c.user.Orders)
	// 				c.mtx.RUnlock()

	// 				subscribe := false
	// 				for _, order := range orders {
	// 					if order.Distance(location) <= entity.Meter*300 {
	// 						if order.Status.InProgress() {
	// 							var msg message.Message
	// 							if !order.Status.ExecutorNearby() {
	// 								subscribe = true
	// 								go c.ggclient.OrderMasterCame(order.ID)
	// 								msg = message.ExecutorNearby{
	// 									UserID:   order.Client.ID,
	// 									MasterID: c.user.ID,
	// 									OrderID:  order.ID,
	// 									Location: tmsg,
	// 								}
	// 							} else {
	// 								msg = message.Location{
	// 									UserID:    c.user.ID,
	// 									Latitude:  c.user.Latitude,
	// 									Longitude: c.user.Longitude,
	// 								}
	// 							}
	// 							producer := c.pubsub.Producer(order.Client.UUID)
	// 							producer <- msg
	// 							close(producer)
	// 						}
	// 					}
	// 				}
	// 				if subscribe {
	// 					go c.subscribe()
	// 				}
	// 			}
	// 		}

	// 	case m, ok := <-consumer:
	// 		if !ok {
	// 			continue
	// 		}
	// 		msg, ok := m.(message.Message);
	// 		if !ok {
	// 			log.Printf("%s consumed bad message %+v", c.user.String(), m)
	// 			continue
	// 		}

	// 		switch  msg.(type) {
	// 		case message.Accepted,
	// 		message.Approved,
	// 		message.Started,
	// 		message.Finished,
	// 		message.ExecutorNearby,
	// 		message.Canceled:
	// 			go c.subscribe()
	// 		}
	// 		if err := c.output(msg); err != nil {
	// 			log.Println(err)
	// 		}
	// 	}
	// }
}

// func (c *Conn) output(msg message.Message) error {
// 	data, err := message.MarshalJSON(msg)
// 	if err != nil {
// 		return err
// 	}
// 	c.out <- data
// 	return nil
// }

// func (c *Conn) unsubscribe() {
// 	c.mtx.RLock()
// 	for _, order := range c.user.Orders {
// 		log.Println("unsubscribe", c.user.UUID, "from", order.UUID)
// 		c.pubsub.Unsubscribe(c.user.UUID, order.UUID)
// 	}
// 	c.mtx.RUnlock()
// }

// func (c *Conn) subscribe() error {
// 	c.mtx.RLock()
// 	subscribes := make(map[string]bool, len(c.user.Orders))
// 	for _, order := range c.user.Orders {
// 		subscribes[order.UUID] = false
// 	}
// 	c.mtx.RUnlock()

// 	orders, err := c.ggclient.FetchOrderList()
// 	if err != nil {
// 		return err
// 	}

// 	for _, order := range orders {
// 		log.Println("order", order.ID, "status", order.Status)
// 		if order.Status < entity.OrderStatusWaitRating {
// 			if _, ok := subscribes[order.UUID]; ok {
// 				subscribes[order.UUID] = true
// 			} else {
// 				log.Println("subscribe", c.user.UUID, "to", order.UUID)
// 				c.pubsub.Subscribe(c.user.UUID, order.UUID)
// 			}
// 		}
// 	}

// 	for uuid, active := range subscribes {
// 		if !active {
// 			log.Println("unsubscribe", c.user.UUID, "from", uuid)
// 			c.pubsub.Unsubscribe(c.user.UUID, uuid)
// 		}
// 	}

// 	c.mtx.Lock()
// 	c.user.Orders = orders
// 	c.mtx.Unlock()

// 	return nil
// }

func (c *Conn) writing() {
	ticker := time.NewTicker(pingPeriod)

	userStr := c.user.String()
	defer func() {
		log.Println(userStr, "ws writing stopped")
		ticker.Stop()
		c.Close()
	}()

	for {
		select {
		case b, ok := <-c.out:
			c.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			log.Println(userStr, "ws write:", string(b))

			w, err := c.NextWriter(websocket.TextMessage)
			if err != nil {
				log.Println(err)
				return
			}

			w.Write(b)
			n := len(c.out)
			for i := 0; i < n; i++ {
				w.Write(newline)
				data, ok := <-c.out
				if !ok {
					log.Println(userStr, "ws write clossed")
					break
				}
				if err != nil {
					log.Println(userStr, err)
					break
				}
				log.Println(userStr, "ws write:", string(data))
				w.Write(data)
			}

			if err := w.Close(); err != nil {
				log.Println(err)
				return
			}
		case <-ticker.C:
			c.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Println(userStr, err)
				return
			}
		}
	}
}

func (c *Conn) reading() {

	defer c.Close()
	defer close(c.in)
	userTag := c.user.String()
	defer log.Println(userTag, "ws reading stopped")
	c.SetReadLimit(readLimit)
	c.SetReadDeadline(time.Now().Add(pongWait))
	c.SetPongHandler(func(string) error {
		c.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, data, err := c.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Println(userTag, err)
			}
			break
		}
		data = bytes.TrimSpace(bytes.Replace(data, newline, space, -1))
		log.Println(userTag, "ws read:", string(data))
		c.in <- data
	}
}
