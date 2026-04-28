import {vi,beforeAll,beforeEach,afterAll, describe,it,expect} from "vitest";

vi.mock("../../src/queues/monitor.queue.js",()=> ({
    monitorQueue: {add: vi.fn()}
}))

import request from "supertest";
import app from "../../../app.js";
import Monitor from "../../src/models/monitors.model.js";
import { connectTestDB, clearTestDB,closeTestDB } from "../setup.js";

describe("POST /api/monitors (Integration)", ()=> {
    beforeAll(connectTestDB);
    afterAll(closeTestDB);
    beforeEach(async()=> {
        await clearTestDB();
        await request(app)
            .post("/api/auth/register")
            .send({
                    email: "test@example.com",
                    username: "testuser",
                    password: "StrongPass123!",})
    });

    const loginUserData = (overrides={}) => ({
      email: "test@example.com",
      password: "StrongPass123!",
      ...overrides
    })

    const createMonitorData = (overrides={}) => ({url: "https://google.com", interval: "60", ...overrides});

    it("should successfully fetch monitors when user is valid", async()=> {
        
        const loginResponse = await request(app)
                                .post("/api/auth/login")
                                .send(loginUserData());
        
        const cookies = loginResponse.headers["set-cookie"]
        expect(cookies).toBeDefined();

        const accessToken = cookies.find(c=> c.startsWith("accessToken="));
    
        expect(accessToken).toBeDefined();

        await request(app)
            .post("/api/monitors")
            .set("Cookie",cookies)
            .send(createMonitorData())

        const response = await request(app)
                            .get("/api/monitors")
                            .set("Cookie",cookies)
        
        expect(response.status).toBe(200);
        expect(response.body.monitors).toBeDefined();
        expect(response.body.monitors).toHaveLength(1);
    });

    it("should return 401 when no accessToken is there", async()=> {
        
        const loginResponse = await request(app)
                                .post("/api/auth/login")
                                .send(loginUserData());
        
        const cookies = loginResponse.headers["set-cookie"]
        expect(cookies).toBeDefined();

        const accessToken = cookies.find(c=> c.startsWith("accessToken="));
    
        expect(accessToken).toBeDefined();

        await request(app)
            .post("/api/monitors")
            .set("Cookie",cookies)
            .send(createMonitorData())

        const response = await request(app)
                            .get("/api/monitors")
                            .set("Cookie","no-access-token")
        
        expect(response.status).toBe(401);
        expect(response.body.monitors).not.toBeDefined();
    });

    it("should return empty array when no monitor found", async()=> {
        
        const loginResponse = await request(app)
                                .post("/api/auth/login")
                                .send(loginUserData());
        
        const cookies = loginResponse.headers["set-cookie"]
        expect(cookies).toBeDefined();

        const accessToken = cookies.find(c=> c.startsWith("accessToken="));
    
        expect(accessToken).toBeDefined();

        const response = await request(app)
                            .get("/api/monitors")
                            .set("Cookie", cookies)
        
        expect(response.status).toBe(200);
        expect(response.body.monitors).toBeDefined();
        expect(response.body.monitors).toHaveLength(0);
    });
});