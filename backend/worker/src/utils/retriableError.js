export class RetriableError extends Error {
    constructor(message) {
        super(message);
        this.name = "RetriableError";
    }
}