import Realm from 'realm';
import migrations from './migrations';

let initialize = () => {
    let realmPath = 'studentCourse.realm';
    let originalSchemaVersion = Realm.schemaVersion(realmPath);

    console.log('Original Version: ',originalSchemaVersion);
    console.log('path: ', Realm.defaultPath);

    let applicableMigrations = migrations.filter((migration)=>{
        return migration.version() >= originalSchemaVersion;
    }).sort((first, second)=>{
        return first.version() - second.version();
    });

    applicableMigrations.map((migration)=>{
        let migratedRealm = new Realm({
            path: realmPath, 
            schema: migration.models(), 
            schemaVersion: migration.version(), 
            migration: migration.migrate
        });
        migratedRealm.close();
    });

    let latestMigration = applicableMigrations[applicableMigrations.length - 1];

    let realm = new Realm({
        path: realmPath,
        schema: latestMigration.models(),
        schemaVersion: latestMigration.version(),
    });

    latestMigration.models().forEach((model)=>model.initalize(realm));
    return realm;
};

export default {
    initialize
};