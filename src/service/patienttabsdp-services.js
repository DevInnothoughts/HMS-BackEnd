const ApiResponse = require("../utils/api-response");
const prescriptionAdviceDb = require("../database/prescriptionAdviceDb.js");
const doctorDb = require("../database/doctorDb.js");
const dischargeCardDetailsDb = require("../database/dischargeCardDetailsDb.js");
const medicineDb = require("../database/medicineDb.js");
const labTestDb = require("../database/labTestDb.js");
const dischargeCardDb = require("../database/dischargeCardDb.js");

async function assistantDoc_dropdown() {
  try {
    const assistants = await doctorDb.find(
      { doctor_type: "Assistance" },
      "name",
    );
    if (!assistants || assistants.length === 0) {
      return new ApiResponse(404, "No assistant doctor data found", null, null);
    }
    console.log("assistant doctor dropdown data:", assistants);
    return new ApiResponse(
      200,
      "assistant doctor dropdown fetched successfully",
      null,
      assistants,
    );
  } catch (error) {
    console.error("Error while fetching assistantdoc_dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch assistantdoc_dropdown",
      error.message,
      null,
    );
  }
}

async function consultant_dropdown() {
  try {
    const consultants = await doctorDb.find(
      { doctor_type: { $ne: "Main" } },
      "name",
    );
    if (!consultants || consultants.length === 0) {
      return new ApiResponse(404, "No consultants data found", null, null);
    }
    console.log("Consultant dropdown data:", consultants);
    return new ApiResponse(
      200,
      "Consultant dropdown fetched successfully",
      null,
      consultants,
    );
  } catch (error) {
    console.error("Error while fetching consultant_dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch consultant_dropdown",
      error.message,
      null,
    );
  }
}

async function surgeon_dropdown() {
  try {
    const surgeons = await doctorDb.find({ doctor_type: "Main" }, "name");
    if (!surgeons || surgeons.length === 0) {
      return new ApiResponse(404, "No surgeons data found", null, null);
    }
    console.log("Surgeon dropdown data:", surgeons);
    return new ApiResponse(
      200,
      "Surgeon dropdown fetched successfully",
      null,
      surgeons,
    );
  } catch (error) {
    console.error("Error while fetching surgeon_dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch surgeon_dropdown",
      error.message,
      null,
    );
  }
}
async function surgeryAdvice_dropdown() {
  try {
    const surgeryAdviceList = await dischargeCardDb.distinct("surgeryadvice");

    if (!surgeryAdviceList || surgeryAdviceList.length === 0) {
      return new ApiResponse(404, "No surgery advice data found", null, null);
    }

    // Filter out values that are empty or contain only spaces
    const filteredList = surgeryAdviceList.filter(
      (advice) => advice && advice.trim() !== "",
    );

    // Map filteredList to an array of objects with id and name
    const formattedList = filteredList.map((advice, index) => ({
      id: index + 1, // Generating a unique id (incremental)
      name: advice, // Using advice as the name
    }));

    console.log("Surgery advice dropdown data:", formattedList);
    return new ApiResponse(
      200,
      "Surgery advice dropdown fetched successfully",
      null,
      formattedList,
    );
  } catch (error) {
    console.error(
      "Error while fetching surgery advice dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch surgery advice dropdown",
      error.message,
      null,
    );
  }
}

