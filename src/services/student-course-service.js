import ModelService from './model-service';
import studentCourseRecords from '../models/json-models/student-course';

class StudentCourseService extends ModelService {
    constructor(modelRecords) {
        super(modelRecords);
    }

    getStudentCourseAsync(courseId, predicate) {
        return new Promise((resolve, reject) => {
            let studentCourse = this.recordsArray.find((studentCourse)=>{
                return studentCourse.courseId === courseId && (!predicate ? true : predicate(studentCourse));
            });
            !studentCourse ? reject(new Error("student course not found")) : resolve(studentCourse); 
        });
    }

}

export default new StudentCourseService(studentCourseRecords);