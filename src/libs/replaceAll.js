
let replaceAll = (text, regEx, callback) => {
    let newText = text.replace(regEx, callback);
    if(newText === text)
        return newText;
    return replaceAll(newText, regEx, callback);
}

export default replaceAll;