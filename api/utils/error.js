// this error handler will be used to generate custom error messages and status codes for the application

export const errorHandler = (statusCode, message) => {
    const error = new Error();
    // statusCode - is the status code of the error, getting manually or automatically from the input of the function  
    error.statusCode = statusCode;
    // message - is the message of the error
    error.message = message;
    return error;
  };
  