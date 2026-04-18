import {z} from "zod";
import {loginSchema, registerSchema} from "../../../../lib/schemas/auth.validator"

export const registerSchemaExtended = registerSchema.extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
})
.refine((data)=> data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterPostDataType = z.infer<typeof registerSchema>;
export type RegisterFormValues = z.infer<typeof registerSchemaExtended>;

export type LoginFormValues = z.infer<typeof loginSchema>

export type AuthType = "loading" | "authenticated" | "unauthenticated";

export type AuthenticationDetailsType = {authenticated: AuthType, username: string};

export interface AuthenticationContextType {
    authenticatedDetails: AuthenticationDetailsType;
    markUnauthenticated: () => void;
    verifyAuth: () => Promise<void>;
}