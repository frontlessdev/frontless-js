
// upload image
let image_boxes = {}
on("change", ".form_image_input", async function (ele) {
      let box_id = ele.getAttribute("box_id")
      if (!box_id) {
            log('can not find box_id')
            return
      }
      let box = image_boxes[box_id]
      let r1 = await jsonPost('/action/api/image_beforuploading', {})
      log('getting preSignedUrl')
      if (r1.status != 'ok') {
            alert(r1.err ?? 'unable to get token')
            return
      }
      let btn = document.querySelector("#" + box_id)
      btn.style.display = 'none'
      btn.previousElementSibling.innerHTML = '<div class="spinner"></div>'
      log('uploading~~')
      var data = new FormData()
      data.append('file', ele.files[0])
      let r = await fetch(r1.preSignedUrl, { method: 'POST', body: data })
      let j = await r.json()
      log('j', j)
      if (j.err) {
            alert(j.err)
      }
      else if (j.status == 'ok') {
            log('uploaded successfully')
            box.entries.push(j)
      }
      update_image_box(box_id)
      ele.remove()
})
on("click", ".form_image_close_btn", function (ele) {
      remove_image_entry(ele.getAttribute("box_id"), ele.getAttribute("img_id"))
})
function remove_image_entry(box_id, img_id) {
      let box = image_boxes[box_id]
      box.entries.splice(box.entries.findIndex(e => e.id == img_id), 1)
      update_image_box(box_id)
}
function update_image_box(box_id) {
      let box = image_boxes[box_id]
      let btn = document.querySelector("#" + box_id)
      btn.previousElementSibling.innerHTML = ''
      if (box.entries.length >= box.max) {
            btn.style.display = 'none'
      }
      else {
            btn.style.display = ''
      }
      let image_preview = document.querySelector(".form_image_preview." + box_id)
      // update preview
      image_preview.innerHTML = ''
      let image_ids = []
      box.entries.map(image => {
            image_ids.push(image.id)
            image_preview.insertAdjacentHTML("beforeend", `<div><span class="form_image_close_btn" box_id="${box_id}" img_id="${image.id}">&#x2715;</span><img src="${image.s.url}" /></div>`)
      })
      // update form field
      document.querySelector(`.${box_id}[name="image_entries"]`).value = JSON.stringify(image_ids)

}
onClick(".form_image_btn", async function (ele) {
      let input = document.createElement("input")
      input.classList.add("form_image_input")
      input.name = 'image'
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'
      ele.insertAdjacentElement("afterend", input)
      let settings = JSON.parse(ele.getAttribute("settings"))
      let box_id = settings.id
      input.setAttribute('box_id', box_id)
      if (!image_boxes[box_id]) {
            image_boxes[box_id] = { max: settings.max, entries: [] }
      }
      input.click()
})



// avatar form

