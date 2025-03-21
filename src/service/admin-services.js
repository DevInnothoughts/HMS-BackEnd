const ApiResponse = require("../utils/api-response");
const USER_ROLE = require("../constants/role-constant");
const UserDb = require("../database/userDb");
const DoctorDb = require("../database/doctorDb");

async function addDoctor(doctor, user) {
  console.log("Service received request ", doctor);

  // Check if doctor with the given mobile number already exists
  const doctorDbExist = await DoctorDb.findOne({ phone: doctor.phone });
  if (doctorDbExist) {
    return new ApiResponse(
      400,
      "Doctor is already registered with the provided phone number.",
      null,
      null,
    );
  }

  try {
    // Create a new doctor instance
    const doctorDb = new DoctorDb({
      gender: `${doctor.gender}`,
      age: `${doctor.age}`,
      doctor_id: `${doctor.doctor_id}`,
      name: `${doctor.name}`,
      doctor_type: `${doctor.doctor_type}`,
      email: `${doctor.email}`,
      password: `${doctor.password}`,
      address: `${doctor.address}`,
      job_location: `${doctor.jobLocation}`,
      phone: `${doctor.phone}`,
      department_id: `${doctor.department_id}`,
      profile: `${doctor.profile}`,
      is_deleted: `${doctor.is_deleted}`,
    });

    // Save the doctor to the database
    const result = await doctorDb.save();
    console.log("Doctor successfully registered", result);
    return new ApiResponse(
      201,
      "Doctor registered successfully.",
      null,
      result,
    );
  } catch (error) {
    console.log("Error while registering doctor: ", error.message);
    return new ApiResponse(
      500,
      "Exception while doctor registration.",
      null,
      error.message,
    );
  }
}

async function editDoctor(email, payload, user) {
  try {
    let doctor = await DoctorDb.findOne({
      email: { $eq: email },
    });
    if (!doctor)
      return new ApiResponse(400, "Doctor not found for edit", null, null);

    payload.email = email;
    delete payload._id;

    await DoctorDb.findOneAndUpdate({ _id: doctor._id }, payload);
    return new ApiResponse(200, "Doctor Updated Successfully.", null, payload);
  } catch (error) {
    console.log("Error while updating doctor: ", error.message);
    return new ApiResponse(
      500,
      "Exception while updating doctor details.",
      null,
      error.message,
    );
  }
}

async function listDoctor(date) {
  try {
    const doctors = await DoctorDb.find({ Date: date }).limit(500);
    return doctors;
  } catch (error) {
    console.log("Error while fetching doctors: ", error.message);
    throw new Error("Unable to fetch doctors.");
  }
}

module.exports = { addDoctor, editDoctor, listDoctor };
