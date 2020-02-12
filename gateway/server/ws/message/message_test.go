package message

import (
	"testing"
	"bytes"
	"encoding/json"
	"reflect"
)

func Test(t *testing.T) {
	tests := []struct {
		json    []byte
		message Message
	}{
		{
			json:    []byte(`{"method":"` + methodMasterCame + `","user_id":"1","master_id":"2","order_id":"3","latitude":12.345,"longitude":32.111}`),
			message: ExecutorNearby{UserID: 1, MasterID: 2, OrderID: 3, Location: Location{Latitude: 12.345, Longitude: 32.111,}},
		},
		{
			json:    []byte(`{"method":"` + methodSendCoordinates + `","latitude":12.345,"longitude":32.111}`),
			message: Location{Latitude: 12.345, Longitude: 32.111},
		},
		{
			json:    []byte(`{"method":"` + methodMasterCoordinates + `","latitude":12.345,"longitude":32.111,"user_id":"1"}`),
			message: Location{Latitude: 12.345, Longitude: 32.111, UserID: 1},
		},
		{
			json:    []byte(`{"method":"` + methodNow + `","server_time":12345678}`),
			message: Status{Time: 12345678},
		},
		{
			json:    []byte(`{"method":"` + methodEndOrder + `","order":{}}`),
			message: Finished{Order: json.RawMessage("{}")},
		},
		{
			json:    []byte(`{"method":"` + methodCancelOrder + `","order_id":"1"}`),
			message: Canceled{OrderID: 1},
		},
		{
			json:    []byte(`{"method":"` + methodStartOrder + `","order_id":"1"}`),
			message: Started{OrderID: 1},
		},
		{
			json:    []byte(`{"method":"` + methodAcceptOrder + `","order":{}}`),
			message: Approved{Order: json.RawMessage("{}")},
		},
		{
			json:    []byte(`{"method":"` + methodMasterFound + `","order_id":"1","masters":[]}`),
			message: Accepted{OrderID: 1, Masters:json.RawMessage("[]")},
		},
	}
	for _, test := range tests {
		{
			actual, err := UnmarshalJSON(test.json)
			if err != nil {
				t.Error(err)
			}
			if !reflect.DeepEqual(actual, test.message) {
				t.Errorf("message %+v, actual %+v", test.message, actual)
			}
		}
		{
			actual, err := MarshalJSON(test.message)
			if err != nil {
				t.Error(err)
			}
			if !bytes.Equal(actual, test.json) {
				t.Errorf("message %+v, actual %+v", string(test.json), string(actual))
			}
		}
	}
}
