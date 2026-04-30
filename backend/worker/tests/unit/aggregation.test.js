import {describe,it,expect,vi,beforeEach} from "vitest"; 

vi.mock("../../../shared/repositories/hourlyAggregate.repository.js", ()=> ({
    upsertHourlyAggregation: vi.fn()
}))

vi.mock("../../src/utils/helpers.js", ()=> ({
    floorToHour: vi.fn()
}))

import { updateAggregation } from "../../src/services/aggregation.service.js";
import { upsertHourlyAggregation } from "../../../shared/repositories/hourlyAggregate.repository.js";
import { floorToHour } from "../../src/utils/helpers.js";

describe("Aggregation Service - Update Aggregation", ()=> {
    beforeEach(()=> {
        vi.clearAllMocks();
    });

    const mockArguments = (overrides={}) => ({monitorId:"123", status:"up", latency: 256, created:true, ...overrides});
    
    it("should upsert aggregation data successfully when created is true", async()=> {
        floorToHour.mockReturnValue("12/04/26, 11:00");
        upsertHourlyAggregation.mockResolvedValue();

        const result = await updateAggregation(mockArguments());

        expect(result).toBeUndefined();
        expect(upsertHourlyAggregation).toHaveBeenCalled()
    })

    it("should return without updating aggregation data when created is false", async()=> {

        const result = await updateAggregation(mockArguments({created:false}));

        expect(result).toBeUndefined();
        expect(upsertHourlyAggregation).not.toHaveBeenCalled()
    })

});