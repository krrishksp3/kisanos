"""
Repeatable Seed Command for KisanOS AI.
Usage:
    python -m app.data.seed [--reset]
"""
import sys
import argparse
import logging
from sqlalchemy import text
from app.core.database import engine, SessionLocal, Base, IS_POSTGRES
from app.core.security import hash_password
from app.data.seed_config import get_seed_config
from app.data.seed_datasets import (
    get_curated_knowledge_chunks,
    get_seed_stores,
    get_seed_markets,
    get_seed_farm_history
)
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

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("kisanos.seed")


def seed_database(reset: bool = False):
    config = get_seed_config()
    logger.info(f"Starting KisanOS database seed. Target DB: {'PostgreSQL' if IS_POSTGRES else 'SQLite Fallback'}")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    counts = {}

    try:
        if reset:
            logger.info("Resetting existing demo records...")
            # Delete in child-to-parent order
            session.query(AIInteraction).delete()
            session.query(Notification).delete()
            session.query(CropObservation).delete()
            session.query(CropHistory).delete()
            session.query(HarvestLot).delete()
            session.query(StoreInventory).delete()
            session.query(Store).delete()
            session.query(Market).delete()
            session.query(KnowledgeChunk).delete()
            session.query(Farm).delete()
            session.query(User).delete()
            session.commit()
            logger.info("Database reset completed.")

        # 1. Seed or retrieve Demo User
        demo_user = session.query(User).filter(User.phone == config.farmer_phone).first()
        if not demo_user:
            demo_user = User(
                name=config.farmer_name,
                phone=config.farmer_phone,
                password_hash=hash_password(config.farmer_password),
                language=config.farmer_language,
                location=config.farmer_location
            )
            session.add(demo_user)
            session.flush()
            logger.info(f"Seeded demo farmer: {demo_user.name} ({demo_user.phone})")
        counts["users"] = 1

        # 2. Seed Primary Farm
        demo_farm = session.query(Farm).filter(Farm.user_id == demo_user.id).first()
        if not demo_farm:
            demo_farm = Farm(
                user_id=demo_user.id,
                name=config.farm_name,
                location=config.farm_location,
                latitude=config.farm_latitude,
                longitude=config.farm_longitude,
                area_acres=config.farm_area_acres,
                soil_type=config.farm_soil_type,
                soil_ph=config.farm_soil_ph,
                irrigation_type=config.farm_irrigation_type,
                current_crop=config.farm_current_crop,
                current_stage=config.farm_current_stage
            )
            session.add(demo_farm)
            session.flush()
            logger.info(f"Seeded primary farm: {demo_farm.name} - {demo_farm.area_acres} acres")
        counts["farms"] = 1

        # 3. Seed Crop History (Farm Memory)
        histories_data = get_seed_farm_history()
        existing_histories = session.query(CropHistory).filter(CropHistory.farm_id == demo_farm.id).count()
        if existing_histories == 0:
            for item in histories_data:
                ch = CropHistory(
                    farm_id=demo_farm.id,
                    crop_name=item["crop_name"],
                    season=item["season"],
                    area=item["area"],
                    yield_quintal=item["yield_quintal"],
                    selling_price=item["selling_price"],
                    inputs_used=item["inputs_used"],
                    notes=item["notes"],
                    data_source=item.get("data_source", "seeded_demo")
                )
                session.add(ch)
            session.flush()
            logger.info(f"Seeded {len(histories_data)} crop history records for farm memory.")
        counts["crop_histories"] = len(histories_data)

        # 4. Seed Crop Observation
        existing_obs = session.query(CropObservation).filter(CropObservation.farm_id == demo_farm.id).count()
        if existing_obs == 0:
            obs = CropObservation(
                farm_id=demo_farm.id,
                crop="Wheat (गेहूं)",
                symptoms="निचली पत्तियों पर पीले रंग की महीन धारियां और हल्का पीलापन। (Yellow stripes on lower leaves)",
                ai_diagnosis="Yellow Rust (Puccinia striiformis) Early Stage",
                severity="medium",
                recommendation="खेत में अत्यधिक पानी न लगाएं। प्रोपीकोनाज़ोल 25% EC (200 मिली/एकड़) का छिड़काव करें।",
                data_source="seeded_demo"
            )
            session.add(obs)
            session.flush()
            logger.info("Seeded initial crop observation.")
        counts["crop_observations"] = 1

        # 5. Seed Stores and Inventories
        stores_data = get_seed_stores(config)
        inventory_count = 0
        existing_stores = session.query(Store).count()
        if existing_stores == 0:
            for s_data in stores_data:
                store = Store(
                    name=s_data["name"],
                    address=s_data["address"],
                    phone=s_data["phone"],
                    latitude=s_data["latitude"],
                    longitude=s_data["longitude"],
                    verified=s_data["verified"],
                    data_source=s_data["data_source"]
                )
                session.add(store)
                session.flush()

                for inv_item in s_data["inventory"]:
                    inv = StoreInventory(
                        store_id=store.id,
                        product_name=inv_item["product_name"],
                        category=inv_item["category"],
                        quantity=inv_item["quantity"],
                        unit=inv_item["unit"],
                        price=inv_item["price"],
                        available=inv_item["available"],
                        data_source=inv_item["data_source"],
                        is_live_verified=inv_item["is_live_verified"]
                    )
                    session.add(inv)
                    inventory_count += 1
            session.flush()
            logger.info(f"Seeded {len(stores_data)} stores with {inventory_count} inventory products.")
        counts["stores"] = len(stores_data)
        counts["store_inventories"] = inventory_count

        # 6. Seed Markets / Mandi benchmarks
        markets_data = get_seed_markets(config)
        existing_markets = session.query(Market).count()
        if existing_markets == 0:
            for m_data in markets_data:
                market = Market(
                    name=m_data["name"],
                    location=m_data["location"],
                    latitude=m_data["latitude"],
                    longitude=m_data["longitude"],
                    crop=m_data["crop"],
                    price_per_quintal=m_data["price_per_quintal"],
                    buyer_name=m_data["buyer_name"],
                    available_quantity=m_data["available_quantity"],
                    data_source=m_data["data_source"],
                    is_live_verified=m_data["is_live_verified"]
                )
                session.add(market)
            session.flush()
            logger.info(f"Seeded {len(markets_data)} Mandi/market price options.")
        counts["markets"] = len(markets_data)

        # 7. Seed Harvest Lot
        existing_lots = session.query(HarvestLot).filter(HarvestLot.farm_id == demo_farm.id).count()
        if existing_lots == 0:
            lot = HarvestLot(
                farm_id=demo_farm.id,
                crop="Wheat (Sharbati Gold)",
                quantity=20.0,
                quality="Grade A (Sharbati Gold - 11.5% Moisture)",
                location=f"{config.farm_location} Farm Yard",
                status="ready_for_sale",
                moisture_percentage=11.5,
                expected_price_per_quintal=2700.0,
                data_source="seeded_demo"
            )
            session.add(lot)
            session.flush()
            logger.info("Seeded demo harvest lot ready for sale.")
        counts["harvest_lots"] = 1

        # 8. Seed Proactive Notifications
        existing_notes = session.query(Notification).filter(Notification.user_id == demo_user.id).count()
        if existing_notes == 0:
            n1 = Notification(
                user_id=demo_user.id,
                type="weather_alert",
                title="सिंचाई स्थगित परामर्श (Weather Alert: Delay Irrigation)",
                message="मौसम विभाग के अनुसार अगले 48 घंटों में हल्की से मध्यम वर्षा की संभावना (65%) है। गेहूं में सिंचाई 2 दिन के लिए टालें।",
                read=False,
                data_source="seeded_demo"
            )
            n2 = Notification(
                user_id=demo_user.id,
                type="disease_risk",
                title="पीला रतुआ सतर्कता (Yellow Rust Advisory)",
                message="सुबह के समय कोहरे के कारण पीला रतुआ का जोखिम बढ़ गया है। खेत का निरीक्षण करें एवं प्रोपीकोनाज़ोल का स्प्रे तैयार रखें।",
                read=False,
                data_source="seeded_demo"
            )
            session.add_all([n1, n2])
            session.flush()
            logger.info("Seeded 2 proactive farm notifications.")
        counts["notifications"] = 2

        # 9. Seed Curated Knowledge Chunks (pgvector RAG index)
        knowledge_chunks = get_curated_knowledge_chunks()
        existing_chunks = session.query(KnowledgeChunk).count()
        if existing_chunks == 0:
            for k in knowledge_chunks:
                kc = KnowledgeChunk(
                    crop=k["crop"],
                    topic=k["topic"],
                    content=k["content"],
                    embedding=k["embedding"],
                    metadata_json=k.get("metadata_json"),
                    source_document=k["source_document"],
                    data_source="icar_knowledge_base"
                )
                session.add(kc)
            session.flush()
            logger.info(f"Seeded {len(knowledge_chunks)} ICAR agronomy knowledge chunks with 1536-dim embeddings.")
        counts["knowledge_chunks"] = len(knowledge_chunks)

        session.commit()
        logger.info("All demo seed data committed successfully!")
        return counts

    except Exception as e:
        session.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        session.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed KisanOS database with realistic Indian agriculture data.")
    parser.add_argument("--reset", action="store_true", help="Clear existing records before seeding.")
    args = parser.parse_args()
    seed_database(reset=args.reset)
