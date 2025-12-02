"""Tests for WSDL analyzer service."""

import pytest
from app.services.wsdl_analyzer import (
    analyze_wsdl,
    _extract_complex_types,
    _extract_operations,
    _clean_xsd_type,
    _infer_operation_type,
    _pluralize,
)
from xml.etree import ElementTree as ET


# Sample WSDL for testing
SAMPLE_WSDL = """<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
             xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
             xmlns:tns="http://example.com/customerservice"
             xmlns:xsd="http://www.w3.org/2001/XMLSchema"
             name="CustomerService"
             targetNamespace="http://example.com/customerservice">

  <types>
    <xsd:schema targetNamespace="http://example.com/customerservice">
      <xsd:complexType name="Customer">
        <xsd:sequence>
          <xsd:element name="customer_id" type="xsd:int"/>
          <xsd:element name="company_name" type="xsd:string"/>
          <xsd:element name="contact_email" type="xsd:string"/>
          <xsd:element name="is_active" type="xsd:boolean"/>
          <xsd:element name="created_date" type="xsd:date"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <portType name="CustomerServicePortType">
    <operation name="GetCustomers">
      <input message="tns:GetCustomersRequest"/>
      <output message="tns:GetCustomersResponse"/>
    </operation>
    <operation name="GetCustomer">
      <input message="tns:GetCustomerRequest"/>
      <output message="tns:GetCustomerResponse"/>
    </operation>
    <operation name="CreateCustomer">
      <input message="tns:CreateCustomerRequest"/>
      <output message="tns:CreateCustomerResponse"/>
    </operation>
  </portType>

  <service name="CustomerService">
    <port name="CustomerServicePort" binding="tns:CustomerServiceBinding">
      <soap:address location="http://example.com/CustomerService.svc"/>
    </port>
  </service>
</definitions>"""


class TestWsdlAnalyzer:
    """Tests for analyze_wsdl function."""

    @pytest.mark.asyncio
    async def test_analyze_wsdl_basic(self):
        """Test basic WSDL parsing."""
        resources = await analyze_wsdl(SAMPLE_WSDL)

        assert len(resources) >= 1
        resource = resources[0]
        assert resource.name == "customers"
        assert len(resource.fields) >= 4
        assert resource.primaryKey == "customer_id"

    @pytest.mark.asyncio
    async def test_analyze_wsdl_extracts_fields(self):
        """Test that WSDL parsing extracts all fields."""
        resources = await analyze_wsdl(SAMPLE_WSDL)

        resource = resources[0]
        field_names = [f.name for f in resource.fields]

        assert "customer_id" in field_names
        assert "company_name" in field_names
        assert "contact_email" in field_names
        assert "is_active" in field_names

    @pytest.mark.asyncio
    async def test_analyze_wsdl_extracts_operations(self):
        """Test that WSDL parsing extracts operations."""
        resources = await analyze_wsdl(SAMPLE_WSDL)

        resource = resources[0]
        assert "list" in resource.operations or "detail" in resource.operations

    @pytest.mark.asyncio
    async def test_analyze_wsdl_invalid_xml(self):
        """Test that invalid XML raises error."""
        with pytest.raises(ValueError, match="Invalid WSDL XML"):
            await analyze_wsdl("not valid xml")

    @pytest.mark.asyncio
    async def test_analyze_wsdl_empty_types(self):
        """Test WSDL with no complex types."""
        empty_wsdl = """<?xml version="1.0"?>
        <definitions xmlns="http://schemas.xmlsoap.org/wsdl/">
        </definitions>"""

        resources = await analyze_wsdl(empty_wsdl)
        # Should return empty list or raise error
        assert resources is not None


class TestXsdTypeMapping:
    """Tests for XSD type to internal type mapping."""

    def test_clean_xsd_type_string(self):
        """Test string type mapping."""
        assert _clean_xsd_type("xsd:string") == "string"
        assert _clean_xsd_type("string") == "string"

    def test_clean_xsd_type_number(self):
        """Test number type mappings."""
        assert _clean_xsd_type("xsd:int") == "number"
        assert _clean_xsd_type("xsd:integer") == "number"
        assert _clean_xsd_type("xsd:decimal") == "number"
        assert _clean_xsd_type("xsd:float") == "number"

    def test_clean_xsd_type_boolean(self):
        """Test boolean type mapping."""
        assert _clean_xsd_type("xsd:boolean") == "boolean"

    def test_clean_xsd_type_date(self):
        """Test date type mappings."""
        assert _clean_xsd_type("xsd:date") == "date"
        assert _clean_xsd_type("xsd:dateTime") == "datetime"


class TestOperationInference:
    """Tests for operation type inference."""

    def test_infer_list_operations(self):
        """Test list operation inference."""
        assert _infer_operation_type("GetAllCustomers") == "list"
        assert _infer_operation_type("ListOrders") == "list"
        assert _infer_operation_type("SearchProducts") == "list"
        assert _infer_operation_type("FindUsers") == "list"

    def test_infer_detail_operations(self):
        """Test detail operation inference."""
        assert _infer_operation_type("GetCustomer") == "detail"
        assert _infer_operation_type("GetCustomerById") == "detail"
        assert _infer_operation_type("FetchOrder") == "detail"

    def test_infer_create_operations(self):
        """Test create operation inference."""
        assert _infer_operation_type("CreateCustomer") == "create"
        assert _infer_operation_type("AddOrder") == "create"
        assert _infer_operation_type("InsertProduct") == "create"

    def test_infer_update_operations(self):
        """Test update operation inference."""
        assert _infer_operation_type("UpdateCustomer") == "update"
        assert _infer_operation_type("ModifyOrder") == "update"
        assert _infer_operation_type("EditProduct") == "update"

    def test_infer_delete_operations(self):
        """Test delete operation inference."""
        assert _infer_operation_type("DeleteCustomer") == "delete"
        assert _infer_operation_type("RemoveOrder") == "delete"


class TestPluralization:
    """Tests for resource name pluralization."""

    def test_pluralize_regular(self):
        """Test regular pluralization."""
        assert _pluralize("customer") == "customers"
        assert _pluralize("order") == "orders"

    def test_pluralize_ends_with_y(self):
        """Test pluralization for words ending in y."""
        assert _pluralize("category") == "categories"
        assert _pluralize("company") == "companies"

    def test_pluralize_ends_with_s(self):
        """Test words already ending in s."""
        assert _pluralize("status") == "status"
        assert _pluralize("address") == "address"

    def test_pluralize_special_endings(self):
        """Test special ending pluralization."""
        assert _pluralize("batch") == "batches"
        assert _pluralize("box") == "boxes"


class TestComplexTypeExtraction:
    """Tests for complex type extraction from WSDL."""

    def test_extract_complex_types(self):
        """Test extraction of complex types from WSDL."""
        root = ET.fromstring(SAMPLE_WSDL)
        complex_types = _extract_complex_types(root)

        assert "Customer" in complex_types
        customer_fields = complex_types["Customer"]
        assert len(customer_fields) >= 4

        field_names = [f["name"] for f in customer_fields]
        assert "customer_id" in field_names
        assert "company_name" in field_names


class TestOperationExtraction:
    """Tests for operation extraction from WSDL."""

    def test_extract_operations(self):
        """Test extraction of operations from WSDL portType."""
        root = ET.fromstring(SAMPLE_WSDL)
        operations = _extract_operations(root)

        assert len(operations) >= 3

        op_names = [op["name"] for op in operations]
        assert "GetCustomers" in op_names
        assert "GetCustomer" in op_names
        assert "CreateCustomer" in op_names