"use strict";
/** Response factories — one fresh object per call (the legacy shared singletons
 *  leaked state across concurrent requests). Shape kept identical for the frontend. */
function success(data, message = "Successfully completed the request") {
    return { success: true, message, data, error: {} };
}
function failure(error, message = "Something went wrong") {
    const body = error instanceof Error ? { message: error.message } : error || {};
    return { success: false, message, data: {}, error: body };
}
module.exports = { success, failure };
