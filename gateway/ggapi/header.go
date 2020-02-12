package ggapi

import (
	"net/http"
	"regexp"
	"fmt"
)

type device string

const (
	DeviceAndroid device = "android"
	DeviceIOS     device = "ios"
)

type app string

const (
	AppClient app = "client"
	AppMaster app = "master"
)

var SignRegexp = regexp.MustCompile(fmt.Sprintf("^(%s|%s)@(%s|%s)_(.+)$", DeviceAndroid, DeviceIOS, AppClient, AppMaster))

type Sign struct {
	App     app
	Device  device
	Version string
}

func (s Sign) String() string {
	i := string(s.App) + "@" + string(s.Device) + "_" + s.Version

	return i
}

func NewSignString(s string) (sign Sign) {
	m := SignRegexp.FindStringSubmatch(s)
	sign.App = app(m[1])
	sign.Device = device(m[2])
	sign.Version = m[3]

	return
}

type Header struct {
	http.Header
}

func NewHeader(s Sign) (h Header) {
	h = Header{
		Header: http.Header{},
	}
	h.SetSign(s)
	h.SetStaticVersion("9000.91")

	return
}

func (h Header) SetToken(token string) {
	h.Add("X-Token", token)
}

func (h Header) SetSign(s Sign) {
	h.Add("X-App-Version", s.String())
}

func (h Header) SetStaticVersion(v string) {
	h.Add("X-Static-Version", v)
}

func (h Header) clone() Header {
	h2 := make(http.Header, len(h.Header))
	for k, vv := range h.Header {
		vv2 := make([]string, len(vv))
		copy(vv2, vv)
		h2[k] = vv2
	}
	return Header{h2}
}
