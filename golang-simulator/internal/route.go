package internal

import (
	"context"
	"math"

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

type FreighService struct {}

func (fs *FreighService) CalculateFreightService(distance int) float64 {
	return math.Round((float64(distance) * 0.15 + 0.49 * 100)) / 100
}


type RouteService struct {
	mongo *mongo.Client
	freighService FreighService
}

func (rs *RouteService) CreateRoute(route Route) (Route, error) {
	ctx := context.TODO()

	route.FreightPrice = rs.freighService.CalculateFreightService(route.Distance)
	
	update := bson.M{
		"$set": bson.M{
			"distance": route.Distance,
			"directions": route.Directions,
			"freight_price": route.FreightPrice, 
		},
	}

	filter := bson.M{"_id": route.ID}
	opts := options.Update().SetUpsert(true)

	_, err := rs.mongo.Database("routes").Collection("routes_c").UpdateOne(ctx, filter, update, opts)

	if err != nil {
		return Route{}, err
	}

  return route, err
}

func (rs *RouteService) GetRoute (id string) (Route, error) {
	ctx := context.TODO()
	
	var route Route
	filter := bson.M{"_id": id}
	
	err := rs.mongo.Database("routes").Collection("routes_c").FindOne(ctx, filter).Decode(&route)

	return route, err
}