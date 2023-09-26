package com.example.workflow.controllers;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("file")
public class UploadFileController {

    @PostMapping("/upload")
    public ResponseEntity<InputStreamResource>  uploadFile(@RequestParam("filePdf") MultipartFile file) throws IOException {
        String fileName  = file.getOriginalFilename() + "_" + UUID.randomUUID().toString() + ".pdf";
        InputStreamResource resource = new InputStreamResource(file.getInputStream());
        file.getInputStream().close();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE);
        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }
}
