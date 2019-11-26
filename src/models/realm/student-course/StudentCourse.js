import RealmModel from '../RealmModel';
import StudentModule from './StudentModule'; 

class StudentCourse extends RealmModel {

    getModel() {
        return StudentCourse;
    }

    static _findCourse(courseId) {
        return this.query(`courseId == '${courseId}'`)
            .then((courses)=>{
                if(courses.length < 1)
                    return Promise.reject({message: 'Cannot Find Course'});
                return courses[0];
            });
    }

    static findOrCreateCourse(courseId) {
        return this._findCourse(courseId)
            .catch((err)=> this.create({courseId: courseId}));
    }

    static updateCourseWithStudentCourse(course) {
        return this.findOrCreateCourse(course.id.toString())
            .then(studentCourse => ({ ...course, studentCourse }));
    };

    get completedModules() {
        return this.modules.filtered("isCompleted == true").length;
    }

    get totalModules() {
        return this.modules.length;
    }

    setIsCompleted(value) {
        return this.getModel().dbWrite(() => this.isCompleted = value);
    }

    setNextModule(module) {
        return this.getModel().dbWrite(() => this.nextModule = module);
    }

    setStudentInfo(studentInfo) {
        return this.getModel().dbWrite(() => this.studentInfo = studentInfo);
    }

    setIsUnlocked(value) {
        return this.getModel().dbWrite(() => this.isUnlocked = value);
    }

    setIsEnrolled(value) {
        return this.getModel().dbWrite(() => this.isEnrolled = value);
    }

    addModule(module) {
        return this.getModel().dbWrite(() => {
            this.findModuleIndex(module) < 0 && this.modules.push(module);
        });
    }

    removeModule(module) {
        return this.getModel().dbWrite(() => {
            let index = this.findModuleIndex(module);
            index >= 0 && this.modules.splice(index, 1);
        });
    }

    findModuleIndex(module) {
        return this.modules.findIndex((moduleItem) => moduleItem.moduleId === module.moduleId);
    }

    addAndLinkModule(module) {
        return module.setStudentCourse(this)
            .then(()=>this.addModule(module));
    }

}

StudentCourse.schema = {
    name: 'StudentCourse',
    primaryKey: 'id',
    properties: {
        id: 'string',
        courseId: {type: 'string', indexed: true},
        studentInfo: {type: 'StudentInfo', optional: true},
        isEnrolled: {type: 'bool', optional: true, default: false},
        isUnlocked: {type: 'bool', optional: true, default: false},
        isCompleted: {type: 'bool', optional: true, default: false},
        modules: {type: 'list', objectType: StudentModule.schema.name},
        nextModule: {type: StudentModule.schema.name, optional: true},
    }
}

export default StudentCourse;