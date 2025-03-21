const ApiResponse = require('../utils/api-response');
const USER_ROLE = require('../constants/role-constant');
const appointmentDb = require('../database/appointmentDb');
const DoctorDb = require('../database/doctorDb');
const FdedetailsDb = require('../database/fdedetailsDb');
const patientDb = require('../database/patientDb');
const departmentDb = require('../database/departmentDb');
const consultationDb = require('../database/consultationDb');
const treatmentDb = require('../database/treatmentDb');
const moment = require('moment');
const mongoose = require('mongoose');
const receiptDb = require('../database/receiptDb');
const ItemReceiptDb = require('../database/itemReceiptDb');
const { MongoClient } = require("mongodb");
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
      ConfirmPatient: 0 , // Initialize as unconfirmed
      consultation_name: appointment.consultation_name
    });

    const appointmentResult = await newAppointment.save();
    console.log("Appointment successfully registered", appointmentResult);

    return new ApiResponse(201, "Appointment registered successfully. Requires confirmation.", null, appointmentResult);
  } catch (error) {
    console.error("Error while registering appointment:", error.message);
    return new ApiResponse(500, "Exception while appointment registration.", null, error.message);
  }
}

async function confirmAppointment(appointment_id) {
  try {
    console.log("Service received request to confirm appointment:", appointment_id);

    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({ _id: new mongoose.Types.ObjectId(appointment_id) });
    } else {
      appointment = await appointmentDb.findOne({ appointment_id: String(appointment_id) });
    }

    if (!appointment) {
      console.warn("Appointment not found for ID:", appointment_id);
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    if (appointment.ConfirmPatient === 1) {
      console.log("Appointment is already confirmed:", appointment_id);
      return new ApiResponse(400, "Appointment is already confirmed.", null, null);
    }

 // Capture the current time in AM/PM format
    const confirmTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Ensures AM/PM format
    });

    // Create patient record only upon confirmation
    const patientCount = await patientDb.countDocuments();
    const newPatientId = `${2025000000 + patientCount + 1}`;

    const newPatient = new patientDb({
      patient_id: newPatientId,
      name: appointment.patientName,
      phone: appointment.patient_phone,
      patient_location: appointment.patient_location,
      departmentName: appointment.departmentName,
      doctorName: appointment.doctorName,
      appointmentTime: appointment.appointmentTime,
      date: appointment.appointment_timestamp,
      ConfirmPatient: 1
    });

    await newPatient.save();
    console.log("Patient added to the patient list:", newPatient);

    // Update appointment with patient_id and confirm status
    const updateResult = await appointmentDb.updateOne(
      { _id: appointment._id },
      {
        $set: {
          ConfirmPatient: 1,
          patient_id: newPatientId,
          confirm_time: confirmTime // Save confirm time
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      console.error("Failed to update appointment status:", appointment_id);
      return new ApiResponse(500, "Error while updating appointment status.", null, null);
    }

      return new ApiResponse(200, "Appointment confirmed successfully.", {
        confirm_time: confirmTime, // Ensure this is included
      });
  } catch (error) {
    console.error("Error while confirming appointment:", error);
    return new ApiResponse(500, "Internal server error.", null, null);
  }
}



// Define formatPhoneNumber function at the top of appointment-services.js
function formatPhoneNumber(phoneNumber) {
    if (phoneNumber && typeof phoneNumber === 'string') {
        return phoneNumber.replace(/\D/g, '');  // Remove non-digit characters
    }
    return ''; // Return empty string if invalid
}

