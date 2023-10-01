window.processInstanceId = undefined;
window.camHttp = undefined;
window.camUri = undefined;
window.domainUrl = location.protocol + "//" + location.host;
window.variableManager = undefined;
function loadProcessInstanceId() {
    return new Promise(resolve => {
        const taskService = window.camForm.client.resource('task');
        taskService.get(window.camForm.taskId, function (err, task) {
            window.processInstanceId = task.processInstanceId;
            resolve(window.processInstanceId);
        });
    });
}

function onInit() {
    window.inject(['$http', 'Uri', function ($http, Uri) {
        window.camHttp = $http;
        window.camUri = Uri;
    }]);
    window.variableManager = window.camForm.variableManager;
}

function camFormOnload(handle) {
    window.camForm.on('form-loaded', async function () {
        await loadProcessInstanceId();
        handle();
    });
}

function camFormVariablesFetch(handle) {
    window.camForm.on('variables-fetched', async function () {
        handle();
    });
}

function camFormSubmit(handle) {
    window.camForm.on('submit', async function () {
        handle();
    });
}

window.processApi = {
    /**
     * variableName: text
     * fileInput: File, file get from input type ="file"
     * @param variableName
     * @param fileInput
     * @param handleSuccess
     * @param handleError
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
    }
}

