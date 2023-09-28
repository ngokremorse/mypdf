package com.example.workflow.domain;

public class Signature {

    private float left;
    private float top;
    private float width;
    private float height;
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

    public float getLeft() {
        return left;
    }

    public void setLeft(float left) {
        this.left = left;
    }

    public float getTop() {
        return top;
    }

    public void setTop(float top) {
        this.top = top;
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

    public Metadata getMetadata() {
        return metadata;
    }

    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }
}
