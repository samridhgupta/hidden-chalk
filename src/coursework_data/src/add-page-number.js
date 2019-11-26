import coursePage from './course-page';
import jsonFile from 'jsonfile';

let pageKeys = Object.keys(coursePage).sort((a, b)=>{
    return parseInt(a) - parseInt(b);
});

let startNumber = 1;
let newObj = {};
pageKeys.forEach((key, index)=>{
    let page = coursePage[key];
    let prevPage = coursePage[page.prev];
    let prevPageNumber = prevPage ? prevPage.number : startNumber;
    let isNewSectionPage = !prevPage || prevPage.sectionId !== page.sectionId;
    page.number = isNewSectionPage ? startNumber : ++prevPageNumber
    newObj[key] = page; 
});

let outFile = `${__dirname}/../course-pages1.json`;
jsonFile.writeFileSync(outFile, newObj);
