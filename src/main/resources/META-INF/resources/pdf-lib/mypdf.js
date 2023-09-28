var PDFTQT = function () {
    async function mergePdf(pdfUrls) {
        const pdfDocMerge = await PDFLib.PDFDocument.create();
        for (let i = 0; i < pdfUrls.length; i++) {
            const pdfUrl = pdfUrls[i];
            // red pdf
            const arrayBuffer = await fetch(pdfUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            for (let j = 0; j < pages.length; j++) {
                const [existingPage] = await pdfDocMerge.copyPages(pdfDoc, [j]);
                pdfDocMerge.addPage(existingPage);
            }
        }
        return pdfDocMerge;
    }

    // Merge more pdf to one pdf, and convert to byte[]
    this.mergePdfToBytes = async function (pdfUrls) {
        const pdfDocMerge = await mergePdf(pdfUrls);
        return pdfDocMerge.save();
    }

    // Merge more pdf to one pdf, and convert to base64
    this.mergePdfToBase64 = async function (pdfUrls) {
        const pdfDocMerge = await mergePdf(pdfUrls);
        return pdfDocMerge.saveAsBase64();
    }

    // Download file pdf with filename from byte[]
    this.downloadPdf = function (pdfBytes, fileName) {
        const blob = new Blob([pdfBytes], {type: "application/pdf"});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }
    // create url form byte[]
    this.getPdfUrl = function (pdfBytes) {
        return URL.createObjectURL(new Blob([pdfBytes], {type: "application/pdf"}));
    }


    //=======================  EDITOR  ====================
    this.PDFEditor = function () {
        this.scale = 1;
        let pageCanvas = [];
        let canvasActive = 0;
        let pdfLoad;
        let containerIdCurrent;
        let mousePosition = {
            x: 0,
            y: 0
        };

        this.exportData = function () {
            return {
                scale: this.scale,
                components: this.getComponents()
            }
        }

        this.reloadPdf = async function () {
            pageCanvas = [];
            const container = document.getElementById(containerIdCurrent);
            container.innerHTML = "";
            await loadPage(container, pdfLoad, 1);
        }

        // ========= Interface ==========================
        // load pdf from url show on document element with containerId
        // pdfSrc: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters

        let resizeTimer;
        let that = this;
        async function resizeFunction() {
            const components = that.getComponents();
            const scaleOld = that.scale;
            await that.reloadPdf(containerIdCurrent);
            const scaleNew = that.scale / scaleOld;
            that.loadComponents(components, scaleNew);
        }

        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeFunction, 500);
        });

        this.loadPdf = async function (containerId, pdfSrc) {
            containerIdCurrent = containerId;
            const container = document.getElementById(containerId);
            container.innerHTML = "";
            container.style.width = "100%";
            container.style.height = "100vh";
            container.style.overflowY = "scroll";
            const loadingTask = await pdfjsLib.getDocument(pdfSrc);
            pdfLoad = await loadingTask.promise;
            await loadPage(container, pdfLoad, 1);
        }

        // load components, component is fabric object
        this.loadComponents = function (components, scaleNew) {
            scaleNew = scaleNew || 1;
            components.forEach(item => {
                const objects = item.objects || item._objects;
                objects.forEach(com => {
                    com.width = com.width * scaleNew;
                    com.height = com.height * scaleNew;
                    if (com.fontSize) com.fontSize = com.fontSize * scaleNew;
                });
                item.top = item.top * scaleNew;
                item.left = item.left * scaleNew;
                item.width = item.width * scaleNew;
                item.height = item.height * scaleNew;
                if (item.type === 'group') {
                    loadGroupOnCanvas(item);
                }
            });
        }

        this.addGroup = function (text, width, height, background, metadata) {
            width = width ? width : 75 * that.scale;
            height = height ? height : 50 * that.scale;
            background = background ? background : 'green';
            text = text ? text : Date.now().toString().substr(0, 3);
            let left = mousePosition.x - width / 2;
            let top = mousePosition.y - height / 2;
            metadata = metadata ? metadata : {
                id: Date.now().toString().substr(0, 3)
            };
            let metadataMerge = {
                name: text,
                pageActive: canvasActive,
                editable: true
            };
            metadataMerge = {
                ...metadataMerge,
                ...metadata
            };
            const fText = new fabric.Text(text, {
                fontSize: width * 15 / 100,
                originX: 'center',
                originY: 'center',
            });

            const rect = new fabric.Rect({
                width: width,
                height: height,
                originX: 'center',
                originY: 'center',
                fill: background,
            });

            const options = {
                left: left > 0 ? left : 0,
                top: top > 0 ? top : 0,
                lockScalingFlip: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true
            }
            const group = new fabric.Group([rect, fText], options);
            group.metadata = metadataMerge;
            const fCanvas = pageCanvas[metadataMerge.pageActive];
            fCanvas.add(group);
            fCanvas.setActiveObject(group);
            fCanvas.renderAll();
        }

        this.addRect = function (width, height, background, metadata) {
            width = width ? width : 150;
            height = height ? height : 100;
            background = background ? background : 'green';
            let left = mousePosition.x - width / 2;
            let top = mousePosition.y - height / 2;
            metadata = metadata ? metadata : {
                id: Date.now().toString()
            };
            let metadataMerge = {
                pageActive: canvasActive,
                editable: true
            };
            metadataMerge = {
                ...metadataMerge,
                ...metadata
            };

            const rect = new fabric.Rect({
                left: left,
                top: top,
                width: width,
                height: height,
                fill: background,
                lockScalingFlip: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true
            });
            rect.metadata = metadataMerge;
            const fCanvas = pageCanvas[metadataMerge.pageActive];
            fCanvas.add(rect);
            fCanvas.setActiveObject(rect);
            fCanvas.renderAll();
        }

        this.removeComponentSelected = function () {
            const objectActive = pageCanvas[canvasActive].getActiveObject();
            objectActive.canvas.remove(objectActive);
        }

        this.replaceGroupToImage = function (group, imageUrl) {
            fabric.Image.fromURL(imageUrl, (myImg) => {
                const img = copyAttributeComponent(group, myImg);
                group.canvas.add(img);
                group.canvas.remove(group);
                myImg.canvas.setActiveObject(img);
            });
        }

        this.hiddenComponent = function (component) {
            component.visible = false;
            component.canvas.discardActiveObject(component);
            component.canvas.renderAll();
        }

        this.showComponent = function (component) {
            component.visible = true;
            component.canvas.renderAll();
        }

        this.getComponents = function () {
            let components = [];
            pageCanvas.forEach(page => page.getObjects().forEach(item => {
                components.push(item);
            }));
            return components;
        }
        this.saveAsByte = async function () {
            const pdfDoc = await PDFLib.PDFDocument.create();
            for (let i = 0; i < pageCanvas.length; i++) {
                let canvas = pageCanvas[i];
                let canvasToImage = canvas.toDataURL("image/png", 1);
                const imageEmbed = await pdfDoc.embedPng(canvasToImage);
                const page = await pdfDoc.addPage([imageEmbed.width, imageEmbed.height]);
                page.drawImage(imageEmbed, {
                    x: 0,
                    y: 0,
                    width: imageEmbed.width,
                    height: imageEmbed.height
                });
            }
            return await pdfDoc.save();
        }

        // ========== Util ================//
        async function loadPage(container, pdf, index) {
            if (index > pdf.numPages) return;
            const page = await pdf.getPage(index);
            let viewport = page.getViewport({scale: 1});
            const scaleCurrent = Math.round(container.offsetWidth / viewport.width * 100) / 100;
            viewport = page.getViewport({scale: scaleCurrent});
            that.scale = scaleCurrent;
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-canvas';
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.id = 'pdf-canvas-' + index;
            container.appendChild(canvas);
            const context = canvas.getContext('2d');

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;
            const background = canvas.toDataURL("image/png");
            const fCanvas = new fabric.Canvas(canvas.id, {
                freeDrawingBrush: {
                    width: 1,
                    color: 'red'
                }
            });
            fCanvas.setBackgroundImage(background, fCanvas.renderAll.bind(fCanvas));
            fCanvas.upperCanvasEl.onclick = (e) => {
                canvasActive = index - 1;
                const pointer = fCanvas.getPointer(e);
                mousePosition.x = pointer.x;
                mousePosition.y = pointer.y;
            };
            // fCanvas.isDrawingMode = true;
            pageCanvas.push(fCanvas);
            await loadPage(container, pdf, index + 1);
        }

        function loadGroupOnCanvas(groupObject) {
            const groupCopy = copyGroup(groupObject);
            const fCanvas = pageCanvas[groupObject.metadata.pageActive];
            fCanvas.add(groupCopy);
            fCanvas.renderAll();
        }


        function copyAttributeComponent(componentOld, componentNew) {
            componentNew.left = componentOld.left;
            componentNew.top = componentOld.top;
            componentNew.metadata = componentOld.metadata;
            componentNew.set({
                scaleX: componentOld.width / componentNew.width,
                scaleY: componentOld.height / componentNew.height
            });
            return componentNew;
        }

        function copyGroup(groupObject) {
            const objects = groupObject.objects || groupObject._objects;
            const fText = new fabric.Text(groupObject.metadata.name, {
                ...objects[1],
                fontSize: objects[1].fontSize || objects[0].width * 15 / 100,
            });

            const rect = new fabric.Rect({
                width: objects[0].width,
                height: objects[0].height,
                originX: objects[0].originX,
                originY: objects[0].originY,
                fill: objects[0].fill,
            });
            const groupCopy = new fabric.Group([rect, fText], {
                width: groupObject.width,
                height: groupObject.height,
                left: groupObject.left,
                top: groupObject.top,
                lockScalingFlip: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                selectable: groupObject.metadata.editable
            });
            groupCopy.metadata = groupObject.metadata;
            return groupCopy;
        }
    }
}

//  ============== Extend Fabric ================= //
fabric.Object.prototype.toObject = (function (toObject) {
    return function () {
        return fabric.util.object.extend(toObject.call(this), {
            metadata: this.metadata
        });
    };
})(fabric.Object.prototype.toObject);