import { courseService } from './course-service';
// import moduleService from './course-module-service'; mmm
import StudentCourse from '../models/realm/student-course/StudentCourse';
import StudentInfo from '../models/realm/student-course/StudentInfo';

import asyncPromise from '../libs/async-promise';

export default {
    getCombinedCoursesAsync() {
        return courseService.getAvailableCoursesAsync()
            .then((courses)=>asyncPromise.map(courses, StudentCourse.updateCourseWithStudentCourse.bind(StudentCourse)));
    },
    getStudentInfo(studentId) {
        return StudentInfo.findOrCreateStudentInfo(studentId);
    },
    updateStudentCourses(studentId, forceUpdate) {
        return this.getStudentInfo(studentId).then((studentInfo) => {
            return courseService.getAvailableCoursesAsync(forceUpdate)
            .then((courses) => {
                return asyncPromise.map(courses, (course) => {
                    return StudentCourse.findOrCreateCourse(course.id.toString())
                        .then(studentInfo.addAndLinkCourse.bind(studentInfo));
                });
            });
        });
    }

}
