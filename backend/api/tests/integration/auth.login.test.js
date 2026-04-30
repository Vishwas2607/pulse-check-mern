import request from "supertest";
import app from "../../../app.js";
import User from "../../../shared/models/user.model.js";
import {vi,beforeAll,beforeEach,afterAll, describe,it,expect} from "vitest";
import { connectTestDB, clearTestDB,closeTestDB } from "../setup.js";

describe("POST /api/auth/login (Integration)", ()=> {
    beforeAll(connectTestDB);
    afterAll(closeTestDB);
    beforeEach(clearTestDB);

    const registerUserData = (overrides={}) => ({
      email: "test@example.com",
      username: "testuser",
      password: "StrongPass123!",
      ...overrides
    })

    const loginUserData = (overrides={}) => ({
      email: "test@example.com",
      password: "StrongPass123!",
      ...overrides
    })

    it("should login a user successfully", async()=> {
        await request(app)
        .post("/api/auth/register")
        .send(registerUserData());

        const loginPayload = loginUserData();

        const response = await request(app)
                            .post("/api/auth/login")
                            .send(loginPayload);

        const cookies = response.headers["set-cookie"]
        expect(cookies).toBeDefined();

        const accessCookie = cookies.find(c=> c.startsWith("accessToken="));

        expect(accessCookie).toBeDefined();

        expect(accessCookie).toContain("HttpOnly");


        expect(response.status).toBe(200);
        expect(response.body.message).not.toBeNull();
        expect(response.body.data.user.password).toBeUndefined();
    })

    it("should return 401 when password is wrong", async()=> {
    await request(app)
        .post("/api/auth/register")
        .send(registerUserData())

    const loginPayload = loginUserData({password:"12345678"})

    const response = await request(app)
                        .post("/api/auth/login")
                        .send(loginPayload)

    const cookies = response.headers["set-cookie"]
    expect(cookies).not.toBeDefined()

    expect(response.status).toBe(401)
    expect(response.body.message).not.toBeNull()
    expect(response.body.data).toBeUndefined()
    
    })
} )