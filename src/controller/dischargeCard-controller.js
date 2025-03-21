const ApiResponse = require("../utils/api-response");
const dischargeCardService = require("../service/dischargeCard-services.js");

async function addDischargeCard(req, res) {
  try {
    const { patient_id } = req.params;
    const dischargeCardData = req.body;

    console.log(
      "Controller received request to add Discharge Card:",
      dischargeCardData,
    );
    console.log("Extracted patient_id from URL:", patient_id);

    const result = await dischargeCardService.addDischargeCard(
      dischargeCardData,
      patient_id,
    );
    console.log("Add dischargeCardData Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding dischargeCardData:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding dischargeCardData.",
          null,
          error.message,
        ),
      );
  }
}
async function updateDischargeCard(req, res) {
  const { patient_id } = req.params;
  const updatedDischargeCardData = req.body;

  try {
    const response = await dischargeCardService.updateDischargeCard(
      patient_id,
      updatedDischargeCardData,
    );

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "discharge card data fetched successfully.",
          null,
          response,
        ),
      );
  } catch (error) {
    console.error("Error in update discharge card Controller:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating discharge card.",
          null,
          error.message,
        ),
      );
  }
}

async function listDischargeCard(req, res) {
  try {
    const { patient_id } = req.params;

    console.log(
      "Controller received request to list discharge card data for patient_id:",
      patient_id,
    );

    const result = await dischargeCardService.listDischargeCard(patient_id);
    console.log("Get discharge card data Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching patient discharge card data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient discharge card data.",
          null,
          error.message,
        ),
      );
  }
}
// async function listDischargeCard(req,res){
//     try {
//         console.log("Controller received request to list dischargeCardData.", req.params.patient_id);
//         const dischargeCardData = await patienttabsService.listDischargeCard(req.params.patient_id);
//         console.log("List dischargeCardData Result:", dischargeCardData);
//         res.status(200).send(new ApiResponse(200, "dischargeCardData fetched successfully.", null, dischargeCardData));
//     } catch (error) {
//         console.error("Error while fetching dischargeCardData:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while fetching dischargeCardData.", null, error.message));
//     }
// }

// async function dischargeCard(req, res, next) {
//     try {
//         console.log("Request Body:", req.body);  // Log the request body
//         console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//         const updatedDischargeCardDetailsData = req.body.dischargeCardData;

//         // Call the service function with the correct data
//         const result = await patienttabsService.dischargeCard(req.params.patient_id, updatedDischargeCardDetailsData);
//         res.status(result.statusCode).send(result);
//     } catch (error) {
//         console.error("Error while editing other tests of patient:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while editing other tests of patient.", null, error.message));
//     }
//   }
// async function dischargeCard(req, res, next) {
//     try {
//         console.log("Request Body:", req.body);  // Log the request body
//         console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//         const updatedDischargeCardData = req.body.dischargeCardData;
//         const updatedDischargeCardDetailsData= req.body.dischargeCardDetailsData;
//         const updatedOpd_prescriptionData=req.body.prescriptionOpdData;
//         const updatedSurgeryData=req.body.surgeryData;
//         const updatedPatientData=req.body.patientData;
//         const updatedUrologyData=req.body.urologyData;
//         const updatedMedicineData=req.body.medicationData;

//         // Call the service function with the correct data
//         const result = await patienttabsService.dischargeCard(req.params.patient_id, updatedDischargeCardData,updatedDischargeCardDetailsData,updatedOpd_prescriptionData,
//             updatedPatientData,updatedUrologyData,updatedSurgeryData,updatedMedicineData);
//         res.status(result.statusCode).send(result);
//     } catch (error) {
//         console.error("Error while editing discharge card of patient:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while editing discharge card details of patient.", null, error.message));
//     }
// }

module.exports = {
  addDischargeCard,
  updateDischargeCard,
  listDischargeCard,
};
