package ggapi

import (
	"os"
	"strings"
	"net/http"
	"errors"
	"fmt"
	"wservergg/entity"
	"encoding/json"
	"strconv"
	"net/url"
)

var (
	host  string
	port  string
)

var (
	ErrInvalidSign   = errors.New("Invalid app sign")
	ErrStaticVersion = errors.New("Invalid sign version")
	ErrForbidden     = errors.New("Forbidden")
)

type (
	client struct {
		ID   string `json:"user_id"`
		UUID string `json:"uuid"`
	}
	master struct {
		ID   string `json:"master_id"`
		UUID string `json:"uuid"`
	}
	order struct {
		Latitude  float64 `json:"order_latitude,string"`
		Longitude float64 `json:"order_longitude,string"`
		OrderID   string  `json:"order_id"`
		Status    uint8   `json:"order_status,string"`
		Client    client  `json:"client"`

		Executor master `json:"master,omitempty"`
		UUID     string `json:"uuid"`
	}
)

func (m *master) UnmarshalJSON(p []byte) error {
	type alias master
	mc := &alias{}
	if p[0] == '[' {
		return nil
	}
	if err := json.Unmarshal(p, &mc); err != nil {
		return err
	}
	m.ID = mc.ID
	m.UUID = mc.UUID

	return nil
}

func init() {
	var ok bool
	if host, ok = os.LookupEnv("GGAPI_HOST"); !ok {
		host = "localhost"
	}
	if port, ok = os.LookupEnv("GGAPI_PORT"); !ok {
		port = "80"
	}
}

func uri(path string) (uri string) {
	uri = host + ":" + port + "/" + strings.TrimPrefix(path, "/")

	return
}

func do(req *http.Request) (res *http.Response, err error) {
	res, err = http.DefaultClient.Do(req)
	if err != nil {
		return
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		switch res.StatusCode {
		case http.StatusForbidden:
			err = ErrForbidden
		case 449:
			err = ErrInvalidSign
		case http.StatusFailedDependency:
			err = ErrStaticVersion
		default:
			err = errors.New(fmt.Sprintf("Response status: %v", res.StatusCode))
		}
	}

	return
}

type Client struct {
	Header Header
}

func New(header Header) Client {
	return Client{
		Header: header,
	}
}

func (g Client) OrderMasterCame(orderID uint64) (err error) {
	var req *http.Request
	form := url.Values{}
	form.Add("order_id", strconv.FormatUint(orderID, 10))
	req, err = http.NewRequest(http.MethodPost, uri("/api/v2/orders/method/masterIsCame"), strings.NewReader(form.Encode()))
	if err != nil {
		return
	}
	req.Header = g.Header.clone().Header
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	_, err = do(req)

	return
}
func (g Client) SetCoordinates(u entity.User) (err error) {
	var req *http.Request
	form := url.Values{}
	form.Add("user_id", strconv.FormatUint(u.ID, 10))
	form.Add("user_role", strconv.FormatUint(uint64(u.Kind), 10))
	form.Add("user_latitude", strconv.FormatFloat(u.Latitude, 'f', 6, 64))
	form.Add("user_longitude", strconv.FormatFloat(u.Longitude, 'f', 6, 64))
	req, err = http.NewRequest(http.MethodPost, uri("/api/v2/orders/method/setCurrentLocation"), strings.NewReader(form.Encode()))
	if err != nil {
		return
	}
	req.Header = g.Header.clone().Header
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	_, err = do(req)

	return
}
func (g Client) FetchCurrentUser() (usr entity.User, err error) {
	var req *http.Request
	var res *http.Response

	req, err = http.NewRequest(http.MethodGet, uri("/api/v2/users/method/viewProfile"), nil)
	if err != nil {
		return
	}

	req.Header = g.Header.clone().Header

	res, err = do(req)
	if err != nil {
		return
	}

	body := struct {
		Data struct {
			UserID   string `json:"user_id"`
			MasterID string `json:"master_id,omitempty"`
			UUID     string `json:"uuid"`
		} `json:"data"`
	}{}
	encoder := json.NewDecoder(res.Body)
	if err = encoder.Decode(&body); err != nil {
		return
	}
	usr = entity.User{
		UUID: body.Data.UUID,
	}
	if body.Data.MasterID != "" {
		var id uint64
		id, err = strconv.ParseUint(body.Data.MasterID, 10, 64)
		usr.ID = id
		usr.Kind = entity.UserKindMaster
	} else if body.Data.UserID != "" {
		var id uint64
		id, err = strconv.ParseUint(body.Data.UserID, 10, 64)
		usr.ID = id
		usr.Kind = entity.UserKindClient
	} else {
		err = errors.New("Expected user_id or master_id")
	}

	return
}

func (g Client) FetchOrderList() (orders []entity.Order, err error) {
	var req *http.Request
	var res *http.Response

	req, err = http.NewRequest(http.MethodGet, uri("/api/v2/orders/method/orderList"), nil)
	if err != nil {
		return
	}

	req.Header = g.Header.clone().Header
	res, err = do(req)
	if err != nil {
		return
	}

	body := struct {
		Data struct {
			Orders []order `json:"orders,omitempty"`
		} `json:"data"`
	}{}

	encoder := json.NewDecoder(res.Body)
	if err = encoder.Decode(&body); err != nil {
		return
	}
	orders = make([]entity.Order, len(body.Data.Orders))

	for i, o := range body.Data.Orders {

		var orderID, masterID, clientID uint64

		orderID, err = strconv.ParseUint(o.OrderID, 10, 64)
		if err != nil {
			return
		}

		clientID, err = strconv.ParseUint(o.Client.ID, 10, 64)
		if err != nil {
			return
		}

		order := entity.Order{
			ID:     orderID,
			Status: entity.OrderStatus(o.Status),
			Location: entity.Location{
				Latitude:  o.Latitude,
				Longitude: o.Longitude,
			},
			Client: entity.User{
				ID:   clientID,
				UUID: o.Client.UUID,
			},
			UUID: o.UUID,
		}

		if o.Executor.ID != "" {
			masterID, err = strconv.ParseUint(o.Executor.ID, 10, 64)
			if err != nil {
				return
			}
			order.Executor = entity.User{
				ID:   masterID,
				UUID: o.Executor.UUID,
			}
		}

		orders[i] = order
	}

	return
}
