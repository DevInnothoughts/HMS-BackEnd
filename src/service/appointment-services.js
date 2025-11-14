const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
const appointmentDb = require("../database/appointmentDb");
const DoctorDb = require("../database/doctorDb");
const FdedetailsDb = require("../database/fdedetailsDb");
const patientDb = require("../database/patientDb");
const departmentDb = require("../database/departmentDb");
const consultationDb = require("../database/consultationDb");
const treatmentDb = require("../database/treatmentDb");
const moment = require("moment");
const mongoose = require("mongoose");
const receiptDb = require("../database/receiptDb");
const ItemReceiptDb = require("../database/itemReceiptDb");
const { MongoClient } = require("mongodb");
const { getConnectionByLocation } = require("../../databaseUtils");
require("dotenv").config(); // Load environment variables

// Add a new appointment
async function addAppointment(appointment, user) {
  console.log("Service received request ", appointment);

  try {
    const appointmentCount = await appointmentDb.countDocuments();
    const newAppointmentId = `2025${appointmentCount + 1}`;

    // Create new appointment without patient_id
    const newAppointment = new appointmentDb({
      appointment_id: newAppointmentId,
      appointment_timestamp: appointment.date,
      doctorName: appointment.doctorName,
      patientName: appointment.patientName,
      patient_phone: appointment.patient_phone,
      patient_location: appointment.patient_location,
      appointmentTime: appointment.appointmentTime,
      FDE_Name: appointment.FDE_Name,
      note: appointment.note,
      reference: appointment.reference,
      departmentName: appointment.departmentName,
      appointmentWith: appointment.appointmentWith,
      patient_type: appointment.patient_type,
      ConfirmPatient: 0, // Initialize as unconfirmed
      consultation_name: appointment.consultation_name,
    });

    const appointmentResult = await newAppointment.save();
    console.log("Appointment successfully registered", appointmentResult);

    return new ApiResponse(
      201,
      "Appointment registered successfully. Requires confirmation.",
      null,
      appointmentResult
    );
  } catch (error) {
    console.error("Error while registering appointment:", error.message);
    return new ApiResponse(
      500,
      "Exception while appointment registration.",
      null,
      error.message
    );
  }
}

