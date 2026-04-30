import {describe,it,expect,vi,beforeEach} from "vitest";

vi.mock("../../../shared/repositories/heartbeats.repository.js", () => ({
    getHeartbeatCursorBased: vi.fn(),
}));

import { getHeartbeats } from "../../src/services/heartbeats.service.js";
import * as heartbeats from "../../../shared/repositories/heartbeats.repository.js";


describe("Heartbeats Service - getHeartbeats", ()=> {
    beforeEach(() => {
        vi.clearAllMocks()
    });

    const mockHeartbeats = [{status:"up", checkKey: "1234567", checkedAt:"12/04/26", monitorId:"123", responseTime:200, statusCode: 200}, {status:"down", checkKey:"12345", checkedAt:"13/04/26", error: "validation failed", monitorId:"123"}]
    const resolvedValues = {heartbeats: mockHeartbeats, nextCursor:null, hasNextPage:false};

    it("should successfully fetch heartbeats", async()=>{
        heartbeats.getHeartbeatCursorBased.mockResolvedValue(mockHeartbeats);

        const result = await getHeartbeats("123",{});

        expect(result).toEqual(resolvedValues);

        expect(heartbeats.getHeartbeatCursorBased).toHaveBeenCalledWith({monitorId:"123"}, 21);

    });

    it("should throw error when monitor id is missing", async ()=> {
        await expect(getHeartbeats()).rejects.toThrow();

        expect(heartbeats.getHeartbeatCursorBased).not.toHaveBeenCalled();

    })
})