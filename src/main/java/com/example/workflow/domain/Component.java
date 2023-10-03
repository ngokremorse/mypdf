package com.example.workflow.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class Component {

    private String type;
    private float left;
    private float top;
    private float width;
    private float height;
    private Metadata metadata;
    private String text;
    private String[] textLines;
    private float fontSize;
    private float scaleX = 1f;
    private float scaleY = 1f;
    private BoundingRect boundingRect;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BoundingRect {
        private float left;
        private float top;
        private float width;
        private float height;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Metadata {
        private int pageActive;
        private String id;
        private String name;
    }
}
