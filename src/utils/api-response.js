class ApiResponse {
  constructor(code, message, description, body) {
    this.statusCode = code;
    this.message = message;
    this.data = body;
    this.description = description;
  }
}

module.exports = ApiResponse;
