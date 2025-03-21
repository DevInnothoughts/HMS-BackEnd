const ApiResponse = require("../utils/api-response");
const prescriptionService = require("../service/prescription-services");

async function addPrescription(req, res) {
  try {
    const { patient_id } = req.params;
    const prescriptionData = req.body;

    console.log(
      "Controller received request to add prescription:",
      prescriptionData,
    );
    console.log("Extracted patient_id from URL:", patient_id);

    const result = await prescriptionService.addPrescription(
      patient_id,
      prescriptionData,
    );
    console.log("Add prescription Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding prescription:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding prescription.",
          null,
          error.message,
        ),
      );
  }
}

async function updatePrescription(req, res) {
  const { patient_id } = req.params;
  const updatedOpd_prescriptionData = req.body;

  try {
    const response = await prescriptionService.updatePrescription(
      patient_id,
      updatedOpd_prescriptionData,
    );

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "prescription card data fetched successfully.",
          null,
          response,
        ),
      );
  } catch (error) {
    console.error(
      "Error in update prescription card Controller:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating prescription card.",
          null,
          error.message,
        ),
      );
  }
}

async function listPrescription(req, res) {
  try {
    const { patient_id } = req.params;

    console.log(
      "Controller received request to list prescription for patient_id:",
      patient_id,
    );

    const result = await prescriptionService.listPrescription(patient_id);
    console.log("Get prescription Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching patient prescription:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient prescription.",
          null,
          error.message,
        ),
      );
  }
}

// async function listPrescription(req,res){
//     try {
//         console.log("Controller received request to list opd prescription.", req.params.patient_id);
//         const opd_prescriptionData = await patienttabsService.listPrescription(req.params.patient_id);
//         console.log("List opd prescription Result:", opd_prescriptionData);
//         res.status(200).send(new ApiResponse(200, "opd prescription fetched successfully.", null, opd_prescriptionData));
//     } catch (error) {
//         console.error("Error while fetching opd prescription:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while fetching opd prescription.", null, error.message));
//     }
// }

// async function opd_prescription(req, res, next) {
//   try {
//       console.log("Request Body:", req.body);  // Log the request body
//       console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//       const updatedOpd_prescriptionData = req.body.opd_prescriptionData;

//       // Call the service function with the correct data
//       const result = await patienttabsService.opd_prescription(req.params.patient_id, updatedOpd_prescriptionData);
//       res.status(result.statusCode).send(result);
//   } catch (error) {
//       console.error("Error while editing other tests of patient:", error.message);
//       res.status(500).send(new ApiResponse(500, "Error while editing other tests of patient.", null, error.message));
//   }
// }

// async function opd_prescription(req, res, next) {
//     try {
//         console.log("Request Body:", req.body);  // Log the request body
//         console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//         const updatedOpd_prescriptionData = req.body.opd_prescriptionData;

//         // Call the service function with the correct data
//         const result = await patienttabsService.opd_prescription(req.params.patient_id, updatedOpd_prescriptionData);
//         res.status(result.statusCode).send(result);
//     } catch (error) {
//         console.error("Error while editing opd prescription of patient:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while editing opd prescription of patient.", null, error.message));
//     }
// }

module.exports = {
  addPrescription,
  updatePrescription,
  listPrescription,
};
