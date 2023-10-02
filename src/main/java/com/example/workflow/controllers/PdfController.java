package com.example.workflow.controllers;

import com.example.workflow.domain.ITextInput;
import com.example.workflow.domain.Signature;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

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
//        Path resourceDirectory = Paths.get("src", "main", "resources");
//        String resourcePath = resourceDirectory.toFile().getAbsolutePath();
        URL resource = getClass().getResource("/META-INF/resources/signature.png");
        signatures.forEach(item -> {
            float scaleX = item.getScaleX();
            float scaleY = item.getScaleY();
            float width = item.getWidth() / scale * scaleX;
            float height = item.getHeight() / scale * scaleY ;
            float left = item.getLeft() / scale;
            float top = item.getTop() / scale;
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
            float scaleY = item.getScaleY();
            float left = item.getLeft() / scale;
            float top = item.getTop() / scale;
            float height = item.getHeight() / scale;
            float fontSize = item.getFontSize() / scale * scaleY;
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
        headers.set("Content-Disposition", "attachment; filename=test.pdf");
        headers.set("Content-Type", "application/pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(new ByteArrayInputStream(outputStream.toByteArray())));
    }
}
