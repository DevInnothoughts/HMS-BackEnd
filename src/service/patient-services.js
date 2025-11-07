const ApiResponse = require("../utils/api-response");
const patientDb = require("../database/patientDb");
const { getConnectionByLocation } = require("../../databaseUtils");

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
      patient_type: patient.patient_type,
    });

    // Save the new patient to the database
    const result = await PatientDb.save();
    console.log("Patient successfully registered", result);
    return new ApiResponse(
      201,
      "Patient registered successfully.",
      null,
      result
    );
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

async function editPatient(patient_id, payload, user, location) {
  try {
    console.log("Edit request for patient_id:", patient_id);

    // Validate input
    if (!patient_id) {
      return new ApiResponse(400, "Missing patient ID.", null, null);
    }
    if (!payload || Object.keys(payload).length === 0) {
      return new ApiResponse(400, "No data provided for update.", null, null);
    }

    // Get DB connection based on user/location (if applicable)
    const { connection } = getConnectionByLocation(location || "default");
    if (!connection) {
      throw new Error("Invalid location or DB connection.");
    }

    // Get existing patient record
    const patient = await new Promise((resolve, reject) => {
      connection.getConnection((err, tempCon) => {
        if (err) return reject(err);

        const sql = "SELECT * FROM patient WHERE patient_id = ?";
        tempCon.query(sql, [patient_id], (error, results) => {
          tempCon.release();
          if (error) return reject(error);
          resolve(results[0]);
        });
      });
    });

    if (!patient) {
      return new ApiResponse(400, "Patient not found for edit.", null, null);
    }

    console.log("Existing Patient Data:", patient);

    // Ensure Uid_no fallback logic (like in Mongo version)
    const updatedPayload = {
      ...payload,
      Uid_no: payload.Uid_no || patient.Uid_no,
    };

    // Build dynamic SQL SET clause
    const fields = Object.keys(updatedPayload)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updatedPayload);

    // Update the record by patient_id (same as Mongo’s findOneAndUpdate)
    const updateResult = await new Promise((resolve, reject) => {
      connection.getConnection((err, tempCon) => {
        if (err) return reject(err);

        const sql = `UPDATE patient SET ${fields} WHERE patient_id = ?`;
        tempCon.query(sql, [...values, patient_id], (error, result) => {
          tempCon.release();
          if (error) return reject(error);
          resolve(result);
        });
      });
    });

    if (updateResult.affectedRows === 0) {
      return new ApiResponse(
        500,
        "Error while updating the patient.",
        null,
        null
      );
    }

    // Fetch the updated record to return (same as `{ new: true }` in Mongo)
    const updatedPatient = await new Promise((resolve, reject) => {
      connection.getConnection((err, tempCon) => {
        if (err) return reject(err);

        const sql = "SELECT * FROM patient WHERE patient_id = ?";
        tempCon.query(sql, [patient_id], (error, results) => {
          tempCon.release();
          if (error) return reject(error);
          resolve(results[0]);
        });
      });
    });

    console.log("Updated Patient Data:", updatedPatient);

    return new ApiResponse(
      200,
      "Patient details updated successfully.",
      null,
      updatedPatient
    );
  } catch (error) {
    console.error("Error while updating Patient details:", error.message);
    return new ApiResponse(
      500,
      "Exception while updating Patient details.",
      null,
      error.stack
    );
  }
}

async function listPatient(req) {
  const { location, from, to } = req.query;
  const showConfirmedOnly = false;

  try {
    // Validate required fields
    if (!location) throw new Error("Missing required field: location");
    if (!from || !to) throw new Error("Missing date range: from/to");

    // Convert DD-MM-YYYY → YYYY-MM-DD
    const formatDate = (dateStr) => {
      const [day, month, year] = dateStr.split("-");
      return `${year}-${month}-${day}`;
    };

    const fromDate = formatDate(from);
    const toDate = formatDate(to);

    const { connection } = getConnectionByLocation(location);
    if (!connection) throw new Error("Invalid location");

    const patients = await new Promise((resolve, reject) => {
      connection.getConnection((err, tempCon) => {
        if (err) {
          console.error("DB connection error:", err);
          return reject(err);
        }

        // Base query
        let sql = `
          SELECT *
          FROM patient
          WHERE date BETWEEN ? AND ?
            AND (is_deleted IS NULL OR is_deleted != 1)
        `;

        // Optional filter for confirmed patients
        if (showConfirmedOnly) {
          sql += " AND ConfirmPatient = 1";
        }

        sql += " ORDER BY patient_id DESC;";

        // Execute query
        tempCon.query(sql, [fromDate, toDate], (error, results) => {
          tempCon.release();
          if (error) {
            console.error("Error fetching patients:", error);
            return reject(error);
          }
          //console.log("Fetched patients:", results.length);
          resolve(results);
        });
      });
    });

    console.log(`✅ Retrieved ${patients.length} patients.`);
    return patients;
  } catch (error) {
    console.error("❌ Error while fetching patients:", error.message);
    throw new Error("Unable to fetch patients.");
  }
}

module.exports = {
  addPatient,
  editPatient,
  listPatient,
};
