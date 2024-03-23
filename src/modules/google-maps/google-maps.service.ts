import { Client } from "@googlemaps/google-maps-services-js";
import config from "config/config";
import { Logger } from "helpers/logger";
import { Coordinate } from "./google.maps.type";
import { GoogleMapsErrors } from "./google-maps.errors";

export class GoogleMapsService {
  private readonly client: Client;
  private readonly logger: Logger;

  constructor() {
    this.client = new Client({});
    this.logger = Logger.getInstance();
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
      this.logger.error(res.data.error_message);
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
      this.logger.error(distanceMatrixResponse.data.error_message);
      throw new GoogleMapsErrors.DistanceCalculationFailedError(); //TODO: change htis
    }

    return destinationDistances.map(element => element.distance.value);
  }
}
