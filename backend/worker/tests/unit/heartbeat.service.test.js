import {describe,it,expect,vi,beforeEach} from "vitest"; 

vi.mock("../../../shared/repositories/heartbeats.repository.js", ()=> ({
    createHeartbeat: vi.fn()
}));


import { processHeartbeat, saveHeartbeat } from "../../src/services/heartbeat.service.js";
import * as heartbeats from "../../../shared/repositories/heartbeats.repository.js"

describe("Heartbeat Service - Save Heartbeat", ()=> {
    beforeEach(()=> {
        vi.clearAllMocks();
    });

    const heartbeatData = (override={}) => ({monitorId:"123", status: "up", checkedAt:"12/04/2026", checkKey:"321", latency:300, statusCode:200})
    const resolvedValue = (overRride={}) => ({created:true, data:heartbeatData({_id:"98765"})})

    it("should create a new heartbeat successfully", async()=> {
        heartbeats.createHeartbeat.mockResolvedValue(heartbeatData({_id:"98765"}));

        const payload = heartbeatData()
        const result = await saveHeartbeat(payload);

        expect(result).toEqual(resolvedValue());
        expect(heartbeats.createHeartbeat).toHaveBeenCalledWith(payload);
    })

    it("should prevent duplicate heartbeat ", async()=> {
        const duplicateError = new Error('E11000 duplicate key error');
        duplicateError.code = 11000;

        heartbeats.createHeartbeat.mockRejectedValue(duplicateError);

        const payload = heartbeatData();

        const result = await saveHeartbeat(payload);

        expect(result).toEqual({created:false});
        expect(heartbeats.createHeartbeat).toHaveBeenCalledWith(payload);
    })

})

describe("Heartbeat Service - Process Heartbeat", ()=> {
    beforeEach(()=> {
        vi.clearAllMocks();
        global.fetch = vi.fn()
    });

    const mockData = (overrides = {}) =>({url: "https://google.com", monitorId:"123", jobId:"321"});

    it("should return heartbeat data with latency on success", async()=> {
        global.fetch.mockResolvedValue({ok:true, status:200});

        const result = await processHeartbeat(mockData());

        expect(result.status).toBe("up");
        expect(result.checkKey).toBe("321")
        expect(result.statusCode).toBe(200);
        expect(result.responseTime).toBeDefined();
    })

    it("should throw RetriableError on 500 status", async()=> {
        global.fetch.mockResolvedValue({
            ok:false,
            status:500,
        });

        await expect(processHeartbeat(mockData())).rejects.toThrow('Server Error: 500');
    })

    it("should handle AbortError (timeout)", async()=> {
        const abortError = new Error("The operation was aborted");
        abortError.name = "AbortError";

        global.fetch.mockRejectedValue(abortError);

        await expect(processHeartbeat(mockData())).rejects.toThrow("The operation was aborted");
    })

    it("should return heartbeat data with status down on 400 error", async()=> {
        global.fetch.mockResolvedValue({ok:false, status:400, message:"400 Error"});

        const result = await processHeartbeat(mockData());

        expect(result).toBeDefined();
        expect(result.status).toBe("down");
        expect(result.error).toBeDefined();
        expect(result.responseTime).toBeDefined();
        expect(result.statusCode).toBe(400);

    })
})