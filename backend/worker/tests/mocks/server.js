import {setupServer} from "msw/node";
import {http, HttpResponse} from "msw";

export const handlers = [
    http.get("https://test.com", ()=> {
        return HttpResponse.json({message: "Default success"}, {status:200});
    })
];

export const mswServer = setupServer(...handlers);