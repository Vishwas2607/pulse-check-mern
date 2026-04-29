import {vi,beforeAll,beforeEach,afterAll, describe,it,expect, afterEach} from "vitest";
import { connectTestDB, clearTestDB,closeTestDB } from "../setup.js";
import monitorProcessor from "../../src/monitor.process.js";
import { Heartbeat } from "../../../api/src/models/heartbeats.model.js";
import { HourlyAggregate } from "../../../api/src/models/hourlyAggregate.model.js";
import { Incident } from "../../../api/src/models/incidents.model.js";
import Monitor from "../../../api/src/models/monitors.model.js";
import mongoose from "mongoose";
import { mswServer } from "../mocks/server.js";
import {http, HttpResponse } from "msw";

describe("Monitor Processor Integration", ()=> {
    beforeAll(async()=>{
        mswServer.listen({onUnhandledRequest: "error"})
        await connectTestDB()
    });
    afterAll(async()=> {
        mswServer.close();
        await closeTestDB()
    });
    beforeEach(async()=>{
        mswServer.resetHandlers();
        await clearTestDB()
    });

    beforeEach(()=> {
        vi.useFakeTimers();
    });

    afterEach(()=> {
        vi.useRealTimers();
    })

    const mockJob = (overrides={}) => ({id:"123", data:{url:"https://test.com"}, ...overrides});
    const createMonitorData = {userId:new mongoose.Types.ObjectId("503f191e810c89729de860ea"), url:"https://test.com", interval:60};

    it("should return when no monitor found", async()=> {
        const jobDetails = mockJob()

        const result = await monitorProcessor(jobDetails);

        expect(result).toBeUndefined();

        const heartbeat = await Heartbeat.find();
        const aggregate = await HourlyAggregate.find();
        const incident = await Incident.find();

        expect(heartbeat).toHaveLength(0);
        expect(incident).toHaveLength(0);
        expect(aggregate).toHaveLength(0);
    })

    it("should successfully process monitor and create heartbeat and aggregate value", async()=> {
        const jobDetails = mockJob();
        const monitor = await Monitor.create(createMonitorData);
        jobDetails.data.monitorId = monitor._id;

        mswServer.use(
            http.get('https://test.com', ()=> {
                return new HttpResponse(null,{status:200})
            })
        )
        await monitorProcessor(jobDetails);

        const heartbeat = await Heartbeat.find({monitorId: jobDetails.data.monitorId});
        const aggregate = await HourlyAggregate.find({monitorId: jobDetails.data.monitorId});
        const incident = await Incident.find({monitorId: jobDetails.data.monitorId});

        expect(heartbeat).toHaveLength(1);
        expect(aggregate).not.toHaveLength(10);
        expect(incident).toHaveLength(0)
    });


    it("should create an incident when last 3 heartbeats are down", async()=> {
        const jobDetails = mockJob()
        const monitor = await Monitor.create(createMonitorData);

        jobDetails.data.monitorId = monitor._id;

        let callCount = 0;
        mswServer.use(
            http.get("https://test.com",()=> {
                callCount++;
                const status = callCount < 4 ? 400 : 200;

                return HttpResponse.json(null,{status:status});
            })
        )
        
        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id= "345";
        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id = "543";
        await monitorProcessor(jobDetails);

        const heartbeat = await Heartbeat.find({monitorId: jobDetails.data.monitorId});
        const aggregate = await HourlyAggregate.find({monitorId: jobDetails.data.monitorId});
        const incident = await Incident.find({monitorId: jobDetails.data.monitorId});

        expect(heartbeat).toHaveLength(3);
        expect(aggregate).not.toHaveLength(0);
        expect(incident).toHaveLength(1);
        expect(incident[0].startedAt).toBeDefined();
        expect(incident[0].resolvedAt).toBeNull();       
    });

    it("should resolve an incident when heartbeat is up and incident is open", async()=> {
        const monitor = await Monitor.create(createMonitorData);
        const jobDetails = mockJob();
        jobDetails.data.monitorId = monitor._id;

        let callCount = 0;
        mswServer.use(
            http.get("https://test.com",()=> {
                callCount++;
                const status = callCount < 4 ? 400 : 200;

                return HttpResponse.json(null,{status:status});
            })
        )

        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id="345"
        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id = "546"
        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id = "675";
        await monitorProcessor(jobDetails);

        const heartbeat = await Heartbeat.find({monitorId: jobDetails.data.monitorId});
        const aggregate = await HourlyAggregate.find({monitorId: jobDetails.data.monitorId});
        const incident = await Incident.find({monitorId: jobDetails.data.monitorId});

        expect(heartbeat).toHaveLength(4);
        expect(aggregate).not.toHaveLength(0);
        expect(incident).toHaveLength(1);
        expect(incident[0].startedAt).toBeDefined();
        expect(incident[0].resolvedAt).toBeDefined();       
    });

    it("should avoid duplicate heartbeats when job id is same", async()=> {
        const jobDetails = mockJob();

        const monitor = await Monitor.create(createMonitorData);
        jobDetails.data.monitorId = monitor._id;

        let callCount = 0;
        mswServer.use(
            http.get("https://test.com",()=> {
                callCount++;
                const status = callCount < 4 ? 400 : 200;

                return HttpResponse.json(null,{status:status});
            })
        )
        
        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        await monitorProcessor(jobDetails);

        const heartbeat = await Heartbeat.find({monitorId: jobDetails.data.monitorId});
        const aggregate = await HourlyAggregate.find({monitorId: jobDetails.data.monitorId});
        const incident = await Incident.find({monitorId: jobDetails.data.monitorId});

        expect(heartbeat).toHaveLength(1);
        expect(aggregate).not.toHaveLength(0);
        expect(incident).toHaveLength(0);
    })

    it("should avoid duplicate incident when 4th heartbeat is also down but incident is open", async()=> {
        const jobDetails = mockJob();
        const monitor = await Monitor.create(createMonitorData);

        jobDetails.data.monitorId = monitor._id;

        let callCount = 0;
        mswServer.use(
            http.get("https://test.com",()=> {
                callCount++;
                const status = callCount < 5 ? 400 : 200;

                return HttpResponse.json(null,{status:status});
            })
        )

        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id="345"
        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id = "546"
        await monitorProcessor(jobDetails);
        vi.advanceTimersByTime(60000);

        jobDetails.id = "675"
        await monitorProcessor(jobDetails);

        const heartbeat = await Heartbeat.find({monitorId: jobDetails.data.monitorId});
        const aggregate = await HourlyAggregate.find({monitorId: jobDetails.data.monitorId});
        const incident = await Incident.find({monitorId: jobDetails.data.monitorId});

        expect(heartbeat).toHaveLength(4);
        expect(aggregate).not.toHaveLength(0);
        expect(incident).toHaveLength(1);
        expect(incident[0].startedAt).toBeDefined(); 
        expect(incident[0].resolvedAt).toBeNull();
    });

});