import jsonFile from 'jsonfile';
import base64UUID from './base64UUID';
import json1 from './chapter3.json';
console.log("Starting Pages Generation");
console.log("json: ", json1);
let base = `${__dirname}/`;
console.log("Dir: ",base);
let files = [
    `${base}chapter3.json`
];


let outFile = `${base}/all-course-pages.json`;

let pagesJson = {};
let count = 332;
files.forEach((filePath)=>{
    let json = jsonFile.readFileSync(filePath);
    let keys = Object.keys(json).sort((a, b)=>{
        return parseInt(a) - parseInt(b);
    });

    if(!keys.length)
        return;

    pagesJson = keys.reduce((pagesJson, key)=>{
        let id = count++;
        let page = json[key];
        page.prev = page.prev !== "" ? (id-1).toString() : "";
        page.next = page.next !== "" ? (id+1).toString() : "";
        page.id = id.toString();
        pagesJson[page.id] = page;
        return pagesJson;
    }, pagesJson);
});

jsonFile.writeFileSync(outFile, pagesJson);

console.log("Done Pages Generation");