import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useForm, type SubmitHandler} from "react-hook-form";
import { registerSchemaExtended, type RegisterFormValues } from "@/features/auth/types";
import {zodResolver} from "@hookform/resolvers/zod";
import { postRegister } from "@/features/auth/api";
import { Link } from "react-router";
import { toast } from "sonner";
import { checkErrorMsg } from "@/utils/helpers";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const {register,handleSubmit, formState:{errors,isSubmitting,isValid}} = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchemaExtended),
        mode: "onChange"
    });

    const onSubmit: SubmitHandler<RegisterFormValues> = async(data:RegisterFormValues)=> {
        try{
            setError("");
            const dataToPost = {username:data.username, email:data.email, password:data.password}
            const result = await postRegister(dataToPost);
            if (result?.message) {
                toast.success(result.message)
                navigate("/login", {replace:true})
            }
        } catch (err) {
            const errorMsg = checkErrorMsg(err);

            toast.error("Failed to register", {
                description: errorMsg
            })
            setError(errorMsg)
        }
    }

    return (
        <section className="section w-full flex-center">
                <div className="w-100 sm:w-120 px-5 md:w-150 lg:w-170">
                <h2 className="text-title text-center mb-5">Create an Account <span className="ml-2 text-indigo-500">(PulseCheck)</span></h2>
                <form className="flex flex-col gap-6 md:text-lg px-5" onSubmit={handleSubmit(onSubmit)}>

                    <div className="input-wrapper">
                        <label htmlFor="username" className="input-label">Username: </label>
                        <input id="username" autoComplete="username" placeholder="Enter username" className="input" {...register("username")}/>
                    </div>
                    {errors.username && <p role="alert" aria-live="polite" className="text-error">{errors.username.message}</p>}

                    <div className="input-wrapper">
                        <label htmlFor="email" className="input-label">Email: </label>
                        <input id="email" autoComplete="email" placeholder="Enter email" className="input" {...register("email")}/>
                    </div>
                    {errors.email && <p role="alert" aria-live="polite" className="text-error">{errors.email.message}</p>}

                    <div className="input-wrapper">
                    <label htmlFor="password" className="input-label">Password: </label>
                    <input type={showPassword ? "text" : "password"} autoComplete="new-password" id="password" placeholder="Enter password" className="input" {...register("password")}/>
                    </div>
                    {errors.password && <p role="alert" aria-live="polite" className="text-error">{errors.password.message}</p>}

                    <div className="input-wrapper">
                    <label htmlFor="cnf-password" className="input-label">Confirm Password: </label>
                    <input type={showPassword ? "text" : "password"} id="cnf-password" placeholder="Confirm password" className="input" {...register("confirmPassword")}/>
                    </div>
                    {errors.confirmPassword && <p role="alert" aria-live="polite" className="text-error">{errors.confirmPassword.message}</p>}

                    <div className="flex gap-5 items-center">
                        <label htmlFor="show-password" className="flex gap-5 items-center cursor-pointer input-label">
                        <input type="checkbox" id="show-password" className="w-5 h-5" onChange={(e)=> setShowPassword(e.target.checked)}/>
                        Show Password:</label>
                    </div>
                    {error && <p className="text-error" role="alert" aria-live="polite">{error}</p>}
                    <button className="btn btn-primary w-50 self-center disabled:btn-disabled" type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? "Registering..." : "Register"}</button>
                </form>
                <p className="text-center">Already have an account? <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-400 transition-all duration-300 ease-in-out">Login</Link></p>
                </div>
        </section>
    )
};