const errorHandler = (err, req, res, next) => {

    const statusCode = err.statusCode || 500;

    // Log unexpected server errors
    if (statusCode >= 500) {
        console.error("Internal Server Error:", err);
    }

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message:
            statusCode >= 500
                ? "Internal Server Error"
                : err.message || "Something went wrong",
        errors: statusCode >= 500 ? [] : err.errors || []
    });
};

export { errorHandler };