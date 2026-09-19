import time
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_manual_verification():
    print("=" * 60)
    print("KISANOS AI — MANUAL API VERIFICATION SUITE")
    print("=" * 60)

    # 0. Check Swagger Docs
    print("\n[Step 0] Verifying Swagger OpenAPI Documentation (/docs)...")
    docs_res = requests.get(f"{BASE_URL}/docs", timeout=5)
    assert docs_res.status_code == 200, f"Docs failed: {docs_res.status_code}"
    print(f"✓ Swagger UI accessible at {BASE_URL}/docs (Status: {docs_res.status_code})")

    # 1. Login
    print("\n[Step 1] Logging in as Demo Farmer...")
    login_payload = {
        "phone": "9876543210",
        "password": "Password123!"
    }
    login_res = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=5)
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token_data = login_res.json()
    token = token_data["access_token"]
    print(f"✓ Login successful! Token type: {token_data['token_type']}, Access Token: {token[:20]}...")

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Current User
    print("\n[Step 2] Retrieving current authenticated user profile (/api/auth/me)...")
    me_res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers, timeout=5)
    assert me_res.status_code == 200
    user_info = me_res.json()
    print(f"✓ Authenticated Farmer: {user_info['name']} | Phone: {user_info['phone']} | Location: {user_info['location']}")

    # 3. Get Farm
    print("\n[Step 3] Retrieving registered farms (/api/farms)...")
    farms_res = requests.get(f"{BASE_URL}/api/farms", headers=headers, timeout=5)
    assert farms_res.status_code == 200
    farms = farms_res.json()
    assert len(farms) > 0
    farm = farms[0]
    farm_id = farm["id"]
    print(f"✓ Farm: {farm['name']} | Area: {farm['area_acres']} Acres | Crop: {farm['current_crop']} ({farm['current_stage']})")

    # 4. Get Farm History (Farm Memory)
    print(f"\n[Step 4] Retrieving Farm Memory (/api/farms/{farm_id}/history)...")
    hist_res = requests.get(f"{BASE_URL}/api/farms/{farm_id}/history", headers=headers, timeout=5)
    assert hist_res.status_code == 200
    histories = hist_res.json()
    print(f"✓ Found {len(histories)} historical seasons in Farm Memory:")
    for h in histories:
        print(f"   - {h['season']}: {h['crop_name']} -> {h['yield_quintal']} Quintal | Revenue: ₹{h['selling_price']:,.2f}")

    # 5. Ask AI Advisor
    print("\n[Step 5] Asking AI Advisor (/api/advisor/chat)...")
    advisor_payload = {
        "farm_id": farm_id,
        "crop": "Wheat",
        "crop_stage": "Tillering",
        "message": "गेहूं में पीली पत्तियां और कमजोर बढ़वार दिख रही है। कृपया तुरंत उपचार बताएं।"
    }
    advisor_res = requests.post(f"{BASE_URL}/api/advisor/chat", json=advisor_payload, headers=headers, timeout=10)
    assert advisor_res.status_code == 200
    adv = advisor_res.json()
    print(f"✓ AI Summary: {adv['summary']}")
    print(f"✓ Suspected Issue: {adv['possible_issue']} (Confidence: {adv['confidence']*100:.0f}%, Severity: {adv['severity']})")
    print(f"✓ Recommended Products: {[p['name'] for p in adv['recommended_products']]}")
    print(f"✓ Sources Cited: {adv['sources']}")

    # 6. Get Nearby Stores
    print("\n[Step 6] Searching Nearby Input Stores (/api/stores/nearby)...")
    stores_res = requests.get(f"{BASE_URL}/api/stores/nearby?latitude={farm['latitude']}&longitude={farm['longitude']}&radius_km=15", timeout=5)
    assert stores_res.status_code == 200
    stores = stores_res.json()
    print(f"✓ Discovered {len(stores)} verified stores within 15km:")
    for s in stores:
        print(f"   - {s['name']} | Distance: {s['distance_km']} km | Items in Stock: {s['inventory_items_count']} | Source: {s['data_source']} (Live: {s['is_live_verified']})")

    first_store_id = stores[0]["id"]

    # 7. Get Store Inventory
    print(f"\n[Step 7] Checking Store Inventory (/api/stores/{first_store_id}/inventory)...")
    inv_res = requests.get(f"{BASE_URL}/api/stores/{first_store_id}/inventory", timeout=5)
    assert inv_res.status_code == 200
    inventory = inv_res.json()
    print(f"✓ Store '{stores[0]['name']}' has {len(inventory)} products available:")
    for item in inventory[:3]:
        print(f"   - {item['product_name']} ({item['category']}): ₹{item['price']}/{item['unit']} [Available: {item['available']}]")

    # 8. Get Market Options
    print("\n[Step 8] Retrieving Mandi Market Options (/api/markets?crop=Wheat)...")
    markets_res = requests.get(f"{BASE_URL}/api/markets?crop=Wheat", timeout=5)
    assert markets_res.status_code == 200
    markets = markets_res.json()
    print(f"✓ Found {len(markets)} Mandi/buyer options:")
    for m in markets:
        print(f"   - {m['name']} ({m['location']}): ₹{m['price_per_quintal']}/Quintal | Buyer: {m['buyer_name']} | Source: {m['data_source']} (Live: {m['is_live_verified']})")

    # 9. Create Harvest Lot
    print("\n[Step 9] Creating Digital Harvest Lot (/api/harvest)...")
    harvest_payload = {
        "farm_id": farm_id,
        "crop": "Wheat (Sharbati Gold)",
        "quantity": 25.0,
        "quality": "Grade A (Sharbati Gold - 11.2% Moisture)",
        "location": "Sehore Yard Warehouse #4",
        "status": "ready_for_sale",
        "moisture_percentage": 11.2,
        "expected_price_per_quintal": 2750.0
    }
    harvest_res = requests.post(f"{BASE_URL}/api/harvest", json=harvest_payload, headers=headers, timeout=5)
    assert harvest_res.status_code == 201
    lot = harvest_res.json()
    print(f"✓ Harvest Lot Created: {lot['crop']} | Quantity: {lot['quantity']} Quintals | Status: {lot['status']} | Lot ID: {lot['id']}")

    # 10. Get Notifications
    print("\n[Step 10] Retrieving Proactive Notifications (/api/notifications)...")
    notifs_res = requests.get(f"{BASE_URL}/api/notifications", headers=headers, timeout=5)
    assert notifs_res.status_code == 200
    notifs_data = notifs_res.json()
    print(f"✓ Unread Notifications: {notifs_data['unread_count']} / Total: {notifs_data['total_count']}")
    for n in notifs_data["notifications"]:
        print(f"   - [{n['type']}] {n['title']} | Read: {n['read']}")

    print("\n" + "=" * 60)
    print("ALL 10 MANUAL VERIFICATION STEPS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_manual_verification()
