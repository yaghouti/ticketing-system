exports.wrongUserPass = {
  code: 'wrongUserPass',
  message: 'Wrong username/password!'
};
exports.internalServerError = {
  code: 'internalServerError',
  message: 'Internal server error!'
};
exports.sessionDestroyError = {
  code: 'sessionDestroyError',
  message: 'Error while destroying session!'
};
exports.invalidLoginData = {
  code: 'invalidLoginData',
  message: 'Invalid login data!'
};
exports.userNotFound = {
  code: 'userNotFound',
  message: 'User not found!'
};
exports.patientNotFound = {
  code: 'patientNotFound',
  message: 'Patient not found!'
};
exports.doctorNotFound = {
  code: 'doctorNotFound',
  message: 'Doctor not found!'
};
exports.secretaryNotFound = {
  code: 'secretaryNotFound',
  message: 'Secretary not found!'
};
exports.adminNotFound = {
  code: 'adminNotFound',
  message: 'Admin not found!'
};
exports.drugNotFound = {
  code: 'drugNotFound',
  message: 'Drug not found!'
};
exports.medicalTestNotFound = {
  code: 'medicalTestNotFound',
  message: 'Medical modifyingTest not found!'
};
exports.specialtyNotFound = {
  code: 'specialtyNotFound',
  message: 'Specialty not found!'
};
exports.medicalRecordNotFound = {
  code: 'medicalRecordNotFound',
  message: 'Medical record not found!'
};
exports.patientAlreadyExists = {
  code: 'patientAlreadyExists',
  message: 'Patient already exists!'
};
exports.doctorAlreadyExists = {
  code: 'doctorAlreadyExists',
  message: 'Doctor already exists!'
};
exports.secretaryAlreadyExists = {
  code: 'secretaryAlreadyExists',
  message: 'Secretary already exists!'
};
exports.drugAlreadyExists = {
  code: 'drugAlreadyExists',
  message: 'Drug already exists!'
};
exports.medicalTestAlreadyExists = {
  code: 'medicalTestAlreadyExists',
  message: 'Medical modifyingTest already exists!'
};
exports.specialtyAlreadyExists = {
  code: 'specialtyAlreadyExists',
  message: 'Specialty already exists!'
};
exports.createPatientError = {
  code: 'createPatientError',
  message: 'Error while creating patient!'
};
exports.createDoctorError = {
  code: 'createDoctorError',
  message: 'Error while creating doctor!'
};
exports.createSecretaryError = {
  code: 'createSecretaryError',
  message: 'Error while creating secretary!'
};
exports.createDrugError = {
  code: 'createDrugError',
  message: 'Error while creating drug!'
};
exports.createMedicalTestError = {
  code: 'createMedicalTestError',
  message: 'Error while creating medical modifyingTest!'
};
exports.createSpecialtyError = {
  code: 'createSpecialtyError',
  message: 'Error while creating specialty!'
};
exports.createMedicalRecordError = {
  code: 'createMedicalRecordError',
  message: 'Error while creating medical record!'
};
exports.createLockerError = {
  code: 'createLockerError',
  message: 'Error while creating locker!'
};
exports.fetchUserError = {
  code: 'fetchUserError',
  message: 'Error while fetching User(s)!'
};
exports.fetchPatientError = {
  code: 'fetchPatientError',
  message: 'Error while fetching patient(s)!'
};
exports.fetchDoctorError = {
  code: 'fetchDoctorError',
  message: 'Error while fetching doctor(s)!'
};
exports.fetchSecretaryError = {
  code: 'fetchSecretaryError',
  message: 'Error while fetching secretary(ies)!'
};
exports.fetchDrugError = {
  code: 'fetchDrugError',
  message: 'Error while fetching drug(s)!'
};
exports.fetchMedicalTestError = {
  code: 'fetchMedicalTestError',
  message: 'Error while fetching medical modifyingTest(s)!'
};
exports.fetchSpecialtyError = {
  code: 'fetchSpecialtyError',
  message: 'Error while fetching specialty(ies)!'
};
exports.fetchMedicalRecordError = {
  code: 'fetchMedicalRecordError',
  message: 'Error while fetching medical record(ies)!'
};
exports.docIdGenError = {
  code: 'docIdGenError',
  message: 'Error while generating docId for patient!'
};
exports.medicalRecordIdGenError = {
  code: 'medicalRecordIdGenError',
  message: 'Error while generating medicalRecordId for patient!'
};
exports.removePatientError = {
  code: 'removePatientError',
  message: 'Error while removing patient(s)!'
};
exports.removeDoctorError = {
  code: 'removeDoctorError',
  message: 'Error while removing doctor(s)!'
};
exports.removeSecretaryError = {
  code: 'removeSecretaryError',
  message: 'Error while removing secretary(ies)!'
};
exports.removeDrugError = {
  code: 'removeDrugError',
  message: 'Error while removing drug(s)!'
};
exports.removeMedicalTestError = {
  code: 'removeMedicalTestError',
  message: 'Error while removing medical modifyingTest(s)!'
};
exports.removeSpecialtyError = {
  code: 'removeSpecialtyError',
  message: 'Error while removing specialty(ies)!'
};
exports.removeMedicalRecordError = {
  code: 'removeMedicalRecordError',
  message: 'Error while removing medical record(s)!'
};
exports.updatePatientError = {
  code: 'updatePatientError',
  message: 'Error while updating patient!'
};
exports.updateDoctorError = {
  code: 'updateDoctorError',
  message: 'Error while updating doctor!'
};
exports.updateSecretaryError = {
  code: 'updateSecretaryError',
  message: 'Error while updating secretary!'
};
exports.updateMedicalTestError = {
  code: 'updateMedicalTestError',
  message: 'Error while updating medical modifyingTest!'
};
exports.updateMedicalRecordError = {
  code: 'updateMedicalRecordError',
  message: 'Error while updating medical record!'
};
exports.mongoError = {
  code: 'mongoError',
  message: 'Error while querying mongo!'
};
exports.mongoConnError = {
  code: 'mongoConnError',
  message: 'Error while connecting to mongodb!'
};
exports.redisError = {
  code: 'redisError',
  message: 'Error while querying redis!'
};
exports.redisConnError = {
  code: 'redisConnError',
  message: 'Error while connecting to redis!'
};
exports.secretaryAlreadyHasTheDoctor = {
  code: 'secretaryAlreadyHasTheDoctor',
  message: 'Secretary has already been assigned to the doctor!'
};
exports.secretaryHasNotTheDoctor = {
  code: 'secretaryHasNotTheDoctor',
  message: 'Secretary has not been assigned to the doctor yet!'
};
exports.accessDenied = {
  code: 'accessDenied',
  message: 'Access denied!'
};
exports.saveScheduleError = {
  code: 'saveScheduleError',
  message: 'Error while saving schedule!'
};
exports.assignTicketError = {
  code: 'assignTicketError',
  message: 'Error while assigning ticket to patient!'
};
exports.fetchTicketsError = {
  code: 'fetchTicketsError',
  message: 'Error while fetching tickets of patient!'
};
exports.noTicketToAssign = {
  code: 'noTicketToAssign',
  message: 'There is no ticket to assign to patient!'
};
exports.unlockError = {
  code: 'unlockError',
  message: 'Cannot unlock the lock! It will eventually expire.'
};