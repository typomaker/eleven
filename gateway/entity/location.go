package entity

import "math"

type Location struct {
	Latitude  float64
	Longitude float64
}

const (
	earthRadiusMeters = 6378100
	Meter = 1
	Kilometer = Meter * 1000
)


// Gist
// https://gist.github.com/cdipaolo/d3f8db3848278b49db68
func (l Location) Distance(loc Location) (float64) {
	var la1, lo1, la2, lo2 float64

	hsin := func(theta float64) float64 {
		return math.Pow(math.Sin(theta/2), 2)
	}

	la1 = l.Latitude * math.Pi / 180
	lo1 = l.Longitude * math.Pi / 180
	la2 = loc.Latitude * math.Pi / 180
	lo2 = loc.Longitude * math.Pi / 180

	h := hsin(la2-la1) + math.Cos(la1)*math.Cos(la2)*hsin(lo2-lo1)

	return 2 * earthRadiusMeters * math.Asin(math.Sqrt(h))
}