async function madeby_dropdown() {
  try {
    // Fetch distinct 'madeby' IDs from dischargeCardDb
    const madeByList = await dischargeCardDb.distinct("madeby");

    if (!madeByList || madeByList.length === 0) {
      return new ApiResponse(404, "No made by doctor data found", null, null);
    }

    // Filter out any invalid or empty doctor IDs and convert to integers
    const validMadeByList = madeByList
      .map((id) => parseInt(id.trim(), 10)) // Convert string IDs to integers
      .filter((id) => !isNaN(id)); // Ensure the value is a valid number (int32)

    if (validMadeByList.length === 0) {
      return new ApiResponse(404, "No valid doctor IDs found", null, null);
    }

    // Fetch doctor details from doctorDb where doctor ID is in 'madeby' field
    const doctors = await doctorDb.find(
      { doctor_id: { $in: validMadeByList } },
      { name: 1 },
    );

    if (!doctors || doctors.length === 0) {
      return new ApiResponse(
        404,
        "No doctors found for the given IDs",
        null,
        null,
      );
    }

    // Format the doctor data
    const formattedList = doctors.map((doctor, index) => ({
      id: index + 1,
      name: doctor.name,
    }));

    console.log("made by doctor dropdown data:", formattedList);
    return new ApiResponse(
      200,
      "Made by doctor dropdown fetched successfully",
      null,
      formattedList,
    );
  } catch (error) {
    console.error(
      "Error while fetching made by doctor dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch made by doctor dropdown",
      error.message,
      null,
    );
  }
}

async function medicineName_dropdown() {
  try {
    const medicines = await medicineDb.find(
      { medicine_type: { $ne: "INJ" } },
      "name",
    );
    if (!medicines || medicines.length === 0) {
      return new ApiResponse(404, "No medicines data found", null, null);
    }
    console.log("medicines dropdown data:", medicines);
    return new ApiResponse(
      200,
      "medicines dropdown fetched successfully",
      null,
      medicines,
    );
  } catch (error) {
    console.error("Error while fetching medicineName_dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch medicineName_dropdown",
      error.message,
      null,
    );
  }
}

async function surgeryType_dropdown() {
  try {
    // Fetch distinct values of surgeryadvice from dischargeCardDb
    const surgeryTestList =
      await dischargeCardDetailsDb.distinct("surgery_type");

    if (!surgeryTestList || surgeryTestList.length === 0) {
      return new ApiResponse(404, "No surgery test data found", null, null);
    }

    console.log("Surgery test dropdown data:", surgeryTestList);
    return new ApiResponse(
      200,
      "Surgery test dropdown fetched successfully",
      null,
      surgeryTestList,
    );
  } catch (error) {
    console.error("Error while fetching surgery test dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch surgery test dropdown",
      error.message,
      null,
    );
  }
}

async function checkedBy_dropdown() {
  try {
    const checkedbyList = await doctorDb.find(
      { doctor_type: "Checkby" },
      "name",
    );

    if (!checkedbyList || checkedbyList.length === 0) {
      return new ApiResponse(404, "No checked by data found", null, null);
    }

    console.log("Checked by dropdown data:", checkedbyList);
    return new ApiResponse(
      200,
      "Checked by dropdown fetched successfully",
      null,
      checkedbyList,
    );
  } catch (error) {
    console.error("Error while fetching checked by dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch checked by dropdown",
      error.message,
      null,
    );
  }
}

async function treatingby_dropdown() {
  try {
    const treatingByList = await dischargeCardDb.distinct("treatingby");

    if (!treatingByList || treatingByList.length === 0) {
      return new ApiResponse(
        404,
        "No treating by doctor data found",
        null,
        null,
      );
    }

    const validtreatingByList = treatingByList
      .map((id) => parseInt(id.trim(), 10)) // Convert string IDs to integers
      .filter((id) => !isNaN(id)); // Ensure the value is a valid number (int32)

    if (validtreatingByList.length === 0) {
      return new ApiResponse(404, "No valid doctor IDs found", null, null);
    }

    const doctors = await doctorDb.find(
      { doctor_id: { $in: validtreatingByList } },
      { name: 1 },
    );

    if (!doctors || doctors.length === 0) {
      return new ApiResponse(
        404,
        "No doctors found for the given IDs",
        null,
        null,
      );
    }

    // Format the doctor data
    const formattedList = doctors.map((doctor, index) => ({
      id: index + 1,
      name: doctor.name,
    }));

    console.log("treating by doctor dropdown data:", formattedList);
    return new ApiResponse(
      200,
      "treating by doctor dropdown fetched successfully",
      null,
      formattedList,
    );
  } catch (error) {
    console.error(
      "Error while fetching treating by doctor dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch treating by doctor dropdown",
      error.message,
      null,
    );
  }
}

