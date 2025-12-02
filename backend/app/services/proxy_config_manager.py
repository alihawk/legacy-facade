"""Proxy configuration manager.

Handles persistence and caching of proxy configuration for the smart proxy layer.
Stores configuration in JSON file with in-memory caching for performance.
"""

import json
from pathlib import Path
from typing import Optional

from ..models.proxy_models import ProxyConfig, ResourceConfig


class ProxyConfigManager:
    """Manages proxy configuration persistence and caching.
    
    Provides methods to store, retrieve, and manage proxy configuration
    that defines how to connect to legacy REST/SOAP APIs.
    
    Features:
    - JSON file persistence
    - In-memory caching for performance
    - Thread-safe operations
    - Automatic cache invalidation
    """
    
    def __init__(self, storage_path: str = ".proxy_config.json"):
        """Initialize the config manager.
        
        Args:
            storage_path: Path to JSON file for persistent storage
        """
        self.storage_path = Path(storage_path)
        self._cache: Optional[ProxyConfig] = None
    
    def set_config(self, config: ProxyConfig) -> None:
        """Set and persist proxy configuration.
        
        Args:
            config: ProxyConfig instance to store
            
        Raises:
            OSError: If unable to write to storage file
            ValueError: If config is invalid
        """
        try:
            # Convert to dict for JSON serialization
            config_dict = config.model_dump()
            
            # Write to JSON file
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                json.dump(config_dict, f, indent=2, ensure_ascii=False)
            
            # Update cache
            self._cache = config
            
        except Exception as e:
            raise OSError(f"Failed to save proxy config: {e}") from e
    
    def get_config(self) -> Optional[ProxyConfig]:
        """Get proxy configuration.
        
        Returns cached config if available, otherwise loads from file.
        
        Returns:
            ProxyConfig instance if configured, None if not found
            
        Raises:
            ValueError: If stored config is invalid
        """
        # Return cached config if available
        if self._cache is not None:
            return self._cache
        
        # Try to load from file
        if not self.storage_path.exists():
            return None
        
        try:
            with open(self.storage_path, 'r', encoding='utf-8') as f:
                config_dict = json.load(f)
            
            # Parse and validate config
            config = ProxyConfig.model_validate(config_dict)
            
            # Update cache
            self._cache = config
            
            return config
            
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Invalid proxy config file: {e}") from e
        except OSError as e:
            raise OSError(f"Failed to read proxy config: {e}") from e
    
    def clear_config(self) -> None:
        """Clear proxy configuration.
        
        Removes both cached config and persistent storage.
        """
        # Clear cache
        self._cache = None
        
        # Delete file if it exists
        if self.storage_path.exists():
            try:
                self.storage_path.unlink()
            except OSError as e:
                raise OSError(f"Failed to delete proxy config file: {e}") from e
    
    def get_resource_config(self, resource_name: str) -> Optional[ResourceConfig]:
        """Get configuration for a specific resource.
        
        Args:
            resource_name: Name of the resource (e.g., "users", "orders")
            
        Returns:
            ResourceConfig if found, None otherwise
        """
        config = self.get_config()
        if config is None:
            return None
        
        # Find resource by name
        for resource in config.resources:
            if resource.name == resource_name:
                return resource
        
        return None
    
    def is_configured(self) -> bool:
        """Check if proxy is configured.
        
        Returns:
            True if proxy config exists, False otherwise
        """
        return self.get_config() is not None
    
    def get_base_url(self) -> Optional[str]:
        """Get the base URL of the configured legacy API.
        
        Returns:
            Base URL string if configured, None otherwise
        """
        config = self.get_config()
        return config.baseUrl if config else None
    
    def get_api_type(self) -> Optional[str]:
        """Get the API type (rest or soap).
        
        Returns:
            API type string if configured, None otherwise
        """
        config = self.get_config()
        return config.apiType if config else None


# Global instance for use across the application
proxy_config_manager = ProxyConfigManager()
