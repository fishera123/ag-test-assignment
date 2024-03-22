import { Client } from "@googlemaps/google-maps-services-js";
import config from "config/config";
import { Logger } from "helpers/logger";
import { Coordinate } from "./google.maps.type";
import { GoogleMapsErrors } from "./google-maps.errors";

export class GoogleMapsService {
  private readonly client: Client;

  constructor() {
    this.client = new Client({});
  }

  public async getCoordinates(address: string): Promise<Coordinate> {
    const res = await this.client.geocode({
      params: {
        key: config.GOOGLE_MAPS_API_KEY,
        address,
      },
    });

    const results = res.data.results;

    if (res.data.status !== "OK" || !results.length) {
      Logger.error(res.data.error_message);
      throw new GoogleMapsErrors.InvalidAddressError();
    }

    const location = results[0].geometry.location;

    return `${location.lat},${location.lng}`;
  }

  public async getDrivingDistanceMeters(origin: Coordinate, destinations: Coordinate[]): Promise<number[]> {
    const distanceMatrixResponse = await this.client.distancematrix({
      params: {
        key: config.GOOGLE_MAPS_API_KEY,
        origins: [origin],
        destinations: destinations,
      },
    });

    const { elements: destinationDistances } = distanceMatrixResponse.data.rows[0];

    if (distanceMatrixResponse.data.status !== "OK" || !destinationDistances.length) {
      Logger.error(distanceMatrixResponse.data.error_message);
      throw new GoogleMapsErrors.DistanceCalculationFailedError(); //TODO: change htis
    }

    return destinationDistances.map(element => element.distance.value);
  }
}
