package entity

type OrderStatus uint8



func (o OrderStatus) ExecutorNearby() bool {
	return o >= OrderStatusMasterCame
}

func (o OrderStatus) InProgress() bool {
	return o >= OrderStatusMasterAccepted && o < OrderStatusWaitRating
}

const (
	OrderStatusMasterAccepted OrderStatus = 20
	OrderStatusMasterCame     OrderStatus = 30
	OrderStatusBegin          OrderStatus = 40
	OrderStatusWaitRating     OrderStatus = 50
)

type Order struct {
	Location
	ID       uint64
	Status   OrderStatus
	Client   User
	Executor User
	UUID     string
}
