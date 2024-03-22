/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { faker } from "@faker-js/faker";
import config from "config/config";

jest.mock("@googlemaps/google-maps-services-js", () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        distancematrix: jest.fn().mockResolvedValue({
          data: {
            status: "OK",
            rows: [
              {
                elements: [
                  {
                    distance: {
                      value: 1000,
                    },
                  },
                ],
              },
            ],
          },
        }),
        geocode: jest.fn().mockResolvedValue({
          data: {
            status: "OK",
            results: [
              {
                geometry: {
                  location: {
                    lat: faker.location.latitude(),
                    lng: faker.location.longitude(),
                  },
                },
              },
            ],
          },
        }),
      };
    }),
  };
});

import * as bcrypt from "bcrypt";
import { Express } from "express";
import { clearDatabase, disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import { User } from "modules/users/entities/user.entity";
import ds from "orm/orm.config";
import { setupServer } from "server/server";
import supertest, { SuperAgentTest } from "supertest";
import { CreateFarmInputDto } from "../dto/create-farm.input.dto";
import { Farm } from "../entities/farm.entity";
import { AuthService } from "modules/auth/auth.service";
import { OrderByEnum } from "../enums/order-by.enum";
import { OutlierFilter } from "../enums/outlier-filter.enum";

describe("FarmsController", function () {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;
  let salt: string;
  let hashedPassword: string;
  let token: string;
  let user: User;

  const validPassword = "password";

  beforeAll(async () => {
    app = setupServer();
    await ds.initialize();

    server = http.createServer(app).listen(config.APP_PORT);

    salt = await bcrypt.genSalt(config.SALT_ROUNDS);
    hashedPassword = await bcrypt.hash(validPassword, salt);
    agent = supertest.agent(app);
  });

  afterAll(async () => {
    await disconnectAndClearDatabase(ds);
    server.close();
  });

  beforeEach(async () => {
    const fakeEmail = faker.internet.email();
    const authService = new AuthService();
    user = await ds.getRepository(User).save({
      email: fakeEmail,
      hashedPassword,
      address: faker.location.streetAddress(),
      coordinates: `${faker.location.longitude()}, ${faker.location.latitude()}`,
    });
    ({ token } = await authService.login({ email: user.email, password: validPassword }));
  });

  afterEach(async () => {
    await clearDatabase(ds);
  });

  describe("POST /farms", function () {
    let input: CreateFarmInputDto;
    beforeEach(() => {
      input = {
        name: "Test Farm 1",
        size: 10,
        yield: 200,
        address: faker.location.streetAddress(),
        owner: user.email,
      };
    });

    it("should create new farm", async () => {
      const res = await agent.post("/api/farms").auth(token, { type: "bearer" }).send(input);

      expect(res.statusCode).toBe(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: input.name,
        size: input.size,
        yield: input.yield,
        address: input.address,
        owner: user.email,
        drivingDistance: 1000,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should throw UnprocessableEntityError if farm name already exists", async () => {
      await ds.getRepository(Farm).save({
        ...input,
        coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
        owner: user,
        drivingDistance: 0,
      });

      const res = await agent.post("/api/farms").auth(token, { type: "bearer" }).send(input);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "A farm with the same name already exists",
      });
    });

    it("should throw BadRequestError if invalid inputs are provided", async () => {
      const res = await agent
        .post("/api/farms")
        .auth(token, { type: "bearer" })
        .send({
          ...input,
          size: -1,
          coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
          owner: user,
          drivingDistance: 0,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        name: "BadRequestError",
        message: "size must not be less than 1, owner must be an email, owner must be a string",
      });
    });

    it("should throw UnauthorizedError if user auth failed", async () => {
      const res = await agent.post("/api/farms");

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        name: "UnauthorizedError",
        message: "Unauthorized",
      });
    });
  });

  describe("GET /farms", function () {
    const averageYield = 100;
    beforeEach(async () => {
      await ds.getRepository(Farm).save([
        {
          name: "Oktopus farm",
          size: 10,
          yield: averageYield * 0.6, //Outlier (30% below average)
          address: faker.location.streetAddress(),
          owner: user,
          drivingDistance: 10,
          coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
        },
        {
          name: "Salmon farm",
          size: 20,
          yield: averageYield, // Not an outlier
          address: faker.location.streetAddress(),
          owner: user,
          drivingDistance: 20,
          coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
        },
        {
          name: "Chicken farm",
          size: 20,
          yield: averageYield * 1.4, // Outlier (30% above average)
          address: faker.location.streetAddress(),
          owner: user,
          drivingDistance: 30,
          coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
        },
      ]);

      await ds.getRepository(Farm).save([
        {
          name: "Goat farm",
          size: 10,
          yield: averageYield * 0.9, // Not an outlier
          address: faker.location.streetAddress(),
          owner: user,
          drivingDistance: 40,
          coordinates: `${faker.location.latitude()}, ${faker.location.longitude()}`,
        },
      ]);
    });
    it("should throw UnauthorizedError if user auth failed", async () => {
      const res = await agent.get("/api/farms").send();

      expect(res.statusCode).toBe(401);
      expect(res.body).toMatchObject({
        name: "UnauthorizedError",
        message: "Unauthorized",
      });
    });
    it("should return pagianated farms list", async () => {
      const res = await agent.get("/api/farms").auth(token, { type: "bearer" });

      expect(res.statusCode).toBe(201);

      expect(res.body.result).toHaveLength(4);
      expect(res.body.meta).toMatchObject({
        totalRecords: "4",
        totalPages: "1",
        offset: "0",
        page: "1",
        firstPage: "true",
        lastPage: "true",
      });
      expect(res.body.result[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        size: expect.any(Number),
        address: expect.any(String),
        yield: expect.any(Number),
        owner: expect.any(String),
        drivingDistance: expect.any(Number),
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it("should sort by createdAt in descending order", async () => {
      const res = await agent.get(`/api/farms?orderBy=${OrderByEnum.date}`).auth(token, { type: "bearer" });

      expect(res.statusCode).toBe(201);
      expect(res.body.result[0]).toMatchObject({
        name: "Goat farm",
      });
    });

    it("should sort by name of the farm in ascending order", async () => {
      const res = await agent.get(`/api/farms?orderBy=${OrderByEnum.name}`).auth(token, { type: "bearer" });

      expect(res.statusCode).toBe(201);
      expect(res.body.result[0]).toMatchObject({
        name: "Chicken farm",
      });
    });

    it("should sort by driving distance in ascending order", async () => {
      const res = await agent.get(`/api/farms?orderBy=${OrderByEnum.drivingDistance}`).auth(token, { type: "bearer" });

      expect(res.statusCode).toBe(201);
      expect(res.body.result[0]).toMatchObject({
        name: "Oktopus farm",
      });
    });

    it("should return farms except outliers", async () => {
      const res = await agent.get(`/api/farms?outlierFilter=${OutlierFilter.ShowExceptOutliers}`).auth(token, { type: "bearer" });

      expect(res.statusCode).toBe(201);
      expect(res.body.result).toHaveLength(2);
      expect(res.body.result[0]).toMatchObject({
        name: "Salmon farm",
      });
      expect(res.body.result[1]).toMatchObject({
        name: "Goat farm",
      });
    });

    it("should return only outlier farms", async () => {
      const res = await agent.get(`/api/farms?outlierFilter=${OutlierFilter.ShowOnlyOutliers}`).auth(token, { type: "bearer" });

      expect(res.statusCode).toBe(201);
      expect(res.body.result).toHaveLength(2);
      expect(res.body.result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Chicken farm" }),
          expect.objectContaining({ name: "Oktopus farm" }),
        ]),
      );
    });
  });
});
