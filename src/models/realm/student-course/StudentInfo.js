import RealmModel from '../RealmModel';
import StudentCourse from './StudentCourse';

class StudentInfo extends RealmModel {

    getModel() {
        return StudentInfo;
    }

    static _findStudentInfo(studentId) {
        return this.query(`studentId == '${studentId}'`)
            .then((studentInfos)=>{
                if(studentInfos.length < 1)
                    return Promise.reject({message: 'Cannot Find StudentInfo'});
                return studentInfos[0];
            });
    }

    static findOrCreateStudentInfo(studentId) {
        return this._findStudentInfo(studentId)
            .catch((err)=> this.create({studentId: studentId}));
    }

    get coursesEnrolled() {
        return this.courses.filtered("isEnrolled == true").length;
    }

    get coursesCompleted() {
        return this.courses.filtered("isCompleted == true").length;
    }

    get coursesInProgress() {
        return this.coursesEnrolled - this.coursesCompleted;
    }

    setNextCourse(course) {
        return this.getModel().dbWrite(() => this.nextCourse = course);
    }

    addCourse(course) {
        return this.getModel().dbWrite(() => {
            this.findCourseIndex(course) < 0 && this.courses.push(course);
        });
    }

    removeCourse(course) {
        return this.getModel().dbWrite(() => {
            let index = this.findCourseIndex(course);
            index >= 0 && this.courses.splice(index, 1);
        });
    }

    findCourseIndex(course) {
        return this.courses.findIndex((courseItem) => courseItem.courseId === course.courseId);
    }

    addAndLinkCourse(course) {
        return course.setStudentInfo(this)
            .then(()=>this.addCourse(course));
    }

}

StudentInfo.schema = {
    name: "StudentInfo",
    primaryKey: 'id',
    properties: {
        id: 'string',
        studentId: {type: 'string', indexed: true},
        nextCourse: {type: StudentCourse.schema.name, optional: true},
        courses: {type: 'list', objectType: StudentCourse.schema.name},
    }
}

export default StudentInfo;