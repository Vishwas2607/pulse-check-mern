import {describe,it,expect,vi,beforeEach} from "vitest"; 

vi.mock("../../../api/src/repositories/incidents.repository.js", ()=> ({
    createIncident: vi.fn(),
    updateIncident: vi.fn()
}));


vi.mock("../../../api/src/repositories/hourlyAggregate.repository.js", ()=> ({
    incrementFailureCount: vi.fn(),
    updateBulkBucketDownTime: vi.fn()
}))

vi.mock("../../src/utils/downtime.util.js", ()=> ({
    calculateDowntimeBuckets: vi.fn()
}))

vi.mock("../../src/utils/helpers.js", ()=> ({
    areLast3Down: vi.fn(),
    floorToHour: vi.fn()
}))


import { handleIncidentCreation, handleIncidentResolution } from "../../src/services/incidents.service.js";
import * as incidents from "../../../api/src/repositories/incidents.repository.js"
import { calculateDowntimeBuckets } from "../../src/utils/downtime.util.js";
import { areLast3Down, floorToHour } from "../../src/utils/helpers.js";
import * as aggregates from "../../../api/src/repositories/hourlyAggregate.repository.js"

describe("Incidents Service - Handle Incident Creation", ()=> {
    beforeEach(()=> {
        vi.clearAllMocks();
    });

    const mockData = () => ([{status:"down"}, {status:"down"}, {status:"down"}])
    const resolvedValue = (overrides = {}) => ({monitorId:"123", status:"open",startedAt:"12/04/26", resolvedAt:null, _id:"321"})
    
    it("should create an incident when last 3 heartbeats are down", async()=> {
        incidents.createIncident.mockResolvedValue(resolvedValue());
        floorToHour.mockResolvedValue("12/04/26 11:00")
        areLast3Down.mockReturnValue(true);
        aggregates.incrementFailureCount.mockResolvedValue();

        const payload = mockData()
        const result = await handleIncidentCreation("123",payload)

        expect(result).toBeDefined();
        expect(result.status).toBe("open");
        expect(floorToHour).toHaveBeenCalled();
        expect(areLast3Down).toHaveBeenCalledWith(payload);
        expect(aggregates.incrementFailureCount).toHaveBeenCalled();
    });

    it("should return without creating incident when last 3 heartbeats are not down", async()=> {
        areLast3Down.mockReturnValue(false);

        const result = await handleIncidentCreation("123", mockData());

        expect(result).toBeUndefined();
        expect(incidents.createIncident).not.toHaveBeenCalled();
        expect(aggregates.incrementFailureCount).not.toHaveBeenCalled();
    })

    it("should prevent duplcate incidents on Error 11000", async()=> {
        const err = new Error("Duplicate incident");
        err.code = 11000;

        incidents.createIncident.mockRejectedValue(err);
        areLast3Down.mockReturnValue(true)

        const result = await handleIncidentCreation("123", mockData());

        expect(result).toBeNull();
        expect(incidents.createIncident).toHaveBeenCalled();
        expect(aggregates.incrementFailureCount).not.toHaveBeenCalled();
    })

    it("should throw DB error", async()=> {
        incidents.createIncident.mockRejectedValue(new Error("DB error"));
        areLast3Down.mockReturnValue(true);

        await expect(handleIncidentCreation("123", mockData())).rejects.toThrow("DB error");

        expect(incidents.createIncident).toHaveBeenCalled();
        expect(aggregates.incrementFailureCount).not.toHaveBeenCalled();
    })

});

describe("Incidents Service - Handle Incident Resolution", ()=> {
    beforeEach(()=> {
        vi.clearAllMocks();
    });

    const resolvedData = () => ({monitorId:"123", startedAt:"12/04/26 11:00"})

    it("should successfully resolve open incident", async()=> {
        const resolvedPayload = resolvedData();

        incidents.updateIncident.mockResolvedValue(resolvedPayload);
        aggregates.updateBulkBucketDownTime.mockResolvedValue({});
        calculateDowntimeBuckets.mockReturnValue(["1","2","3","4"]);

        const result = await handleIncidentResolution("123");
        
        expect(result).toEqual(resolvedPayload);
        expect(incidents.updateIncident).toHaveBeenCalled();
        expect(aggregates.updateBulkBucketDownTime).toHaveBeenCalled();
    });

    it("should return null when no open incident is there", async()=> {
        incidents.updateIncident.mockResolvedValue(null);

        const result = await handleIncidentResolution("123");

        expect(result).toBeNull();
        expect(aggregates.updateBulkBucketDownTime).not.toHaveBeenCalled();
    })

});