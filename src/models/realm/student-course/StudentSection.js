import RealmModel from '../RealmModel';
import StudentPage from './StudentPage';

class StudentSection extends RealmModel {

    getModel() {
        return StudentSection;
    }

    static _findSection(sectionId) {
        return this.query(`sectionId == '${sectionId}'`)
            .then((sections)=>{
                if(sections.length < 1)
                    return Promise.reject({message: 'Cannot Find Section'});
                return sections[0];
            });
    }

    static findOrCreateSection(sectionId) {
        return this._findSection(sectionId)
            .catch((err) => this.create({sectionId: sectionId}));
    }

    static updateSectionWithStudentSection(section) {
        return this.findOrCreateSection(section.id.toString())
            .then(studentSection => ({ ...section, studentSection }));
    };

    get completedPages() {
        return this.pages.filtered("isCompleted == true").length;
    }

    get totalPages() {
        return this.pages.length;
    }

    setIsCompleted(value) {
        return this.getModel().dbWrite(() => this.isCompleted = value);
    }

    setNextPage(page) {
        return this.getModel().dbWrite(() => this.nextPage = page);
    }

    setStudentModule(studentModule) {
        return this.getModel().dbWrite(() => this.studentModule = studentModule);
    }

    setIsUnlocked(value) {
        return this.getModel().dbWrite(() => this.isUnlocked = value);
    }

    addPage(page) {
        return this.getModel().dbWrite(() => {
            this.findPageIndex(page) < 0 && this.pages.push(page);
        });
    }

    removePage(page) {
        return this.getModel().dbWrite(() => {
            let index = this.findPageIndex(page);
            index >= 0 && this.pages.splice(index, 1);
        });
    }

    findPageIndex(page) {
        return this.pages.findIndex((pageItem) => pageItem.pageId === page.pageId);
    }

    addAndLinkPage(page) {
        return page.setStudentSection(this)
            .then(()=>this.addPage(page));
    }
    
}

StudentSection.schema = {
    name: 'StudentSection',
    primaryKey: 'id',
    properties: {
        id: 'string',
        sectionId: {type: 'string', indexed: true},
        studentModule: {type: 'StudentModule', optional: true},
        isUnlocked: {type: 'bool', optional: true, default: true},
        isCompleted: {type: 'bool', optional: true, default: false},
        pages: {type: 'list', objectType: StudentPage.schema.name},
        nextPage: {type: StudentPage.schema.name, optional: true},
    }
}

export default StudentSection;