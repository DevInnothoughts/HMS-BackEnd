const ApiResponse = require("../utils/api-response");
const otherTestsService = require("../service/otherTests-services.js");

async function addOtherTests(req, res) {
  try {
    const { patient_id } = req.params;
    const otherTestsData = req.body;

    console.log(
      "Controller received request to add other tests:",
      otherTestsData,
    );
    console.log("Extracted patient_id from URL:", patient_id);

    const result = await otherTestsService.addOtherTests(
      otherTestsData,
      patient_id,
    );
    console.log("Add other tests Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding other tests:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding other tests.",
          null,
          error.message,
        ),
      );
  }
}

async function updateOtherTests(req, res) {
  const { patient_id } = req.params;
  const updatedOtherTestsData = req.body;

  try {
    const response = await otherTestsService.updateOtherTests(
      patient_id,
      updatedOtherTestsData,
    );

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "other tests data fetched successfully.",
          null,
          response,
        ),
      );
  } catch (error) {
    console.error("Error in update other tests Controller:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating other tests.",
          null,
          error.message,
        ),
      );
  }
}

async function listOtherTests(req, res) {
  try {
    const { patient_id } = req.params;

    console.log(
      "Controller received request to list other tests data for patient_id:",
      patient_id,
    );

    const result = await otherTestsService.listOtherTests(patient_id);
    console.log("Get other tests data Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching patient other tests data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient other tests data.",
          null,
          error.message,
        ),
      );
  }
}

// async function otherTests(req, res, next) {
//     try {
//         console.log("Controller received request to fetch tests for patient with ID:", req.params.patient_id);
//         const result = await patienttabsService.otherTests(req.params.patient_id);
//         console.log("Fetch tests Controller Result:", result);
//         if (result.statusCode !== 200) {
//             return res.status(result.statusCode).send(result);
//         }
//         res.status(200).send(result);
//     } catch (error) {
//         console.error("Error while fetching patient tests:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while fetching patient tests.", null, error.message));
//     }
// }

// async function otherTests(req, res, next) {
//     try {
//       // Log the request body and patient ID
//       console.log("Request Body:", req.body);
//       console.log("Patient ID:", req.params.patient_id);

//       // Extract the fields to be updated from the request body
//       const combinedData = req.body;

//       // Call the service function to update the personal details
//       const result = await patienttabsService.otherTests(req.params.patient_id, combinedData);

//       // Send the response with the result from the service function
//       res.status(result.statusCode).send(result);
//     } catch (error) {
//       // Log any errors and send a failure response
//       console.error("Error while updating patient:", error.message);
//       res.status(500).send(new ApiResponse(500, "Error while updating patient.", null, error.message));
//     }
//   }

// async function otherTests(req, res, next) {
//   try {
//       console.log("Request Body:", req.body);  // Log the request body
//       console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//       const updatedOtherTestsData = req.body.OtherTestsData;

//       // Call the service function with the correct data
//       const result = await patienttabsService.otherTests(req.params.patient_id, updatedOtherTestsData);
//       res.status(result.statusCode).send(result);
//   } catch (error) {
//       console.error("Error while editing other tests of patient:", error.message);
//       res.status(500).send(new ApiResponse(500, "Error while editing other tests of patient.", null, error.message));
//   }
// }

module.exports = {
  addOtherTests,
  updateOtherTests,
  listOtherTests,
};
