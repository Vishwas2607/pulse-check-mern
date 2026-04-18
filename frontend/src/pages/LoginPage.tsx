import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form";
import type { LoginFormValues } from "../features/auth/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {loginSchema} from "../../../lib/schemas/auth.validator"
import { Link, useNavigate } from "react-router";
import { postLogin } from "@/features/auth/api";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [error,setError] = useState("");
    const navigate = useNavigate();
    
    const {register, handleSubmit, formState: {errors, isSubmitting,isValid}} = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: "onChange"
    });

    const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
        try {
            setError("");
            const result = await postLogin(data);
            if(result.message) {
                navigate("/monitors")
            }
        } catch(err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Something went wrong")
        }
    };

    return (
        <section className="section w-full flex-center mt-10"> 
                    <div className="w-100 sm:w-120 px-5 md:w-150 lg:w-170">
                        <h2 className="text-title mb-5 text-center">Enter Login Credentails <span className="ml-2 text-indigo-500">(PulseCheck)</span></h2>
                        <form className="flex flex-col gap-6 md:text-lg px-5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="input-wrapper">
                                <label htmlFor="email" className="input-label">Email: </label>
                                <input id="email" placeholder="Enter email" className="input" {...register("email")}/>
                            </div>
                            {errors.email && <p role="alert" aria-live="polite" className="text-error">{errors.email.message}</p>}

                            <div className="input-wrapper">
                            <label htmlFor="password" className="input-label">Password: </label>
                            <input type={showPassword ? "text" : "password"} id="password" placeholder="Enter password" className="input" {...register("password")}/>
                            </div>
                            {errors.password && <p role="alert" aria-live="polite" className="text-error">{errors.password.message}</p>}

                            <div>
                                <label htmlFor="show-password" className="flex gap-5 items-center cursor-pointer input-label">
                                <input type="checkbox" id="show-password" className="w-5 h-5" onChange={(e)=> setShowPassword(e.target.checked)}/>
                                Show Password:</label>
                            </div>

                            {error && <p className="text-error" role="alert" aria-live="polite">{error}</p>}
                            <button className="btn-primary w-50 self-center disabled:btn-disabled" type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</button>
                        </form>
                        <p className="text-center">Don't have an account? <Link to="/register" className="text-indigo-500 font-semibold hover:text-indigo-400 transition-all duration-300 ease-in-out">Sign Up</Link></p>
                    </div>
        </section>
    )
};