package entity

import (
	"strconv"
	"errors"
)

type IdentityKind uint8

func (ik IdentityKind) String() (r string) {
	switch ik {
	case IdentityKindClient:
		r = "c"
	case IdentityKindMaster:
		r = "m"
	}

	return
}

const (
	IdentityKindClient IdentityKind = 0
	IdentityKindMaster IdentityKind = 1
)

type Identity struct {
	ID   uint64       `json:"id"`
	Kind IdentityKind `json:"kind"`
}

func (i *Identity) UnmarshalJSON(dt []byte) error {
	if dt[1] != '@' {
		return errors.New("Invalid identity. Should start with '@' character")
	}
	switch dt[2] {
	case 'c':
		i.Kind = IdentityKindClient
	case 'm':
		i.Kind = IdentityKindMaster
	default:
		return errors.New("Invalid identity. Invalid kind type")
	}
	dt = dt[3 : len(dt)-1]

	var err error

	i.ID, err = strconv.ParseUint(string(dt), 10, 64)
	if err != nil {
		return err
	}

	return nil
}

func (i Identity) String() string {
	return "@" + i.Kind.String() + strconv.FormatUint(i.ID, 10)
}

func MakeIdentityMaster(ID uint64) Identity {
	return Identity{
		ID:   ID,
		Kind: IdentityKindMaster,
	}
}

func MakeIdentityClient(ID uint64) Identity {
	return Identity{
		ID:   ID,
		Kind: IdentityKindClient,
	}
}
