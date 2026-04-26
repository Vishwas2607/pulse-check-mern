import request from "supertest";
import app from "../../../app.js";
import User from "../../src/models/user.model.js";
import {vi,beforeAll,beforeEach,afterAll, describe,it,expect} from "vitest";
import { connectTestDB, clearTestDB,closeTestDB } from "../setup.js";

describe("POST /api/auth/register", ()=> {
    beforeAll(connectTestDB);
    afterAll(closeTestDB);
    beforeEach(clearTestDB);

    const registerUserData = (overrides={}) => ({
      email: "test@example.com",
      username: "testuser",
      password: "StrongPass123!",
      ...overrides
    })

    it("should register a user sucessfully", async()=> {
        const registerPayload = registerUserData();

        const response = await request(app)
        .post("/api/auth/register")
        .send(registerPayload);

        expect(response.status).toBe(201);
        expect(response.body.message).toBeDefined();
        expect(response.body.data).toBeDefined();
        expect(response.body.data.user.password).toBeUndefined();

        const newUser = await User.findOne({email:registerPayload.email});
        expect(newUser).not.toBeNull();
        expect(newUser.password).not.toEqual(registerPayload.password);
    })

    it("should return 400 when email already exists", async()=> {
        const registerPayload = registerUserData();

        await request(app)
        .post("/api/auth/register")
        .send(registerPayload);

        const response = await request(app)
        .post("/api/auth/register")
        .send(registerPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toBeDefined();
        expect(response.body.data).toBeUndefined();

        const newUser = await User.find({email:registerPayload.email});
        expect(newUser.length).toBe(1);
        expect(newUser.password).not.toEqual(registerPayload.password);
    })

    it("should return 400 when email is invalid", async()=> {
        const registerPayload = registerUserData({email:"test.com"});

        const response = await request(app)
        .post("/api/auth/register")
        .send(registerPayload);

        expect(response.status).toBe(400);
        expect(response.body.message).toBeDefined();
        expect(response.body.data).toBeUndefined();

        const newUser = await User.findOne({email:registerPayload.email});
        expect(newUser).toBeNull();
    })
})