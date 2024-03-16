const { log } = console

onClick(".modal-close-btn", (ele) => {
    close_modal()
})

// open a modal
onClick(".modal_btn", async function (ele) {
    handle_component_btn_click(ele, async (component, data, action_url) => {
        // check modl already exists
        let modal = document.querySelector(".commonModal")
        if (!modal) {
            component.insertAdjacentHTML("beforeend", modal_template());
            modal = document.querySelector(`.commonModal`)
            modal.style.display = 'block'
        }
        let res = await jsonPost(action_url, data)
        if (typeof res == 'string') {
            res = JSON.parse(res)
        }
        if (typeof res.css == 'string' && res.css.length > 0) {
            update_dynamic_css(res.css)
        }
        let modal_body = document.querySelector(`.modal-body`)
        if (res.err) {
            modal_body.innerHTML = res.err
        }
        else {
            modal_body.innerHTML = res.html
        }
        setTimeout(() => {
            modal_body.querySelectorAll('input[type="text"],input[type="password"],textarea')[0]?.focus()
        }, 100);
    })
})

// insert updated dynamic css
function update_dynamic_css(css) {
    log('updating css', css)
    document.getElementById("dstyle").insertAdjacentHTML("beforeend", css)
}

// close modal by esc button
document.onkeyup = function (e) {
    if (e.key === "Escape") {
        close_modal()
    }
};

// general component button clicking
onClick(".component_btn", async function (ele) {
    handle_component_btn_click(ele, async (component, data, action_url) => {
        component.querySelectorAll("button").forEach(function (btn) {
            btn.disabled = true
        })
        let res = await jsonPost(action_url, data)
        if (res.err) {
            alert(res.err)
            component.querySelectorAll("button").forEach(function (btn) {
                btn.disabled = false
            })
        }
        else {
            component_handle_res(component, res)
        }
    })
})

