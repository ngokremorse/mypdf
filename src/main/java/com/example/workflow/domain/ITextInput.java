package com.example.workflow.domain;

public class ITextInput {

    private float top;
    private float left;
    private float width;
    private float height;
    private String text;
    private String[] textLines;
    private float fontSize;
    private Metadata metadata;
    public static class Metadata {
        private int pageActive;
        private int id;
        private String name;

        public int getPageActive() {
            return pageActive;
        }

        public void setPageActive(int pageActive) {
            this.pageActive = pageActive;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
    public  ITextInput(){

    }
    public float getTop() {
        return top;
    }

    public void setTop(float top) {
        this.top = top;
    }

    public float getLeft() {
        return left;
    }

    public void setLeft(float left) {
        this.left = left;
    }

    public float getWidth() {
        return width;
    }

    public void setWidth(float width) {
        this.width = width;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height) {
        this.height = height;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public float getFontSize() {
        return fontSize;
    }

    public void setFontSize(float fontSize) {
        this.fontSize = fontSize;
    }

    public String[] getTextLines() {
        return textLines;
    }

    public void setTextLines(String[] textLines) {
        this.textLines = textLines;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }
}
