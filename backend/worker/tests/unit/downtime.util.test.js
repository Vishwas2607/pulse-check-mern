import {describe,it,expect,vi,beforeEach} from "vitest"; 

import { calculateDowntimeBuckets } from "../../src/utils/downtime.util.js";

describe("Downtime Utils - Calculate DownTime Buckets", async()=> {
    beforeEach(()=> {
        vi.clearAllMocks()
    });

    const mockStartDate = new Date()
    mockStartDate.setHours(10,0,0,0);
    const mockEndDate = new Date(mockStartDate.getTime() + 3*60*60*1000);
    

    it("should return succesfully return ops array",()=> {
        const result = calculateDowntimeBuckets(mockStartDate,mockEndDate,"123");
        console.log(result)
        expect(result).toHaveLength(3);
    })
})