const { log } = console

onClick(".modal-close-btn", (ele) => {
    close_modal()
})

// open a modal
onClick(".modal_btn", async function (ele) {
    handle_component_btn_click(ele, async (component, data, action_url) => {
        let modal = before_modal_submit(component, ele.getAttribute("title"))
        let res = await jsonPost(action_url, data)
        after_modal_submit(res)
    })
})

// target modal 
function before_modal_submit(component, title = null) {
    let modal = document.querySelector(".commonModal")
    if (!modal) {
        component.insertAdjacentHTML("beforeend", modal_template());
        modal = document.querySelector(`.commonModal`)
        modal.style.display = 'block'
    }
    if (title) {
        document.querySelector(`.modal-title`).innerHTML = title
    }
    return modal
}
function after_modal_submit(res) {
    document.querySelector(`.modal-body`).style.maxHeight = '700px'
    setTimeout(() => {
        document.querySelector(`.modal-body`).style.overflowY = 'auto'
    }, 160);
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
        modal_body.innerHTML = res.content
    }
    setTimeout(() => {
        modal_body.querySelectorAll('input[type="text"],input[type="password"],textarea')[0]?.focus()
    }, 100);
}

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
        }
        else {
            component_handle_res(component, res)
        }
        component.querySelectorAll("button").forEach(function (btn) {
            btn.disabled = false
        })
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
        const formDataObject = Object.fromEntries(Array.from(formData.keys(), key => {
            const val = formData.getAll(key)
            return [key, val.length > 1 ? val : val.pop()]
        }))
        data = { ...data, ...formDataObject }
        component.querySelector(".form-error-box").style.display = 'none'
        if (ele.classList.contains("target_modal")) {
            before_modal_submit(component)
        }
        let res = await jsonPost(action_url, data)
        remove_loader(ele)
        component.classList.remove("submitting")
        if (res.err) {
            component.querySelector(".form-error-box").innerHTML = res.err
            component.querySelector(".form-error-box").style.display = 'block'
            component.classList.remove("submitting")
        }
        else {
            if (ele.classList.contains("target_modal")) {
                after_modal_submit(res)
            }
            else {
                component_handle_res(component, res)
            }
        }
    })
})
function add_loader(ele) {
    if (ele) {
        ele.insertAdjacentHTML("beforeend", `<div class="loader"></div>`)
    }
}
function remove_loader(ele) {
    ele?.querySelector(".loader")?.remove()
}
// close modal by Esc key
function escapeHtml(s) {
    return s.replace(
        /[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g,
        c => '&#' + ('000' + c.charCodeAt(0)).slice(-4) + ';'
    )
}

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
    else {
        if (live_modal) {
            live_modal.remove()
        }
    }
    let name = component.getAttribute('name')
    let key = component.getAttribute('key')
    if (typeof res.css == 'string' && res.css.length > 0) {
        update_dynamic_css(res.css)
    }

    if (typeof res.content == 'string') {
        if (res.content == '') {
            component.style.height = component.offsetHeight + 'px'
            component.style.overflow = 'hidden'
            setTimeout(() => {
                component.style.height = '1px'
            }, 10);
            setTimeout(() => {
                component.remove()
            }, 210);
        }
        else {
            component.innerHTML = res.content
            // let div = document.createElement('div');
            // div.innerHTML = res.html;
            // traverseNodes(component, div, 0)

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
        component = document.querySelector(arr[0]).closest(".component")
    }
    else {
        component = ele.closest('.component')
    }
    if (!component) {
        log('component not found')
        return
    }
    let component_name = component.getAttribute("name")
    let action_url = '/action/' + component_name + '/' + component_action
    log('action_url', action_url)
    let data = {}
    data['component_key'] = component.getAttribute('key')
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
                <div class="modal-head">
                    <div class="modal-title"></div>
                    <span class="modal-close-btn">&times;</span>
                </div>
                <div class="modal-body">
                    <div style="padding:50px 10px">
                    <div class="loader"></div>
                    </div>
                </div>
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

// auto height textarea
document.addEventListener("input", function (e) {
    if (e.target.classList.contains("autoheight")) {
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + "px";
    }
}, false);


// json post
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
    let j = await response.json()
    log('response.json()', j)
    return j;
}
function on(eventName, target, callback) {
    document.addEventListener(eventName, (event) => {
        if (event.target.closest(target)) {
            event.preventDefault()
            callback(event.target.closest(target), event)
        }
        return false
    })
}

function onClickOutside(target, callback) {
    document.addEventListener("click", (event) => {
        if (!event.target.closest(target)) {
            callback()
        }
    })
}

function onSubmit(target, callback) {
    on("submit", target, callback)
}
function onClick(target, callback) {
    on("click", target, callback)
}

// dropdown
on("click", ".dropdown-btn", function (ele) {
    let dropdown = ele.closest(".dropdown")
    let body = dropdown.querySelector(".dropdown-body")
    log('ele.offsetHeight', ele.offsetHeight)
    body.style.top = '50px'
    body.style.display = 'block'
    body.style.opacity = 0
    setTimeout(() => {
        body.style.opacity = 1.0
        body.style.top = ele.offsetHeight + 5 + 'px'
    }, 1);
})
onClickOutside(".dropdown", function () {
    Array.from(document.getElementsByClassName("dropdown-body")).forEach(element => {
        element.style.display = 'none'
    });
})


// handler node changing
// let showed = false
function traverseNodes(originalNode, newNode, depth) {
    const isListView = originalNode.classList.contains('indexedList');
    // loop original node detect removed elements
    let index = 0
    originalNode.childNodes.forEach(originalChild => {
        if (originalChild.nodeType === Node.ELEMENT_NODE) {
            let newChild
            if (isListView) {
                const idx = originalChild.getAttribute('idx');
                newChild = newNode.querySelector(`[idx="${idx}"]`);

                if (!newChild) {
                    // remove node
                    slideUp(originalChild)
                } else if (originalChild.innerHTML != newChild.innerHTML) {
                    // modify node
                    // newChild.style.background = "green"
                }
            } else {
                // if not listview, only considering modify
                newChild = newNode.children[index];
                if (!newChild || newChild.innerHTML == "") {
                    slideUp(originalChild)
                }
                else {
                    originalChild.innerHTML = newChild.innerHTML
                }
                /*
                // developing: animated
                index++
                if (originalChild?.firstChild?.nodeType === 1 && depth <= 5) {
                    traverseNodes(originalChild, newChild, depth + 1);
                }
                else {
                    if (!newChild || newChild.innerHTML == "") {
                        slideUp(originalChild)
                    }
                    else if (originalChild.innerHTML !== newChild.innerHTML) {
                        originalChild.innerHTML = newChild.innerHTML
                    }
                    else if (originalChild.innerHTML !== newChild.innerHTML) {
                        originalChild.innerHTML = newChild.innerHTML
                        originalChild.classList.add("fadeIn")
                        originalChild.style.opacity = 0
                        setTimeout(() => {
                            originalChild.style.opacity = 1
                        }, 100);
                    }
                }
                */
            }
        }
    });
    if (isListView) {
        // loop new node
        newNode.childNodes.forEach(newChild => {
            if (newChild.nodeType === Node.ELEMENT_NODE) {
                const idx = newChild.getAttribute('idx');
                const originalChild = originalNode.querySelector(`[idx="${idx}"]`);
                if (!originalChild) {
                    // insert new node
                    // slideDown(newChild)
                    newChild.classList.add("slideDown")
                }
            }
        });
        originalNode.innerHTML = newNode.innerHTML
    }
}
function slideUp(element, duration = 500) {
    log('element.offsetHeight', element.offsetHeight)
    element.style.height = element.offsetHeight + "px"
    element.style.transition = "height 500ms ease-in"
    element.style.overflow = "hidden"
    setTimeout(() => {
        element.style.height = "0px"
    }, 10);

}