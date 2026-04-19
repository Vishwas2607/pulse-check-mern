export const validateBody = (schema) => (req,res,next) => {
    const result = schema.safeParse(req.body);
    if(!result.success) {
        throw result.error
    };
    console.log(result.data, req.body)
    req.validatedBody = result.data;
    next();
};

export const validateQuery = (schema) => (req,res,next) => {
    const result = schema.safeParse(req.query);

    if(!result.success){
        throw result.error
    };

    req.validatedQuery= result.data;
    next()
}