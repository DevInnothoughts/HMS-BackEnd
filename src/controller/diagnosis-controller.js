const ApiResponse = require("../utils/api-response");
const diagnosisService = require("../service/diagnosis-services.js");
async function addDiagnosis(req, res) {
  try {
    const { patient_id } = req.params; // Extract patient_id from URL parameters
    const diagnosisData = req.body; // Extract diagnosis data from request body

    console.log("Controller received request to add diagnosis:", diagnosisData);
    console.log("Extracted patient_id from URL:", patient_id);

    // Validate patient_id
    if (!patient_id || isNaN(Number(patient_id))) {
      console.error("Invalid or missing patient_id:", patient_id);
      return res
        .status(400)
        .send(
          new ApiResponse(400, "Invalid or missing patient_id.", null, null),
        );
    }

    // Validate diagnosisData (basic check)
    if (!diagnosisData || Object.keys(diagnosisData).length === 0) {
      console.error("Empty or missing diagnosis data.");
      return res
        .status(400)
        .send(
          new ApiResponse(400, "Diagnosis data cannot be empty.", null, null),
        );
    }

    // Pass the patient_id and patient data to the service
    const result = await diagnosisService.addDiagnosis(
      Number(patient_id),
      diagnosisData,
    );
    console.log("Add diagnosis Controller Result:", result);

    // Send the service response to the client
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding diagnosis:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding diagnosis.",
          null,
          error.message,
        ),
      );
  }
}

const updateDiagnosis = async (req, res) => {
  const { patient_id } = req.params; // Extract patient_id from request parameters
  const updatedDiagnosisData = req.body; // Extract the updated data from request body

  try {
    // Call the service function
    const response = await diagnosisService.updateDiagnosis(
      patient_id,
      updatedDiagnosisData,
    );

    // Check if the response indicates an error
    if (response.statusCode >= 400) {
      return res.status(response.statusCode).json(response);
    }

    // Send the success response
    return res.status(200).json(response);
  } catch (error) {
    console.error("Controller: Error in updateDiagnosis:", error.message);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          "Error while updating patient diagnosis.",
          null,
          error.message,
        ),
      );
  }
};

async function listDiagnosis(req, res) {
  try {
    const { patient_id } = req.params;

    console.log(
      "Controller received request to list diagnosis for patient_id:",
      patient_id,
    );

    const result = await diagnosisService.listDiagnosis(patient_id);
    console.log("Get diagnosis Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching patient diagnosis:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient diagnosis.",
          null,
          error.message,
        ),
      );
  }
}

async function listAllDiagnosis(req, res) {
  try {
    console.log("Received request to list all diagnoses.");

    const response = await diagnosisService.listAllDiagnosis(); // Call the service function

    // Return the response
    return res.status(response.statusCode).json({
      message: response.message,
      data: response.data,
      error: response.error,
    });
  } catch (error) {
    console.error("Error in diagnosis controller:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}
async function addDoctorComment(req, res) {
  try {
    const { patient_id } = req.params; // Extract patient_id from the URL
    const commentData = req.body; // Extract comment data from the request body
    console.log("Controller received request to add comment:", commentData);

    if (!patient_id) {
      return res
        .status(400)
        .send(
          new ApiResponse(400, "Invalid or missing patient_id.", null, null),
        );
    }

    // if (!commentData || !commentData.comment) {
    //   return res
    //     .status(400)
    //     .send(
    //       new ApiResponse(400, "Invalid or missing comment data.", null, null)
    //     );
    // }

    // Pass both patient_id and commentData to the service function
    const response = await diagnosisService.addDoctorComment(
      patient_id,
      commentData,
    );

    res.status(response.statusCode).send(response);
  } catch (error) {
    console.error("Error in addDoctorComment:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding comment.",
          null,
          error.message,
        ),
      );
  }
}

//   async function diagnosis(req, res, next) {
//     try {
//       // Log the request body and patient ID
//       console.log("Request Body:", req.body);
//       console.log("Patient ID:", req.params.patient_id);

//       // Extract the fields to be updated from the request body
//       const combinedData = req.body;

//       // Call the service function to update the personal details
//       const result = await patienttabsService.diagnosis(req.params.patient_id, combinedData);

//       // Send the response with the result from the service function
//       res.status(result.statusCode).send(result);
//     } catch (error) {
//       // Log any errors and send a failure response
//       console.error("Error while updating patient:", error.message);
//       res.status(500).send(new ApiResponse(500, "Error while updating patient.", null, error.message));
//     }
//   }

// async function listDiagnosis(req,res){
//     try {
//         console.log("Controller received request to list all diagnosis data.", req.params.patient_id);
//         const diagnosisData = await patienttabsService.listDiagnosis(req.params.patient_id);
//         console.log("List diagnosis data Result:", diagnosisData);
//         res.status(200).send(new ApiResponse(200, "diagnosis data fetched successfully.", null, diagnosisData));
//     } catch (error) {
//         console.error("Error while fetching diagnosis data:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while fetching diagnosis data.", null, error.message));
//     }
// }
// async function diagnosis(req, res, next) {
//     try {
//         console.log("Request Body:", req.body);  // Log the request body
//         console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//         const updatedDiagnosisData = req.body.diagnosisData;
//         const updatedSurgicalAdviceData= req.body.surgicalAdviceData;
//         // const updatedMedicationHistoryData = req.body.medicationHistoryData;

//         // Call the service function with the correct data
//         const result = await patienttabsService.diagnosis(req.params.patient_id, updatedDiagnosisData,updatedSurgicalAdviceData);
//         res.status(result.statusCode).send(result);
//     } catch (error) {
//         console.error("Error while editing patient:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while editing patient.", null, error.message));
//     }
// }

module.exports = {
  addDiagnosis,
  updateDiagnosis,
  listDiagnosis,
  listAllDiagnosis,
  addDoctorComment,
};
