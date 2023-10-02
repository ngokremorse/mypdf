window.processInstanceId = undefined;
window.camHttp = undefined;
window.camUri = undefined;
window.camRootScope = undefined;
window.domainUrl = location.protocol + "//" + location.host;
window.variableManager = undefined;
window.camForm = undefined;
window.loggedInUserName = undefined;

function loadProcessInstanceId() {
    processApi.task.get(camForm.taskId, function (err, task) {
        window.processInstanceId = task.processInstanceId;
    });
}

function onInit() {
    window.inject(['$http', 'Uri', '$rootScope', function ($http, Uri, $rootScope) {
        window.camHttp = $http;
        window.camUri = Uri;
        window.camRootScope = $rootScope;
    }]);
    window.variableManager = window.camForm.variableManager;

}

function camFormOnload(handle) {
    camForm.on('form-loaded', function () {
        loadProcessInstanceId();
        window.loggedInUserName = camRootScope.authentication.name;
        handle();
    });
}

function camFormVariablesFetch(handle) {
    camForm.on('variables-fetched', handle);
}

function camFormSubmit(handle) {
    camForm.on('submit', handle);
}

window.processApi = {
    /**
     * @param {String} variableName
     * @param {Blob | File} fileInput
     * @param {Function} handleSuccess
     * @param {Function} handleError
     */
    createOrUpdateFile: function (variableName, fileInput, handleSuccess, handleError) {
        const url = `${domainUrl}/engine-rest/process-instance/${processInstanceId}/variables/${variableName}/data`
        const formData = new FormData();
        formData.append("valueType", "File");
        formData.append("data", fileInput);
        camHttp({
            url: url,
            data: formData,
            headers: {"Content-Type": undefined},
            method: "post"
        })
            .then(handleSuccess)
            .catch(handleError);
    },
    task: {
        /**
         * @param {String} taskId - Required, unique value
         * @param {Function} done (err, taskData)
         */
        get: function (taskId, done) {
            camForm.client.resource('task').get(taskId, done);
        }
    },
    message: {
        /**
         * @param {Object} params
         * @param {String} [params.processInstanceId] The processInstanceId
         * @param {String} params.messageName The message name of the message to be corrolated
         * @param {String} [params.businessKey] The business key the workflow instance is to be initialized with. The business key identifies the workflow instance in the context of the given workflow definition.
         * @param {String} [params.correlationKeys] A JSON object containing the keys the recieve task is to be corrolated with. Each key corresponds to a variable name and each value to a variable value.
         * @param {String} [params.processVariables] A JSON object containing the variables the recieve task is to be corrolated with. Each key corresponds to a variable name and each value to a variable value.
         * @param {Function} done
         */
        correlate: function (params, done) {
            camForm.client.resource('message').correlate(params, done);
        }
    }
}