{
      const fileInput = document.getElementById('fileInput');
      let imageCanvas, maskCanvas, imageCtx, maskCtx;
      let img = new Image();
      let drag = false;
      let resize = false;
      let rect = { x: 0, y: 0, w: 200, h: 200 };

      onClick(".form_avatar_btn", async function (ele) {
            let input = document.createElement("input")
            input.classList.add("form_avatar_input")
            input.name = 'image'
            input.type = 'file'
            input.accept = 'image/*'
            input.style.display = 'none'
            ele.insertAdjacentElement("afterend", input)
            input.click()
      })

      on("change", ".form_avatar_input", async function (ele) {
            imageCanvas = document.createElement('canvas');
            maskCanvas = document.createElement('canvas');
            maskCanvas.classList.add("maskCanvas")
            imageCanvas.style.position = 'absolute';
            maskCanvas.style.position = 'absolute';

            let reader = new FileReader();
            reader.onload = function (e) {
                  img.onload = function () {
                        let scale = Math.max(200 / img.width, 200 / img.height);
                        imageCanvas.width = img.width * scale;
                        imageCanvas.height = img.height * scale;
                        maskCanvas.width = img.width * scale;
                        maskCanvas.height = img.height * scale;
                        rect.x = (imageCanvas.width - rect.w) / 2;
                        rect.y = (imageCanvas.height - rect.h) / 2;
                        drawImageAndRect();
                  }
                  img.src = e.target.result;
            }
            reader.readAsDataURL(ele.files[0]);
            let cmt = ele.closest(".component")
            cmt.insertAdjacentHTML("beforeend", modal_template())
            document.querySelector(".modal-title").innerHTML = 'Avatar'
            document.querySelector(".modal-body").style.maxHeight = '700px'
            document.querySelector(".modal-body").style.height = '400px'
            document.querySelector(".modal-body").innerHTML = ``
            document.querySelector(".modal-body").appendChild(imageCanvas);
            document.querySelector(".modal-body").appendChild(maskCanvas);
            document.querySelector(".modal-body").insertAdjacentHTML("beforeend", `<button class="avatar_submit" style="position:absolute;bottom:10px">Submit</button>`)
            imageCtx = imageCanvas.getContext('2d');
            maskCtx = maskCanvas.getContext('2d');
      })

      function drawImageAndRect() {
            imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            maskCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
            maskCtx.clearRect(rect.x, rect.y, rect.w, rect.h);
            maskCtx.strokeStyle = 'red';
            maskCtx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            maskCtx.fillRect(rect.x + rect.w - 5, rect.y + rect.h - 5, 10, 10);
      }
      on("mousedown", ".maskCanvas", function (ele, e) {
            let rectX = e.clientX - maskCanvas.getBoundingClientRect().left;
            let rectY = e.clientY - maskCanvas.getBoundingClientRect().top;
            if (Math.abs(rectX - rect.x - rect.w) < 10 && Math.abs(rectY - rect.y - rect.h) < 10) {
                  resize = true;
                  maskCanvas.style.cursor = 'nwse-resize';
            } else if (rectX > rect.x && rectX < rect.x + rect.w && rectY > rect.y && rectY < rect.y + rect.h) {
                  drag = true;
                  maskCanvas.style.cursor = 'move';
            }
      });
      on("mousemove", ".maskCanvas", function (ele, e) {
            let rectX = e.clientX - maskCanvas.getBoundingClientRect().left;
            let rectY = e.clientY - maskCanvas.getBoundingClientRect().top;
            if (resize) {
                  let size = Math.max(rectX - rect.x, rectY - rect.y, 50);
                  rect.w = Math.min(size, maskCanvas.width - rect.x);
                  rect.h = Math.min(size, maskCanvas.height - rect.y);
            } else if (drag) {
                  rect.x = Math.min(Math.max(0, rectX - rect.w / 2), maskCanvas.width - rect.w);
                  rect.y = Math.min(Math.max(0, rectY - rect.h / 2), maskCanvas.height - rect.h);
            }

            drawImageAndRect();
      });
      on("mouseup", ".maskCanvas", function (e) {
            drag = false;
            resize = false;
            maskCanvas.style.cursor = 'default';
      });
      on("click", ".avatar_submit", async function (ele) {
            let cmt = ele.closest(".component")
            let selectedCanvas = document.createElement('canvas');
            selectedCanvas.width = rect.w;
            selectedCanvas.height = rect.h;
            let selectedCtx = selectedCanvas.getContext('2d');
            selectedCtx.drawImage(imageCanvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
            let selectedImageDataURL = selectedCanvas.toDataURL();
            // Convert data URL to Blob
            let byteString = atob(selectedImageDataURL.split(',')[1]);
            let mimeString = selectedImageDataURL.split(',')[0].split(':')[1].split(';')[0]
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
            }
            let blob = new Blob([ab], { type: mimeString });
            close_modal()
            cmt.querySelector(".form_image_loader").innerHTML = '<div class="spinner"></div>'
            let r = await upload_avatar(blob)
            cmt.querySelector(".form_image_loader").innerHTML = ''
            if (r.status == 'ok') {
                  log('assign entry', r)
                  cmt.querySelector(".avatar_preview").innerHTML = `<img src="${r.s.url}" />`
                  cmt.querySelector("[name='image_entries']").value = JSON.stringify([r.id])
            }
            else {
                  alert('unable to upload')
            }
      });

      async function upload_avatar(blob) {
            let r1 = await jsonPost('/action/api/image_beforuploading', {})
            if (r1.status != 'ok') {
                  alert(r1.err ?? 'unable to get token')
                  return
            }
            log('uploading~~')
            var data = new FormData()
            data.append('file', blob, 'avatar.png')
            let r = await fetch(r1.preSignedUrl, { method: 'POST', body: data })
            let j = await r.json()
            return j

      }

}