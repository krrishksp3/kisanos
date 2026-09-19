import pytest
import numpy as np
from sqlalchemy import text
from app.core.database import check_db_health, CompatibleVector
from app.core.config import settings
from app.models import (
    User,
    Farm,
    CropHistory,
    CropObservation,
    Store,
    StoreInventory,
    Market,
    HarvestLot,
    AIInteraction,
    Notification,
    KnowledgeChunk
)
from app.data.seed_datasets import generate_deterministic_embedding
from app.data.seed import seed_database


def test_db_health_and_connection():
    """Verify database connection health check returns expected structure."""
    health = check_db_health()
    assert "status" in health
    assert health["status"] in ["connected", "degraded"]
    assert "dialect" in health
    assert "is_postgres" in health
    assert "fallback_active" in health
    # If not on PostgreSQL server, fallback_active must be True
    if not health["is_postgres"]:
        assert health["fallback_active"] is True


def test_user_and_farm_creation(db_session):
    """Verify User and Farm creation with cascade relationship."""
    user = User(
        name="सुनील कुमार (Sunil Kumar)",
        phone="9988776655",
        password_hash="hashed_pw_xyz",
        language="hi",
        location="विदिशा, MP"
    )
    db_session.add(user)
    db_session.commit()

    assert user.id is not None
    assert user.name == "सुनील कुमार (Sunil Kumar)"

    farm = Farm(
        user_id=user.id,
        name="दक्खिन खेत (South Field)",
        location="विदिशा, MP",
        latitude=23.5251,
        longitude=77.8081,
        area_acres=3.2,
        soil_type="Black Loamy",
        soil_ph=7.1,
        irrigation_type="Canal + Sprinkler",
        current_crop="Gram (चना)",
        current_stage="Pod Formation"
    )
    db_session.add(farm)
    db_session.commit()

    assert farm.id is not None
    assert farm.user.name == "सुनील कुमार (Sunil Kumar)"
    assert len(user.farms) == 1
    assert user.farms[0].name == "दक्खिन खेत (South Field)"


def test_crop_history_farm_memory(db_session):
    """Verify Farm Memory: Crop history logging with yield and financials."""
    user = User(name="देवेंद्र (Devendra)", phone="9123456789", password_hash="hash")
    db_session.add(user)
    db_session.commit()

    farm = Farm(
        user_id=user.id,
        name="खेत नं 2",
        location="सीहोर",
        area_acres=2.0,
        soil_type="Clay Loam",
        irrigation_type="Tubewell"
    )
    db_session.add(farm)
    db_session.commit()

    ch1 = CropHistory(
        farm_id=farm.id,
        crop_name="Wheat (गेहूं)",
        season="Rabi 2024",
        area=2.0,
        yield_quintal=18.5,
        selling_price=42550.0,
        inputs_used="DAP 50kg, Urea 45kg"
    )
    db_session.add(ch1)
    db_session.commit()

    assert len(farm.histories) == 1
    assert farm.histories[0].yield_quintal == 18.5
    assert farm.histories[0].selling_price == 42550.0


def test_crop_observation_and_severity(db_session):
    """Verify Crop health observation logs with severity levels."""
    user = User(name="अशोक (Ashok)", phone="9871122334", password_hash="hash")
    db_session.add(user)
    db_session.commit()

    farm = Farm(user_id=user.id, name="उत्तर ब्लॉक", location="रायसेन", area_acres=4.0, soil_type="Black", irrigation_type="Drip")
    db_session.add(farm)
    db_session.commit()

    obs = CropObservation(
        farm_id=farm.id,
        crop="Tomato",
        symptoms="पत्तियों का मुड़ना और छोटा होना (Leaves curling)",
        ai_diagnosis="Tomato Leaf Curl Virus (ToLCV)",
        severity="high",
        recommendation="पीले स्टिकी ट्रैप लगाएं एवं सफेद मक्खी नियंत्रण करें।",
        data_source="vision_ai"
    )
    db_session.add(obs)
    db_session.commit()

    assert obs.id is not None
    assert obs.severity == "high"
    assert len(farm.observations) == 1


def test_store_and_inventory_relationship(db_session):
    """Verify input store and stock inventory with non-live demo tags."""
    store = Store(
        name="श्री राम बीज भंडार",
        address="मंडी चौराहा, सीहोर",
        phone="9827011223",
        latitude=23.205,
        longitude=77.085,
        verified=True,
        data_source="seeded_demo"
    )
    db_session.add(store)
    db_session.commit()

    item1 = StoreInventory(
        store_id=store.id,
        product_name="Tilt Propiconazole 25% EC",
        category="Pesticide",
        quantity=20.0,
        unit="bottles",
        price=850.0,
        available=True,
        data_source="seeded_demo",
        is_live_verified=False
    )
    item2 = StoreInventory(
        store_id=store.id,
        product_name="Nano Urea Liquid",
        category="Fertilizer",
        quantity=50.0,
        unit="bottles",
        price=225.0,
        available=True,
        data_source="seeded_demo",
        is_live_verified=False
    )
    db_session.add_all([item1, item2])
    db_session.commit()

    assert len(store.inventory) == 2
    assert store.inventory[0].is_live_verified is False
    assert store.inventory[0].data_source == "seeded_demo"


