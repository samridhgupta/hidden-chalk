import studentDashboardService from '../student-dashboard-service';

it('get combined course list', () => {
    return studentDashboardService.getCombinedCoursesAsync().then((finalCourses)=>{
        expect(finalCourses.length).toBeGreaterThan(0);
        expect(finalCourses[0]).toHaveProperty("completedModules");
        expect(finalCourses[0]).toHaveProperty("description");
        expect(finalCourses[0]).toHaveProperty("name");
        expect(finalCourses[0]).toHaveProperty("isCompleted");
        expect(finalCourses[0]).toHaveProperty("isNew");
        expect(finalCourses[0]).toHaveProperty("isUnlocked");
    });
});