package message

import (
	"encoding/json"
)

const (
	methodNewOrder          = "newOrder"
	methodMasterCame        = "masterCame"
	methodMasterFound       = "masterFound"
	methodAcceptOrder       = "acceptOrder"
	methodStartOrder        = "startOrder"
	methodCancelOrder       = "cancelOrder"
	methodEndOrder          = "endOrder"
	methodMasterCoordinates = "masterCoordinates"
	methodNow               = "now"
	methodSendCoordinates   = "sendCoordinates"
)

type (
	Message interface {
		implMessage()
	}
	message struct{}
	Location struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		UserID    uint64  `json:"user_id,string,omitempty"`
		message
	}
	ExecutorNearby struct {
		UserID   uint64 `json:"user_id,string"`
		MasterID uint64 `json:"master_id,string"`
		OrderID  uint64 `json:"order_id,string"`
		Location
		message
	}
	Status struct {
		Time int64 `json:"server_time,omitempty"`
		message
	}
	New struct {
		Order json.RawMessage `json:"order"`
		message
	}
	Started struct {
		OrderID uint64 `json:"order_id,string"`
		message
	}
	Accepted struct {
		OrderID uint64          `json:"order_id,string"`
		Masters json.RawMessage `json:"masters"`
		message
	}
	Approved struct {
		Order json.RawMessage `json:"order"`
		message
	}
	Finished struct {
		Order json.RawMessage `json:"order"`
		message
	}
	Canceled struct {
		OrderID uint64 `json:"order_id,string"`
		message
	}
	method struct {
		Method string `json:"method"`
	}
)

type ErrBadMessage string

func (e ErrBadMessage) Error() string {
	return "error Bad message: " + string(e)
}

func (message) implMessage() {}

func UnmarshalJSON(data []byte) (message Message, err error) {
	target := method{}
	if err := json.Unmarshal(data, &target); err != nil {
		return nil, err
	}
	switch target.Method {
	case methodNewOrder:
		target := New{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodMasterCame:
		target := ExecutorNearby{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodSendCoordinates,
		methodMasterCoordinates:
		target := Location{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodNow:
		target := Status{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodEndOrder:
		target := Finished{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodCancelOrder:
		target := Canceled{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodStartOrder:
		target := Started{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodAcceptOrder:
		target := Approved{}
		err = json.Unmarshal(data, &target)
		message = target
	case methodMasterFound:
		target := Accepted{}
		err = json.Unmarshal(data, &target)
		message = target
	default:
		return nil, ErrBadMessage(data)
	}

	return
}

func MarshalJSON(message Message) (data []byte, err error) {
	switch v := message.(type) {
	case ExecutorNearby:
		data, err = json.Marshal(struct {
			method
			ExecutorNearby
		}{
			method:         method{methodMasterCame},
			ExecutorNearby: v,
		})
	case Location:
		target := struct {
			method
			Location
		}{Location: v}
		if v.UserID != 0 {
			target.Method = methodMasterCoordinates
		} else {
			target.Method = methodSendCoordinates
		}
		data, err = json.Marshal(target)
	case Status:
		data, err = json.Marshal(struct {
			method
			Status
		}{
			method: method{methodNow},
			Status: v,
		})
	case New:
		data, err = json.Marshal(struct {
			method
			New
		}{
			method:   method{methodNewOrder},
			New: v,
		})
	case Finished:
		data, err = json.Marshal(struct {
			method
			Finished
		}{
			method:   method{methodEndOrder},
			Finished: v,
		})
	case Canceled:
		data, err = json.Marshal(struct {
			method
			Canceled
		}{
			method:   method{methodCancelOrder},
			Canceled: v,
		})
	case Started:
		data, err = json.Marshal(struct {
			method
			Started
		}{
			method:  method{methodStartOrder},
			Started: v,
		})
	case Approved:
		data, err = json.Marshal(struct {
			method
			Approved
		}{
			method:   method{methodAcceptOrder},
			Approved: v,
		})
	case Accepted:
		data, err = json.Marshal(struct {
			method
			Accepted
		}{
			method:   method{methodMasterFound},
			Accepted: v,
		})

	default:
		return nil, ErrBadMessage(data)
	}
	return
}
