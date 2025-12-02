"""Error normalizer for proxy responses.

Converts various error responses from legacy APIs into a standardized
format that the frontend can handle consistently.
"""

from typing import Any


def normalize_error(
    status_code: int,
    response_body: str | dict,
    context: str = ""
) -> dict[str, Any]:
    """Normalize error responses into a standard format.
    
    Maps HTTP status codes and response bodies to standardized error objects
    that the frontend can handle consistently.
    
    Args:
        status_code: HTTP status code from the legacy API
        response_body: Response body (string or dict)
        context: Optional context about the operation (e.g., "fetching users")
        
    Returns:
        Standardized error response dictionary with structure:
        {
            "error": {
                "code": "ERROR_CODE",
                "status": status_code,
                "message": "Human-readable message",
                "details": {...}  # Optional
            }
        }
        
    Examples:
        >>> normalize_error(404, "Not found", "fetching user 123")
        {'error': {'code': 'NOT_FOUND', 'status': 404, 'message': 'Resource not found: fetching user 123'}}
        
        >>> normalize_error(500, {"error": "Internal error"})
        {'error': {'code': 'BACKEND_ERROR', 'status': 500, 'message': 'Backend error'}}
    """
    # Check if response is HTML (invalid response type)
    if isinstance(response_body, str) and "<html" in response_body.lower():
        return {
            "error": {
                "code": "INVALID_RESPONSE",
                "status": status_code,
                "message": f"Backend returned HTML instead of JSON{': ' + context if context else ''}",
                "details": {"responseType": "text/html"}
            }
        }
    
    # Map status codes to error responses
    if status_code == 404:
        return {
            "error": {
                "code": "NOT_FOUND",
                "status": 404,
                "message": f"Resource not found{': ' + context if context else ''}"
            }
        }
    
    if status_code == 405:
        return {
            "error": {
                "code": "OPERATION_NOT_SUPPORTED",
                "status": 405,
                "message": f"Operation not supported{': ' + context if context else ''}"
            }
        }
    
    if status_code in (401, 403):
        return {
            "error": {
                "code": "AUTH_ERROR",
                "status": status_code,
                "message": f"Authentication failed{': ' + context if context else ''}"
            }
        }
    
    if status_code >= 500:
        # Extract error message from response body if available
        error_message = "Backend error"
        details = None
        
        if isinstance(response_body, dict):
            # Try to extract error message from common fields
            if "error" in response_body:
                if isinstance(response_body["error"], str):
                    error_message = response_body["error"]
                elif isinstance(response_body["error"], dict) and "message" in response_body["error"]:
                    error_message = response_body["error"]["message"]
            elif "message" in response_body:
                error_message = response_body["message"]
            
            details = response_body
        elif isinstance(response_body, str) and response_body:
            error_message = response_body[:200]  # Truncate long messages
            details = {"rawResponse": response_body}
        
        if context:
            error_message = f"{error_message}: {context}"
        
        return {
            "error": {
                "code": "BACKEND_ERROR",
                "status": status_code,
                "message": error_message,
                "details": details
            }
        }
    
    # Default error for other status codes
    return {
        "error": {
            "code": "UNKNOWN_ERROR",
            "status": status_code,
            "message": f"Unexpected error (status {status_code}){': ' + context if context else ''}",
            "details": {"responseBody": response_body} if response_body else None
        }
    }


def normalize_timeout_error(context: str = "") -> dict[str, Any]:
    """Normalize timeout errors into standard format.
    
    Used when the legacy API request times out or is unreachable.
    
    Args:
        context: Optional context about the operation
        
    Returns:
        Standardized error response for timeout
        
    Example:
        >>> normalize_timeout_error("fetching orders")
        {'error': {'code': 'BACKEND_UNAVAILABLE', 'status': 503, 'message': 'Backend timed out: fetching orders'}}
    """
    return {
        "error": {
            "code": "BACKEND_UNAVAILABLE",
            "status": 503,
            "message": f"Backend timed out{': ' + context if context else ''}"
        }
    }


def normalize_soap_fault(fault_code: str, fault_string: str, context: str = "") -> dict[str, Any]:
    """Normalize SOAP fault responses into standard format.
    
    Converts SOAP Fault elements into the standard error format.
    
    Args:
        fault_code: SOAP fault code (e.g., "soap:Server", "soap:Client")
        fault_string: Human-readable fault description
        context: Optional context about the operation
        
    Returns:
        Standardized error response for SOAP fault
        
    Example:
        >>> normalize_soap_fault("soap:Server", "Invalid credentials")
        {'error': {'code': 'SOAP_FAULT', 'status': 500, 'message': 'Invalid credentials', 'soapFaultCode': 'soap:Server'}}
    """
    message = fault_string
    if context:
        message = f"{fault_string}: {context}"
    
    return {
        "error": {
            "code": "SOAP_FAULT",
            "status": 500,
            "message": message,
            "soapFaultCode": fault_code
        }
    }


def normalize_connection_error(error_message: str, context: str = "") -> dict[str, Any]:
    """Normalize connection errors into standard format.
    
    Used when unable to connect to the legacy API (network errors, DNS failures, etc.).
    
    Args:
        error_message: Error message from the connection attempt
        context: Optional context about the operation
        
    Returns:
        Standardized error response for connection failure
    """
    return {
        "error": {
            "code": "CONNECTION_ERROR",
            "status": 503,
            "message": f"Unable to connect to backend: {error_message}{': ' + context if context else ''}",
            "details": {"originalError": error_message}
        }
    }


def normalize_validation_error(validation_errors: list[str] | str, context: str = "") -> dict[str, Any]:
    """Normalize validation errors into standard format.
    
    Used when request validation fails before sending to legacy API.
    
    Args:
        validation_errors: List of validation error messages or single message
        context: Optional context about the operation
        
    Returns:
        Standardized error response for validation failure
    """
    if isinstance(validation_errors, list):
        message = "; ".join(validation_errors)
    else:
        message = validation_errors
    
    if context:
        message = f"{message}: {context}"
    
    return {
        "error": {
            "code": "VALIDATION_ERROR",
            "status": 400,
            "message": message,
            "details": {"validationErrors": validation_errors if isinstance(validation_errors, list) else [validation_errors]}
        }
    }
