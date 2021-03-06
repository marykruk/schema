const expect = require('chai').expect

const schema = require('../dist/json-schema/index.json')
let validate = require('../dist/json-schema/frontend')
let validateStrict = require('../dist/json-schema')
let validateBackend = require('../dist/json-schema/backend')

const checkProperty = (errors, keyword, property) => {
  for (let i = errors.length; i--; i) {
    const error = validate.errors[i]
    if (error.keyword !== keyword) continue
    if (['required', 'dependencies'].includes(keyword) && error.params.missingProperty === property) return true
    else if (keyword === 'enum' && error.params.allowedValues.length && error.dataPath === `/${property}`) return true
    else if (keyword === 'additionalProperties' && error.params.additionalProperty === property) return true
    else if (keyword === 'propertyNames' && error.params.propertyName === property) return true
    //else if(keyword === 'if' && error.params.failingKeyword === 'then' && error.schemaPath === property ) return true
    else if (keyword === 'oneOf' && error.params.passingSchemas.includes(property)) return true
    else if (keyword === 'anyOf') return true
  }
  return false
}

describe('Required / Dependencies', function () {

  it('Should not set any defaults', function (done) {
    let data = {}
    let valid = validate(data)
    expect(data).to.deep.equal({})

    done()
  })

  it('Should require properties', function (done) {
    let valid = validate({})
    expect(valid).to.equal(false)

    // #/allOf/0
    expect(checkProperty(validate.errors, 'required', 'DatasetName')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'MonitoringLocationID')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'MonitoringLocationName')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'MonitoringLocationType')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'MonitoringLocationLatitude')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'MonitoringLocationLongitude')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'MonitoringLocationHorizontalCoordinateReferenceSystem')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'ActivityType')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'ActivityMediaName')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'ActivityStartDate')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'CharacteristicName')).to.equal(true)
    expect(checkProperty(validate.errors, 'required', 'ResultValueType')).to.equal(true)

    done()
  })

  it('Should not require properties', function (done) {
    let valid = validate({
      'DatasetName': 'Test',
      'MonitoringLocationID': 'A1',
      'MonitoringLocationName': 'A1 Test',
      'MonitoringLocationLatitude': '51.0486',
      'MonitoringLocationLongitude': '-114.0708',
      'MonitoringLocationHorizontalCoordinateReferenceSystem': 'AMSMA',
      'MonitoringLocationType': 'Ocean',
      'ActivityType': 'Field Msr/Obs',
      'ActivityMediaName': 'Surface Water',
      'ActivityDepthHeightMeasure': '-34',
      'ActivityDepthHeightUnit': 'm',
      'SampleCollectionEquipmentName': 'Bucket',
      'CharacteristicName': 'Silver Dioxide',
      'MethodSpeciation': 'as B',
      'ResultSampleFraction': 'Dissolved',
      'ResultValue': '99.99',
      'ResultUnit': 'ug',
      'ResultValueType': 'Actual',
      'ResultStatusID': 'Accepted',
      'ResultComment': 'None at this time',
      'ResultAnalyticalMethodID': '1',
      'ResultAnalyticalMethodContext': 'APHA',
      'ActivityStartDate': '2018-02-23',
      'ActivityStartTime': '13:15:00',
      'ActivityEndDate': '2018-02-23',
      'ActivityEndTime': '13:15:00',
      'LaboratoryName': 'Farrell Labs',
      'LaboratorySampleID': '101010011110',
      'AnalysisStartDate': '2018-02-23',
      'AnalysisStartTime': '13:15:00',
      'AnalysisStartTimeZone': '-06:00'
    })
    //console.log(validate.errors)
    expect(valid).to.equal(true)
    done()
  })

  it('Should reject additional headers', function (done) {
    let valid = validate({
      'MonitoringLocationWaterBody': 'Lake'
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'additionalProperties', 'MonitoringLocationWaterBody')).to.equal(true)

    done()
  })

  it('Should reject ActivityDepthHeightMeasure AND NOT ActivityDepthHeightUnit', function (done) {
    let valid = validate({
      'ActivityDepthHeightMeasure': true
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'dependencies', 'ActivityDepthHeightUnit')).to.equal(true)
    done()
  })
  it('Should accept ActivityDepthHeightMeasure AND ActivityDepthHeightUnit', function (done) {
    let valid = validate({
      'ActivityDepthHeightMeasure': true,
      'ActivityDepthHeightUnit': true
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'dependencies', 'ActivityDepthHeightUnit')).to.equal(false)
    done()
  })

  it('Should reject ResultValue AND NOT ResultUnit', function (done) {
    let valid = validate({
      'ResultValue': true
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'dependencies', 'ResultUnit')).to.equal(true)
    done()
  })
  it('Should reject ResultValue AND ResultUnit', function (done) {
    let valid = validate({
      'ResultValue': true,
      'ResultUnit': true
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'dependencies', 'ResultUnit')).to.equal(false)
    done()
  })

  it('Should reject ResultDetectionQuantitationLimitMeasure AND NOT ResultDetectionQuantitationLimitUnit', function (done) {
    let valid = validate({
      'ResultDetectionQuantitationLimitMeasure': true
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'dependencies', 'ResultDetectionQuantitationLimitUnit')).to.equal(true)
    done()
  })
  it('Should accept ResultDetectionQuantitationLimitMeasure AND ResultDetectionQuantitationLimitUnit', function (done) {
    let valid = validate({
      'ResultDetectionQuantitationLimitMeasure': true,
      ResultDetectionQuantitationLimitUnit: true
    })
    expect(valid).to.equal(false)
    expect(checkProperty(validate.errors, 'dependencies', 'ResultDetectionQuantitationLimitUnit')).to.equal(false)
    done()
  })

  it('Should reject AnalysisStartTime AND NOT AnalysisStartTimeZone', function (done) {
    let valid = validate({
      'AnalysisStartTime': true
    })
    expect(checkProperty(validate.errors, 'dependencies', 'AnalysisStartTimeZone')).to.equal(true)
    done()
  })

  it('Should accept AnalysisStartTime AND AnalysisStartTimeZone', function (done) {
    let valid = validate({
      'AnalysisStartTime': true,
      AnalysisStartTimeZone: true
    })
    expect(checkProperty(validate.errors, 'dependencies', 'AnalysisStartTimeZone')).to.equal(false)
    done()
  })

})
