package com.example.workflow.controllers;

import com.example.workflow.domain.Component;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.util.Matrix;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;

@RestController
@RequestMapping("pdf")
public class PdfController {

    @PostMapping(value = "/sign", consumes = {"multipart/form-data"})
    public ResponseEntity<InputStreamResource> test(@RequestParam(value = "file") MultipartFile file,
                                                    @RequestParam(value = "scalePage") float scalePage,
                                                    @RequestPart(value = "signatures") List<Component> signatures,
                                                    @RequestPart(value = "textInputs") List<Component> textInputs) throws Exception {
        PDDocument document = PDDocument.load(file.getInputStream());
        file.getInputStream().close();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        URL resource = getClass().getResource("/META-INF/resources/signature.png");
        signatures.forEach(item -> {
            Component.BoundingRect rect = item.getBoundingRect();
            float width = rect.getWidth() / scalePage;
            float height = rect.getHeight() / scalePage;
            float left = rect.getLeft() / scalePage;
            float top = rect.getTop() / scalePage;
            // get page
            PDPage page = document.getPage(item.getMetadata().getPageActive());
            // load sign image
            try {
                PDImageXObject pdImage = PDImageXObject.createFromFile(resource.getPath(), document);
                PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                contentStream.drawImage(pdImage, left, page.getCropBox().getUpperRightY() - top - height, width, height);
                contentStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        InputStream fontResource = getClass().getResourceAsStream("/META-INF/resources/times.ttf");
        PDType0Font fontResourceLoad = PDType0Font.load(document, fontResource);
        textInputs.forEach(item -> {
            Component.BoundingRect rect = item.getBoundingRect();
            float left = rect.getLeft() / scalePage;
            float top = rect.getTop() / scalePage;
            float height = rect.getHeight() / scalePage;
            float fontSize = item.getFontSize() / scalePage;
            String text = item.getText();
            PDPage page = document.getPage(item.getMetadata().getPageActive());
            try {
                PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                contentStream.beginText();
                contentStream.setFont(fontResourceLoad, fontSize);
                contentStream.newLineAtOffset(left, page.getCropBox().getUpperRightY() - top - height + height / 4);
                try {
                    contentStream.showText(text);
                    contentStream.newLine();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                contentStream.endText();
                contentStream.close();
            } catch (Exception e) {
                e.printStackTrace();
            }

        });

        document.save(outputStream);
        document.close();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Disposition", "attachment; filename=sign.pdf");
        headers.set("Content-Type", "application/pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(new ByteArrayInputStream(outputStream.toByteArray())));
    }
}
