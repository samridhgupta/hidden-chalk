import { moduleService } from './course-module-service';
import { courseService } from './course-service';
import { sectionService } from './course-section-service';

import StudentModule from '../models/realm/student-course/StudentModule';
import StudentSection from '../models/realm/student-course/StudentSection';
import StudentCourse from '../models/realm/student-course/StudentCourse';

import asyncPromise from '../libs/async-promise';


export default {

    getCombinedModulesAndSections(courseId) {
        return moduleService.getCourseModulesAsync(courseId)
            .then(modules => asyncPromise.map(modules, module => {
                return StudentModule.updateModuleWithStudentModule(module)
                    .then(module => sectionService.getModuleSectionsAsync(module.id)
                        .then(sections => asyncPromise.map(sections, StudentSection.updateSectionWithStudentSection.bind(StudentSection))) 
                        .then(sections => ({...module, sections}) ));
            }));
    },

    getCombinedCourseAsync(courseId) {
        return courseService.getCourseById(courseId)
            .then(StudentCourse.updateCourseWithStudentCourse.bind(StudentCourse));
    }



}