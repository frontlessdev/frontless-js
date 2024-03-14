// first character is letter, so that is can be used for HTML class name and id
export function makeId(length = 8) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const lettersLength = letters.length;
    let counter = 0;
    while (counter < length) {
        if (counter == 0) {
            result += letters.charAt(Math.floor(Math.random() * lettersLength));
        }
        else {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        counter += 1;
    }
    return result;
}