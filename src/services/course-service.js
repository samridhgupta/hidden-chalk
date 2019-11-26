import ModelService from "./model-service";
import contentService from "../services/content-service";

class CourseService extends ModelService {
    constructor(modelRecords) {
        super(modelRecords);
    }

    replenishWithData() {
        return contentService.getCourseContent();
    }

    getAvailableCoursesAsync(forceUpdate) {
        return this._getRecordsAsync(null, forceUpdate);
    }

    getCourseById(courseId) {
        return this._getRecordAsync(courseId);
    }
}

const courseService = new CourseService();

export { courseService };
