const ApiResponse = require('../utils/api-response');
const InvoiceService = require('../service/invoice-services.js');
// --- ASSUMPTION: Import your pool utility ---
const { getConnectionByLocation } = require('../config/dbConnection.js'); 

// Helper function to get the correct pool instance
const getInvoicePool = (user) => {
    // Infer location from the authenticated user or default
    const location = user?.location || 'default'; 
    // Assuming getConnectionByLocation returns the pool instance
    return getConnectionByLocation(location);
};

// -------------------------------------------------------------------------
//                          INVOICE CONTROLLERS
// -------------------------------------------------------------------------

async function addInvoice(req, res, next) {
  const pool = getInvoicePool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to add invoice:", req.body);

    // ✅ PASS THE POOL as the first argument
    const result = await InvoiceService.addInvoice(pool, req.body, req.user);
    
    // Service returns an ApiResponse object
    return res.status(result.statusCode).json(result); 
  } catch (error) {
    console.error("Error while adding Invoice:", error.message);
    return res.status(500).send(
      new ApiResponse(500, "Error while adding Invoice.", null, error.message)
    );
  }
}

async function editInvoice(req, res, next) {
  const pool = getInvoicePool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }
  
  try {
      console.log("Controller received request to edit Invoice with invoice id:", req.params.invoice_id);

      // ✅ PASS THE POOL as the first argument
      const result = await InvoiceService.editInvoice(pool, req.params.invoice_id, req.body, req.user);
      
      console.log("Edit Invoice Controller Result:", result);
      return res.status(result.statusCode).send(result);
  } catch (error) {
      console.error("Error while editing Invoice:", error.message);
      return res.status(500).send(new ApiResponse(500, "Error while editing Invoice.", null, error.message));
  }
}

async function listInvoice(req, res, next) {
  const pool = getInvoicePool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
      console.log("Controller received request to list all Invoice.");
      
      // ✅ PASS THE POOL as the first argument
      const invoices = await InvoiceService.listInvoice(pool, req.query.date); // Pass date filter if available
      
      console.log("List Invoice Result: Found", invoices.length, "records.");
      // Service returns raw data array, wrap it in ApiResponse
      return res.status(200).send(new ApiResponse(200, "Invoice fetched successfully.", null, invoices));
  } catch (error) {
      console.error("Error while fetching Invoice:", error.message);
      return res.status(500).send(new ApiResponse(500, "Error while fetching Invoice.", null, error.message));
  }
}

// -------------------------------------------------------------------------
//                          DROPDOWN CONTROLLERS
// -------------------------------------------------------------------------

async function surgeon_dropdown(req, res, next) {
  const pool = getInvoicePool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch surgeon dropdown");

    // ✅ PASS THE POOL as the first argument
    const result = await InvoiceService.surgeon_dropdown(pool);
    
    // Service returns an ApiResponse object
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching surgeon data:", error.message);
    return res.status(500).send(
      new ApiResponse(500, "Error while fetching surgeon data", error.message, null)
    );
  }
}

async function consultant_dropdown(req, res, next) {
  const pool = getInvoicePool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }
  
  try {
    console.log("Controller received request to fetch consultant dropdown");

    // ✅ PASS THE POOL as the first argument
    const result = await InvoiceService.consultant_dropdown(pool);
    
    // Service returns an ApiResponse object
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching doctor data:", error.message);
    return res.status(500).send(
      new ApiResponse(500, "Error while fetching doctor data", error.message, null)
    );
  }
}

async function insurance_co_dropdown(req, res, next) {
  const pool = getInvoicePool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch insurance company dropdown");

    // ✅ PASS THE POOL as the first argument
    const result = await InvoiceService.insurance_co_dropdown(pool);
    
    // Service returns an ApiResponse object
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching insurance company data:", error.message);
    return res.status(500).send(
      new ApiResponse(500, "Error while fetching insurance company data", error.message, null)
    );
  }
}

async function tpa_dropdown(req, res, next) {
  const pool = getInvoicePool(req.user);

  if (!pool) {
    return res.status(500).send(new ApiResponse(500, "Database connection failed.", null, null));
  }

  try {
    console.log("Controller received request to fetch TPA dropdown");

    // ✅ PASS THE POOL as the first argument
    const result = await InvoiceService.tpa_dropdown(pool);
    
    // Service returns an ApiResponse object
    return res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching TPA data:", error.message);
    return res.status(500).send(
      new ApiResponse(500, "Error while fetching TPA data", error.message, null)
    );
  }
}

module.exports = {
  addInvoice,
  editInvoice,
  listInvoice,
  surgeon_dropdown,
  consultant_dropdown,
  insurance_co_dropdown,
  tpa_dropdown,
};