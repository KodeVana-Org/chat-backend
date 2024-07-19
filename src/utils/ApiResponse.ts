class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  Success: boolean;

  constructor(statusCode: number, data: T, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.Success = statusCode < 400;
  }
}
export { ApiResponse };
