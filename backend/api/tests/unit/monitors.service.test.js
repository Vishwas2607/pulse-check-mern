import {describe,it,expect,vi,beforeEach} from "vitest";

vi.mock("../../src/repositories/monitors.repository.js", () => ({
    createMonitor: vi.fn(),
}));

vi.mock("../../src/queues/monitor.queue.js",()=> ({
    monitorQueue: {add: vi.fn()}
}))

import { createNewMonitor } from "../../src/services/monitors.service.js";
import * as monitorRepo from "../../../api/src/repositories/monitors.repository.js";
import { monitorQueue } from "../../src/queues/monitor.queue.js";

describe("Monitor Service - Create", ()=> {
    beforeEach(()=> {
        vi.clearAllMocks()
    })

    const mockMonitor = (override = {}) => ({
        url: "https://google.com",
        interval: 60,
    })

    const mockResolvedMonitorValue = () => ({
        _id: "123456789",
        url: "https://google.com",
        interval: 60,
    })

    it("should create a monitor successfully", async()=> {
        monitorRepo.createMonitor.mockResolvedValue(mockResolvedMonitorValue())

        const payload = mockMonitor();

        const result = await createNewMonitor("userId",payload);

        expect(result).toEqual(mockResolvedMonitorValue())
        expect(monitorQueue.add).toHaveBeenCalled();
        expect(monitorRepo.createMonitor).toHaveBeenCalledWith({"userId":"userId",...payload})

    })
})