import ModelService from './model-service';
import asyncPromise from '../libs/async-promise';
import contentService from '../services/content-service';
class CourseSectionService extends ModelService {
    
    constructor(modelRecords) {
        super(modelRecords);
    }

    replenishWithData() {
        return contentService.getSectionContent();
    }

    getModuleSectionsAsync(moduleId) {
        return this._getRecordsAsync((section)=>section.moduleId === moduleId)
            .then(sections => asyncPromise.sort(sections, (first) => first.order));
    }

    getSectionById(sectionId) {
        return this._getRecordAsync(sectionId);
    }
}

const sectionService = new CourseSectionService();
export { sectionService }