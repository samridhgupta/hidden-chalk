import base64UUID from '../../libs/base64UUID';

class RealmModel {

    static initalize(db) {
        this._realmDB = db;
        this._schemaName = this.schema.name;
    }

    getModel() {
        return RealmModel;
    }

    static db() {
        if(!this._realmDB)
            throw new Error("Model not Initialised");
        return this._realmDB;
    }

    static dbWrite(callback) {
        return new Promise((resolve, reject)=>{
            requestAnimationFrame(()=>{
                this.db().write(()=>{
                    try {
                        let res = callback(this.db());
                        resolve(res);
                    } catch(err) {
                        reject(err);
                    }
                });
            });
        });
    }

    static upsert(properties) {
        return this.dbWrite((_db) => _db.create(this._schemaName, properties, true));
    }

    static create(properties) {
        let key = this.schema.primaryKey;
        let keySchema = this.schema.properties[key];
        if(key && !properties[key]) {
            let keyValue = this.generateKey(keySchema);
            if(keyValue !== undefined)
                properties[key] = keyValue;
        }
        return this.upsert(properties);
    }

    static findByPK(primaryKey) {
        return new Promise((resolve, reject) => {
            let obj = this.db().objectForPrimaryKey(this._schemaName, primaryKey);
            if(!obj){
                reject({message: 'Object Not Found', data: obj});
                return;
            }
            resolve(obj);
        });
    }

    static query(query, args) {
        return new Promise((resolve, reject) => {
            let objs = this.db().objects(this._schemaName);
            let results = objs.filtered(query, args);
            resolve(results);
        });
    }

    static generateKey(keySchema) {
        let keySchemaType = typeof keySchema === 'string' ? keySchema : keySchema.type;
        switch(keySchemaType) {
            case 'string' :
                return base64UUID.escapedBase64UUID();
        }
    }

}

export default RealmModel;