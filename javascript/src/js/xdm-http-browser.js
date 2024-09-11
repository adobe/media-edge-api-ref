/***************************************************************************************
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ***************************************************************************************/

const Q = require("q/q");
const xdmConfig = require("./xdm-collector-config");

const handleResponse = (httpRequest, deferredAction) => {
    if (httpRequest.readyState !== XMLHttpRequest.DONE) {
        return;
    }

    if (httpRequest.status < 200 || httpRequest.status >= 300) {
        if (httpRequest.responseText != null) {
            const errorResponse = JSON.parse(httpRequest.responseText);
            deferredAction.reject({
                statusCode: httpRequest.status,
                error: errorResponse,
            });
        } else {
            deferredAction.reject({
                statusCode: httpRequest.status,
                error: {
                    message:
                        "Request failed with status code " + httpRequest.status,
                },
            });
        }

        return;
    }

    try {
        const responseData = httpRequest.responseText
            ? JSON.parse(httpRequest.responseText)
            : null;
        deferredAction.resolve({
            statusCode: httpRequest.status,
            data: responseData,
        });
    } catch (err) {
        console.error("Error parsing response: " + err);
    }
};

const request = (requestData) => {
    const pendingRequest = Q.defer();

    try {
        const httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = () =>
            handleResponse(httpRequest, pendingRequest);
        httpRequest.open(
            requestData.method,
            `${requestData.baseUrl}${requestData.path
                .concat(xdmConfig.configIdQueryParam)
                .concat(xdmConfig.configIdValue)}`
        );
        httpRequest.setRequestHeader("Content-Type", "application/json");
        httpRequest.send(requestData.data);
    } catch (err) {
        request.reject({
            error: err,
        });
    }

    return pendingRequest.promise;
};

module.exports = {
    request: request,
};
