import Migration from './Migration';
import StudentPage from '../StudentPage';
import StudentSection from '../StudentSection';
import StudentModule from '../StudentModule';
import StudentCourse from '../StudentCourse';
import StudentInfo from '../StudentInfo';

StudentPage.schema = {
    name: 'StudentPage',
    primaryKey: 'id',
    properties: {
        id: 'string',
        pageId: { type: 'string', indexed: true },
        studentSection: {type: 'StudentSection', optional: true},
        isUnlocked: { type: 'bool', optional: true, default: false},
        isCompleted: { type: 'bool', optional: true, default: false },
        activity: { type: 'string', optional: true },
    }
};

StudentSection.schema = {
    name: 'StudentSection',
    primaryKey: 'id',
    properties: {
        id: 'string',
        sectionId: {type: 'string', indexed: true},
        studentModule: {type: StudentModule.schema.name, optional: true},
        isUnlocked: {type: 'bool', optional: true, default: false},
        isCompleted: {type: 'bool', optional: true, default: false},
        pages: {type: 'list', objectType: StudentPage.schema.name},
        nextPage: {type: StudentPage.schema.name, optional: true},
    }
}

StudentModule.schema = {
    name: 'StudentModule',
    primaryKey: 'id',
    properties: {
        id: 'string',
        moduleId: {type: 'string', indexed: true},
        studentCourse: {type: StudentCourse.schema.name, optional: true},
        isUnlocked: {type: 'bool', optional: true, default: false},
        isCompleted: {type: 'bool', optional: true, default: false},
        sections: {type: 'list', objectType: StudentSection.schema.name},
        nextSection: {type: StudentSection.schema.name, optional: true},
    }
}

StudentCourse.schema = {
    name: 'StudentCourse',
    primaryKey: 'id',
    properties: {
        id: 'string',
        courseId: {type: 'string', indexed: true},
        studentInfo: {type: StudentInfo.schema.name, optional: true},
        isEnrolled: {type: 'bool', optional: true, default: false},
        isUnlocked: {type: 'bool', optional: true, default: false},
        isCompleted: {type: 'bool', optional: true, default: false},
        modules: {type: 'list', objectType: StudentModule.schema.name},
        nextModule: {type: StudentModule.schema.name, optional: true},
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

class InitialMigration extends Migration {

    version() { 
        return 1;
    }
    
    models() {
        return [StudentPage, StudentSection, StudentModule, StudentCourse, StudentInfo];
    }

    migrate(oldRealm, newRealm) {

    }

}

export default new InitialMigration();