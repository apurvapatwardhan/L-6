
class ApiResponse {
    constructor(data, statusCode, message) {
        this.data = data;
        this.success = statusCode < 400;
        this.message = message;
    }
}

export default ApiResponse;