export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
  static badRequest(msg = 'Bad request', details?: unknown) {
    return new ApiError(400, 'BAD_REQUEST', msg, details);
  }
  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, 'UNAUTHORIZED', msg);
  }
  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, 'FORBIDDEN', msg);
  }
  static notFound(msg = 'Not found') {
    return new ApiError(404, 'NOT_FOUND', msg);
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, 'CONFLICT', msg);
  }
}
