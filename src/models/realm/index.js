import studentCourseRealm from './student-course/db';

class RealmHelper {
    get studentCourseDB() {
        if(this._studentCourseDB === undefined)
            this._studentCourseDB = studentCourseRealm.initialize();
        return this._studentCourseDB;
    }
    initialize() {
        this._studentCourseDB = studentCourseRealm.initialize();
    }
}

export default new RealmHelper();