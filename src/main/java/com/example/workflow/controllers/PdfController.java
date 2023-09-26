package com.example.workflow.controllers;

import com.example.workflow.domain.Signature;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("pdf")
public class PdfController {


    @PostMapping(value = "/export", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InputStreamResource> test(@RequestParam("file") MultipartFile file,
                                                    @RequestParam List<Signature> signatures) throws IOException {
        PDDocument document = PDDocument.load(file.getInputStream());
        file.getInputStream().close();
        return null;
    }
}
