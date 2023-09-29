package com.example.workflow.controllers;

import com.example.workflow.domain.ITextInput;
import com.example.workflow.domain.Signature;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("pdf")
public class PdfController {

    @PostMapping(value = "/sign", consumes = {"multipart/form-data"})
    public ResponseEntity<InputStreamResource> test(@RequestParam("file") MultipartFile file,
                                                    @RequestParam("scale") float scale,
                                                    @RequestPart("signatures") List<Signature> signatures,
                                                    @RequestPart("textInputs") List<ITextInput> textInputs) throws Exception {
        PDDocument document = PDDocument.load(file.getInputStream());
        file.getInputStream().close();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        signatures.forEach(item -> {
            float width = item.getWidth() / scale;
            float height = item.getHeight() / scale;
            float left = item.getLeft() / scale;
            float top = item.getTop() / scale;
            float scaleX = item.getScaleX();
            float scaleY = item.getScaleY();
            // get page
            PDPage page = document.getPage(item.getMetadata().getPageActive());
            // load sign image
            try {
                PDImageXObject pdImage = PDImageXObject.createFromFile("D:\\Project\\bpm-camunda-7\\src\\main\\resources\\META-INF\\resources\\webjars\\camunda\\app\\tasklist\\scripts\\pdf-lib\\signature.png", document);
                PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                contentStream.drawImage(pdImage, left, page.getCropBox().getUpperRightY() - top - height * scaleY, width * scaleX, height * scaleY);
                contentStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        textInputs.forEach(item -> {

            float scaleX = item.getScaleX();
            float scaleY = item.getScaleY();
            float width = item.getWidth() / scale;
            float height = item.getHeight() / scale;
            float left = item.getLeft() / scale;
            float top = item.getTop() / scale;
            float fontSize = item.getFontSize() / scale * scaleX;
            String[] textLines = item.getTextLines();

            PDPage page = document.getPage(item.getMetadata().getPageActive());

            try {
                PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                contentStream.beginText();
                contentStream.setFont(PDType1Font.TIMES_ROMAN, fontSize);
                Arrays.stream(textLines).forEach(text -> {
                    try {
                        contentStream.newLineAtOffset(left, page.getCropBox().getUpperRightY() - top - height * scaleY);
                        contentStream.showText(text);
                        contentStream.newLine();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
                contentStream.endText();
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
