"""Mock data API endpoints.

Provides realistic demo data for testing the portal without requiring
actual backend API connections. This allows the examples to work
out of the box.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import Any
import random
from datetime import datetime, timedelta

router = APIRouter()


# ============================================================================
# REST API Mock Data - HR, Activity, Products
# ============================================================================

MOCK_USERS = [
    {"user_id": 1, "full_name": "Sarah Johnson", "email_address": "sarah.johnson@company.com", "dept_code": "HR", "is_active": True, "hire_date": "2019-03-15"},
    {"user_id": 2, "full_name": "Michael Chen", "email_address": "michael.chen@company.com", "dept_code": "ENG", "is_active": True, "hire_date": "2020-06-22"},
    {"user_id": 3, "full_name": "Emily Rodriguez", "email_address": "emily.rodriguez@company.com", "dept_code": "SALES", "is_active": True, "hire_date": "2018-11-08"},
    {"user_id": 4, "full_name": "James Wilson", "email_address": "james.wilson@company.com", "dept_code": "FIN", "is_active": False, "hire_date": "2017-01-30"},
    {"user_id": 5, "full_name": "Amanda Foster", "email_address": "amanda.foster@company.com", "dept_code": "HR", "is_active": True, "hire_date": "2021-09-12"},
    {"user_id": 6, "full_name": "David Kim", "email_address": "david.kim@company.com", "dept_code": "ENG", "is_active": True, "hire_date": "2019-07-03"},
    {"user_id": 7, "full_name": "Jessica Martinez", "email_address": "jessica.martinez@company.com", "dept_code": "MKT", "is_active": True, "hire_date": "2020-02-18"},
    {"user_id": 8, "full_name": "Robert Taylor", "email_address": "robert.taylor@company.com", "dept_code": "OPS", "is_active": True, "hire_date": "2016-05-25"},
    {"user_id": 9, "full_name": "Lisa Anderson", "email_address": "lisa.anderson@company.com", "dept_code": "SALES", "is_active": False, "hire_date": "2018-08-14"},
    {"user_id": 10, "full_name": "Christopher Brown", "email_address": "chris.brown@company.com", "dept_code": "ENG", "is_active": True, "hire_date": "2022-01-10"},
]

MOCK_ACTIVITY = [
    {"activity_id": 1, "timestamp": "2024-01-15T09:30:00Z", "action": "User Login", "user": "sarah.johnson@company.com", "resource_id": 1, "details": "Successful login from Chrome browser"},
    {"activity_id": 2, "timestamp": "2024-01-15T10:15:00Z", "action": "Record Created", "user": "michael.chen@company.com", "resource_id": 45, "details": "Created new employee record"},
    {"activity_id": 3, "timestamp": "2024-01-15T11:00:00Z", "action": "Record Updated", "user": "emily.rodriguez@company.com", "resource_id": 23, "details": "Updated contact information"},
    {"activity_id": 4, "timestamp": "2024-01-15T14:22:00Z", "action": "Report Generated", "user": "james.wilson@company.com", "resource_id": 0, "details": "Monthly sales report exported"},
    {"activity_id": 5, "timestamp": "2024-01-15T15:45:00Z", "action": "User Logout", "user": "amanda.foster@company.com", "resource_id": 5, "details": "Session ended normally"},
    {"activity_id": 6, "timestamp": "2024-01-16T08:00:00Z", "action": "System Backup", "user": "system", "resource_id": 0, "details": "Automated daily backup completed"},
    {"activity_id": 7, "timestamp": "2024-01-16T09:12:00Z", "action": "Permission Changed", "user": "david.kim@company.com", "resource_id": 8, "details": "Admin role assigned to user"},
    {"activity_id": 8, "timestamp": "2024-01-16T10:30:00Z", "action": "Record Deleted", "user": "jessica.martinez@company.com", "resource_id": 67, "details": "Removed duplicate entry"},
]

MOCK_PRODUCTS = [
    {"product_id": 1, "sku_code": "LAPTOP-001", "product_name": "ProBook 15 Laptop", "category_id": 1, "unit_price": 1299.99, "stock_quantity": 45, "is_available": True, "created_date": "2023-06-15", "last_updated": "2024-01-10"},
    {"product_id": 2, "sku_code": "MOUSE-002", "product_name": "Wireless Ergonomic Mouse", "category_id": 2, "unit_price": 49.99, "stock_quantity": 230, "is_available": True, "created_date": "2023-07-20", "last_updated": "2024-01-08"},
    {"product_id": 3, "sku_code": "MONITOR-003", "product_name": "UltraWide 34\" Monitor", "category_id": 1, "unit_price": 599.99, "stock_quantity": 28, "is_available": True, "created_date": "2023-08-05", "last_updated": "2024-01-12"},
    {"product_id": 4, "sku_code": "KEYBOARD-004", "product_name": "Mechanical Gaming Keyboard", "category_id": 2, "unit_price": 129.99, "stock_quantity": 0, "is_available": False, "created_date": "2023-05-10", "last_updated": "2024-01-05"},
    {"product_id": 5, "sku_code": "HEADSET-005", "product_name": "Noise Cancelling Headset", "category_id": 3, "unit_price": 199.99, "stock_quantity": 67, "is_available": True, "created_date": "2023-09-01", "last_updated": "2024-01-11"},
    {"product_id": 6, "sku_code": "WEBCAM-006", "product_name": "4K HD Webcam", "category_id": 3, "unit_price": 149.99, "stock_quantity": 89, "is_available": True, "created_date": "2023-10-15", "last_updated": "2024-01-09"},
    {"product_id": 7, "sku_code": "DOCK-007", "product_name": "USB-C Docking Station", "category_id": 2, "unit_price": 249.99, "stock_quantity": 34, "is_available": True, "created_date": "2023-11-20", "last_updated": "2024-01-07"},
    {"product_id": 8, "sku_code": "TABLET-008", "product_name": "Pro Tablet 12.9\"", "category_id": 1, "unit_price": 899.99, "stock_quantity": 15, "is_available": True, "created_date": "2023-12-01", "last_updated": "2024-01-13"},
]


# ============================================================================
# SOAP API Mock Data - Customers, Orders, Banking
# ============================================================================

MOCK_CUSTOMERS = [
    {"customer_id": 1001, "first_name": "John", "last_name": "Smith", "email": "john.smith@email.com", "phone": "+1-555-0101", "company": "Acme Corp", "status": "active", "created_at": "2022-03-15"},
    {"customer_id": 1002, "first_name": "Maria", "last_name": "Garcia", "email": "maria.garcia@email.com", "phone": "+1-555-0102", "company": "TechStart Inc", "status": "active", "created_at": "2022-05-20"},
    {"customer_id": 1003, "first_name": "William", "last_name": "Johnson", "email": "w.johnson@email.com", "phone": "+1-555-0103", "company": "Global Solutions", "status": "inactive", "created_at": "2021-11-08"},
    {"customer_id": 1004, "first_name": "Emma", "last_name": "Williams", "email": "emma.w@email.com", "phone": "+1-555-0104", "company": "Innovation Labs", "status": "active", "created_at": "2023-01-12"},
    {"customer_id": 1005, "first_name": "James", "last_name": "Brown", "email": "james.brown@email.com", "phone": "+1-555-0105", "company": "DataDrive LLC", "status": "active", "created_at": "2022-08-30"},
    {"customer_id": 1006, "first_name": "Olivia", "last_name": "Davis", "email": "olivia.d@email.com", "phone": "+1-555-0106", "company": "CloudFirst", "status": "pending", "created_at": "2023-06-18"},
]

MOCK_ORDERS = [
    {"order_id": 5001, "customer_id": 1001, "order_date": "2024-01-10", "total_amount": 1549.98, "status": "delivered", "shipping_address": "123 Main St, New York, NY 10001", "items_count": 3},
    {"order_id": 5002, "customer_id": 1002, "order_date": "2024-01-12", "total_amount": 299.99, "status": "shipped", "shipping_address": "456 Oak Ave, Los Angeles, CA 90001", "items_count": 1},
    {"order_id": 5003, "customer_id": 1001, "order_date": "2024-01-14", "total_amount": 849.97, "status": "processing", "shipping_address": "123 Main St, New York, NY 10001", "items_count": 2},
    {"order_id": 5004, "customer_id": 1004, "order_date": "2024-01-15", "total_amount": 2199.99, "status": "pending", "shipping_address": "789 Pine Rd, Chicago, IL 60601", "items_count": 1},
    {"order_id": 5005, "customer_id": 1003, "order_date": "2024-01-08", "total_amount": 449.98, "status": "delivered", "shipping_address": "321 Elm St, Houston, TX 77001", "items_count": 2},
    {"order_id": 5006, "customer_id": 1005, "order_date": "2024-01-16", "total_amount": 179.99, "status": "processing", "shipping_address": "654 Maple Dr, Phoenix, AZ 85001", "items_count": 1},
]

MOCK_ACCOUNTS = [
    {"account_id": "ACC-001", "account_holder": "John Smith", "account_type": "checking", "balance": 15420.50, "currency": "USD", "status": "active", "opened_date": "2020-01-15"},
    {"account_id": "ACC-002", "account_holder": "Maria Garcia", "account_type": "savings", "balance": 52340.75, "currency": "USD", "status": "active", "opened_date": "2019-06-20"},
    {"account_id": "ACC-003", "account_holder": "William Johnson", "account_type": "checking", "balance": 3250.00, "currency": "USD", "status": "active", "opened_date": "2021-03-10"},
    {"account_id": "ACC-004", "account_holder": "Emma Williams", "account_type": "business", "balance": 125000.00, "currency": "USD", "status": "active", "opened_date": "2022-08-05"},
    {"account_id": "ACC-005", "account_holder": "James Brown", "account_type": "savings", "balance": 8750.25, "currency": "USD", "status": "frozen", "opened_date": "2018-11-30"},
]

MOCK_TRANSACTIONS = [
    {"transaction_id": "TXN-10001", "account_id": "ACC-001", "type": "debit", "amount": 150.00, "description": "Online Purchase - Amazon", "date": "2024-01-15", "status": "completed"},
    {"transaction_id": "TXN-10002", "account_id": "ACC-001", "type": "credit", "amount": 3500.00, "description": "Salary Deposit", "date": "2024-01-14", "status": "completed"},
    {"transaction_id": "TXN-10003", "account_id": "ACC-002", "type": "debit", "amount": 500.00, "description": "Transfer to Checking", "date": "2024-01-13", "status": "completed"},
    {"transaction_id": "TXN-10004", "account_id": "ACC-003", "type": "debit", "amount": 75.50, "description": "Utility Bill Payment", "date": "2024-01-12", "status": "completed"},
    {"transaction_id": "TXN-10005", "account_id": "ACC-004", "type": "credit", "amount": 12500.00, "description": "Client Payment - Invoice #1234", "date": "2024-01-11", "status": "completed"},
    {"transaction_id": "TXN-10006", "account_id": "ACC-001", "type": "debit", "amount": 45.99, "description": "Subscription - Netflix", "date": "2024-01-10", "status": "completed"},
]


def _build_cors_headers() -> dict[str, str]:
    """Build CORS headers for mock responses."""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


# ============================================================================
# REST Mock Endpoints
# ============================================================================

@router.get("/mock/users")
async def get_mock_users():
    """Get mock HR users data."""
    return JSONResponse(
        content={"data": MOCK_USERS},
        headers=_build_cors_headers()
    )


@router.get("/mock/users/{user_id}")
async def get_mock_user(user_id: int):
    """Get a single mock user."""
    user = next((u for u in MOCK_USERS if u["user_id"] == user_id), None)
    if user:
        return JSONResponse(content={"data": user}, headers=_build_cors_headers())
    return JSONResponse(content={"error": "User not found"}, status_code=404, headers=_build_cors_headers())


@router.get("/mock/activity")
async def get_mock_activity():
    """Get mock activity log data."""
    return JSONResponse(
        content={"data": MOCK_ACTIVITY},
        headers=_build_cors_headers()
    )


@router.get("/mock/activity/{activity_id}")
async def get_mock_activity_item(activity_id: int):
    """Get a single mock activity item."""
    activity = next((a for a in MOCK_ACTIVITY if a["activity_id"] == activity_id), None)
    if activity:
        return JSONResponse(content={"data": activity}, headers=_build_cors_headers())
    return JSONResponse(content={"error": "Activity not found"}, status_code=404, headers=_build_cors_headers())


@router.get("/mock/products")
async def get_mock_products():
    """Get mock products data."""
    return JSONResponse(
        content={"data": MOCK_PRODUCTS},
        headers=_build_cors_headers()
    )


@router.get("/mock/products/{product_id}")
async def get_mock_product(product_id: int):
    """Get a single mock product."""
    product = next((p for p in MOCK_PRODUCTS if p["product_id"] == product_id), None)
    if product:
        return JSONResponse(content={"data": product}, headers=_build_cors_headers())
    return JSONResponse(content={"error": "Product not found"}, status_code=404, headers=_build_cors_headers())


# ============================================================================
# SOAP Mock Endpoints (REST-style for demo purposes)
# ============================================================================

@router.get("/mock/customers")
async def get_mock_customers():
    """Get mock customers data (SOAP Customer Service demo)."""
    return JSONResponse(
        content={"data": MOCK_CUSTOMERS},
        headers=_build_cors_headers()
    )


@router.get("/mock/customers/{customer_id}")
async def get_mock_customer(customer_id: int):
    """Get a single mock customer."""
    customer = next((c for c in MOCK_CUSTOMERS if c["customer_id"] == customer_id), None)
    if customer:
        return JSONResponse(content={"data": customer}, headers=_build_cors_headers())
    return JSONResponse(content={"error": "Customer not found"}, status_code=404, headers=_build_cors_headers())


@router.get("/mock/orders")
async def get_mock_orders():
    """Get mock orders data (SOAP Order Service demo)."""
    return JSONResponse(
        content={"data": MOCK_ORDERS},
        headers=_build_cors_headers()
    )


@router.get("/mock/orders/{order_id}")
async def get_mock_order(order_id: int):
    """Get a single mock order."""
    order = next((o for o in MOCK_ORDERS if o["order_id"] == order_id), None)
    if order:
        return JSONResponse(content={"data": order}, headers=_build_cors_headers())
    return JSONResponse(content={"error": "Order not found"}, status_code=404, headers=_build_cors_headers())


@router.get("/mock/accounts")
async def get_mock_accounts():
    """Get mock bank accounts data (SOAP Banking Service demo)."""
    return JSONResponse(
        content={"data": MOCK_ACCOUNTS},
        headers=_build_cors_headers()
    )


@router.get("/mock/accounts/{account_id}")
async def get_mock_account(account_id: str):
    """Get a single mock account."""
    account = next((a for a in MOCK_ACCOUNTS if a["account_id"] == account_id), None)
    if account:
        return JSONResponse(content={"data": account}, headers=_build_cors_headers())
    return JSONResponse(content={"error": "Account not found"}, status_code=404, headers=_build_cors_headers())


@router.get("/mock/transactions")
async def get_mock_transactions():
    """Get mock transactions data (SOAP Banking Service demo)."""
    return JSONResponse(
        content={"data": MOCK_TRANSACTIONS},
        headers=_build_cors_headers()
    )


@router.get("/mock/transactions/{transaction_id}")
async def get_mock_transaction(transaction_id: str):
    """Get a single mock transaction."""
    transaction = next((t for t in MOCK_TRANSACTIONS if t["transaction_id"] == transaction_id), None)
    if transaction:
        return JSONResponse(content={"data": transaction}, headers=_build_cors_headers())
    return JSONResponse(content={"error": "Transaction not found"}, status_code=404, headers=_build_cors_headers())


# ============================================================================
# Generic Mock Endpoint (fallback for any resource)
# ============================================================================

@router.get("/mock/{resource}")
async def get_generic_mock_data(resource: str):
    """Generic mock endpoint that returns sample data for any resource."""
    # Map resource names to mock data
    resource_map = {
        "users": MOCK_USERS,
        "activity": MOCK_ACTIVITY,
        "products": MOCK_PRODUCTS,
        "customers": MOCK_CUSTOMERS,
        "orders": MOCK_ORDERS,
        "accounts": MOCK_ACCOUNTS,
        "transactions": MOCK_TRANSACTIONS,
    }
    
    data = resource_map.get(resource.lower())
    if data:
        return JSONResponse(content={"data": data}, headers=_build_cors_headers())
    
    # Generate generic mock data for unknown resources
    generic_data = [
        {"id": i, "name": f"{resource.title()} Item {i}", "status": "active", "created_at": "2024-01-15"}
        for i in range(1, 11)
    ]
    return JSONResponse(content={"data": generic_data}, headers=_build_cors_headers())


# ============================================================================
# SOAP Mock Endpoints (Return XML for SOAP endpoint analyzer)
# ============================================================================

def _build_soap_response(body_content: str) -> str:
    """Build a SOAP envelope response."""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    {body_content}
  </soap:Body>
</soap:Envelope>'''


@router.post("/mock/soap/customers")
async def soap_get_customers():
    """SOAP endpoint for customers - returns XML response."""
    customers_xml = "\n".join([
        f'''<Customer>
          <customer_id>{c["customer_id"]}</customer_id>
          <first_name>{c["first_name"]}</first_name>
          <last_name>{c["last_name"]}</last_name>
          <email>{c["email"]}</email>
          <phone>{c["phone"]}</phone>
          <company>{c["company"]}</company>
          <status>{c["status"]}</status>
          <created_at>{c["created_at"]}</created_at>
        </Customer>'''
        for c in MOCK_CUSTOMERS
    ])
    
    body = f'''<GetCustomersResponse xmlns="http://example.com/customerservice">
      <customers>
        {customers_xml}
      </customers>
    </GetCustomersResponse>'''
    
    from fastapi.responses import Response
    return Response(
        content=_build_soap_response(body),
        media_type="text/xml",
        headers=_build_cors_headers()
    )


@router.post("/mock/soap/orders")
async def soap_get_orders():
    """SOAP endpoint for orders - returns XML response."""
    orders_xml = "\n".join([
        f'''<Order>
          <order_id>{o["order_id"]}</order_id>
          <customer_id>{o["customer_id"]}</customer_id>
          <order_date>{o["order_date"]}</order_date>
          <total_amount>{o["total_amount"]}</total_amount>
          <status>{o["status"]}</status>
          <shipping_address>{o["shipping_address"]}</shipping_address>
          <items_count>{o["items_count"]}</items_count>
        </Order>'''
        for o in MOCK_ORDERS
    ])
    
    body = f'''<GetOrdersResponse xmlns="http://example.com/orderservice">
      <orders>
        {orders_xml}
      </orders>
    </GetOrdersResponse>'''
    
    from fastapi.responses import Response
    return Response(
        content=_build_soap_response(body),
        media_type="text/xml",
        headers=_build_cors_headers()
    )


@router.post("/mock/soap/accounts")
async def soap_get_accounts():
    """SOAP endpoint for bank accounts - returns XML response."""
    accounts_xml = "\n".join([
        f'''<Account>
          <account_id>{a["account_id"]}</account_id>
          <account_holder>{a["account_holder"]}</account_holder>
          <account_type>{a["account_type"]}</account_type>
          <balance>{a["balance"]}</balance>
          <currency>{a["currency"]}</currency>
          <status>{a["status"]}</status>
          <opened_date>{a["opened_date"]}</opened_date>
        </Account>'''
        for a in MOCK_ACCOUNTS
    ])
    
    body = f'''<GetAccountsResponse xmlns="http://example.com/bankingservice">
      <accounts>
        {accounts_xml}
      </accounts>
    </GetAccountsResponse>'''
    
    from fastapi.responses import Response
    return Response(
        content=_build_soap_response(body),
        media_type="text/xml",
        headers=_build_cors_headers()
    )
