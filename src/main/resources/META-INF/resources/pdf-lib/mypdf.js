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
        let that = this;
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

        function createBoxShadow() {
            const loadingBackground = document.createElement("div");
            const content = document.createElement("h1");
            content.innerText = "Loading...";
            content.style.textAlign = "center";
            content.style.margin = "50vh auto";
            content.style.color = "red";
            loadingBackground.appendChild(content);
            loadingBackground.style.width = "100%";
            loadingBackground.style.height = "100vh";
            loadingBackground.style.position = "absolute";
            loadingBackground.style.zIndex = "100";
            loadingBackground.style.background = "rgba(180, 180, 180, 0.8)";
            return loadingBackground;
        }

        this.reloadPdf = async function () {
            const components = this.getComponents();
            const scaleOld = this.scale;
            pageCanvas = [];
            const container = document.getElementById(containerIdCurrent);
            container.innerHTML = "";
            const boxShadow = createBoxShadow();
            container.appendChild(boxShadow);
            await loadPage(container, pdfLoad, 1);
            const scaleNew = that.scale / scaleOld;
            this.loadComponents(components, scaleNew);
            boxShadow.remove();
        }

        // ========= Interface ==========================
        // load pdf from url show on document element with containerId
        // pdfSrc: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters
        this.loadPdf = async function (containerId, pdfSrc) {
            containerIdCurrent = containerId;
            const container = document.getElementById(containerId);
            container.innerHTML = "";
            container.style.width = "100%";
            container.style.height = "100vh";
            container.style.overflowY = "scroll";
            const loadingTask = await pdfjsLib.getDocument(pdfSrc);
            container.style.background = "gray";
            pdfLoad = await loadingTask.promise;
            const boxShadow = createBoxShadow();
            container.appendChild(boxShadow);
            await loadPage(container, pdfLoad, 1);
            boxShadow.remove();
        }

        // load components, component is fabric object
        this.loadComponents = function (components, scaleNew) {
            scaleNew = scaleNew || 1;
            components.forEach(item => {
                item.top = item.top * scaleNew;
                item.left = item.left * scaleNew;
                item.width = item.width * scaleNew;
                item.height = item.height * scaleNew;
                if (item.type === 'group') {
                    const objects = item.objects || item._objects;
                    objects.forEach(com => {
                        com.width = com.width * scaleNew;
                        com.height = com.height * scaleNew;
                        if (com.fontSize) com.fontSize = com.fontSize * scaleNew;
                    });
                    loadGroupOnCanvas(item);
                } else if (item.type === "i-text") {
                    if (item.fontSize) item.fontSize = item.fontSize * scaleNew;
                    loadITextOnCanvas(item);
                }
            });
        }

        this.addIText = function (text, width, fontSize) {
            width = width ? width : 75 * that.scale;
            text = text ? text : "Typing something";
            fontSize = fontSize ? fontSize : 12;
            const itext = new fabric.IText(text, {
                width: width,
                fontSize: fontSize,
                left: 50,
                top: 70,
                fill: "black",
                selectionColor: "rgba(0,0,255,0.5)",
                lockScalingFlip: true,
                lockRotation: true
            });
            let metadataMerge = {
                name: text,
                pageActive: canvasActive,
                editable: true
            };
            itext.metadata = metadataMerge;

            const fCanvas = pageCanvas[canvasActive];
            fCanvas.add(itext);
            fCanvas.setActiveObject(itext);
            fCanvas.renderAll();

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
                // lockScalingX: true,
                // lockScalingY: true,
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
                // lockScalingX: true,
                // lockScalingY: true,
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
            let page = undefined;
            if (index < pdf._transport.pageCache.length) {
                page = pdf._transport.pageCache[index - 1];
            } else {
                page = await pdf.getPage(index);
            }
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
            const div = document.createElement("div");
            div.style.marginTop = "10px";
            container.appendChild(div);
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

        function loadITextOnCanvas(ItextObject) {
            const iText = new fabric.IText(ItextObject.text, {
                text: ItextObject.text,
                textLines: ItextObject.textLines,
                height: ItextObject.height,
                width: ItextObject.width,
                fontSize: ItextObject.fontSize || 12,
                left: ItextObject.left,
                top: ItextObject.top,
                fill: ItextObject.fill,
                selectionColor: ItextObject.selectionColor,
                lockScalingFlip: true,
                lockRotation: true,
                scaleX: ItextObject.scaleX,
                scaleY: ItextObject.scaleY,
                selectable: ItextObject.metadata.editable
            });
            iText.metadata = ItextObject.metadata;
            const fCanvas = pageCanvas[ItextObject.metadata.pageActive];
            fCanvas.add(iText);
            fCanvas.renderAll();
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
                // lockScalingX: true,
                // lockScalingY: true,
                lockRotation: true,
                scaleX: groupObject.scaleX,
                scaleY: groupObject.scaleY,
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