import ModelService from './model-service';
import contentService from '../services/content-service';
import asyncPromise from '../libs/async-promise';

class CourseModuleService extends ModelService {
    
    constructor(modelRecords) {
        super(modelRecords);
    }

    replenishWithData() {
        return contentService.getModuleContent();
    }

    getCourseModulesAsync(courseId) {
        return this._getRecordsAsync((module)=>module.courseId === courseId)
            .then(modules => asyncPromise.sort(modules, (first) => first.order));
    }

    getModuleById(moduleId) {
        return this._getRecordAsync(moduleId);
    }

}

const moduleService = new CourseModuleService()

export {moduleService}