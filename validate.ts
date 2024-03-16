type field = {
    name: string,
    type: string,

}

let body: any = []
function getPost<T extends { [k: string]: any }>(fields: T): T {
    let Post: any = {}
    for (let k in fields) {
        switch (typeof fields[k]) {
            case 'string':
                if (typeof body[k] != 'string') {
                    body[k] = ''
                }
                break
        }
        Post[k] = body[k]
    }
    return ' ' as any
}
let post = getPost({
    board_id: 'string',
    title: 'required',
    images: [{ url: '' }]
})



