import { courseService } from './course-service';
import { moduleService } from './course-module-service'; 
import { sectionService } from './course-section-service';
import { coursePageService } from './course-page-service';

import StudentCourse from '../models/realm/student-course/StudentCourse';
import StudentModule from '../models/realm/student-course/StudentModule';
import StudentSection from '../models/realm/student-course/StudentSection';
import StudentPage from '../models/realm/student-course/StudentPage';

import asyncPromise from '../libs/async-promise';

let unlockStartingModule = (courseId) => {
    return courseService.getCourseById(courseId)
        .then(course => StudentModule.findOrCreateModule(course.startModuleId.toString()))
        .then(studentModule => studentModule.setIsUnlocked(true)
            .then(() => unlockStartingSection(studentModule.moduleId)));
};

let unlockStartingSection = (moduleId) => {
    return moduleService.getModuleById(moduleId)
        .then(module => StudentSection.findOrCreateSection(module.startSectionId.toString()))
        .then(studentSection => studentSection.setIsUnlocked(true)
            .then(()=>unlockStartingPage(studentSection.sectionId)));
}

let unlockStartingPage = (sectionId) => {
    return sectionService.getSectionById(sectionId)
        .then(section => StudentPage.findOrCreatePage(section.startPageId.toString()))
        .then(studentPage => studentPage.setIsUnlocked(true));
}

let updateStudentPages = (sectionId) => {
    return StudentSection.findOrCreateSection(sectionId.toString()).then(studentSection => {
        return coursePageService.getSectionPagesAsync(sectionId)
        .then(pages => {
            return asyncPromise.map(pages, page => {
                return StudentPage.findOrCreatePage(page.id.toString())
                    .then(studentSection.addAndLinkPage.bind(studentSection));
            });
        })
    });
}

let updateStudentSections = (moduleId) => {
    return StudentModule.findOrCreateModule(moduleId.toString()).then((studentModule) => {
        return sectionService.getModuleSectionsAsync(moduleId).then((sections) => {
            return asyncPromise.map(sections, (section) => {
                return StudentSection.findOrCreateSection(section.id.toString())
                    .then(studentModule.addAndLinkSection.bind(studentModule));
            });
        });
    });
};

let updateStudentModules = (courseId) => {
    return StudentCourse.findOrCreateCourse(courseId.toString()).then((studentCourse) => {
        return moduleService.getCourseModulesAsync(courseId)
            .then((modules) => {
            return asyncPromise.map(modules, (module) => {
                return StudentModule.findOrCreateModule(module.id.toString())
                    .then(studentCourse.addAndLinkModule.bind(studentCourse))
                    .then(() => updateStudentSections(module.id));
            });
        });
    });
};

export default {
    unlockCourse(courseId) {
        return StudentCourse.findOrCreateCourse(courseId.toString())
            .then(course => course.setIsUnlocked(true)
                .then(() => course.setIsEnrolled(true)))
            .then(() => unlockStartingModule(courseId))
            .then(() => Promise.all([updateStudentModules(courseId), this._updateStartingSection(courseId)]));
    },
    getCourse(courseId) {
        return courseService.getCourseById(courseId);
    },
    _updateStartingSection(courseId) {
        return courseService.getCourseById(courseId).then(course => course.startModuleId)
            .then(moduleId => moduleService.getModuleById(moduleId).then(module => module.startSectionId))
            .then(sectionId => this.updateStudentPages(sectionId))
    },
    updateStudentPages(sectionId) {
        return StudentSection.findOrCreateSection(sectionId.toString()).then(studentSection => {
            return coursePageService.getSectionPagesAsync(sectionId).then(pages => {
                return asyncPromise.map(pages, page => {
                    return StudentPage.findOrCreatePage(page.id.toString())
                        .then(studentSection.addAndLinkPage.bind(studentSection));
                });
            })
        });
    }
}