async function injection_dropdown() {
  try {
    const injections = await medicineDb.find({ medicine_type: "INJ" }, "name");
    if (!injections || injections.length === 0) {
      return new ApiResponse(404, "No injections data found", null, null);
    }
    console.log("injections dropdown data:", injections);
    return new ApiResponse(
      200,
      "injections dropdown fetched successfully",
      null,
      injections,
    );
  } catch (error) {
    console.error("Error while fetching injection_dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch injection_dropdown",
      error.message,
      null,
    );
  }
}

async function anaesthetist_dropdown() {
  try {
    const anaetheists = await doctorDb.find({ department_id: "1" }, "name");
    if (!anaetheists || anaetheists.length === 0) {
      return new ApiResponse(404, "No anaetheists data found", null, null);
    }
    console.log("anaetheists dropdown data:", anaetheists);
    return new ApiResponse(
      200,
      "anaetheists dropdown fetched successfully",
      null,
      anaetheists,
    );
  } catch (error) {
    console.error("Error while fetching anaesthetist_dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch anaesthetist_dropdown",
      error.message,
      null,
    );
  }
}

async function testType_dropdown() {
  try {
    const testTypeList = await labTestDb.distinct("test_name");

    if (!testTypeList || testTypeList.length === 0) {
      return new ApiResponse(404, "No test type data found", null, null);
    }

    const formattedList = testTypeList.map((test, index) => ({
      id: index + 1, // Generating a unique id (incremental)
      name: test, // Using advice as the name
    }));

    console.log("test type dropdown data:", formattedList);
    return new ApiResponse(
      200,
      "test type dropdown fetched successfully",
      null,
      formattedList,
    );
  } catch (error) {
    console.error("Error while fetching test type dropdown:", error.message);
    return new ApiResponse(
      501,
      "Unable to fetch test type dropdown",
      error.message,
      null,
    );
  }
}

async function urologyMedicine_dropdown() {
  try {
    const urologies = await medicineDb.find({ status: "Urology" }, "name");
    if (!urologies || urologies.length === 0) {
      return new ApiResponse(
        404,
        "No urology medicines data found",
        null,
        null,
      );
    }
    console.log("urology medicines dropdown data:", urologies);
    return new ApiResponse(
      200,
      "urology medicines dropdown fetched successfully",
      null,
      urologies,
    );
  } catch (error) {
    console.error(
      "Error while fetching urologyMedicine_dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch urologyMedicine_dropdown",
      error.message,
      null,
    );
  }
}

async function proctologyMedicine_dropdown() {
  try {
    const proctologies = await medicineDb.find(
      { status: "Proctology" },
      "name",
    );
    if (!proctologies || proctologies.length === 0) {
      return new ApiResponse(
        404,
        "No proctology medicines data found",
        null,
        null,
      );
    }
    console.log("proctology medicines dropdown data:", proctologies);
    return new ApiResponse(
      200,
      "proctology medicines dropdown fetched successfully",
      null,
      proctologies,
    );
  } catch (error) {
    console.error(
      "Error while fetching proctologyMedicine_dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch proctologyMedicine_dropdown",
      error.message,
      null,
    );
  }
}

async function urologyTestAdvice_dropdown() {
  try {
    const urologies = await prescriptionAdviceDb.find(
      { testadvice: "urology" },
      "padvice_desc",
    );
    if (!urologies || urologies.length === 0) {
      return new ApiResponse(404, "No test advice data found", null, null);
    }
    console.log("urology test advice dropdown data:", urologies);
    return new ApiResponse(
      200,
      "urology test advice dropdown fetched successfully",
      null,
      urologies,
    );
  } catch (error) {
    console.error(
      "Error while fetching urologyTestAdvice_dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch urologyTestAdvice_dropdown",
      error.message,
      null,
    );
  }
}

