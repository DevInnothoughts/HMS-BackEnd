const express = require("express");
const dotenv = require("dotenv");
const bodyparser = require("body-parser");
const path = require("path");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const cors = require("cors");
dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(fileUpload());

// Route handling
app.use("/api/V1/admin", require("./src/routes/admin-routes"));
app.use("/api/V1/appointment", require("./src/routes/appointment-routes"));
app.use("/api/V1/enquiry",require("./src/routes/enquiry-routes"));
app.use("/api/V1/ivrdata", require("./src/routes/ivrdata-routes"));
app.use("/api/V1/invoice", require("./src/routes/invoice-routes"));
app.use("/api/V1/auth", require("./src/routes/auth-routes"));
app.use("/api/V1/patient", require("./src/routes/patient-routes"));
app.use("/api/V1/hospital", require("./src/routes/hospital-routes"));
app.use("/api/V1/receptionist", require("./src/routes/receptionist-routes"));
app.use("/api/V1/consultation", require("./src/routes/consultation-routes"));
app.use("/api/V1/enquiry", require("./src/routes/enquiry-routes"));
app.use("/api/V1/ivrdata", require("./src/routes/ivrdata-routes"));
app.use("/api/V1/invoice", require("./src/routes/invoice-routes"));
app.use("/api/V1/patients", require("./src/routes/Patients-routes"));
app.use(
  "/api/V1/patientHistory",
  require("./src/routes/patientHistory-routes"),
);
app.use("/api/V1/diagnosis", require("./src/routes/diagnosis-routes"));
app.use("/api/V1/followUp", require("./src/routes/followUp-routes.js"));
app.use("/api/V1/otherTests", require("./src/routes/otherTests-routes"));
app.use("/api/V1/prescription", require("./src/routes/prescription-routes"));
app.use("/api/V1/dischargeCard", require("./src/routes/dischargeCard-routes"));
app.use(
  "/api/V1/surgeryDetails",
  require("./src/routes/surgeryDetails-routes"),
);
app.use("/api/V1/patienttabs", require("./src/routes/patienttabs-routes.js"));
app.use(
  "/api/V1/patienttabsdp",
  require("./src/routes/patienttabsdp-routes.js"),
);
app.get("/", (req, res) => res.send("Server is running!"));

// MongoDB connection
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.DB_NAME}`,
  )
  .then(() => {
    console.log("MongoDB connected successfully.");
    app.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