def test_market_mandi_prices(db_session):
    """Verify Mandi benchmark rates with explicit demo disclaimer flags."""
    mandi = Market(
        name="सीहोर कृषि उपज मंडी (Sehore Mandi)",
        location="सीहोर, MP",
        latitude=23.210,
        longitude=77.090,
        crop="Wheat (Sharbati)",
        price_per_quintal=2750.0,
        buyer_name="मध्य प्रदेश नागरिक आपूर्ति",
        available_quantity=500.0,
        data_source="seeded_demo",
        is_live_verified=False
    )
    db_session.add(mandi)
    db_session.commit()

    assert mandi.id is not None
    assert mandi.price_per_quintal == 2750.0
    assert mandi.is_live_verified is False


def test_harvest_lot_creation(db_session):
    """Verify Harvest lot creation with quality grades."""
    user = User(name="राकेश (Rakesh)", phone="9406512345", password_hash="hash")
    db_session.add(user)
    db_session.commit()

    farm = Farm(user_id=user.id, name="फार्म 1", location="होशंगाबाद", area_acres=5.0, soil_type="Alluvial", irrigation_type="Canal")
    db_session.add(farm)
    db_session.commit()

    lot = HarvestLot(
        farm_id=farm.id,
        crop="Wheat (Sharbati Gold)",
        quantity=25.0,
        quality="Grade A",
        location="खलिहान यार्ड",
        status="ready_for_sale",
        moisture_percentage=11.2,
        expected_price_per_quintal=2800.0
    )
    db_session.add(lot)
    db_session.commit()

    assert lot.id is not None
    assert lot.status == "ready_for_sale"
    assert lot.quantity == 25.0


def test_notification_and_ai_interaction(db_session):
    """Verify Notifications and AI Structured interaction logging."""
    user = User(name="मोहन (Mohan)", phone="9755123456", password_hash="hash")
    db_session.add(user)
    db_session.commit()

    notif = Notification(
        user_id=user.id,
        type="weather_alert",
        title="बारिश अलर्ट",
        message="अगले 24 घंटे में वर्षा की संभावना है। सिंचाई स्थगित करें।",
        read=False,
        data_source="rule_engine"
    )
    db_session.add(notif)

    ai = AIInteraction(
        user_id=user.id,
        question="गेहूं में यूरिया कब डालें?",
        response={
            "summary": "पहली सिंचाई के बाद टॉप ड्रेसिंग करें",
            "recommended_products": ["Urea", "Nano Urea"],
            "confidence": 0.95
        },
        data_source="ai_generated"
    )
    db_session.add(ai)
    db_session.commit()

    assert notif.read is False
    assert ai.response["confidence"] == 0.95


def test_knowledge_chunk_vector_compatibility(db_session):
    """Verify KnowledgeChunk accepts 1536-dim vectors and performs cosine ranking."""
    query_text = "पीला रतुआ फफूंदनाशक प्रोपीकोनाज़ोल"
    query_vec = generate_deterministic_embedding(query_text)
    assert len(query_vec) == 1536

    doc1 = KnowledgeChunk(
        crop="Wheat",
        topic="Yellow Rust Treatment",
        content="प्रोपीकोनाज़ोल 25% EC का 1ml प्रति लीटर पानी में छिड़काव करें।",
        embedding=query_vec,
        source_document="ICAR Wheat Advisory"
    )
    doc2 = KnowledgeChunk(
        crop="Potato",
        topic="Late Blight Treatment",
        content="आलू में मैंकोजेब 75% WP का छिड़काव करें।",
        embedding=generate_deterministic_embedding("आलू झुलसा मैंकोजेब"),
        source_document="CPRI Potato Advisory"
    )
    db_session.add_all([doc1, doc2])
    db_session.commit()

    assert doc1.id is not None
    assert len(doc1.embedding) == 1536

    # Test Cosine similarity in Python / SQLite fallback
    vec_q = np.array(query_vec)
    vec_d1 = np.array(doc1.embedding)
    vec_d2 = np.array(doc2.embedding)

    sim1 = np.dot(vec_q, vec_d1) / (np.linalg.norm(vec_q) * np.linalg.norm(vec_d1))
    sim2 = np.dot(vec_q, vec_d2) / (np.linalg.norm(vec_q) * np.linalg.norm(vec_d2))

    assert sim1 > sim2, "Relevant document should have strictly higher similarity"


def test_seed_database_execution():
    """Verify the repeatable seed script runs and produces expected entities."""
    counts = seed_database(reset=True)
    assert counts["users"] >= 1
    assert counts["farms"] >= 1
    assert counts["crop_histories"] >= 2
    assert counts["stores"] >= 3
    assert counts["markets"] >= 4
    assert counts["knowledge_chunks"] >= 6
