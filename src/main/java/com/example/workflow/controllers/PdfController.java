package com.example.workflow.controllers;

import com.example.workflow.domain.Signature;
import com.example.workflow.dto.SignDto;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("pdf")
public class PdfController {


    @PostMapping(value = "/sign")
    public ResponseEntity<InputStreamResource> test(@RequestBody SignDto signDto) throws Exception {
        PDDocument document = PDDocument.load(new FileInputStream("D:\\Project\\mypdf\\src\\main\\resources\\META-INF\\resources\\pdf.pdf"));
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        float scale = signDto.getScale();
        List<Signature> signatures = signDto.getSignatures();

        signatures.forEach(item -> {
            float width = item.getWidth() / scale;
            float height = item.getHeight() / scale;
            float left = item.getLeft() / scale;
            float top = item.getTop() / scale;
            // get page
            PDPage page = document.getPage(item.getMetadata().getPageActive());
            // load sign image
            try {
                PDImageXObject pdImage = PDImageXObject.createFromFile("D:\\Project\\mypdf\\src\\main\\resources\\META-INF\\resources\\signature.png", document);
                PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                contentStream.drawImage(pdImage, left, page.getCropBox().getUpperRightY() - top - height, width, height);
                contentStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        document.save(outputStream);
        document.close();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Disposition", "attachment; filename=test.pdf");
        headers.set("Content-Type", "application/pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(new ByteArrayInputStream(outputStream.toByteArray())));

    }
}
