import ModelService from './model-service';
import studentSectionRecords from '../models/json-models/student-section';

class StudentSectionService extends ModelService {
    constructor(modelRecords) {
        super(modelRecords);
    }

    getStudentSectionAsync(sectionId, predicate) {
        return new Promise((resolve, reject) => {
            let studentSection = this.recordsArray.find((studentSection)=>{
                return studentSection.sectionId === sectionId && (!predicate ? true : predicate(studentSection));
            });
            !studentSection ? reject(new Error("Student Section not found")) : resolve(studentSection); 
        });
    }

}

export default new StudentSectionService(studentSectionRecords);