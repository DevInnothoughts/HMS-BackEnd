const ApiResponse = require("../utils/api-response");
const patienttabsdpService = require("../service/patienttabsdp-services.js");

async function assistantDoc_dropdown(req, res, next) {
  try {
    console.log(
      "Controller received request to fetch assistant doctor dropdown",
    );

    const result = await patienttabsdpService.assistantDoc_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching assistant doctor dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching assistant doctor dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function consultant_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch consultant dropdown");

    // Call service method to get consultant data
    const result = await patienttabsdpService.consultant_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching consultant doctor data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching consultant doctor data",
          error.message,
          null,
        ),
      );
  }
}

async function surgeon_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch surgeon dropdown");

    // Call service method to get surgeon data
    const result = await patienttabsdpService.surgeon_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching surgeon data:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching surgeon data",
          error.message,
          null,
        ),
      );
  }
}

async function medicineName_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch medicine anme dropdown");

    const result = await patienttabsdpService.medicineName_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching medicine name dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching medicine name dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function surgeryAdvice_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch surgery advice dropdown");

    const result = await patienttabsdpService.surgeryAdvice_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching surgery advice dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching surgery advice dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function surgeryType_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch surgery type dropdown");

    const result = await patienttabsdpService.surgeryType_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching surgery type dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching surgery type dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function checkedBy_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch checked by dropdown");

    const result = await patienttabsdpService.checkedBy_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching checked by dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching checked by dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function madeby_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch made by doctor dropdown");

    const result = await patienttabsdpService.madeby_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching made by doctor dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching made by doctor dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function treatingby_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch treating by dropdown");

    const result = await patienttabsdpService.treatingby_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching made by treating by dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching made by treating by dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function injection_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch injection dropdown");

    const result = await patienttabsdpService.injection_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching made by injection dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching made by injection dropdown dropdown data",
          error.message,
          null,
        ),
      );
  }
}

async function anaesthetist_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch anaesthetist dropdown");

    const result = await patienttabsdpService.anaesthetist_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching anaesthetist data:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching anaesthetist data",
          error.message,
          null,
        ),
      );
  }
}

async function testType_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch testType dropdown");

    const result = await patienttabsdpService.testType_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching testType data:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching testType data",
          error.message,
          null,
        ),
      );
  }
}

async function urologyMedicine_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch surgeon dropdown");

    const result = await patienttabsdpService.urologyMedicine_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching urology medicine data:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching urology medicine data",
          error.message,
          null,
        ),
      );
  }
}

async function proctologyMedicine_dropdown(req, res, next) {
  try {
    console.log(
      "Controller received request to fetch proctology medicine dropdown",
    );

    const result = await patienttabsdpService.proctologyMedicine_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching proctology medicine data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching proctology medicine data",
          error.message,
          null,
        ),
      );
  }
}

async function urologyTestAdvice_dropdown(req, res, next) {
  try {
    console.log(
      "Controller received request to fetch urology test advice dropdown",
    );

    const result = await patienttabsdpService.urologyTestAdvice_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching urology test advice data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching urology test advice data",
          error.message,
          null,
        ),
      );
  }
}

async function proctologyTestAdvice_dropdown(req, res, next) {
  try {
    console.log(
      "Controller received request to fetch proctology test advice dropdown",
    );

    const result = await patienttabsdpService.proctologyTestAdvice_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching proctology test advice data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching proctology test advice data",
          error.message,
          null,
        ),
      );
  }
}

async function medicineType_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch medicine type dropdown");

    const result = await patienttabsdpService.medicineType_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching medicine type data:", error.message);
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching medicine type data",
          error.message,
          null,
        ),
      );
  }
}

async function assistantDocUro_dropdown(req, res, next) {
  try {
    console.log(
      "Controller received request to fetch urology assistant doctor dropdown",
    );

    const result = await patienttabsdpService.assistantDocUro_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching urology assistant doctor dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching urology assistant doctor dropdown data",
          error.message,
          null,
        ),
      );
  }
}
async function assistantDocProc_dropdown(req, res, next) {
  try {
    console.log(
      "Controller received request to fetch proctology assistant doctor dropdown",
    );

    const result = await patienttabsdpService.assistantDocProc_dropdown();

    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error(
      "Error while fetching proctology assistant doctor dropdown data:",
      error.message,
    );
    res
      .status(500)
      .send(
        new ApiResponse(
          500,
          "Error while fetching proctology assistant doctor dropdown data",
          error.message,
          null,
        ),
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
