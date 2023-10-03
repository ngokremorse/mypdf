package com.example.workflow.features;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.camunda.bpm.engine.variable.Variables;
import org.camunda.bpm.engine.variable.value.FileValue;
import org.camunda.spin.impl.json.jackson.JacksonJsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class SignFile implements JavaDelegate {

    @Autowired
    private RuntimeService runtimeService;

    private HttpEntity<InputStreamResource> createFileRequestParam(InputStream inputStream) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "form-data;name=file;filename=sign.pdf");
        return new HttpEntity<>(new InputStreamResource(inputStream), headers);
    }

    private HttpEntity createComponentsRequestPart(List<com.example.workflow.domain.Component> components) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(mapper.writeValueAsString(components), headers);
    }

    @Override
    public void execute(DelegateExecution delegateExecution) throws Exception {
        ByteArrayInputStream attachFile = (ByteArrayInputStream) delegateExecution.getVariable("attachFile");
        JacksonJsonNode pdfData = (JacksonJsonNode) delegateExecution.getVariable("pdfData");
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonNode = mapper.readValue(pdfData.toString(), JsonNode.class);
        List<com.example.workflow.domain.Component> components = mapper.readValue(jsonNode.get("components").toString(), new TypeReference<>() {
        });
        List<com.example.workflow.domain.Component> signatures = components.stream().filter(item -> item.getType().equals("group")).collect(Collectors.toList());
        List<com.example.workflow.domain.Component> textInputs = components.stream().filter(item -> item.getType().equals("i-text")).collect(Collectors.toList());

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> formData = new LinkedMultiValueMap<>();
        formData.add("file", createFileRequestParam(attachFile));
        formData.add("signatures", createComponentsRequestPart(signatures));
        formData.add("textInputs", createComponentsRequestPart(textInputs));
        formData.add("scalePage", jsonNode.get("scalePage").asDouble());

        RequestEntity<MultiValueMap<String, Object>> requestEntity =
                new RequestEntity<>(formData, headers, HttpMethod.POST, new URI("http://localhost:8080/pdf/sign/"));
        ResponseEntity<Resource> responseEntity = restTemplate.exchange(requestEntity, Resource.class);
        if (responseEntity.getStatusCode().is2xxSuccessful()) {
            FileValue typedFileValue = Variables
                    .fileValue("sign.pdf")
                    .file(responseEntity.getBody().getInputStream())
                    .mimeType("application/pdf")
                    .encoding("UTF-8")
                    .create();
            runtimeService.setVariable(delegateExecution.getId(), "thanhtqSignFile", typedFileValue);
        }

    }
}
