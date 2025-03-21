const Authservice = require('../service/auth-service');
const ApiResponse = require('../utils/api-response');

async function login(req, res, next) {
        try {
            const { email, password, accountType, jobLocation } = req.body;

            // Validate required fields
            if (!email || !password || !accountType || !jobLocation) {
                return res.status(400).json(new ApiResponse(400, "Missing required fields", false));
            }

            console.log('Login attempt:', { email, accountType, jobLocation });

            // Authenticate and fetch database data
            const authResult = await Authservice.login(email, password, accountType, jobLocation);
            
            return res.status(200).json(authResult);
        } catch (error) {
            console.error("Login error:", error);
            return res.status(401).json(new ApiResponse(401, error.message || "Authentication failed", false));
        }
    };

async function locationDropdown(req, res, next) {
    try {
        console.log("Controller received request to fetch doctor dropdown");
        const data = await Authservice.locationDropdown();
        return res.status(data.length ? 200 : 404).send(new ApiResponse(200, "Location dropdown fetched successfully.", null, data));
    } catch (error) {
        console.error("Error while fetching Location dropdown:", error.message);
        return res.status(500).send(new ApiResponse(500, "Error while fetching Location dropdown.", null, error.message));
    }
}

module.exports = {login, locationDropdown};
