
const fs = require('fs')
const {subtractions} = require('./build-values')

const wqxRequiredIf = async(file) => {
  console.log(file)
  const object = require(`wqx/required/${file}.json`)

  const column = file.split('-')[0]
  const list = [...new Set(object.if.properties[column].enum.sort())]
  object.if.properties[column].enum = subtractions(column, list)

  fs.writeFileSync(__dirname + `/../src/logic/${file}.json`, JSON.stringify(object, null, 2), {encoding: 'utf8'})
}

//wqxRequiredIf('ActivityType-AnalyticalMethod','CharacteristicName',['AnalyticalMethodtype'])
//wqxRequiredIf('ActivityType-MonitoringLocation','CharacteristicName',['MonitoringLocation'])
//wqxRequiredIf('Characteristic-AnalyticalMethod','CharacteristicName',['ResultAnalyticalMethodID','ResultAnalyticalMethodContext'])
wqxRequiredIf('CharacteristicName-MethodSpeciation')
wqxRequiredIf('CharacteristicName-ResultSampleFraction')


