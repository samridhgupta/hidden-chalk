import ModelService from './model-service';
import asyncPromise from '../libs/async-promise';
import contentService from './content-service';
import CoursePages from '../models/json-models/course-page';

class CoursePageService extends ModelService {
  constructor(modelRecords) {
    super(modelRecords);
  }

  replenishWithData() {
    return Promise.resolve(CoursePages);
  }

  getPageById(pageId) {
    return this._getRecordAsync(pageId);
  }

  getSectionPagesAsync(sectionId) {
    return this._getRecordsAsync(
      page => page.sectionId === sectionId,
    ).then(pages => asyncPromise.sort(pages, first => first.number));
  }
}
const coursePageService = new CoursePageService();
export {coursePageService};
