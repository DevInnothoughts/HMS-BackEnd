const ApiResponse = require("../utils/api-response");
const surgeryDetailsService = require("../service/surgeryDetails-services");

async function addSurgeryDetails(req, res) {
  try {
    const { patient_id } = req.params;
    const surgeryDetailsData = req.body;

    console.log(
      "Controller received request to add surgeryDetails Card:",
      surgeryDetailsData,
    );
    console.log("Extracted patient_id from URL:", patient_id);

    const result = await surgeryDetailsService.addSurgeryDetails(
      surgeryDetailsData,
      patient_id,
    );
    console.log("Add surgeryDetails Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while adding surgeryDetails:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while adding surgeryDetails.",
          null,
          error.message,
        ),
      );
  }
}

async function updateSurgeryDetails(req, res) {
  const { patient_id } = req.params;
  const updatedSurgeryDetailsData = req.body;

  try {
    const response = await surgeryDetailsService.updateSurgeryDetails(
      patient_id,
      updatedSurgeryDetailsData,
    );

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          "surgeryDetails data fetched successfully.",
          null,
          updatedSurgeryDetailsData,
        ),
      );
  } catch (error) {
    console.error(
      "Error in update surgeryDetails card Controller:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while updating surgeryDetails card.",
          null,
          error.message,
        ),
      );
  }
}

async function listSurgeryDetails(req, res) {
  try {
    const { patient_id } = req.params;

    console.log(
      "Controller received request to list surgeryDetails for patient_id:",
      patient_id,
    );

    const result = await surgeryDetailsService.listSurgeryDetails(patient_id);
    console.log("Get surgeryDetails Controller Result:", result);

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching patient surgeryDetails:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching patient surgeryDetails.",
          null,
          error.message,
        ),
      );
  }
}

async function listAllSurgeryDetails(req, res) {
  try {
    console.log("Received request to list all surgery.");

    const response = await surgeryDetailsService.listAllSurgeryDetails(); // Call the service function

    // Return the response
    return res.status(response.statusCode).json({
      message: response.message,
      data: response.data,
      error: response.error,
    });
  } catch (error) {
    console.error("Error in surgery controller:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function addPatientComment(req, res) {
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
    const response = await surgeryDetailsService.addPatientComment(
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

// async function listSurgeryDetails(req,res){
//     try {
//         console.log("Controller received request to list surgeryDetailsData.", req.params.patient_id);
//         const surgeryDetailsData = await patienttabsService.listSurgeryDetails(req.params.patient_id);
//         console.log("List surgeryDetailsData Result:", surgeryDetailsData);
//         res.status(200).send(new ApiResponse(200, "surgeryDetailsData fetched successfully.", null, surgeryDetailsData));
//     } catch (error) {
//         console.error("Error while fetching surgeryDetailsData:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while fetching surgeryDetailsData.", null, error.message));
//     }
// }

// async function surgeryDetails(req, res, next) {
//     try {
//         console.log("Request Body:", req.body);  // Log the request body
//         console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//         const updatedSurgeryDetailsData = req.body.surgeryDetailsData;

//         // Call the service function with the correct data
//         const result = await patienttabsService.surgeryDetails(req.params.patient_id, updatedSurgeryDetailsData);
//         res.status(result.statusCode).send(result);
//     } catch (error) {
//         console.error("Error while editing other tests of patient:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while editing other tests of patient.", null, error.message));
//     }
//   }

// async function surgeryDetails(req, res, next) {
//     try {
//         console.log("Request Body:", req.body);  // Log the request body
//         console.log("Patient ID:", req.params.patient_id);  // Log the patient ID
//         const  = req.body.surgeryDetailsData;
//         const updatedUrologyData=req.body.urologyData;

//         // Call the service function with the correct data
//         const result = await patienttabsService.surgeryDetails(req.params.patient_id, updatedSurgeryDetailsData,updatedUrologyData);
//         res.status(result.statusCode).send(result);
//     } catch (error) {
//         console.error("Error while editing surgery details of patient:", error.message);
//         res.status(500).send(new ApiResponse(500, "Error while editing surgery details of patient.", null, error.message));
//     }
// }

module.exports = {
  addSurgeryDetails,
  updateSurgeryDetails,
  listSurgeryDetails,
  listAllSurgeryDetails,
  addPatientComment,
};
