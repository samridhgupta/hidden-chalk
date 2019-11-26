import ModelService from './model-service';
import studentPageRecords from '../models/json-models/student-page';

class StudentPageService extends ModelService {
    constructor(modelRecords) {
        super(modelRecords);
    }

    getStudentPageAsync(pageId, predicate) {
        return new Promise((resolve, reject) => {
            let studentPage = this.recordsArray.find((studentPage)=>{
                return studentPage.pageId === pageId && (!predicate ? true : predicate(studentPage));
            });
            !studentPage ? reject(new Error("Student Page not found")) : resolve(studentPage); 
        });
    }

}

export default new StudentPageService(studentPageRecords);