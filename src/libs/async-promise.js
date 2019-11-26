import async from 'async-es';

export default {
    map(collection, mapFn) {
        return new Promise((resolve, reject) => {
            let iteratee = (item, cb) => {
                let mapReturn = mapFn(item);
                if(mapReturn.then)
                    return mapReturn
                        .then(mapped => {
                            requestAnimationFrame(()=>{
                                cb(null, mapped);
                            });
                        });
                requestAnimationFrame(() => {
                    cb(null, mapped);
                });
            };
            async.map(collection, iteratee, (err, results)=>{
                resolve(results);
            });
        });
    },
    filter(collection, filterFn) {
        return new Promise((resolve, reject) => {
            let iteratee = (item, cb) => {
                requestAnimationFrame(() => {
                    cb(null, filterFn(item));
                });
            };
            async.filter(collection, async.ensureAsync(iteratee), (err, results) => {
                resolve(results);
            });
        });
    },
    sort(collection, sortFn) {
        return new Promise((resolve, reject) => {
            let iteratee = (item, cb) => {
                requestAnimationFrame(() => {
                    cb(null, sortFn(item));
                });
            };
            async.sortBy(collection, async.ensureAsync(iteratee), (err, results) => {
                resolve(results);
            });
        });
    }
};