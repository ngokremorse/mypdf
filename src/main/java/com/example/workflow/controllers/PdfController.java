package com.example.workflow.controllers;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.FileInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/pdf")
public class PdfController {


    @PostMapping("/sign")
    public ResponseEntity<InputStreamResource> test() throws IOException {
        FileInputStream fileInputStream = new FileInputStream("D:\\Canmunda Project\\my-project\\my-project\\src\\main\\resources\\META-INF\\resources\\pdf.pdf");
        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sign.pdf");
        return ResponseEntity.ok()
                .headers(header)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(fileInputStream));
    }
}
