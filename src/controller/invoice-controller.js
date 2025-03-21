const ApiResponse = require('../utils/api-response');
const InvoiceService = require('../service/invoice-services.js');

async function addInvoice(req, res, next) {
  try {
    console.log("Controller received request to add invoice:", req.body);

    // Call the service layer to process and save the invoice
    const result = await InvoiceService.addInvoice(req.body);
    
    // Ensure response status is correctly set
    res.status(result.statusCode).json(result); // Make sure result.status is valid
  } catch (error) {
    console.error("Error while adding Invoice:", error.message);
    res.status(500).send(
      new ApiResponse(500, "Error while adding Invoice.", null, error.message)
    );
  }
}


// async function editInvoice(req, res, next) {
//   try {
//       console.log("Controller received request to edit appointment with email:", req.params.phone);
//       const result = await InvoiceService.editInvoice(req.params.phone, req.body, req.user);
//       console.log("Edit Invoice Controller Result:", result);
//       res.status(result.statusCode).send(result);
//   } catch (error) {
//       console.error("Error while editing Invoice:", error.message);
//       res.status(500).send(new ApiResponse(500, "Error while editing Invoice.", null, error.message));
//   }
// }

// async function editInvoice(req, res, next) {
//   try {
//       console.log("Controller received request to edit Invoice for the logged-in user.");
      
//       // Assuming the Invoice details are associated with the logged-in user (req.user)
//       const result = await InvoiceService.editInvoice(req.user, req.body);
//       console.log("Edit Invoice Controller Result:", result);
      
//       res.status(result.statusCode).send(result);
//   } catch (error) {
//       console.error("Error while editing Invoice:", error.message);
//       res.status(500).send(new ApiResponse(500, "Error while editing Invoice.", null, error.message));
//   }
// }


async function editInvoice(req, res, next) {
  try {
      console.log("Controller received request to edit Invoice with invoice id", req.params.invoice_id);
      const result = await InvoiceService.editInvoice(req.params.invoice_id, req.body, req.user);
      console.log("Edit Invoice Controller Result:", result);
      res.status(result.statusCode).send(result);
  } catch (error) {
      console.error("Error while editing Invoice:", error.message);
      res.status(500).send(new ApiResponse(500, "Error while editing Invoice.", null, error.message));
  }
}

async function listInvoice(req, res, next) {
  try {
      console.log("Controller received request to list all Invoice.");
      const invoices = await InvoiceService.listInvoice();
      console.log("List Invoice Result:", invoices);
      res.status(200).send(new ApiResponse(200, "Invoice fetched successfully.", null, invoices));
  } catch (error) {
      console.error("Error while fetching Invoice:", error.message);
      res.status(500).send(new ApiResponse(500, "Error while fetching Invoice.", null, error.message));
  }
}


// Fetch Surgeon Dropdown
async function surgeon_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch surgeon dropdown");

    // Call service method to get surgeon data
    const result = await InvoiceService.surgeon_dropdown();
    
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching surgeon data:", error.message);
    res.status(500).send(
      new ApiResponse(500, "Error while fetching surgeon data", error.message, null)
    );
  }
}

// Fetch Consultant Dropdown
async function consultant_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch consultant dropdown");

    // Call service method to get consultant data
    const result = await InvoiceService.consultant_dropdown();
    
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching doctor data:", error.message);
    res.status(500).send(
      new ApiResponse(500, "Error while fetching doctor data", error.message, null)
    );
  }
}

// Fetch Insurance Company Dropdown
async function insurance_co_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch insurance company dropdown");

    // Call service method to get insurance company data
    const result = await InvoiceService.insurance_co_dropdown();
    
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching insurance company data:", error.message);
    res.status(500).send(
      new ApiResponse(500, "Error while fetching insurance company data", error.message, null)
    );
  }
}

// Fetch TPA Dropdown
async function tpa_dropdown(req, res, next) {
  try {
    console.log("Controller received request to fetch TPA dropdown");

    // Call service method to get TPA data
    const result = await InvoiceService.tpa_dropdown();
    
    res.status(result.statusCode).send(result);
  } catch (error) {
    console.error("Error while fetching TPA data:", error.message);
    res.status(500).send(
      new ApiResponse(500, "Error while fetching TPA data", error.message, null)
    );
  }
}

module.exports = {
addInvoice,editInvoice,listInvoice,surgeon_dropdown,consultant_dropdown,insurance_co_dropdown,tpa_dropdown,
};
