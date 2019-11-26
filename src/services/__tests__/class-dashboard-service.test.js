import classDashboardService from '../class-dashboard-service';


it('get combined modules', ()=>{
    return classDashboardService.getCombinedModulesByCourseId(1).then((modules)=>{
        expect(modules.length).toBeGreaterThan(0);
    });
});

it('get combined sections', ()=>{
    return classDashboardService.getCombinedSectionsByModule({id: 1}).then((sections)=>{
        expect(sections.length).toBeGreaterThan(0);
    });
});