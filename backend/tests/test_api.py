import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.data.seed import seed_database
from app.core.config import settings

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_seed_data():
    """Ensure database is seeded with demo farmer and baseline entities."""
    seed_database(reset=True)


def test_system_root_and_health():
    """Verify root and health check endpoints."""
    res = client.get("/")
    assert res.status_code == 200
    assert "KisanOS AI" in res.json()["app"]

    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    data = res_health.json()
    assert data["status"] == "healthy"
    assert "database" in data


def test_auth_login_demo_farmer():
    """Verify demo farmer login with valid credentials."""
    res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["phone"] == settings.DEMO_FARMER_PHONE


def test_auth_login_invalid():
    """Verify login failure on bad credentials."""
    res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": "WrongPassword123"
    })
    assert res.status_code == 401


def test_auth_register_new_user():
    """Verify new farmer registration."""
    new_phone = "9811223344"
    res = client.post("/api/auth/register", json={
        "name": "दिनेश शर्मा (Dinesh Sharma)",
        "phone": new_phone,
        "password": "SecretPassword123",
        "language": "hi",
        "location": "हरदा, मध्य प्रदेश"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["phone"] == new_phone
    assert "access_token" in data


def test_auth_get_me():
    """Verify /api/auth/me returns current authenticated user."""
    # Login as demo farmer
    login_res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["phone"] == settings.DEMO_FARMER_PHONE


def test_auth_unauthorized_request():
    """Verify protected route rejects request without token."""
    res = client.get("/api/farms")
    assert res.status_code == 401


def test_farms_crud_and_ownership():
    """Verify Farm creation, listing, retrieval, and ownership protection."""
    # User A (Demo Farmer)
    login_res_a = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token_a = login_res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # User B
    login_res_b = client.post("/api/auth/login", json={
        "phone": "9811223344",
        "password": "SecretPassword123"
    })
    token_b = login_res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Create farm for User A
    create_res = client.post("/api/farms", json={
        "name": "दक्षिण प्लॉट (South Plot)",
        "location": "सीहोर जिला",
        "latitude": 23.1950,
        "longitude": 77.0750,
        "area_acres": 1.8,
        "soil_type": "Black Soil",
        "soil_ph": 7.0,
        "irrigation_type": "Drip",
        "current_crop": "Mustard",
        "current_stage": "Flowering"
    }, headers=headers_a)
    assert create_res.status_code == 201
    farm_id = create_res.json()["id"]

    # User A can get it
    res_get = client.get(f"/api/farms/{farm_id}", headers=headers_a)
    assert res_get.status_code == 200
    assert res_get.json()["name"] == "दक्षिण प्लॉट (South Plot)"

    # User B CANNOT get User A's farm (ownership protection: 403 Forbidden)
    res_unauth = client.get(f"/api/farms/{farm_id}", headers=headers_b)
    assert res_unauth.status_code == 403


def test_farm_history_and_farm_memory():
    """Verify Farm Memory: logging and retrieving multi-season history."""
    login_res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farms_res = client.get("/api/farms", headers=headers)
    assert farms_res.status_code == 200
    farm_id = farms_res.json()[0]["id"]

    # Add a history record
    hist_res = client.post(f"/api/farms/{farm_id}/history", json={
        "crop_name": "Gram (चना - JG 11)",
        "season": "Rabi 2023",
        "area": 2.0,
        "yield_quintal": 14.0,
        "selling_price": 70000.0,
        "inputs_used": "DAP 1 bag, Neem oil spray",
        "notes": "मध्यम वर्षा, दाना चमकदार रहा"
    }, headers=headers)
    assert hist_res.status_code == 201
    assert hist_res.json()["yield_quintal"] == 14.0

    # Retrieve all histories
    list_hist = client.get(f"/api/farms/{farm_id}/history", headers=headers)
    assert list_hist.status_code == 200
    assert len(list_hist.json()) >= 2


def test_farm_insights_personalized():
    """Verify Farm Memory + Personalized Insight Engine fuses farm profile, history and weather."""
    login_res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farms_res = client.get("/api/farms", headers=headers)
    farm_id = farms_res.json()[0]["id"]

    insights_res = client.get(f"/api/farms/{farm_id}/insights", headers=headers)
    assert insights_res.status_code == 200
    data = insights_res.json()
    assert "farm_summary" in data
    assert "historical_context" in data
    assert "current_crop_context" in data
    assert "insights" in data
    assert "actions" in data
    assert len(data["insights"]) >= 3
    assert len(data["actions"]) >= 4
    # Ensure action cards have proper schema and source attribution
    for action in data["actions"]:
        assert "category" in action
        assert "title" in action
        assert "badge" in action
        assert "source_type" in action



def test_crop_observations_logging():
    """Verify recording and querying crop symptom observations."""
    login_res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farms_res = client.get("/api/farms", headers=headers)
    farm_id = farms_res.json()[0]["id"]

    obs_res = client.post("/api/observations", json={
        "farm_id": farm_id,
        "crop": "Wheat",
        "symptoms": "पत्तियों के सिरों पर हल्का पीलापन (Mild tip yellowing)",
        "severity": "low",
        "ai_diagnosis": "Minor Nitrogen Deficiency",
        "recommendation": "नैनो यूरिया का 4ml/L पानी में छिड़काव करें।"
    }, headers=headers)
    assert obs_res.status_code == 201
    assert obs_res.json()["severity"] == "low"

    list_obs = client.get(f"/api/observations?farm_id={farm_id}", headers=headers)
    assert list_obs.status_code == 200
    assert len(list_obs.json()) >= 1


def test_ai_advisor_chat_structured_response():
    """Verify AI Advisor chat synthesizes farm context and returns structured JSON."""
    login_res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farms_res = client.get("/api/farms", headers=headers)
    farm_id = farms_res.json()[0]["id"]

    chat_res = client.post("/api/advisor/chat", json={
        "farm_id": farm_id,
        "crop": "Wheat",
        "crop_stage": "Tillering",
        "message": "गेहूं में पीली पत्तियां और रतुआ के लक्षण दिख रहे हैं, क्या दवा छिड़कें?"
    }, headers=headers)

    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "summary" in data
    assert "possible_issue" in data
    assert data["confidence"] > 0.5
    assert len(data["recommended_products"]) > 0
    assert len(data["nearby_stores"]) > 0
    assert len(data["warnings"]) > 0
    assert "sources" in data


def test_stores_and_nearby_discovery():
    """Verify Store listing, proximity search, and inventory retrieval."""
    stores_res = client.get("/api/stores")
    assert stores_res.status_code == 200
    stores = stores_res.json()
    assert len(stores) >= 3

    first_store_id = stores[0]["id"]

    # Nearby search with radius
    nearby_res = client.get("/api/stores/nearby?latitude=23.2033&longitude=77.0844&radius_km=15")
    assert nearby_res.status_code == 200
    nearby = nearby_res.json()
    assert len(nearby) >= 1
    assert "distance_km" in nearby[0]
    assert nearby[0]["data_source"] == "seeded_demo"
    assert nearby[0]["is_live_verified"] is False

    # Store Inventory
    inv_res = client.get(f"/api/stores/{first_store_id}/inventory")
    assert inv_res.status_code == 200
    items = inv_res.json()
    assert len(items) >= 1
    assert items[0]["is_live_verified"] is False
    assert items[0]["data_source"] == "seeded_demo"


def test_markets_listing_and_filters():
    """Verify Mandi market listing with crop filters and explicit disclaimer tags."""
    markets_res = client.get("/api/markets?crop=Wheat")
    assert markets_res.status_code == 200
    markets = markets_res.json()
    assert len(markets) >= 1
    assert markets[0]["is_live_verified"] is False
    assert markets[0]["data_source"] == "seeded_demo"
    assert "Wheat" in markets[0]["crop"]


def test_harvest_lot_creation_and_update():
    """Verify digital harvest lot creation and status updates."""
    login_res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farms_res = client.get("/api/farms", headers=headers)
    farm_id = farms_res.json()[0]["id"]

    create_lot = client.post("/api/harvest", json={
        "farm_id": farm_id,
        "crop": "Wheat (Sharbati Gold)",
        "quantity": 22.0,
        "quality": "Grade A",
        "location": "सीहोर यार्ड",
        "status": "ready_for_sale",
        "moisture_percentage": 11.0,
        "expected_price_per_quintal": 2750.0
    }, headers=headers)
    assert create_lot.status_code == 201
    lot_id = create_lot.json()["id"]

    # Patch lot status to bidding
    patch_res = client.patch(f"/api/harvest/{lot_id}", json={
        "status": "bidding"
    }, headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "bidding"


def test_weather_service_and_advisories():
    """Verify 5-day weather endpoint and farming advisories."""
    res = client.get("/api/weather?latitude=23.2033&longitude=77.0844")
    assert res.status_code == 200
    data = res.json()
    assert data["postpone_irrigation"] is True
    assert len(data["forecast_5day"]) == 5
    assert data["is_live_verified"] is False
    assert data["data_source"] == "fallback_agri_met"


def test_notifications_unread_and_mark_read():
    """Verify Notification retrieval, unread counter, and mark-as-read patch."""
    login_res = client.post("/api/auth/login", json={
        "phone": settings.DEMO_FARMER_PHONE,
        "password": settings.DEMO_FARMER_PASSWORD
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["unread_count"] >= 1
    first_notif_id = data["notifications"][0]["id"]

    # Mark as read
    patch_res = client.patch(f"/api/notifications/{first_notif_id}/read", headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["read"] is True
