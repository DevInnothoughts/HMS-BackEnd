const ApiResponse = require("../utils/api-response");
// Removed MongoDB/Mongoose database imports

/**
 * Helper function to execute a MySQL query directly on the pool.
 * @param {object} pool - MySQL connection pool instance.
 * @param {string} sql - SQL query string.
 * @param {Array<any>} params - Query parameters.
 * @returns {Promise<Array<object>>} - Query results (rows).
 */
async function executePoolQuery(pool, sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

// -------------------------------------------------------------------------
//                          DOCTOR DROPDOWNS
// -------------------------------------------------------------------------

async function assistantDoc_dropdown(pool) {
  try {
    const sql = `
      SELECT doctor_id, name
      FROM doctor
      WHERE doctor_type = 'Assistance' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const assistants = await executePoolQuery(pool, sql);
    
    if (assistants.length === 0) {
      return new ApiResponse(404, "No assistant doctor data found", null, null);
    }
    return new ApiResponse(200, "assistant doctor dropdown fetched successfully", null, assistants);
  } catch (error) {
    console.error("Error fetching assistantDoc_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch assistantDoc_dropdown", error.message, null);
  }
}

async function consultant_dropdown(pool) {
  try {
    const sql = `
      SELECT doctor_id, name
      FROM doctor
      WHERE doctor_type != 'Main' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const consultants = await executePoolQuery(pool, sql);
    
    if (consultants.length === 0) {
      return new ApiResponse(404, "No consultants data found", null, null);
    }
    return new ApiResponse(200, "Consultant dropdown fetched successfully", null, consultants);
  } catch (error) {
    console.error("Error fetching consultant_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch consultant_dropdown", error.message, null);
  }
}

async function surgeon_dropdown(pool) {
  try {
    const sql = `
      SELECT doctor_id, name
      FROM doctor
      WHERE doctor_type = 'Main' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const surgeons = await executePoolQuery(pool, sql);
    
    if (surgeons.length === 0) {
      return new ApiResponse(404, "No surgeons data found", null, null);
    }
    return new ApiResponse(200, "Surgeon dropdown fetched successfully", null, surgeons);
  } catch (error) {
    console.error("Error fetching surgeon_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch surgeon_dropdown", error.message, null);
  }
}

async function checkedBy_dropdown(pool) {
  try {
    // Assuming 'Checkby' is a value in the doctor_type column
    const sql = `
      SELECT doctor_id, name
      FROM doctor
      WHERE doctor_type = 'Checkby' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const checkedbyList = await executePoolQuery(pool, sql);

    if (checkedbyList.length === 0) {
      return new ApiResponse(404, "No checked by data found", null, null);
    }

    return new ApiResponse(200, "Checked by dropdown fetched successfully", null, checkedbyList);
  } catch (error) {
    console.error("Error fetching checkedBy_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch checked by dropdown", error.message, null);
  }
}

async function anaesthetist_dropdown(pool) {
  try {
    // Assuming department_id '1' refers to Anesthesia/Anaesthetist department
    const sql = `
      SELECT doctor_id, name
      FROM doctor
      WHERE department_id = '1' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const anaetheists = await executePoolQuery(pool, sql);

    if (anaetheists.length === 0) {
      return new ApiResponse(404, "No anaetheists data found", null, null);
    }
    return new ApiResponse(200, "anaetheists dropdown fetched successfully", null, anaetheists);
  } catch (error) {
    console.error("Error fetching anaesthetist_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch anaesthetist_dropdown", error.message, null);
  }
}

async function assistantDocUro_dropdown(pool) {
  try {
    // Assuming department_id 6 is Urology
    const sql = `
      SELECT doctor_id, name
      FROM doctor
      WHERE doctor_type = 'Assistance' AND department_id = 6 AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const assistants = await executePoolQuery(pool, sql);
    
    if (assistants.length === 0) {
      return new ApiResponse(404, "No urology assistant doctor data found", null, null);
    }
    return new ApiResponse(200, "urology assistant doctor dropdown fetched successfully", null, assistants);
  } catch (error) {
    console.error("Error fetching assistantDocUro_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch assistantDocUro_dropdown", error.message, null);
  }
}

async function assistantDocProc_dropdown(pool) {
  try {
    // Assuming department_id 5 is Proctology
    const sql = `
      SELECT doctor_id, name
      FROM doctor
      WHERE doctor_type = 'Assistance' AND department_id = 5 AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const assistants = await executePoolQuery(pool, sql);
    
    if (assistants.length === 0) {
      return new ApiResponse(404, "No proctology assistant doctor data found", null, null);
    }
    return new ApiResponse(200, "proctology assistant doctor dropdown fetched successfully", null, assistants);
  } catch (error) {
    console.error("Error fetching assistantDocProc_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch assistantDocProc_dropdown", error.message, null);
  }
}

// -------------------------------------------------------------------------
//                          MEDICINE DROPDOWNS
// -------------------------------------------------------------------------

async function medicineName_dropdown(pool) {
  try {
    // Assuming medicine_type 'INJ' should be excluded (using NOT IN)
    const sql = `
      SELECT medicine_id, name
      FROM medicine
      WHERE medicine_type != 'INJ' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const medicines = await executePoolQuery(pool, sql);
    
    if (medicines.length === 0) {
      return new ApiResponse(404, "No medicines data found", null, null);
    }
    return new ApiResponse(200, "medicines dropdown fetched successfully", null, medicines);
  } catch (error) {
    console.error("Error fetching medicineName_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch medicineName_dropdown", error.message, null);
  }
}

async function injection_dropdown(pool) {
  try {
    const sql = `
      SELECT medicine_id, name
      FROM medicine
      WHERE medicine_type = 'INJ' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const injections = await executePoolQuery(pool, sql);
    
    if (injections.length === 0) {
      return new ApiResponse(404, "No injections data found", null, null);
    }
    return new ApiResponse(200, "injections dropdown fetched successfully", null, injections);
  } catch (error) {
    console.error("Error fetching injection_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch injection_dropdown", error.message, null);
  }
}

async function urologyMedicine_dropdown(pool) {
  try {
    const sql = `
      SELECT medicine_id, name
      FROM medicine
      WHERE status = 'Urology' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const urologies = await executePoolQuery(pool, sql);
    
    if (urologies.length === 0) {
      return new ApiResponse(404, "No urology medicines data found", null, null);
    }
    return new ApiResponse(200, "urology medicines dropdown fetched successfully", null, urologies);
  } catch (error) {
    console.error("Error fetching urologyMedicine_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch urologyMedicine_dropdown", error.message, null);
  }
}

async function proctologyMedicine_dropdown(pool) {
  try {
    const sql = `
      SELECT medicine_id, name
      FROM medicine
      WHERE status = 'Proctology' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const proctologies = await executePoolQuery(pool, sql);
    
    if (proctologies.length === 0) {
      return new ApiResponse(404, "No proctology medicines data found", null, null);
    }
    return new ApiResponse(200, "proctology medicines dropdown fetched successfully", null, proctologies);
  } catch (error) {
    console.error("Error fetching proctologyMedicine_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch proctologyMedicine_dropdown", error.message, null);
  }
}

async function medicineType_dropdown(pool) {
  try {
    const sql = `
      SELECT DISTINCT medicine_type
      FROM medicine
      WHERE (is_deleted IS NULL OR is_deleted != 1) AND medicine_type IS NOT NULL AND medicine_type != ''
      ORDER BY medicine_type ASC;
    `;
    const results = await executePoolQuery(pool, sql);

    if (results.length === 0) {
      return new ApiResponse(404, "No medicine type data found", null, null);
    }

    // Format the result to match the original structure (id: index + 1, name: type)
    const formattedList = results.map((row, index) => ({
      id: index + 1,
      name: row.medicine_type,
    }));

    return new ApiResponse(200, "medicine type dropdown fetched successfully", null, formattedList);
  } catch (error) {
    console.error("Error fetching medicineType_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch medicine type dropdown", error.message, null);
  }
}

// -------------------------------------------------------------------------
//                          OTHER DROPDOWNS
// -------------------------------------------------------------------------

async function surgeryAdvice_dropdown(pool) {
  try {
    // Fetch distinct non-empty surgeryadvice values
    const sql = `
      SELECT DISTINCT surgeryadvice
      FROM discharge_card
      WHERE surgeryadvice IS NOT NULL AND surgeryadvice != '' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY surgeryadvice ASC;
    `;
    const results = await executePoolQuery(pool, sql);

    if (results.length === 0) {
      return new ApiResponse(404, "No surgery advice data found", null, null);
    }

    // Format the result to match the original structure
    const formattedList = results.map((row, index) => ({
      id: index + 1,
      name: row.surgeryadvice,
    }));

    return new ApiResponse(200, "Surgery advice dropdown fetched successfully", null, formattedList);
  } catch (error) {
    console.error("Error fetching surgeryAdvice_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch surgery advice dropdown", error.message, null);
  }
}

async function surgeryType_dropdown(pool) {
  try {
    // Fetch distinct surgery_type values from discharge_card_details
    const sql = `
      SELECT DISTINCT surgery_type
      FROM discharge_card_details
      WHERE surgery_type IS NOT NULL AND surgery_type != '' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY surgery_type ASC;
    `;
    const surgeryTestList = await executePoolQuery(pool, sql);

    if (surgeryTestList.length === 0) {
      return new ApiResponse(404, "No surgery test data found", null, null);
    }
    
    // The original returns the raw list, but for consistency with other formatted lists:
    const formattedList = surgeryTestList.map(row => row.surgery_type); 

    return new ApiResponse(200, "Surgery test dropdown fetched successfully", null, formattedList);
  } catch (error) {
    console.error("Error fetching surgeryType_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch surgery test dropdown", error.message, null);
  }
}

async function madeby_dropdown(pool) {
  try {
    // 1. Fetch distinct valid doctor_ids from the 'madeby' column in discharge_card
    const madeBySql = `
      SELECT DISTINCT madeby 
      FROM discharge_card 
      WHERE madeby IS NOT NULL AND TRIM(madeby) != '' AND (is_deleted IS NULL OR is_deleted != 1)
    `;
    const madeByResults = await executePoolQuery(pool, madeBySql);
    const validDoctorIds = madeByResults.map(row => parseInt(row.madeby)).filter(id => !isNaN(id));

    if (validDoctorIds.length === 0) {
      return new ApiResponse(404, "No valid doctor IDs found", null, null);
    }

    // 2. Fetch doctor details based on the IDs
    const doctorsSql = `
      SELECT doctor_id, name 
      FROM doctor 
      WHERE doctor_id IN (?) AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const doctors = await executePoolQuery(pool, doctorsSql, [validDoctorIds]);

    if (doctors.length === 0) {
      return new ApiResponse(404, "No doctors found for the given IDs", null, null);
    }

    // 3. Format the doctor data
    const formattedList = doctors.map((doctor, index) => ({
      id: index + 1,
      name: doctor.name,
      doctor_id: doctor.doctor_id, // include ID for clarity/use
    }));

    return new ApiResponse(200, "Made by doctor dropdown fetched successfully", null, formattedList);
  } catch (error) {
    console.error("Error fetching madeby_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch made by doctor dropdown", error.message, null);
  }
}

async function treatingby_dropdown(pool) {
  try {
    // 1. Fetch distinct valid doctor_ids from the 'treatingby' column in discharge_card
    const treatingBySql = `
      SELECT DISTINCT treatingby 
      FROM discharge_card 
      WHERE treatingby IS NOT NULL AND TRIM(treatingby) != '' AND (is_deleted IS NULL OR is_deleted != 1)
    `;
    const treatingByResults = await executePoolQuery(pool, treatingBySql);
    const validDoctorIds = treatingByResults.map(row => parseInt(row.treatingby)).filter(id => !isNaN(id));

    if (validDoctorIds.length === 0) {
      return new ApiResponse(404, "No valid doctor IDs found", null, null);
    }

    // 2. Fetch doctor details based on the IDs
    const doctorsSql = `
      SELECT doctor_id, name 
      FROM doctor 
      WHERE doctor_id IN (?) AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY name ASC;
    `;
    const doctors = await executePoolQuery(pool, doctorsSql, [validDoctorIds]);

    if (doctors.length === 0) {
      return new ApiResponse(404, "No doctors found for the given IDs", null, null);
    }

    // 3. Format the doctor data
    const formattedList = doctors.map((doctor, index) => ({
      id: index + 1,
      name: doctor.name,
      doctor_id: doctor.doctor_id,
    }));

    return new ApiResponse(200, "treating by doctor dropdown fetched successfully", null, formattedList);
  } catch (error) {
    console.error("Error fetching treatingby_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch treating by doctor dropdown", error.message, null);
  }
}


async function testType_dropdown(pool) {
  try {
    const sql = `
      SELECT DISTINCT test_name
      FROM lab_test
      WHERE (is_deleted IS NULL OR is_deleted != 1) AND test_name IS NOT NULL AND test_name != ''
      ORDER BY test_name ASC;
    `;
    const results = await executePoolQuery(pool, sql);

    if (results.length === 0) {
      return new ApiResponse(404, "No test type data found", null, null);
    }

    // Format the result to match the original structure (id: index + 1, name: test_name)
    const formattedList = results.map((row, index) => ({
      id: index + 1,
      name: row.test_name,
    }));

    return new ApiResponse(200, "test type dropdown fetched successfully", null, formattedList);
  } catch (error) {
    console.error("Error fetching testType_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch test type dropdown", error.message, null);
  }
}

async function urologyTestAdvice_dropdown(pool) {
  try {
    const sql = `
      SELECT padvice_desc
      FROM prescription_advice
      WHERE testadvice = 'urology' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY padvice_desc ASC;
    `;
    const urologies = await executePoolQuery(pool, sql);
    
    if (urologies.length === 0) {
      return new ApiResponse(404, "No test advice data found", null, null);
    }
    return new ApiResponse(200, "urology test advice dropdown fetched successfully", null, urologies);
  } catch (error) {
    console.error("Error fetching urologyTestAdvice_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch urologyTestAdvice_dropdown", error.message, null);
  }
}

async function proctologyTestAdvice_dropdown(pool) {
  try {
    const sql = `
      SELECT padvice_desc
      FROM prescription_advice
      WHERE testadvice = 'proctology' AND (is_deleted IS NULL OR is_deleted != 1)
      ORDER BY padvice_desc ASC;
    `;
    const proctologies = await executePoolQuery(pool, sql);
    
    if (proctologies.length === 0) {
      return new ApiResponse(404, "No proctology test advice data found", null, null);
    }
    return new ApiResponse(200, "proctology test advice dropdown fetched successfully", null, proctologies);
  } catch (error) {
    console.error("Error fetching proctologyTestAdvice_dropdown:", error.message);
    return new ApiResponse(501, "Unable to fetch proctologyTestAdvice_dropdown", error.message, null);
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