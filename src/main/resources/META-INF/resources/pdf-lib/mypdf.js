var PDFTQT = function () {
    async function mergePdf(pdfUrls) {
        const pdfDocMerge = await PDFLib.PDFDocument.create();
        for (let i = 0; i < pdfUrls.length; i++) {
            const pdfUrl = pdfUrls[i];
            // red pdf
            const arrayBuffer = await fetch(pdfUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            for (let j = 0; j < pdfDoc.getPageCount(); j++) {
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
        let pageCanvas = [];
        let canvasActive = 0;
        let mousePosition = {
            x: 0,
            y: 0
        };

        // ========= Interface ==========================
        // load pdf from url show on document element with containerId string | URL | TypedArray | ArrayBuffer | DocumentInitParameters
        this.loadPdf = async function (containerId, pdfSrc) {
            let loadingTask = await pdfjsLib.getDocument(pdfSrc);
            const pdf = await loadingTask.promise;
            await loadPage(containerId, pdf, 1);
        }

        // load components, component is fabric object
        this.loadComponents = function (components) {
            components.forEach((compo) => {
                if (compo.type === 'group') {
                    loadGroupOnCanvas(compo);
                }
            });
        }

        this.addGroup = function (text, width, height, background, metadata) {
            width = width ? width : 150;
            height = height ? height : 100;
            background = background ? background : 'green';
            text = text ? text : Date.now().toString();
            let left = mousePosition.x - width / 2;
            let top = mousePosition.y - height / 2;
            metadata = metadata ? metadata : {
                id: Date.now()
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
                if (item.type === 'group') {
                    let objects = item._objects.map(ob => {
                        if (ob.type === 'text') {
                            return {
                                ...ob.toObject(),
                                text: ob.text,
                                fontSize: ob.fontSize
                            }
                        }
                        return ob.toObject();
                    })
                    components.push({
                        ...item.toObject(),
                        objects: objects
                    })
                } else {
                    components.push(item);
                }
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
        async function loadPage(containerId, pdf, index) {
            if (index > pdf.numPages) return;
            let container = document.getElementById(containerId);
            container.style.width = "100%";
            container.style.height = "100vh";
            container.style.overflowY = "scroll";
            const page = await pdf.getPage(index);
            let viewport = page.getViewport({scale: 1});
            const scale = Math.floor(container.offsetWidth / viewport.width)
            viewport = page.getViewport({scale: scale});
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
            await loadPage(containerId, pdf, index + 1);
        }

        function loadGroupOnCanvas(groupObject) {
            fabric.Group.fromObject(groupObject, function (groupInstance){
                const fCanvas = pageCanvas[groupObject.metadata.pageActive];
                groupInstance.selectable = false;
                fCanvas.add(groupInstance);
                fCanvas.renderAll();
            });

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