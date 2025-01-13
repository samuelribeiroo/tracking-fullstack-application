package internal

import (
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Directions struct {
	Lat float64
	Lng float64
}

type Route struct {
	ID           string
	Distance     int
	Directions   []Directions
	FreightPrice float64
}

/* Responsible to create a route and save it at db  */
type RouteService struct {
	mongo *mongo.Client
}

func (rs *RouteService) CreateRoute(route Route) (Route, error) {
	update := bson.M{
		"$set": bson.M{
			"distance": route.Distance,
			"directions": route.Directions,
			"freight_price": route.FreightPrice, 
		},
	}

	filter := bson.M{"_id": route.ID}
	opts := options.Update().SetUpsert(true)

	_, err := rs.mongo.Database("routes").Collection("routes_c").UpdateOne(nil, filter, update, opts)

	if err != nil {
		return Route{}, err
	}

  return route, err
}