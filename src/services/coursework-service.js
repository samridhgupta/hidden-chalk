import { coursePageService } from './course-page-service';
import { sectionService } from './course-section-service';
import { moduleService } from './course-module-service';
import { courseService } from './course-service';

import unlockService from '../services/unlock-course-service';

import StudentPage from '../models/realm/student-course/StudentPage';
import StudentSection from '../models/realm/student-course/StudentSection';
import StudentModule from '../models/realm/student-course/StudentModule';
import StudentCourse from '../models/realm/student-course/StudentCourse';

import asyncPromise from '../libs/async-promise';

let getCombinedPages = (sectionId) => {
    return coursePageService.getSectionPagesAsync(sectionId)
        .then(pages => asyncPromise.map(pages, StudentPage.updatePageWithStudentPage.bind(StudentPage)));
}

export default {

    getCombinedPage(pageId) {
        return coursePageService.getPageById(pageId)
            .then(StudentPage.updatePageWithStudentPage.bind(StudentPage));
    },

    getCombinedSection(sectionId) {
        return sectionService.getSectionById(sectionId)
            .then(StudentSection.updateSectionWithStudentSection.bind(StudentSection))
            .then(section => getCombinedPages(sectionId).then(pages => ({...section, pages})));
    },

    getCombinedModule(moduleId) {
        return moduleService.getModuleById(moduleId)
            .then(StudentModule.updateModuleWithStudentModule.bind(StudentModule));
    },

    getCombinedCourse(courseId) {
        return courseService.getCourseById(courseId)
            .then(StudentCourse.updateCourseWithStudentCourse.bind(StudentCourse));
    },

    updateStudentSection(pageId) {
        return coursePageService.getPageById(pageId)
        .then((page)=> page.sectionId)
        .then((sectionId)=>StudentSection.findOrCreateSection(sectionId.toString()))
        .then(studentSection=>{
            return StudentPage.findOrCreatePage(pageId)
                .then(studentSection.addAndLinkPage.bind(studentSection));
        });
    },

    markPageCompleteAndCascadeUp(pageId) {
        return coursePageService.getPageById(pageId)
            .then(page => StudentPage.findOrCreatePage(page.id.toString()))
            .then(studentPage => studentPage.setIsCompleted(true)
                .then(() => studentPage.studentSection))
            .then(studentSection => studentSection.setIsCompleted(studentSection.totalPages==studentSection.completedPages)
                .then(() => studentSection.studentModule))
            .then(studentModule => studentModule.setIsCompleted(studentModule.totalSections==studentModule.completedSections)
                .then(() => studentModule.studentCourse))
            .then(studentCourse => studentCourse.setIsCompleted(studentCourse.totalModules==studentCourse.completedModules));
                    
    },
    setPageActivity(pageId, pageActivity) {
        return coursePageService.getPageById(pageId)
            .then(page => StudentPage.findOrCreatePage(page.id.toString()))
            .then(studentPage => studentPage.setActivity(pageActivity));
    },
    unlockPageAndCascadeUp(pageId) {
        return coursePageService.getPageById(pageId)
            .then(page => StudentPage.findOrCreatePage(page.id)
                .then(studentPage => studentPage.setIsUnlocked(true))
                .then(() => sectionService.getSectionById(page.sectionId)))
            .then(section => StudentSection.findOrCreateSection(section.id.toString())
                .then(studentSection => studentSection.setIsUnlocked(true))
                .then(() => moduleService.getModuleById(section.moduleId)))
            .then(module => StudentModule.findOrCreateModule(module.id.toString())
                .then(studentModule => studentModule.setIsUnlocked(true)));
    },
    pageIdExists(pageId) {
        return coursePageService.getPageById(pageId)
            .then(()=>true);
    },
    updateNextPageOfSectionAndCascadeUp(pageId) {

        return coursePageService.getPageById(pageId)
            .then(page => StudentPage.findOrCreatePage(page.id.toString()))
            .then(studentPage => studentPage.studentSection.setNextPage(studentPage)
                .then(() => studentPage.studentSection))
            .then(studentSection => studentSection.studentModule.setNextSection(studentSection)
                .then(() => studentSection.studentModule))
            .then(studentModule => studentModule.studentCourse.setNextModule(studentModule)
                .then(() => studentModule.studentCourse))
            .then(studentCourse => studentCourse.studentInfo.setNextCourse(studentCourse));
    },
    updateSectionWithLocalPages(pageId) {
        return coursePageService.getPageById(pageId)
        .then(page => page.sectionId)
        .then(unlockService.updateStudentPages.bind(unlockService));
    }
}