import ModelService from './model-service';
import studentCourseModuleRecords from '../models/json-models/student-module';

class StudentCourseModuleService extends ModelService {
    
    constructor(modelRecords) {
        super(modelRecords);
    }
    
    getStudentModuleAsync(moduleId, predicate) {
        return new Promise((resolve, reject) => {
            let studentModule = this.recordsArray.find((studentModule)=>{
                return studentModule.moduleId === moduleId && (!predicate ? true : predicate(studentModule));
            });
            !studentModule ? reject(new Error("Student Module not found")) : resolve(studentModule); 
        });
    }

}

export default new StudentCourseModuleService(studentCourseModuleRecords);