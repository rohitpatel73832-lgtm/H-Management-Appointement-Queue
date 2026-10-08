const errorHandler = (err, req, res, next) => {

    // console.log("========== ERROR ==========");
    // console.log("Error name:", err.name);
    // console.log("Error message:", err.message);
    // console.log("Error status:", err.statusCode);
    // console.log("Full error:", err);
    // console.log("===========================");
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: err.success || false,
        statusCode: statusCode,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
};

export { errorHandler };