async function proctologyTestAdvice_dropdown() {
  try {
    const proctologies = await prescriptionAdviceDb.find(
      { testadvice: "proctology" },
      "padvice_desc",
    );
    if (!proctologies || proctologies.length === 0) {
      return new ApiResponse(
        404,
        "No proctology test advice data found",
        null,
        null,
      );
    }
    console.log("proctology test advice dropdown data:", proctologies);
    return new ApiResponse(
      200,
      "proctology test advice dropdown fetched successfully",
      null,
      proctologies,
    );
  } catch (error) {
    console.error(
      "Error while fetching proctologyTestAdvice_dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch proctologyTestAdvice_dropdown",
      error.message,
      null,
    );
  }
}

async function medicineType_dropdown() {
  try {
    const medicineTypeList = await medicineDb.distinct("medicine_type");

    if (!medicineTypeList || medicineTypeList.length === 0) {
      return new ApiResponse(404, "No medicine type data found", null, null);
    }

    const formattedList = medicineTypeList.map((medicine, index) => ({
      id: index + 1, // Generating a unique id (incremental)
      name: medicine, // Using advice as the name
    }));

    console.log("medicine type dropdown data:", formattedList);
    return new ApiResponse(
      200,
      "medicine type dropdown fetched successfully",
      null,
      formattedList,
    );
  } catch (error) {
    console.error(
      "Error while fetching medicine type dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch medicine type dropdown",
      error.message,
      null,
    );
  }
}

async function assistantDocUro_dropdown() {
  try {
    const assistants = await doctorDb.find(
      { doctor_type: "Assistance", department_id: 6 },
      "name",
    );
    if (!assistants || assistants.length === 0) {
      return new ApiResponse(
        404,
        "No urology assistant doctor data found",
        null,
        null,
      );
    }
    console.log("urology assistant doctor dropdown data:", assistants);
    return new ApiResponse(
      200,
      "urology assistant doctor dropdown fetched successfully",
      null,
      assistants,
    );
  } catch (error) {
    console.error(
      "Error while fetching assistantDocUro_dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch assistantDocUro_dropdown",
      error.message,
      null,
    );
  }
}

async function assistantDocProc_dropdown() {
  try {
    const assistants = await doctorDb.find(
      { doctor_type: "Assistance", department_id: 5 },
      "name",
    );
    if (!assistants || assistants.length === 0) {
      return new ApiResponse(
        404,
        "No proctology assistant doctor data found",
        null,
        null,
      );
    }
    console.log("proctology assistant doctor dropdown data:", assistants);
    return new ApiResponse(
      200,
      "proctology assistant doctor dropdown fetched successfully",
      null,
      assistants,
    );
  } catch (error) {
    console.error(
      "Error while fetching assistantDocProc_dropdown:",
      error.message,
    );
    return new ApiResponse(
      501,
      "Unable to fetch assistantDocProc_dropdown",
      error.message,
      null,
    );
  }
}

module.exports = {
  urologyTestAdvice_dropdown,
  proctologyTestAdvice_dropdown,
  consultant_dropdown,
  assistantDoc_dropdown,
  surgeon_dropdown,
  surgeryAdvice_dropdown,
  surgeryType_dropdown,
  checkedBy_dropdown,
  medicineName_dropdown,
  madeby_dropdown,
  treatingby_dropdown,
  injection_dropdown,
  anaesthetist_dropdown,
  testType_dropdown,
  urologyMedicine_dropdown,
  proctologyMedicine_dropdown,
  medicineType_dropdown,
  assistantDocUro_dropdown,
  assistantDocProc_dropdown,
};
