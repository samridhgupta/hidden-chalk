import RealmModel from '../RealmModel';

class StudentPage extends RealmModel {
    
    getModel() {
        return StudentPage;
    }

    static _findPage(pageId) {
        return this.query(`pageId == '${pageId}'`)
            .then((pages)=>{
                if(pages.length < 1)
                    return Promise.reject({message: 'Cannot Find Page'});
                return pages[0];
            });
    }

    static findOrCreatePage(pageId) {
        return this._findPage(pageId)
            .catch((err)=> this.create({pageId: pageId}));
    }

    static updatePageWithStudentPage(page) {
        return this.findOrCreatePage(page.id.toString())
            .then(studentPage => ({...page, studentPage}));
    };

    setStudentSection(studentSection) {
        return this.getModel().dbWrite(() => this.studentSection = studentSection);
    }

    setIsCompleted(value) {
        return this.getModel().dbWrite(() => this.isCompleted = value);
    }

    setIsUnlocked(value) {
        return this.getModel().dbWrite(() => this.isUnlocked = value);
    }

    setActivity(activity) {
        return this.getModel().dbWrite(() => this.activity = activity);
    }

}

StudentPage.schema = {
    name: 'StudentPage',
    primaryKey: 'id',
    properties: {
        id: 'string',
        pageId: { type: 'string', indexed: true },
        studentSection: {type: 'StudentSection', optional: true},
        isUnlocked: { type: 'bool', optional: true, default: true},
        isCompleted: { type: 'bool', optional: true, default: false },
        activity: { type: 'string', optional: true },
    }
};

export default StudentPage;