async function confirmAppointment(appointment_id, location) {
  const { connection } = getConnectionByLocation(location);

  if (!connection) {
    const err = new Error("Invalid location");
    err.status = 404;
    throw err;
  }

  try {
    console.log(
      "Service received request to confirm appointment:",
      appointment_id
    );

    const appointment = await new Promise((resolve, reject) => {
      connection.getConnection(function (err, tempCon) {
        if (err) return reject(err);

        const sql = `
          SELECT * 
          FROM appointment 
          WHERE appointment_id = ? 
          LIMIT 1;
        `;

        tempCon.query(sql, [appointment_id], (error, rows) => {
          tempCon.release();
          if (error) return reject(error);
          resolve(rows.length > 0 ? rows[0] : null);
        });
      });
    });

    if (!appointment) {
      console.warn("Appointment not found for ID:", appointment_id);
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    if (appointment.ConfirmPatient === 1) {
      console.log("Appointment already confirmed:", appointment_id);
      return new ApiResponse(
        400,
        "Appointment is already confirmed.",
        null,
        null
      );
    }

    // Capture confirm time (AM/PM)
    const confirmTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Generate new patient ID
    const patientCount = await new Promise((resolve, reject) => {
      connection.getConnection(function (err, tempCon) {
        if (err) return reject(err);

        tempCon.query(
          `SELECT COUNT(*) AS count FROM patient`,
          (error, rows) => {
            tempCon.release();
            if (error) return reject(error);
            resolve(rows[0].count);
          }
        );
      });
    });

    const newPatientId = `HHC/DP/${patientCount + 1}`;

    // Update patient record
    await new Promise((resolve, reject) => {
      connection.getConnection(function (err, tempCon) {
        if (err) return reject(err);

        const updateSQL = `
          UPDATE patient 
            SET Uid_no= ?, ConfirmPatient = 1
            WHERE patient_id = ?
            LIMIT 1;
          `;

        const values = [newPatientId, appointment.patient_id];

        tempCon.query(updateSQL, values, (error, result) => {
          tempCon.release();
          if (error) return reject(error);
          resolve(result);
        });
      });
    });

    console.log("✅ Patient updated:", newPatientId);

    // Update appointment
    const updateResult = await new Promise((resolve, reject) => {
      connection.getConnection(function (err, tempCon) {
        if (err) return reject(err);

        const updateSQL = `
          UPDATE appointment
          SET confirm_time = ?
          WHERE appointment_id = ?
          LIMIT 1;
        `;

        const params = [confirmTime, appointment_id];

        tempCon.query(updateSQL, params, (error, result) => {
          tempCon.release();
          if (error) return reject(error);
          resolve(result);
        });
      });
    });

    if (updateResult.affectedRows === 0) {
      console.error("❌ Failed to update appointment:", appointment_id);
      return new ApiResponse(
        500,
        "Error while updating appointment status.",
        null,
        null
      );
    }

    console.log("✅ Appointment confirmed successfully:", appointment_id);

    return new ApiResponse(200, "Appointment confirmed successfully.", {
      confirm_time: confirmTime,
    });
  } catch (error) {
    console.error("❌ Error while confirming appointment:", error.message);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

// Define formatPhoneNumber function at the top of appointment-services.js
function formatPhoneNumber(phoneNumber) {
  if (phoneNumber && typeof phoneNumber === "string") {
    return phoneNumber.replace(/\D/g, ""); // Remove non-digit characters
  }
  return ""; // Return empty string if invalid
}

async function editAppointment(patient_phone, updateData, user) {
  try {
    console.log("Phone number received:", patient_phone);
    console.log(" Update Data received:", updateData);

    const formattedPhone = formatPhoneNumber(patient_phone);

    if (!formattedPhone) {
      console.log(" Error: Missing or invalid phone number");
      return {
        statusCode: 400,
        message: "Phone number is required",
        data: null,
      };
    }

    console.log(" Searching for appointment with phone:", formattedPhone);

    // Remove _id from the update data, if it exists
    const { _id, ...updateWithoutId } = updateData;

    const updatedAppointment = await appointmentDb.findOneAndUpdate(
      { patient_phone: formattedPhone },
      { $set: updateWithoutId },
      { new: true }
    );

    if (!updatedAppointment) {
      console.log(" Error: Appointment not found in database.");
      return { statusCode: 404, message: "Appointment not found", data: null };
    }

    console.log("✅ Appointment updated successfully:", updatedAppointment);
    return {
      statusCode: 200,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    };
  } catch (error) {
    console.error(" Service Error while editing appointment:", error.message);
    return {
      statusCode: 500,
      message: "Internal server error",
      data: null,
      errorDetails: error.message, // This will help debug the issue
    };
  }
}

const uri =
  "mongodb+srv://latkarmuskan16:JyD7bl4xulV9VBhl@cluster0.ffvwr.mongodb.net/hmsDPRoadDb"; // Replace with your MongoDB URI

async function listAppointments({ from, to, location }) {
  const { connection } = getConnectionByLocation(location);

  if (!connection) {
    const err = new Error("Invalid location");
    err.status = 404;
    throw err;
  }

  try {
    console.log("Raw Query Params:", { from, to });

    if (!from || !to) {
      throw new Error("Missing 'from' or 'to' date in query params.");
    }

    // Convert DD-MM-YYYY → YYYY-MM-DD for MySQL
    const fromDate = moment(from, "DD-MM-YYYY", true).format("YYYY-MM-DD");
    const toDate = moment(to, "DD-MM-YYYY", true).format("YYYY-MM-DD");

    if (
      !moment(fromDate, "YYYY-MM-DD", true).isValid() ||
      !moment(toDate, "YYYY-MM-DD", true).isValid()
    ) {
      throw new Error(`Invalid date format: from=${from}, to=${to}`);
    }

    console.log("Converted Dates:", { fromDate, toDate });

    // ✅ Proper async/await query with connection pool
    const rows = await new Promise((resolve, reject) => {
      connection.getConnection(function (err, tempCon) {
        if (err) {
          return reject(err);
        }

        const sql = `
         SELECT
          ap.*,
          p.name AS patient_name,
          d.name AS doctor_name
        FROM appointment ap
        LEFT JOIN patient p ON ap.patient_id = p.patient_id
        LEFT JOIN doctor d ON ap.doctor_id = d.doctor_id
        WHERE
          ap.appointment_timestamp BETWEEN ? AND ?
          AND (ap.is_deleted IS NULL OR ap.is_deleted != 1)
        ORDER BY ap.appointment_id DESC;
        `;

        const queryParams = [fromDate, toDate];

        tempCon.query(sql, queryParams, (error, rows) => {
          tempCon.release();
          if (error) return reject(error);
          resolve(rows);
        });
      });
    });

    console.log("✅ Appointments Found:", rows.length);
    return rows;
  } catch (error) {
    console.error("❌ Error fetching appointments:", error.message);
    return [];
  }
}

// Doctor dropdown
async function doctorDropdown(location) {
  try {
    // Get MySQL connection by location
    const { connection } = getConnectionByLocation(location);
    if (!connection) {
      throw new Error("Invalid location");
    }

    // Fetch doctor_id and name from the doctor table
    const doctors = await new Promise((resolve, reject) => {
      connection.getConnection((err, tempCon) => {
        if (err) {
          console.error("DB connection error:", err);
          return reject(err);
        }

        const sql = `
          SELECT doctor_id, name
          FROM doctor
          WHERE (is_deleted IS NULL OR is_deleted != 1)
          ORDER BY name ASC;
        `;

        tempCon.query(sql, (error, results) => {
          tempCon.release();
          if (error) {
            console.error("Error fetching doctors:", error);
            return reject(error);
          }
          console.log("Fetched doctors:", results);
          resolve(results);
        });
      });
    });

    console.log(`✅ Retrieved ${doctors.length} doctors for dropdown.`);
    return doctors;
  } catch (error) {
    console.error(
      "❌ Error in service layer while fetching doctor dropdown:",
      error.message
    );
    throw new Error("Unable to fetch doctor dropdown.");
  }
}

// Consultation dropdown
async function consultationDropdown() {
  try {
    return await consultationDb.find({}, "consultation_id consultation_name");
  } catch (error) {
    console.error(
      "Error in service layer while fetching doctor consultationDropdown:",
      error.message
    );
    throw new Error("Unable to fetch doctor dropdown.");
  }
}

// FDE dropdown
async function fdeDropdown(location) {
  try {
    // Get MySQL connection based on location
    const { connection } = getConnectionByLocation(location);
    if (!connection) {
      throw new Error("Invalid location");
    }

    // Query to fetch FDEID and FDEName
    const fdeList = await new Promise((resolve, reject) => {
      connection.getConnection((err, tempCon) => {
        if (err) {
          console.error("DB connection error:", err);
          return reject(err);
        }

        const sql = `
          SELECT FDEID, FDEName
          FROM fdedetails
          WHERE (is_deleted IS NULL OR is_deleted != 1)
          ORDER BY FDEName ASC;
        `;

        tempCon.query(sql, (error, results) => {
          tempCon.release();
          if (error) {
            console.error("Error fetching FDE dropdown:", error);
            return reject(error);
          }
          resolve(results);
        });
      });
    });

    console.log(`✅ Retrieved ${fdeList.length} FDEs for dropdown.`);
    return fdeList;
  } catch (error) {
    console.error(
      "❌ Error in service layer while fetching FDE dropdown:",
      error.message
    );
    throw new Error("Unable to fetch FDE dropdown.");
  }
}

// Department dropdown
async function departmentDropdown() {
  try {
    return await departmentDb.find({}, "department_id name");
  } catch (error) {
    console.error(
      "Error in service layer while fetching department dropdown:",
      error.message
    );
    throw new Error("Unable to fetch department dropdown.");
  }
}

// Treatment DropDown
async function treatmentDropdown() {
  try {
    return await treatmentDb.find({}, "treatment_id treatment_name");
  } catch (error) {
    console.error(
      "Error in service layer while fetching treatment dropdown:",
      error.message
    );
    throw new Error("Unable to fetch treatment dropdown.");
  }
}

// Update history check
async function updateHistoryChk(appointment_id, location) {
  try {
    console.log(
      "Service received request to update historyChk:",
      appointment_id
    );

    const result = await new Promise((resolve, reject) => {
      const { connection } = getConnectionByLocation(location); // ✅ adjust to your DB connection function
      connection.getConnection((err, tempCon) => {
        if (err) {
          console.error("DB connection error:", err);
          return reject(err);
        }

        // Step 1: Check if appointment exists
        const checkSql = `
          SELECT * FROM appointment 
          WHERE appointment_id = ? AND (is_deleted IS NULL OR is_deleted != 1)
          LIMIT 1;
        `;

        tempCon.query(checkSql, [appointment_id], (checkErr, rows) => {
          if (checkErr) {
            tempCon.release();
            return reject(checkErr);
          }

          if (rows.length === 0) {
            tempCon.release();
            console.warn(
              "Appointment not found for history update:",
              appointment_id
            );
            return resolve({
              status: 404,
              message: "Appointment not found.",
              data: null,
            });
          }

          // Step 2: Update historychk field
          const updateSql = `
            UPDATE appointment 
            SET historychk = 3 
            WHERE appointment_id = ?
            LIMIT 1;
          `;

          tempCon.query(
            updateSql,
            [appointment_id],
            (updateErr, updateResult) => {
              if (updateErr) {
                tempCon.release();
                return reject(updateErr);
              }

              if (updateResult.affectedRows === 0) {
                tempCon.release();
                console.error("Failed to update historyChk:", appointment_id);
                return resolve({
                  status: 500,
                  message: "Error while updating historyChk.",
                  data: null,
                });
              }

              // Step 3: Fetch the updated appointment
              const fetchUpdatedSql = `
              SELECT * FROM appointment WHERE appointment_id = ? LIMIT 1;
            `;

              tempCon.query(
                fetchUpdatedSql,
                [appointment_id],
                (fetchErr, updatedRows) => {
                  tempCon.release();
                  if (fetchErr) return reject(fetchErr);

                  console.log(
                    "historyChk successfully updated for appointment:",
                    appointment_id
                  );

                  resolve({
                    status: 200,
                    message: "History flag updated successfully.",
                    data: updatedRows[0],
                  });
                }
              );
            }
          );
        });
      });
    });

    return new ApiResponse(result.status, result.message, result.data, null);
  } catch (error) {
    console.error("Error while updating historyChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

// Update execution checkS

async function updateExecutionChk(appointment_id, location) {
  try {
    console.log(
      "Service received request to update executionChk:",
      appointment_id
    );

    const result = await new Promise((resolve, reject) => {
      const { connection } = getConnectionByLocation(location); // ✅ Use your existing DB connection manager

      connection.getConnection((err, tempCon) => {
        if (err) {
          console.error("DB connection error:", err);
          return reject(err);
        }

        // Step 1: Check if the appointment exists
        const checkSql = `
          SELECT * FROM appointment 
          WHERE appointment_id = ? 
          AND (is_deleted IS NULL OR is_deleted != 1)
          LIMIT 1;
        `;

        tempCon.query(checkSql, [appointment_id], (checkErr, rows) => {
          if (checkErr) {
            tempCon.release();
            return reject(checkErr);
          }

          if (rows.length === 0) {
            tempCon.release();
            console.warn(
              "Appointment not found for execution update:",
              appointment_id
            );
            return resolve({
              status: 404,
              message: "Appointment not found.",
              data: null,
            });
          }

          // Step 2: Update the execution flag
          const updateSql = `
            UPDATE appointment 
            SET executivechk = 1 
            WHERE appointment_id = ?
            LIMIT 1;
          `;

          tempCon.query(
            updateSql,
            [appointment_id],
            (updateErr, updateResult) => {
              if (updateErr) {
                tempCon.release();
                return reject(updateErr);
              }

              if (updateResult.affectedRows === 0) {
                tempCon.release();
                console.error("Failed to update executionChk:", appointment_id);
                return resolve({
                  status: 500,
                  message: "Error while updating executionChk.",
                  data: null,
                });
              }

              tempCon.release();
              console.log(
                "executionChk successfully updated for appointment:",
                appointment_id
              );

              resolve({
                status: 200,
                message: "Execution flag updated successfully.",
                data: null,
              });
            }
          );
        });
      });
    });

    return new ApiResponse(result.status, result.message, result.data, null);
  } catch (error) {
    console.error("Error while updating executionChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

// Update consultation check
async function updateConsultationChk(appointment_id, location) {
  try {
    console.log(
      "Service received request to update consultationChk:",
      appointment_id
    );

    const result = await new Promise((resolve, reject) => {
      const { connection } = getConnectionByLocation(location); // ✅ Use your existing DB connection manager

      connection.getConnection((err, tempCon) => {
        if (err) {
          console.error("DB connection error:", err);
          return reject(err);
        }

        // Step 1: Check if appointment exists
        const checkSql = `
          SELECT * FROM appointment 
          WHERE appointment_id = ? 
          AND (is_deleted IS NULL OR is_deleted != 1)
          LIMIT 1;
        `;

        tempCon.query(checkSql, [appointment_id], (checkErr, rows) => {
          if (checkErr) {
            tempCon.release();
            return reject(checkErr);
          }

          if (rows.length === 0) {
            tempCon.release();
            console.warn(
              "Appointment not found for consultation update:",
              appointment_id
            );
            return resolve({
              status: 404,
              message: "Appointment not found.",
              data: null,
            });
          }

          // Step 2: Update consultationchk to 2
          const updateSql = `
            UPDATE appointment 
            SET consultationchk = 2 
            WHERE appointment_id = ?
            LIMIT 1;
          `;

          tempCon.query(
            updateSql,
            [appointment_id],
            (updateErr, updateResult) => {
              tempCon.release();

              if (updateErr) return reject(updateErr);

              if (updateResult.affectedRows === 0) {
                console.error(
                  "Failed to update consultationChk:",
                  appointment_id
                );
                return resolve({
                  status: 500,
                  message: "Error while updating consultationChk.",
                  data: null,
                });
              }

              console.log(
                "consultationChk successfully updated for appointment:",
                appointment_id
              );

              resolve({
                status: 200,
                message: "Consultation flag updated successfully.",
                data: null,
              });
            }
          );
        });
      });
    });

    return new ApiResponse(result.status, result.message, result.data, null);
  } catch (error) {
    console.error("Error while updating consultationChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

async function updateExecutionChkToFour(appointment_id) {
  try {
    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({
        _id: new mongoose.Types.ObjectId(appointment_id),
      });
    } else {
      appointment = await appointmentDb.findOne({
        appointment_id: String(appointment_id),
      });
    }

    if (!appointment) {
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    if (appointment.executivechk === 1) {
      const updateResult = await appointmentDb.updateOne(
        { _id: appointment._id },
        { $set: { executivechk: 4 } }
      );

      if (updateResult.modifiedCount === 0) {
        return new ApiResponse(
          500,
          "Error while updating executionChk.",
          null,
          null
        );
      }

      return new ApiResponse(
        200,
        "Execution flag updated to 4 successfully.",
        null,
        null
      );
    } else {
      return new ApiResponse(
        400,
        "Execution flag is not in the expected state (1).",
        null,
        null
      );
    }
  } catch (error) {
    console.error("Error while updating executionChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

// Add a new receipt
async function saveReceipt(receiptData) {
  console.log("Initial request received:", receiptData);

  try {
    if (mongoose.connection.readyState !== 1) {
      console.error("Database is not connected.");
      return new ApiResponse(500, "Database connection error.", null, null);
    }

    const results = [];
    const receipts = Array.isArray(receiptData) ? receiptData : [receiptData];

    for (const receipt of receipts) {
      // Get fresh counts for each receipt
      const receiptCount = await receiptDb.countDocuments();
      const itemCount = await ItemReceiptDb.countDocuments();

      // Generate receipt_id first
      receipt.receipt_id = `REC${receiptCount + 1}`;
      console.log("Processing receipt with generated ID:", receipt);

      // Validate required fields
      const requiredFields = ["appointment_id", "totalamt", "paymentmode"];
      const missingFields = requiredFields.filter((field) => !receipt[field]);

      if (missingFields.length > 0) {
        console.error("Missing required fields for receipt:", missingFields);
        continue;
      }

      const appointment = await appointmentDb.findOne({
        appointment_id: receipt.appointment_id,
      });
      if (!appointment) {
        console.error("Appointment not found for ID:", receipt.appointment_id);
        continue;
      }

      // Create main receipt with the generated receipt_id
      const newReceipt = new receiptDb({
        receipt_id: receipt.receipt_id, // Use the generated ID from receipt object
        receipt_date: receipt.receipt_date,
        patient_id: appointment.patient_id,
        appointment_id: appointment.appointment_id,
        doctor_id: receipt.doctor_id,
        consultation: receipt.consultation,
        comment: receipt.comment || appointment.note,
        sprayqty: receipt.sprayqty || 0,
        totalamt: receipt.totalamt,
        discountnote: receipt.discountnote || "",
        discountamt: receipt.discountamt || 0,
        paymentmode: receipt.paymentmode,
        otherdetails: receipt.otherdetails || "",
        is_deleted: receipt.is_deleted || 0,
      });

      // Create item receipt with the same receipt_id
      // Convert the formatted string to a valid Date object using moment
      const itemDate = moment(receipt.receipt_date, "DD-MM-YYYY").toDate();
      const formattedItemId = String(itemCount + 1).padStart(4, "0");
      const newItemReceipt = new ItemReceiptDb({
        item_id: formattedItemId,
        receipt_id: receipt.receipt_id, // Use the generated ID from receipt object
        patient_id: appointment.patient_id,
        item_date: itemDate, // ✅ Save as Date object                consultation: receipt.consultation,
        total: receipt.totalamt,
        payment_mode: receipt.paymentmode,
        is_deleted: 0,
      });

      const [mainReceiptResult, itemReceiptResult] = await Promise.all([
        newReceipt.save(),
        newItemReceipt.save(),
      ]);

      results.push({
        mainReceipt: mainReceiptResult,
        itemReceipt: itemReceiptResult,
      });
    }

    console.log(
      `Successfully saved ${results.length} receipts in DB:`,
      results
    );
    return new ApiResponse(
      201,
      "Receipts created successfully.",
      null,
      results
    );
  } catch (error) {
    console.error("Error while creating receipts:", error);
    return new ApiResponse(
      500,
      "Exception while creating receipts.",
      null,
      error.message
    );
  }
}

async function getPatientByMobile(patient_phone) {
  try {
    console.log("Fetching patient details for mobile number:", patient_phone);

    // Use the correct variable name 'patient_phone'
    const patients = await patientDb.findOne({ phone: patient_phone });

    if (!patients) {
      return new ApiResponse(
        404,
        "Patient not found in patient list",
        null,
        null
      );
    }

    return new ApiResponse(
      200,
      "Patient details fetched successfully",
      null,
      patients
    ); // Return patient details
  } catch (error) {
    console.error("Error fetching patient details:", error);
    return new ApiResponse(500, "Internal server error", null, error.message);
  }
}

async function listReceipt(queryParams) {
  try {
    let filter = {};
    // Apply date range filter only if both from and to dates are provided
    if (queryParams.from && queryParams.to) {
      const fromDate = new Date(queryParams.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(queryParams.to);
      toDate.setHours(23, 59, 59, 999);

      filter.receipt_date = { $gte: fromDate, $lte: toDate };
    }

    // Apply other filters
    if (queryParams.appointment_id)
      filter.appointment_id = queryParams.appointment_id;
    if (queryParams.patient_id) filter.patient_id = queryParams.patient_id;

    // Apply date range filter if both from and to dates are provided
    if (queryParams.from && queryParams.to) {
      const fromDate = new Date(queryParams.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(queryParams.to);
      toDate.setHours(23, 59, 59, 999);

      filter.receipt_date = { $gte: fromDate, $lte: toDate };
    }

    // Apply other filters
    if (queryParams.appointment_id)
      filter.appointment_id = queryParams.appointment_id;
    if (queryParams.patient_id) filter.patient_id = queryParams.patient_id;

    console.log("Final filter applied:", filter);

    // Pagination
    const page = queryParams.page ? parseInt(queryParams.page) : 1;
    const limit = queryParams.limit ? parseInt(queryParams.limit) : 1000;
    const skip = (page - 1) * limit;

    // Fetch receipts
    const receipts = await receiptDb
      .find(filter)
      .sort({ receipt_id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    console.log("Receipts found:", receipts.length);

    // Fetch appointment details separately
    const updatedReceipts = await Promise.all(
      receipts.map(async (receipt) => {
        if (!receipt.appointment_id) return receipt;

        const appointment = await appointmentDb
          .findOne({ appointment_id: receipt.appointment_id })
          .lean();
        if (appointment) {
          receipt.patientName = appointment.patientName;
          receipt.doctorName = appointment.doctorName;
          receipt.consultation = receipt.consultation;
        }
        return receipt;
      })
    );

    return new ApiResponse(
      200,
      "Receipts fetched successfully.",
      null,
      updatedReceipts
    );
  } catch (error) {
    console.error("Error while fetching receipts:", error.message);
    return new ApiResponse(
      500,
      "Unable to fetch receipts.",
      null,
      error.message
    );
  }
}

// async function deleteAppointment(appointment_id) {
//   try {
//     console.log("Service received request to mark appointment as deleted:", appointment_id);

//     let appointment;
//     if (mongoose.Types.ObjectId.isValid(appointment_id)) {
//       appointment = await appointmentDb.findOne({ _id: new mongoose.Types.ObjectId(appointment_id) });
//     } else {
//       appointment = await appointmentDb.findOne({ appointment_id: String(appointment_id) });
//     }

//     if (!appointment) {
//       console.warn("Appointment not found for ID:", appointment_id);
//       return new ApiResponse(404, "Appointment not found.", null, null);
//     }

//     // Update the is_deleted flag
//     appointment.is_deleted = 1; // Mark as deleted
//     await appointment.save(); // Save the changes

//     console.log("Appointment marked as deleted successfully:", appointment_id);
//     return new ApiResponse(200, "Appointment marked as deleted successfully.", null, null);
//   } catch (error) {
//     console.error("Error while marking appointment as deleted:", error);
//     return new ApiResponse(500, "Internal server error.", null, error.message);
//   }
// }
async function deleteAppointment(appointment_id) {
  try {
    console.log(
      "Service received request to mark appointment as deleted:",
      appointment_id
    );

    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({
        $or: [
          { _id: new mongoose.Types.ObjectId(appointment_id) },
          { appointment_id: String(appointment_id) },
        ],
      });
    } else {
      appointment = await appointmentDb.findOne({
        appointment_id: String(appointment_id),
      });
    }

    if (!appointment) {
      console.warn("Appointment not found for ID:", appointment_id);
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    console.log("Before update, is_deleted:", appointment.is_deleted);

    // Update the is_deleted flag using updateOne
    const updateResult = await appointmentDb.updateOne(
      { _id: appointment._id },
      { $set: { is_deleted: 1 } }
    );

    if (updateResult.modifiedCount === 0) {
      console.warn(
        "Appointment was not updated. Possible issue:",
        updateResult
      );
      return new ApiResponse(
        500,
        "Failed to mark appointment as deleted.",
        null,
        null
      );
    }

    console.log("Appointment marked as deleted successfully:", appointment_id);
    return new ApiResponse(
      200,
      "Appointment marked as deleted successfully.",
      null,
      null
    );
  } catch (error) {
    console.error("Error while marking appointment as deleted:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

module.exports = {
  addAppointment,
  editAppointment,
  listAppointments,
  confirmAppointment,
  doctorDropdown,
  consultationDropdown,
  fdeDropdown,
  departmentDropdown,
  updateHistoryChk,
  updateExecutionChk,
  updateConsultationChk,
  updateExecutionChkToFour,
  treatmentDropdown,
  saveReceipt,
  getPatientByMobile,
  listReceipt,
  deleteAppointment,
};
