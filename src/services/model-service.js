import asyncPromise from '../libs/async-promise';
import * as BBPromise from 'bluebird';
class ModelService {
  constructor(modelRecords) {
    this.recordsArray = [];
    this.recordsHash = {};
    if (modelRecords) {
      this.initModel(modelRecords);
    }
  }

  initModel(modelRecords) {
    if (Array.isArray(modelRecords)) {
      this.recordsArray = modelRecords;
      this.recordsHash = this._getModelHashFromArray(modelRecords);
    } else if (typeof modelRecords === 'object') {
      this.recordsHash = modelRecords;
      this.recordsArray = this._getModelArrayFromObject(modelRecords);
    }
  }

  replenishWithData() {
    return BBPromise.resolve([]);
  }

  _getModelHashFromArray(modelRecords) {
    return modelRecords.reduce((hash, item) => {
      hash[item.id] = item;
      return hash;
    }, {});
  }

  _getModelArrayFromObject(modelRecords) {
    return Object.keys(modelRecords).map(key => modelRecords[key]);
  }

  _getRecordAsync(recordId, forceUpdate = false) {
    if (forceUpdate) {
      this.replenishingWithData = null;
    }
    return this._checkAndReplenishData().then(() => {
      let record = this.recordsHash[recordId];
      if (record === undefined) {
        return BBPromise.reject({
          code: 401,
          msg: `Cannot find Record: with recordId: ${recordId}`,
        });
      }
      return record;
    });
  }

  _getRecordsAsync(filterFunc, forceUpdate = false) {
    if (forceUpdate) {
      this.replenishingWithData = null;
    }
    return this._checkAndReplenishData().then(() => {
      if (!filterFunc) return BBPromise.resolve(this.recordsArray);
      return asyncPromise.filter(this.recordsArray, item => {
        return filterFunc(item);
      });
    });
  }

  _getRecordsCount(filterFunc) {
    return this._checkAndReplenishData()
      .then(() => this._getRecordsAsync(filterFunc))
      .then(results => results.length);
  }

  _checkAndReplenishData() {
    if (this.replenishingWithData) return this.replenishingWithData;
    this.replenishingWithData = BBPromise.resolve(
      this.replenishWithData(),
    ).then(records => this.initModel(records));
    return this.replenishingWithData;
  }
}

export default ModelService;