// component form
onSubmit(".component_form", async (ele) => {
    handle_component_btn_click(ele, async (component, data, action_url) => {
        if (component.classList.contains("submitting")) {
            log('is submitting..')
            return
        }
        let error_box = component.querySelector(".form-error-box")
        if (!error_box) {
            error_box = document.createElement("div")
            error_box.classList.add("form-error-box")
            ele.insertAdjacentElement("beforeend", error_box)
        }
        add_loader(ele)
        component.classList.add("submitting")
        const formData = new FormData(ele);
        const formDataObject = Object.fromEntries(formData.entries());
        data = { ...data, ...formDataObject }
        log('data', data)
        component.querySelector(".form-error-box").style.display = 'none'
        let res = await jsonPost(action_url, data)
        component.classList.remove("submitting")
        if (res.err) {
            component.querySelector(".form-error-box").innerHTML = res.err
            component.querySelector(".form-error-box").style.display = 'block'
            component.classList.remove("submitting")
        }
        else {
            component_handle_res(component, res)
        }
        remove_loader(ele)
    })
})
function add_loader(ele) {
    ele.insertAdjacentHTML("beforeend", `<div class="loader"></div>`)
}
function remove_loader(ele) {
    ele.querySelector(".loader").remove()
}
// close modal by Esc key
function escapeHtml(s) {
    return s.replace(
        /[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g,
        c => '&#' + ('000' + c.charCodeAt(0)).slice(-4) + ';'
    )
}

// upload image
let image_boxes = {}
on("change", ".form_image_input", async function (ele) {
    let box_id = ele.getAttribute("box_id")
    if (!box_id) {
        log('can not find box_id')
        return
    }
    let box = image_boxes[box_id]
    let r1 = await jsonPost('/action/builtin_image/beforuploading', {})
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

//
function component_handle_res(component, res) {
    log('handle res', res)
    let live_modal = document.querySelector(".commonModal")
    if (res.act == 'redirect') {
        log('redirecting')
        window.location.href = res.url;
        return
    }
    else if (res.act == 'refresh') {
        log('refreshing')
        window.location.reload();
        return
    }
    else if (res.method == 'modal') {
        log('create modal')
        if (!live_modal) {
            component.insertAdjacentHTML("beforeend", modal_template())
            let live_modal = document.querySelector(".commonModal")
        }

        live_modal.querySelector(".modal-body").innerHTML = res.content
        // cm.fadeIn("fast")
        setTimeout(() => {
            live_modal.querySelector(`input[type="text"],input[type="password"], textarea`).focus();
        }, 100);
        return
    }
    else {
        if (live_modal) {
            live_modal.remove()
        }
    }
    let name = component.getAttribute('name')
    let key = component.getAttribute('key')
    let cmts = []
    document.querySelectorAll(`component[name='${name}'][key='${key}']`).forEach(function (e) {
        cmts.push(e)
    })
    if (typeof res.css == 'string' && res.css.length > 0) {
        update_dynamic_css(res.css)
    }
    for (let cmt of cmts) {
        if (res.method == 'before') {
            cmt.insertAdjacentHTML("beforebegin", res.content)
        }
        else if (res.method == 'after') {
            cmt.insertAdjacentHTML("afterend", res.content)
        }
        else if (res.method == 'append') {
            cmt.insertAdjacentHTML("beforeend", res.content)
        }
        else if (res.method == 'prepend') {
            cmt.insertAdjacentHTML("afterbegin", res.content)
        }
        else if (typeof res.html == 'string') {
            if (res.html == '') {
                cmt.remove()
            }
            else {
                cmt.innerHTML = res.html;

            }
        }

        else {

        }
    }
}

function handle_component_btn_click(ele, cb) {
    let component
    let component_action = ele.getAttribute("component-action")
    if (!component_action) {
        log('no action')
        return
    }
    if (component_action.match(':')) {
        let arr = component_action.split(':')
        component_action = arr[1]
        component = document.querySelector(arr[0]).closest("component")
    }
    else {
        component = ele.closest('component')
    }
    if (!component) {
        log('component not found')
        return
    }
    let action_url = '/action/' + component.getAttribute('name') + '/' + component_action
    log('action_url', action_url)
    let data = { component_key: component.getAttribute('key') }
    if (ele.getAttribute('data-postdata')) {
        let postdata = JSON.parse(ele.getAttribute('data-postdata'))
        for (let [k, v] of Object.entries(postdata)) {
            data[k] = v
        }
    }
    cb(component, data, action_url)
}
function modal_template() {
    setTimeout(() => {
        document.getElementsByClassName("modal-container")[0].style.opacity = 1
        document.getElementsByClassName("modal-content")[0].style.transform = 'scale(1)'
    }, 1);
    setTimeout(() => {
        document.getElementsByClassName("modal-content-container")[0].style.transform = 'scale(1)'
        document.getElementsByClassName("modal-container")[0].style.transition = 'opacity 0.1s linear';
    }, 150);
    return `<div  class="commonModal modal-container">
    <div class="modal">
        <div class="modal-content-container">
            <div class="modal-content">
                <div class="modal-title"><span class="modal-close-btn">&times;</span></div>
                <div class="modal-body"><div class="loader"></div></div>
            </div>
        </div>
    </div>
    </div>`
}

function close_modal() {
    let ele = document.getElementsByClassName("modal-container")[0]
    if (ele) {
        document.getElementsByClassName("modal-content")[0].style.transform = 'scale(0.5)'
        ele.style.opacity = 0
        setTimeout(() => {
            ele.remove()
        }, 200);
    }
}


async function jsonPost(url = "", data = {}) {
    log('posting ', url, "\ndata ", data)
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "error",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
    });
    return await response.json();
}
function on(eventName, target, callback) {
    document.addEventListener(eventName, (event) => {
        if (event.target.closest(target)) {
            event.preventDefault()
            callback(event.target.closest(target))
        }
    })
}
function onSubmit(target, callback) {
    on("submit", target, callback)
}
function onClick(target, callback) {
    on("click", target, callback)
}