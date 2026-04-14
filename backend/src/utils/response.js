export const RESPONSE_CODE = Object.freeze({
  SUCCESS: 0,
  ERROR: 1
});

export function buildResponse({
  code = RESPONSE_CODE.SUCCESS,
  message = 'success',
  data = null
} = {}) {
  return {
    code,
    message,
    data
  };
}

export function sendSuccess(res, {
  data = null,
  message = 'success',
  code = RESPONSE_CODE.SUCCESS,
  status = 200
} = {}) {
  return res.status(status).json(buildResponse({ code, message, data }));
}

export function sendError(res, {
  message = 'error',
  code = RESPONSE_CODE.ERROR,
  data = null,
  status = 400
} = {}) {
  return res.status(status).json(buildResponse({ code, message, data }));
}
