const mongoose =require ('mongoose');
var Patients = require ('./seeders/patients.seeder')
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27001,localhost:27002,localhost:27003,localhost:27004/bio_bbdd?replicaSet=my-mongo-set';

/**
 * Seeders List
 * order is important
 * @type {Object}
 */
const seedersList = {
  Patients,
};
/**
 * Connect to mongodb implementation
 * @return {Promise}
 */

const connect = async () =>
  await mongoose.connect(mongoURL, { useNewUrlParser: true });
/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
const dropdb = async () => mongoose.connection.db.dropDatabase();
 module.exports= {seedersList,connect,dropdb}
