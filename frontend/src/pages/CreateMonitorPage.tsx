import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { createMonitorSchema } from "../../../lib/schemas/monitor.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateMonitorType } from "@/features/monitors/types";
import { createMonitor, getMonitorStatus, updateMonitor } from "@/features/monitors/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loadable, Skeleton } from "@/components/Skeleton";
import { checkErrorMsg } from "@/utils/helpers";

export default function CreateMonitor() {
    const {id} = useParams();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    let isEditing = false;
    
    if (id) isEditing = true;
    const [showLoader,setLoader] = useState(isEditing);

    const queryClient = useQueryClient();

    const {register, handleSubmit,reset, formState:{errors,isSubmitting,isValid}} = useForm({
        resolver: zodResolver(createMonitorSchema),
        mode:"onChange"
    });

    useEffect(()=> {
        if(isEditing && id) {
            getMonitorStatus(id).then((data)=> {
                reset({url:data.monitor.url, interval:data.monitor.interval});
            }).catch((err)=>{
                toast.error("Failed to load monitor details",{description: err.message})}).finally(()=> setLoader(false))
        }
    },[id,isEditing,reset]);

    const onSubmit: SubmitHandler<CreateMonitorType> = async (data) => {
        try {
            setError("");
            let result;
            if(isEditing) {
                result = await updateMonitor(id, data);
            } else {
                result = await createMonitor(data);
            }
            toast.success(result.message)
            queryClient.invalidateQueries({queryKey:["monitors"]})
            navigate("/monitors", {replace:true});
        } catch (err) {
            const errorMsg = checkErrorMsg(err);
            toast.error(`Failed to ${isEditing ? "update monitor": "create monitor"}`, {
                description: errorMsg
            })
            setError(errorMsg)
        } 
    }

    return(
        <section className="section w-full flex-center mt-10">
            <Loadable loading={showLoader} skeleton={<Skeleton childClass="bottom-5 left-1/2 -translate-x-1/2 w-32 h-9 rounded-lg" className="w-100 sm:w-120 px-5 h-71 md:w-150 lg:w-170"/>}>
            <div className="w-100 sm:w-120 px-5 md:w-150 lg:w-170">
                <h1 className="text-title mb-5 text-center">{isEditing ? "Edit Monitor": "Add Monitor"} <span className="ml-2 text-indigo-500">(PulseCheck)</span></h1>
                <form className="flex flex-col gap-6 md:text-lg px-5" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-wrapper">
                        <label htmlFor="url" className="input-label">URL: </label>
                        <input id="url" placeholder="Enter url" className="input" {...register("url")}/>
                    </div>
                    {errors.url && <p role="alert" aria-live="polite" className="text-error">{errors.url.message}</p>}

                    <div className="input-wrapper">
                        <label htmlFor="interval" className="input-label">Interval (in sec): </label>
                        <select className="select" id="interval" {...register("interval")}>
                            <option className="option" value="60">60</option>
                            <option className="option" value="90">90</option>
                            <option className="option" value="120">120</option>
                            <option className="option" value="300">300</option>
                        </select>
                    </div>

                    {error && <p className="text-error" role="alert" aria-live="polite">{error}</p>}
                    <button className="btn-primary w-50 self-center disabled:btn-disabled" type="submit" disabled={!isValid || isSubmitting}>{isEditing ? "Edit" : "Add"}</button>
                </form>
                
            </div>
            </Loadable>

            <Loadable loading={showLoader} skeleton={<Skeleton childClass="hidden" className="w-23 h-9 rounded-lg mt-20"/>}>
                <div className="w-full flex-center mt-20">
                    <button className="btn-secondary " onClick={()=> navigate(-1)}>Go Back</button>
                </div>
            </Loadable>

        </section>
    )
}