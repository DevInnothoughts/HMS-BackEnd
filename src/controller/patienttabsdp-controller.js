const ApiResponse = require("../utils/api-response");
const patienttabsdpService = require("../service/patienttabsdp-services.js");
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getPatientTabsDPPool = (req) => {
    // Infer location from the authenticated user or default (can use req.query if location is passed there)
    const location = req.query?.location || req.user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          DROPDOWN CONTROLLERS
// -------------------------------------------------------------------------

async function assistantDoc_dropdown(req, res, next) {
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch assistant doctor dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.assistantDoc_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching assistant doctor dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch consultant dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.consultant_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching consultant doctor data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch surgeon dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.surgeon_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching surgeon data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch medicine name dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.medicineName_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching medicine name dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch surgery advice dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.surgeryAdvice_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching surgery advice dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch surgery type dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.surgeryType_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching surgery type dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch checked by dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.checkedBy_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching checked by dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch made by doctor dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.madeby_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching made by doctor dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch treating by dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.treatingby_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching made by treating by dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch injection dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.injection_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching made by injection dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch anaesthetist dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.anaesthetist_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching anaesthetist data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch testType dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.testType_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching testType data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch urology medicine dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.urologyMedicine_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching urology medicine data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch proctology medicine dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.proctologyMedicine_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching proctology medicine data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch urology test advice dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.urologyTestAdvice_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching urology test advice data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch proctology test advice dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.proctologyTestAdvice_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching proctology test advice data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch medicine type dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.medicineType_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching medicine type data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch urology assistant doctor dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.assistantDocUro_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching urology assistant doctor dropdown data:", error.message);
    return res
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
  const pool = getPatientTabsDPPool(req);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch proctology assistant doctor dropdown");
    // ✅ PASS THE POOL as the first argument
    const result = await patienttabsdpService.assistantDocProc_dropdown(pool);

    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching proctology assistant doctor dropdown data:", error.message);
    return res
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