package com.example.workflow.domain;

public class ITextInput {

    private float top;
    private float left;
    private float width;
    private float height;
    private String text;
    private String[] textLines;
    private float fontSize;
    private float scaleX = 1f;
    private float scaleY = 1f;
    private float cacheTranslationX;
    private float cacheTranslationY;
    private Signature.Metadata metadata;

    public ITextInput(float top, float left, float width, float height, String text, String[] textLines, float fontSize) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.text = text;
        this.textLines = textLines;
        this.fontSize = fontSize;
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

    public Signature.Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Signature.Metadata metadata) {
        this.metadata = metadata;
    }

    public float getScaleX() {
        return scaleX;
    }

    public void setScaleX(float scaleX) {
        this.scaleX = scaleX;
    }

    public float getScaleY() {
        return scaleY;
    }

    public void setScaleY(float scaleY) {
        this.scaleY = scaleY;
    }

    public float getCacheTranslationX() {
        return cacheTranslationX;
    }

    public void setCacheTranslationX(float cacheTranslationX) {
        this.cacheTranslationX = cacheTranslationX;
    }

    public float getCacheTranslationY() {
        return cacheTranslationY;
    }

    public void setCacheTranslationY(float cacheTranslationY) {
        this.cacheTranslationY = cacheTranslationY;
    }
}