async function editAppointment(patient_phone, updateData, user) {
    try {
        console.log("Phone number received:", patient_phone);
        console.log(" Update Data received:", updateData);

        const formattedPhone = formatPhoneNumber(patient_phone);

        if (!formattedPhone) {
            console.log(" Error: Missing or invalid phone number");
            return { statusCode: 400, message: "Phone number is required", data: null };
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
        return { statusCode: 200, message: "Appointment updated successfully", data: updatedAppointment };

    } catch (error) {
        console.error(" Service Error while editing appointment:", error.message);
        return { 
            statusCode: 500, 
            message: "Internal server error", 
            data: null,
            errorDetails: error.message // This will help debug the issue
        };
    }
}


const uri = "mongodb+srv://latkarmuskan16:JyD7bl4xulV9VBhl@cluster0.ffvwr.mongodb.net/hmsDPRoadDb"; // Replace with your MongoDB URI

async function listAppointments({ from, to }) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("Raw Query Params:", { from, to });

        if (!from || !to) {
            throw new Error("Missing 'from' or 'to' date in query params.");
        }

        // Convert DD-MM-YYYY to JavaScript Date objects
        const fromDate = moment(from, "DD-MM-YYYY", true).startOf("day").toDate();
        const toDate = moment(to, "DD-MM-YYYY", true).endOf("day").toDate();

        if (isNaN(fromDate) || isNaN(toDate)) {
            throw new Error(`Invalid date format: from=${from}, to=${to}`);
        }

        console.log("Converted Dates:", { fromDate, toDate });

        await client.connect();
        const db = client.db("hmsDPRoadDb");
        const collection = db.collection("appointment");

        // ✅ Corrected Query: Exclude is_deleted = 1
        const results = await collection
            .find({
                $and: [
                    {
                        $expr: {
                            $and: [
                                {
                                    $gte: [
                                        { $dateFromString: { dateString: "$appointment_timestamp", format: "%d-%m-%Y", onError: null } },
                                        fromDate
                                    ]
                                },
                                {
                                    $lte: [
                                        { $dateFromString: { dateString: "$appointment_timestamp", format: "%d-%m-%Y", onError: null } },
                                        toDate
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        $or: [
                            { is_deleted: { $ne: 1 } } // ✅ Exclude records where is_deleted = 1
                        ]
                    }
                ]
            })
            .sort({ appointment_id: -1 }) // ✅ Sort by `appointment_timestamp` in descending order
            .toArray();

        console.log("✅ Appointments Found:", results.length);
        return results;
    } catch (error) {
        console.error("❌ Error fetching appointments:", error.message);
        return [];
    } finally {
        if (client) {
            await client.close();
        }
    }
}



// Doctor dropdown
async function doctorDropdown() {
  try {
    return await DoctorDb.find({}, 'doctor_id name');
  } catch (error) {
    console.error("Error in service layer while fetching doctor dropdown:", error.message);
    throw new Error("Unable to fetch doctor dropdown.");
  }
}

// Consultation dropdown
async function consultationDropdown() {
  try {
    return await consultationDb.find({}, 'consultation_id consultation_name');
  } catch (error) {
    console.error("Error in service layer while fetching doctor consultationDropdown:", error.message);
    throw new Error("Unable to fetch doctor dropdown.");

  }
}

// FDE dropdown
async function fdeDropdown() {
  try {
    return await FdedetailsDb.find({}, 'FDEID FDEName');
  } catch (error) {
    console.error("Error in service layer while fetching FDE dropdown:", error.message);
    throw new Error("Unable to fetch FDE dropdown.");
  }
}

// Department dropdown
async function departmentDropdown() {
  try {
    return await departmentDb.find({}, 'department_id name');
  } catch (error) {
    console.error("Error in service layer while fetching department dropdown:", error.message);
    throw new Error("Unable to fetch department dropdown.");
  }
}

// Treatment DropDown
async function treatmentDropdown() {
  try {
    return await treatmentDb.find({}, 'treatment_id treatment_name');
  } catch (error) {
    console.error("Error in service layer while fetching treatment dropdown:", error.message);
    throw new Error("Unable to fetch treatment dropdown.");
  }
}

// Update history check
async function updateHistoryChk(appointment_id) {
  try {
    console.log("Service received request to update historyChk:", appointment_id);

    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({ _id: new mongoose.Types.ObjectId(appointment_id) });
    } else {
      appointment = await appointmentDb.findOne({ appointment_id: String(appointment_id) });
    }

    if (!appointment) {
      console.warn("Appointment not found for history update:", appointment_id);
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    const updateResult = await appointmentDb.updateOne(
      { _id: appointment._id },
      { $set: { historychk: 3 } }
    );

    if (updateResult.modifiedCount === 0) {
      console.error("Failed to update historyChk:", appointment_id);
      return new ApiResponse(500, "Error while updating historyChk.", null, null);
    }

    // Fetch the updated appointment
    const updatedAppointment = await appointmentDb.findOne({ _id: appointment._id });

    console.log("historyChk successfully updated for appointment:", appointment_id);
    return new ApiResponse(200, "History flag updated successfully.", updatedAppointment, null);
  } catch (error) {
    console.error("Error while updating historyChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

// Update execution check
async function updateExecutionChk(appointment_id) {
  try {
    console.log("Service received request to update executionChk:", appointment_id);

    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({ _id: new mongoose.Types.ObjectId(appointment_id) });
    } else {
      appointment = await appointmentDb.findOne({ appointment_id: String(appointment_id) });
    }

    if (!appointment) {
      console.warn("Appointment not found for execution update:", appointment_id);
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    const updateResult = await appointmentDb.updateOne(
      { _id: appointment._id },
      { $set: { executivechk: 1 } }
    );

    if (updateResult.modifiedCount === 0) {
      console.error("Failed to update executionChk:", appointment_id);
      return new ApiResponse(500, "Error while updating executionChk.", null, null);
    }

    console.log("executionChk successfully updated for appointment:", appointment_id);
    return new ApiResponse(200, "Execution flag updated successfully.", null, null);
  } catch (error) {
    console.error("Error while updating executionChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

// Update consultation check
async function updateConsultationChk(appointment_id) {
  try {
    console.log("Service received request to update consultationChk:", appointment_id);

    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({ _id: new mongoose.Types.ObjectId(appointment_id) });
    } else {
      appointment = await appointmentDb.findOne({ appointment_id: String(appointment_id) });
    }

    if (!appointment) {
      console.warn("Appointment not found for consultation update:", appointment_id);
      return new ApiResponse(404, "Appointment not found.", null, null);
    }

    const updateResult = await appointmentDb.updateOne(
      { _id: appointment._id },
      { $set: { consultationchk: 2 } }
    );

    if (updateResult.modifiedCount === 0) {
      console.error("Failed to update consultationChk:", appointment_id);
      return new ApiResponse(500, "Error while updating consultationChk.", null, null);
    }

    console.log("consultationChk successfully updated for appointment:", appointment_id);
    return new ApiResponse(200, "Consultation flag updated successfully.", null, null);
  } catch (error) {
    console.error("Error while updating consultationChk:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

async function updateExecutionChkToFour(appointment_id) {
  try {
    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({ _id: new mongoose.Types.ObjectId(appointment_id) });
    } else {
      appointment = await appointmentDb.findOne({ appointment_id: String(appointment_id) });
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
        return new ApiResponse(500, "Error while updating executionChk.", null, null);
      }

      return new ApiResponse(200, "Execution flag updated to 4 successfully.", null, null);
    } else {
      return new ApiResponse(400, "Execution flag is not in the expected state (1).", null, null);
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
            const requiredFields = ['appointment_id', 'totalamt', 'paymentmode'];
            const missingFields = requiredFields.filter(field => !receipt[field]);
            
            if (missingFields.length > 0) {
                console.error("Missing required fields for receipt:", missingFields);
                continue;
            }

            const appointment = await appointmentDb.findOne({ appointment_id: receipt.appointment_id });
            if (!appointment) {
                console.error("Appointment not found for ID:", receipt.appointment_id);
                continue;
            }

            // Create main receipt with the generated receipt_id
            const newReceipt = new receiptDb({
                receipt_id: receipt.receipt_id,  // Use the generated ID from receipt object
                receipt_date: receipt.receipt_date,
                patient_id: appointment.patient_id,
                appointment_id: appointment.appointment_id,
                doctor_id: receipt.doctor_id,
                consultation: receipt.consultation,
                comment: receipt.comment || appointment.note,
                sprayqty: receipt.sprayqty || 0,
                totalamt: receipt.totalamt,
                discountnote: receipt.discountnote || '',
                discountamt: receipt.discountamt || 0,
                paymentmode: receipt.paymentmode,
                otherdetails: receipt.otherdetails || '',
                is_deleted: receipt.is_deleted || 0
            });

            // Create item receipt with the same receipt_id
            const formattedItemId = String(itemCount + 1).padStart(4, '0');
            const newItemReceipt = new ItemReceiptDb({
                item_id: formattedItemId,
                receipt_id: receipt.receipt_id,  // Use the generated ID from receipt object
                patient_id: appointment.patient_id,
                item_date: receipt.receipt_date,
                consultation: receipt.consultation,
                total: receipt.totalamt,
                payment_mode: receipt.paymentmode,
                is_deleted: 0
            });

            const [mainReceiptResult, itemReceiptResult] = await Promise.all([
                newReceipt.save(),
                newItemReceipt.save()
            ]);

            results.push({
                mainReceipt: mainReceiptResult,
                itemReceipt: itemReceiptResult
            });
        }

        console.log(`Successfully saved ${results.length} receipts in DB:`, results);
        return new ApiResponse(201, "Receipts created successfully.", null, results);

    } catch (error) {
        console.error("Error while creating receipts:", error);
        return new ApiResponse(500, "Exception while creating receipts.", null, error.message);
    }
}


async function getPatientByMobile(patient_phone) { 
    try {
        console.log("Fetching patient details for mobile number:", patient_phone);

        // Use the correct variable name 'patient_phone'
        const patients = await patientDb.findOne({ phone: patient_phone });

        if (!patients) {
            return new ApiResponse(404, "Patient not found in patient list", null, null);
        }

        return new ApiResponse(200, "Patient details fetched successfully", null, patients); // Return patient details
    } catch (error) {
        console.error("Error fetching patient details:", error);
        return new ApiResponse(500, "Internal server error", null, error.message);
    }
}

async function listReceipt(queryParams) {
    try {
        let filter = {};

        // Default: Filter for today's receipts
        if (!queryParams.from || !queryParams.to) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            filter.receipt_date = { $gte: todayStart, $lte: todayEnd };
        }

        // Apply date range filter if both from and to dates are provided
        if (queryParams.from && queryParams.to) {
            const fromDate = new Date(queryParams.from);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(queryParams.to);
            toDate.setHours(23, 59, 59, 999);

            filter.receipt_date = { $gte: fromDate, $lte: toDate };
        }

        // Apply other filters
        if (queryParams.appointment_id) filter.appointment_id = queryParams.appointment_id;
        if (queryParams.patient_id) filter.patient_id = queryParams.patient_id;

        console.log("Final filter applied:", filter);

        // Pagination
        const page = queryParams.page ? parseInt(queryParams.page) : 1;
        const limit = queryParams.limit ? parseInt(queryParams.limit) : 5000;
        const skip = (page - 1) * limit;

        // Fetch receipts
        const receipts = await receiptDb.find(filter).sort({ receipt_id: -1 }).skip(skip).limit(limit).lean();
        console.log("Receipts found:", receipts.length);

        // Fetch appointment details separately
        const updatedReceipts = await Promise.all(receipts.map(async (receipt) => {
            if (!receipt.appointment_id) return receipt;

            const appointment = await appointmentDb.findOne({ appointment_id: receipt.appointment_id }).lean();
            if (appointment) {
              receipt.patientName = appointment.patientName;
              receipt.doctorName = appointment.doctorName;
              receipt.consultation = receipt.consultation;
            }
            return receipt;
        }));

        return new ApiResponse(200, "Receipts fetched successfully.", null, updatedReceipts);
    } catch (error) {
        console.error("Error while fetching receipts:", error.message);
        return new ApiResponse(500, "Unable to fetch receipts.", null, error.message);
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
    console.log("Service received request to mark appointment as deleted:", appointment_id);

    let appointment;
    if (mongoose.Types.ObjectId.isValid(appointment_id)) {
      appointment = await appointmentDb.findOne({ 
        $or: [
          { _id: new mongoose.Types.ObjectId(appointment_id) },
          { appointment_id: String(appointment_id) }
        ] 
      });
    } else {
      appointment = await appointmentDb.findOne({ appointment_id: String(appointment_id) });
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
      console.warn("Appointment was not updated. Possible issue:", updateResult);
      return new ApiResponse(500, "Failed to mark appointment as deleted.", null, null);
    }

    console.log("Appointment marked as deleted successfully:", appointment_id);
    return new ApiResponse(200, "Appointment marked as deleted successfully.", null, null);
  } catch (error) {
    console.error("Error while marking appointment as deleted:", error);
    return new ApiResponse(500, "Internal server error.", null, error.message);
  }
}

module.exports = {
  addAppointment,editAppointment,listAppointments,confirmAppointment,
  doctorDropdown,consultationDropdown,fdeDropdown,departmentDropdown,
  updateHistoryChk,updateExecutionChk,updateConsultationChk,updateExecutionChkToFour,
  treatmentDropdown,saveReceipt,getPatientByMobile,listReceipt,deleteAppointment
};