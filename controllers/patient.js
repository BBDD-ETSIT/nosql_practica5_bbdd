// Cargamos los modelos para usarlos posteriormente
const Patient = require('../models/patient');

exports.list = async function() {
    let result= await Patient.find();
    return result;
}

exports.create = async function(body) {
    let patient = new Patient(body);
    let result= await patient.save();
    return result;
}