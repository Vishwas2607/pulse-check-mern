import request from "supertest";
import app from "../../../app.js";
import Monitor from "../../src/models/monitors.model.js";
import {vi,beforeAll,beforeEach,afterAll, describe,it,expect} from "vitest";
import { connectTestDB, clearTestDB,closeTestDB } from "../setup.js";

describe("POST /api/monitors (Integration)", ()=> {
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

    const createMonitorData = (overrides={}) => ({url: "https://google.com", interval: "60", ...overrides});
    
    it("should create a new monitor successfully", async()=> {
        await request(app)
            .post("/api/auth/register")
            .send(registerUserData())
        
        const loginResponse = await request(app)
                                .post("/api/auth/login")
                                .send(loginUserData());
        
        const cookies = loginResponse.headers["set-cookie"]
        expect(cookies).toBeDefined();

        const accessToken = cookies.find(c=> c.startsWith("accessToken="));
    
        expect(accessToken).toBeDefined();

        const response = await request(app)
                        .post("/api/monitors")
                        .set("Cookie",cookies)
                        .send(createMonitorData())

        expect(response.status).toBe(201);

        expect(response.body.message).toBeDefined()

        const newMonitor = await Monitor.find();
        expect(newMonitor.length).toEqual(1);
    })

    it("should return 400 when url is invalid", async()=> {
        await request(app)
            .post("/api/auth/register")
            .send(registerUserData())
        
        const loginResponse = await request(app)
                                .post("/api/auth/login")
                                .send(loginUserData());
        
        const cookies = loginResponse.headers["set-cookie"]
        expect(cookies).toBeDefined();

        const accessToken = cookies.find(c=> c.startsWith("accessToken="));
    
        expect(accessToken).toBeDefined();

        const response = await request(app)
                        .post("/api/monitors")
                        .set("Cookie",cookies)
                        .send(createMonitorData({url:"fun.com"}))

        expect(response.status).toBe(400);

        expect(response.body.message).toBeDefined()

        const newMonitor = await Monitor.find();
        expect(newMonitor).toHaveLength(0);
    })

    it("should return 401 when access token is malformed", async()=> {
        await request(app)
            .post("/api/auth/register")
            .send(registerUserData())
        
        const loginResponse = await request(app)
                                .post("/api/auth/login")
                                .send(loginUserData());
        
        const cookies = loginResponse.headers["set-cookie"]
        expect(cookies).toBeDefined();

        const accessToken = cookies.find(c=> c.startsWith("accessToken=")).replace("accessToken","");
    
        expect(accessToken).toBeDefined();

        const response = await request(app)
                        .post("/api/monitors")
                        .set("Cookie",[`accessToken=${accessToken}fun`])
                        .send(createMonitorData({url:"https://google.com"}))

        expect(response.status).toBe(403);

        expect(response.body.message).toBeDefined()

        const newMonitor = await Monitor.find();
        expect(newMonitor).toHaveLength(0);
    })

});