package entity

import "strconv"

type UserKind uint8

const (
	UserKindMaster UserKind = iota
	UserKindClient
)

type User struct {
	ID     uint64
	Kind   UserKind
	UUID   string
	Orders []Order
	Location
}

func (u *User) String() string {
	var t string
	switch u.Kind {
	case UserKindClient:
		t = "client"
	case UserKindMaster:
		t = "master"
	}

	return t + "@" + strconv.FormatUint(u.ID, 10) + "#" + u.UUID
}
