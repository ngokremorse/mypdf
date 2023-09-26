package com.example.workflow.domain;

public class Signature {

    private float left;
    private float right;
    private float with;
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

    public float getRight() {
        return right;
    }

    public void setRight(float right) {
        this.right = right;
    }

    public float getWith() {
        return with;
    }

    public void setWith(float with) {
        this.with = with;
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
