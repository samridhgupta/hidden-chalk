import RealmModel from '../RealmModel';
import StudentSection from './StudentSection';

class StudentModule extends RealmModel {
    
    getModel() {
        return StudentModule;
    }

    static _findModule(moduleId) {
        return this.query(`moduleId == '${moduleId}'`)
            .then((modules)=>{
                if(modules.length < 1)
                    return Promise.reject({message: 'Cannot Find Module'});
                return modules[0];
            });
    }

    static findOrCreateModule(moduleId) {
        return this._findModule(moduleId)
            .catch((err)=> this.create({moduleId: moduleId}));
    }

    static updateModuleWithStudentModule(module) {
        return this.findOrCreateModule(module.id.toString())
            .then(studentModule => ({ ...module, studentModule }));
    };

    get completedSections() {
        return this.sections.filtered("isCompleted == true").length;
    }

    get totalSections() {
        return this.sections.length;
    }

    setIsCompleted(value) {
        return this.getModel().dbWrite(() => this.isCompleted = value);
    }

    setNextSection(section) {
        return this.getModel().dbWrite(() => this.nextSection = section);
    }

    setStudentCourse(studentCourse) {
        return this.getModel().dbWrite(() => this.studentCourse = studentCourse);
    }

    setIsUnlocked(value) {
        return this.getModel().dbWrite(() => this.isUnlocked = value);
    }

    addSection(section) {
        return this.getModel().dbWrite(() => {
            this.findSectionIndex(section) < 0 && this.sections.push(section);
        });
    }

    removeSection(section) {
        return this.getModel().dbWrite(() => {
            let index = this.findSectionIndex(section);
            index >= 0 && this.sections.splice(index, 1);
        });
    }

    findSectionIndex(section) {
        return this.sections.findIndex((sectionItem) => sectionItem.sectionId === section.sectionId);
    }

    addAndLinkSection(section) {
        return section.setStudentModule(this)
            .then(()=>this.addSection(section));
    }

}

StudentModule.schema = {
    name: 'StudentModule',
    primaryKey: 'id',
    properties: {
        id: 'string',
        moduleId: {type: 'string', indexed: true},
        studentCourse: {type: 'StudentCourse', optional: true},
        isUnlocked: {type: 'bool', optional: true, default: true},
        isCompleted: {type: 'bool', optional: true, default: false},
        sections: {type: 'list', objectType: StudentSection.schema.name},
        nextSection: {type: StudentSection.schema.name, optional: true},
    }
}

export default StudentModule;