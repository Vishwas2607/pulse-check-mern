import {describe,it,expect,vi,beforeEach} from "vitest";

vi.mock("../../../shared/repositories/user.repository.js", () => ({
    createUser: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn()
}));

vi.mock("../../src/utils/helpers.js",()=> ({
    generateAccessToken: vi.fn()
}));

vi.mock("bcrypt", () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn()
    }
}));

import { registerUser, loginUser } from "../../src/services/auth.service.js";
import * as userRepo from "../../../shared/repositories/user.repository.js";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../../src/utils/helpers.js";

describe("Auth Service - Register", ()=> {
    beforeEach(()=> {
        vi.clearAllMocks()
    })

    const mockUser = (overrides = {}) => ({
        username: "john",
        email: "john@mail.com",
        password: "12345678",
        ...overrides
    })

    it("should register a new user successfully", async()=> {

        userRepo.findByEmail.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue("hashed123");

        userRepo.createUser.mockResolvedValue({
            username: "john",
            email: "john@main/com"
        })

        const result = await registerUser(mockUser());

        expect(userRepo.findByEmail).toHaveBeenCalled("john@main.com");
        expect(bcrypt.hash).toHaveBeenCalled();
        expect(userRepo.createUser).toHaveBeenCalledWith(mockUser({password:"hashed123"}))
    })

   it("should throw error if email already exists", async () => {
    userRepo.findByEmail.mockResolvedValue({
      email: "john@mail.com",
      username: "john"
    })

    await expect(registerUser(mockUser())).rejects.toThrow("If an account exists with this email, you’ll receive instructions")

    expect(bcrypt.hash).not.toHaveBeenCalled()
    expect(userRepo.createUser).not.toHaveBeenCalled()

  })
})

describe("Auth Service - Login", () => {
    beforeEach(()=> {
        vi.clearAllMocks()
    });

    const mockLoginUser = () => ({email: "john@mail.com", password:"123456"});
    const mockFindUserResolved = () => ({_id: "123456789",username:"john", email: "john@mail.com", password:"hashed123", role:"user"});

  it("should login a user successfully", async()=> {
    userRepo.findByEmail.mockResolvedValue(mockFindUserResolved())
    bcrypt.compare.mockResolvedValue(true)
    generateAccessToken.mockReturnValue("mockAccess")
    bcrypt.hash.mockResolvedValue("hashedToken")

    const result = await loginUser(mockLoginUser())

    expect(result).toEqual({
      accessToken: "mockAccess",
      username: "john",
      email: "john@mail.com"
    })

    expect(userRepo.findByEmail).toHaveBeenCalledWith("john@mail.com")
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed123")
    expect(generateAccessToken).toHaveBeenCalledWith("123456789")
  })

  it("should throw error Unauthorized when password is wrong", async() => {
    userRepo.findByEmail.mockResolvedValue(mockFindUserResolved());
    bcrypt.compare.mockResolvedValue(false)

    await expect(loginUser(mockLoginUser())).rejects.toThrow("Unauthorized");

    expect(userRepo.findByEmail).toHaveBeenCalledWith("john@mail.com")
    expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed123");
    expect(generateAccessToken).not.toHaveBeenCalled();
  })

  it("should throw error Invalid email or password when user not found", async() => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(loginUser(mockLoginUser())).rejects.toThrow("Invalid email or password");

    expect(userRepo.findByEmail).toHaveBeenCalledWith("john@mail.com")
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(generateAccessToken).not.toHaveBeenCalled();
  })

})