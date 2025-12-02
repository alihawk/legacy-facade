"""Path template resolver for proxy requests.

Resolves path templates with parameters (e.g., /users/{id}) by replacing
placeholders with actual values from the request.
"""

import re


def resolve_path(path_template: str, params: dict[str, str]) -> str:
    """Resolve path template by replacing parameter placeholders.
    
    Finds all {param} patterns in the path template and replaces them
    with corresponding values from the params dictionary.
    
    Args:
        path_template: Path with parameter placeholders (e.g., "/users/{id}")
        params: Dictionary mapping parameter names to values
        
    Returns:
        Resolved path with all parameters replaced
        
    Raises:
        ValueError: If a required parameter is missing from params dict
        
    Examples:
        >>> resolve_path("/orders/{id}", {"id": "123"})
        '/orders/123'
        
        >>> resolve_path("/users/{userId}/orders/{orderId}", {"userId": "1", "orderId": "2"})
        '/users/1/orders/2'
        
        >>> resolve_path("/products/{id}", {})
        ValueError: Missing path parameter: id
    """
    # Find all parameter placeholders in the path template
    # Pattern matches {paramName} where paramName is alphanumeric/underscore
    pattern = r'\{(\w+)\}'
    
    # Find all parameter names
    param_names = re.findall(pattern, path_template)
    
    # Check that all required parameters are provided
    for param_name in param_names:
        if param_name not in params:
            raise ValueError(f"Missing path parameter: {param_name}")
    
    # Replace each parameter placeholder with its value
    resolved_path = path_template
    for param_name in param_names:
        placeholder = f"{{{param_name}}}"
        value = params[param_name]
        resolved_path = resolved_path.replace(placeholder, value)
    
    return resolved_path


def extract_path_params(path_template: str) -> list[str]:
    """Extract list of parameter names from a path template.
    
    Useful for validating that all required parameters are available
    before attempting to resolve the path.
    
    Args:
        path_template: Path with parameter placeholders
        
    Returns:
        List of parameter names found in the template
        
    Examples:
        >>> extract_path_params("/users/{id}")
        ['id']
        
        >>> extract_path_params("/users/{userId}/orders/{orderId}")
        ['userId', 'orderId']
        
        >>> extract_path_params("/products")
        []
    """
    pattern = r'\{(\w+)\}'
    return re.findall(pattern, path_template)
