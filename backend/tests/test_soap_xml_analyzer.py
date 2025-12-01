"""Tests for SOAP XML analyzer service."""

import pytest
from app.services.soap_xml_analyzer import (
    analyze_soap_xml_sample,
    _extract_soap_body,
    _extract_records,
    _extract_resource_name,
    _infer_operations,
    _get_local_name,
)
from xml.etree import ElementTree as ET


# Sample SOAP response for testing
SAMPLE_SOAP_RESPONSE = """<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetCustomersResponse xmlns="http://example.com/customerservice">
      <customers>
        <Customer>
          <customer_id>1001</customer_id>
          <company_name>Acme Corporation</company_name>
          <contact_name>John Smith</contact_name>
          <contact_email>john.smith@acme.com</contact_email>
          <phone_number>+1-555-123-4567</phone_number>
          <account_status>Active</account_status>
          <created_date>2020-03-15</created_date>
        </Customer>
        <Customer>
          <customer_id>1002</customer_id>
          <company_name>GlobalTech Industries</company_name>
          <contact_name>Sarah Johnson</contact_name>
          <contact_email>s.johnson@globaltech.com</contact_email>
          <phone_number>+1-555-987-6543</phone_number>
          <account_status>Active</account_status>
          <created_date>2019-08-22</created_date>
        </Customer>
      </customers>
    </GetCustomersResponse>
  </soap:Body>
</soap:Envelope>"""


SIMPLE_XML_RESPONSE = """<?xml version="1.0" encoding="UTF-8"?>
<GetOrdersResponse>
  <Orders>
    <Order>
      <order_id>5001</order_id>
      <customer_id>1001</customer_id>
      <order_date>2024-01-15</order_date>
      <total_amount>1250.00</total_amount>
      <status>Shipped</status>
    </Order>
    <Order>
      <order_id>5002</order_id>
      <customer_id>1002</customer_id>
      <order_date>2024-01-16</order_date>
      <total_amount>850.50</total_amount>
      <status>Processing</status>
    </Order>
  </Orders>
</GetOrdersResponse>"""


class TestSoapXmlAnalyzer:
    """Tests for analyze_soap_xml_sample function."""

    @pytest.mark.asyncio
    async def test_analyze_soap_response(self):
        """Test analyzing a SOAP envelope response."""
        resources = await analyze_soap_xml_sample(
            xml_content=SAMPLE_SOAP_RESPONSE,
            operation_name="GetCustomers",
        )

        assert len(resources) == 1
        resource = resources[0]
        assert resource.name == "customers"
        assert len(resource.fields) >= 5

    @pytest.mark.asyncio
    async def test_analyze_simple_xml(self):
        """Test analyzing simple XML without SOAP envelope."""
        resources = await analyze_soap_xml_sample(
            xml_content=SIMPLE_XML_RESPONSE,
            operation_name="GetOrders",
        )

        assert len(resources) == 1
        resource = resources[0]
        assert resource.name == "orders"

    @pytest.mark.asyncio
    async def test_extracts_field_types(self):
        """Test that field types are correctly inferred."""
        resources = await analyze_soap_xml_sample(
            xml_content=SAMPLE_SOAP_RESPONSE,
            operation_name="GetCustomers",
        )

        resource = resources[0]
        field_types = {f.name: f.type for f in resource.fields}

        # Email should be detected
        assert field_types.get("contact_email") == "email"

    @pytest.mark.asyncio
    async def test_extracts_primary_key(self):
        """Test that primary key is detected."""
        resources = await analyze_soap_xml_sample(
            xml_content=SAMPLE_SOAP_RESPONSE,
            operation_name="GetCustomers",
        )

        resource = resources[0]
        assert resource.primaryKey == "customer_id"

    @pytest.mark.asyncio
    async def test_invalid_xml_raises_error(self):
        """Test that invalid XML raises ValueError."""
        with pytest.raises(ValueError, match="Invalid XML"):
            await analyze_soap_xml_sample(
                xml_content="not valid xml",
                operation_name="GetCustomers",
            )

    @pytest.mark.asyncio
    async def test_with_base_url(self):
        """Test that base_url is used for endpoint."""
        resources = await analyze_soap_xml_sample(
            xml_content=SAMPLE_SOAP_RESPONSE,
            operation_name="GetCustomers",
            base_url="https://api.example.com/CustomerService.svc",
        )

        resource = resources[0]
        assert resource.endpoint == "https://api.example.com/CustomerService.svc"


