const ApiResponse = require('../utils/api-response');
const patientDb = require('../database/patientDb');

// Helper function to generate a unique UID
function generateUniqueUid() {
    const prefix = "HHCDP"; // Example prefix for UIDs
    const uniqueNumber = Date.now() + Math.floor(Math.random() * 1000); // Ensures a unique value based on timestamp
    return `${prefix}${uniqueNumber}`;
}

// Add a new patient
async function addPatient(patient) {
    console.log("Service received request ", patient);
    try {
        // Generate a UID if it is not provided
        const Uid_no = patient.Uid_no || generateUniqueUid();

        // Create a new patient instance
        const PatientDb = new patientDb({
            patient_id: patient.patient_id,
            Uid_no: patient.Uid_no,
            name: patient.patientName,
            prefix: patient.prefix,
            sex: patient.sex,
            phone: patient.mobileNo,
            email: patient.email,
            pincode: patient.pincode,
            companyname: patient.companyname,
            age: patient.age,
            ref: patient.ref,
            reference_type: patient.reference_type,
            occupation: patient.occupation,
            address: patient.address,
            registeration_id: patient.registeration_id,
            mobile_2: patient.mobile_2,
            timestamp_date: patient.timestamp_date,
            blood_group: patient.blood_group,
            birth_date: patient.birth_date,
            password: patient.password,
            account_opening_timestamp: patient.account_opening_timestamp,
            image: patient.image,
            is_deleted: patient.is_deleted,
            patientHistory: patient.patientHistory,
            state: patient.state,
            country: patient.country,
            height: patient.height,
            weight: patient.weight,
            maritalStatus: patient.maritalStatus,
            title: patient.title,
            city: patient.city,
            date: patient.date,
            patient_location: patient.patient_location,
            ConfirmPatient: patient.ConfirmPatient || 0, // Default to 0 unless provided
            specific_work: patient.specific_work,
            identity: patient.identity,
            patient_type: patient.patient_type
        });

        // Save the new patient to the database
        const result = await PatientDb.save();
        console.log("Patient successfully registered", result);
        return new ApiResponse(201, "Patient registered successfully.", null, result);

    } catch (error) {
        console.log("Error while registering patient: ", error.message);
        return new ApiResponse(
            500,
            "Exception while patient registration.",
            null,
            error.message
        );
    }
}

async function editPatient(phone, payload, user) {
    try {
        let patient = await patientDb.findOne({ phone });

        if (!patient) {
            return new ApiResponse(400, "Patient not found for edit", null, null);
        }

        console.log("Existing Patient Data:", patient);

        // Ensure payload is not empty
        if (Object.keys(payload).length === 0) {
            return new ApiResponse(400, "No data provided for update.", null, null);
        }

        // Prepare update object
        const updatedPayload = {
            ...payload,
            Uid_no: payload.Uid_no || patient.Uid_no
        };

        // Update patient record
        const updatedPatient = await patientDb.findOneAndUpdate(
            { phone: patient.phone },
            { $set: updatedPayload },
            { new: true }
        );

        if (!updatedPatient) {
            return new ApiResponse(500, "Error while updating the patient.", null, null);
        }

        console.log("Updated Patient Data:", updatedPatient);
        return new ApiResponse(200, "Patient details updated successfully.", null, updatedPatient._doc);

    } catch (error) {
        console.error("Error while updating Patient details:", error.message);
        return new ApiResponse(500, "Exception while updating Patient details.", null, error.stack);
    }
}

async function listPatient(showConfirmedOnly = false) {
    try {
        const aggregationPipeline = [
            { $sort: { _id: -1 } },
            { $limit: 10 }
        ];

        if (showConfirmedOnly) {
            aggregationPipeline.push({
                $match: {
                    ConfirmPatient: 1
                }
            });
        }

        aggregationPipeline.push({
            $project: {
                _id: 1,
                patient_id: 1,
                title: 1,
                uid: "$Uid_no",
                name: 1,
                prefix: 1,
                sex: 1,
                phone: 1,
                email: 1,
                pincode: 1,
                companyname: 1,
                age: 1,
                ref: 1,
                reference_type: 1,
                occupation: 1,
                address: 1,
                registeration_id: 1,
                mobile_2: 1,
                timestamp_date: 1,
                blood_group: 1,
                birth_date: 1,
                password: 1,
                account_opening_timestamp: 1,
                image: 1,
                is_deleted: 1,
                weight: 1,
                height: 1,
                patient_location: 1,
                date: 1,
                patientHistory: 1,
                ConfirmPatient: 1,
                mobileNo: 1,
                identity: 1,
                specific_work: 1,
                patient_type: 1
            }
        });

        const patients = await patientDb.aggregate(aggregationPipeline);
        return patients;
    } catch (error) {
        console.log("Error while fetching patients: ", error.message);
        throw new Error("Unable to fetch patients.");
    }
}


module.exports = {
    addPatient, editPatient, listPatient};
