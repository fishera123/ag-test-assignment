export namespace GoogleMapsErrors {
  export class InvalidAddressError extends Error {
    constructor() {
      super("Invalid address provided");
      this.name = "InvalidAddressError";
    }
  }

  export class DistanceCalculationFailedError extends Error {
    constructor() {
      super("Calculating distance between the owner and the farms has failed");
      this.name = "InvalidAddressError";
    }
  }
}