class TestSoapBodyExtraction:
    """Tests for SOAP body extraction."""

    def test_extract_soap_body_soap11(self):
        """Test extracting body from SOAP 1.1 envelope."""
        root = ET.fromstring(SAMPLE_SOAP_RESPONSE)
        body = _extract_soap_body(root)

        assert body is not None
        assert body.tag.endswith("Body")

    def test_extract_soap_body_no_envelope(self):
        """Test extraction when there's no SOAP envelope."""
        root = ET.fromstring(SIMPLE_XML_RESPONSE)
        body = _extract_soap_body(root)

        # Should return None for non-SOAP XML
        assert body is None


class TestRecordExtraction:
    """Tests for record extraction from XML."""

    def test_extract_records_from_soap(self):
        """Test extracting records from SOAP response."""
        root = ET.fromstring(SAMPLE_SOAP_RESPONSE)
        body = _extract_soap_body(root)
        records = _extract_records(body)

        assert len(records) >= 2

    def test_extract_records_from_simple_xml(self):
        """Test extracting records from simple XML."""
        root = ET.fromstring(SIMPLE_XML_RESPONSE)
        records = _extract_records(root)

        assert len(records) >= 2


class TestResourceNameExtraction:
    """Tests for extracting resource names from operation names."""

    def test_extract_from_get_operations(self):
        """Test resource name extraction from Get operations."""
        assert _extract_resource_name("GetCustomers") == "customers"
        assert _extract_resource_name("GetOrders") == "orders"
        assert _extract_resource_name("GetAllProducts") == "products"

    def test_extract_from_create_operations(self):
        """Test resource name extraction from Create operations."""
        assert _extract_resource_name("CreateCustomer") == "customers"
        assert _extract_resource_name("CreateOrder") == "orders"

    def test_extract_from_list_operations(self):
        """Test resource name extraction from List operations."""
        assert _extract_resource_name("ListCustomers") == "customers"
        assert _extract_resource_name("FindOrders") == "orders"

    def test_extract_removes_response_suffix(self):
        """Test that Response suffix is removed."""
        assert _extract_resource_name("GetCustomersResponse") == "customers"

    def test_extract_pluralizes(self):
        """Test that singular names are pluralized."""
        assert _extract_resource_name("GetCustomer") == "customers"
        assert _extract_resource_name("CreateOrder") == "orders"


class TestOperationInference:
    """Tests for inferring operations from operation name."""

    def test_infer_list_operations(self):
        """Test inferring list operations."""
        ops = _infer_operations("GetAllCustomers")
        assert "list" in ops

        ops = _infer_operations("ListOrders")
        assert "list" in ops

    def test_infer_get_operations(self):
        """Test inferring get/detail operations."""
        ops = _infer_operations("GetCustomer")
        assert "list" in ops or "detail" in ops

    def test_infer_create_operations(self):
        """Test inferring create operations."""
        ops = _infer_operations("CreateCustomer")
        assert "create" in ops

    def test_infer_update_operations(self):
        """Test inferring update operations."""
        ops = _infer_operations("UpdateCustomer")
        assert "update" in ops

    def test_infer_delete_operations(self):
        """Test inferring delete operations."""
        ops = _infer_operations("DeleteCustomer")
        assert "delete" in ops


class TestLocalNameExtraction:
    """Tests for extracting local name from namespaced tags."""

    def test_get_local_name_with_namespace(self):
        """Test extracting local name from namespaced tag."""
        assert _get_local_name("{http://example.com}Customer") == "Customer"
        assert _get_local_name("{http://schemas.xmlsoap.org/soap/envelope/}Body") == "Body"

    def test_get_local_name_without_namespace(self):
        """Test extracting local name from non-namespaced tag."""
        assert _get_local_name("Customer") == "Customer"
        assert _get_local_name("order_id") == "order_id"