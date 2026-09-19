import logging
import math
import json
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Farm, CropHistory, CropObservation, Store, StoreInventory, AIInteraction, User
from app.schemas.advisor import (
    AdvisorRequest,
    AdvisorResponse,
    ProductRecommendation,
    StoreRecommendation,
    KnowledgeReference
)
from app.services.rag_service import rag_service
from app.services.weather_service import weather_service
from app.services.llm_provider import get_llm_provider

logger = logging.getLogger("kisanos.advisor")


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes distance between two coordinates in kilometers using Haversine formula."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


class AdvisorService:
    """
    Upgraded AI Farming Advisor Pipeline.
    Gathers:
    1. Farmer question
    2. Authenticated user
    3. Selected farm (with ownership security validation)
    4. Current crop & stage
    5. Soil information (type, pH)
    6. Farm history / Farm Memory (previous seasons, yields, past inputs)
    7. Recent crop observations & symptoms
    8. Current weather context & precipitation probability
    9. Relevant agricultural knowledge from KnowledgeChunk database via RAG
    10. Nearby stores and actual database inventory matching
    11. Persisted AIInteraction recording
    """

    def generate_advice(
        self,
        db: Session,
        user: User,
        request: AdvisorRequest
    ) -> AdvisorResponse:
        # Validate question
        if not request.message or len(request.message.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="प्रश्न खाली नहीं हो सकता (Question cannot be empty)."
            )

        # 1. Farm Validation & Context Gathering
        farm: Optional[Farm] = None
        farm_lat = 23.2033
        farm_lon = 77.0844
        farm_location = "Sehore, Madhya Pradesh"
        soil_info = "काली दोमट मिट्टी (Black loamy soil)"
        soil_ph = 6.8
        irrigation_type = "Tubewell + Drip"
        history_summary = "कोई पूर्व रिकॉर्ड नहीं"
        has_history = False

        if request.farm_id:
            farm = db.query(Farm).filter(Farm.id == request.farm_id).first()
            if not farm:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="खेत का विवरण नहीं मिला (Farm not found)."
                )
            if farm.user_id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="अनधिकृत पहुंच: यह खेत आपका नहीं है (Not authorized to access this farm)."
                )

            farm_lat = farm.latitude or farm_lat
            farm_lon = farm.longitude or farm_lon
            farm_location = farm.location or farm_location
            soil_info = farm.soil_type or soil_info
            soil_ph = farm.soil_ph or soil_ph
            irrigation_type = farm.irrigation_type or irrigation_type
            crop_name = request.crop or farm.current_crop or "Wheat"
            crop_stage = request.crop_stage or farm.current_stage or "Tillering"

            # Query Farm History (Farm Memory)
            histories = (
                db.query(CropHistory)
                .filter(CropHistory.farm_id == farm.id)
                .order_by(CropHistory.created_at.desc())
                .all()
            )
            if histories:
                has_history = True
                hist_items = [
                    f"{h.season} ({h.crop_name}): {h.yield_quintal}Q, इनपुट्स: {h.inputs_used or 'मानक'}"
                    for h in histories
                ]
                history_summary = "; ".join(hist_items)
        else:
            # Fallback to user's first farm if available
            first_farm = db.query(Farm).filter(Farm.user_id == user.id).first()
            if first_farm:
                farm = first_farm
                farm_lat = first_farm.latitude or farm_lat
                farm_lon = first_farm.longitude or farm_lon
                crop_name = request.crop or first_farm.current_crop or "Wheat"
                crop_stage = request.crop_stage or first_farm.current_stage or "Tillering"
                soil_info = first_farm.soil_type or soil_info
                soil_ph = first_farm.soil_ph or soil_ph
                irrigation_type = first_farm.irrigation_type or irrigation_type
            else:
                crop_name = request.crop or "Wheat"
                crop_stage = request.crop_stage or "Tillering"

        # 2. Recent Crop Observations
        recent_observation = None
        if farm:
            recent_observation = (
                db.query(CropObservation)
                .filter(CropObservation.farm_id == farm.id)
                .order_by(CropObservation.created_at.desc())
                .first()
            )

        # 3. Weather Context
        weather = weather_service.get_weather(farm_lat, farm_lon, farm_location)

        # 4. RAG Knowledge Retrieval
        rag_query = f"{crop_name} {crop_stage} {request.message}"
        relevant_chunks = rag_service.retrieve_relevant_chunks(db, rag_query, crop=crop_name, top_k=3)
        knowledge_refs = rag_service.to_knowledge_references(relevant_chunks)
        sources = [c.source_document for c in relevant_chunks] if relevant_chunks else ["ICAR Agronomy Guidelines"]

        # 5. Nearby Stores & Inventory Gathering from Database
        all_stores = db.query(Store).all()
        store_inventory_map: Dict[str, List[StoreInventory]] = {}
        for s in all_stores:
            inv = db.query(StoreInventory).filter(
                StoreInventory.store_id == s.id,
                StoreInventory.available == True
            ).all()
            store_inventory_map[s.id] = inv

        # 6. LLM Provider vs. Grounded Agronomy Synthesis
        llm_provider = get_llm_provider()
        ai_generated = False
        data_sources = ["कृषि ज्ञान आधार (ICAR)", "मौसम पूर्वानुमान", "स्टोर इन्वेंटरी"]
        if has_history:
            data_sources.append("खेत मेमोरी (Farm Memory)")

        q_lower = request.message.lower()

        # Deterministic Grounded Agronomic Analysis
        if any(term in q_lower for term in ["पीला", "yellow", "रतुआ", "rust", "धब्बे", "spot", "फफूंद"]):
            possible_issue = "Yellow Rust (पीला रतुआ) के संभावित लक्षण"
            severity = "high"
            confidence = 0.91
            summary = (
                f"{crop_name} ({crop_stage}) में पत्तियों पर पीलापन एवं धारियां फफूंद जनित 'पीला रतुआ' के संभावित लक्षण हैं। "
                f"आर्द्रता ({weather.humidity_percent}%) अधिक होने से संक्रमण फैलने का जोखिम बढ़ जाता है।"
            )
            guidance = [
                "खेत में अतिरिक्त जलजमाव न होने दें, जल निकासी नालियां खुली रखें।",
                "संक्रमित पत्तियों को एकत्र कर खेत से दूर गड्ढे में दबाएं ताकि बीजाणु न फैलें।",
                "मौसम साफ होने पर प्रोपीकोनाज़ोल 25% EC (1 मिली/लीटर) या टेबुकोनाज़ोल का पर्णीय छिड़काव करें।"
            ]
            recommended_products = [
                ProductRecommendation(
                    name="Tilt (Propiconazole 25% EC)",
                    category="Fungicide",
                    dosage="1 ml प्रति लीटर पानी (200 ml/एकड़)",
                    purpose="पीला रतुआ फफूंद नियंत्रण",
                    estimated_price=850.0
                ),
                ProductRecommendation(
                    name="IFFCO Nano Urea Liquid",
                    category="Fertilizer",
                    dosage="4 ml प्रति लीटर पानी",
                    purpose="पत्तियों में क्लोरोफिल और पोषण पुनर्बहाली",
                    estimated_price=225.0
                )
            ]
            warnings = [
                f"आगामी 48 घंटों में {weather.precipitation_prob}% वर्षा की संभावना है। वर्षा के दौरान अथवा वर्षा से ठीक पहले छिड़काव न करें।"
            ]

        elif any(term in q_lower for term in ["यूरिया", "खाद", "fertilizer", "nutrition", "डोज़", "टॉप ड्रेसिंग", "पोषण"]):
            possible_issue = "Tillering Stage Nutrient Management (कल्ले फूटने की अवस्था में पोषण)"
            severity = "medium"
            confidence = 0.94
            summary = (
                f"{crop_name} के कल्ले फूटने ({crop_stage}) के समय नाइट्रोजन और सूक्ष्म पोषक तत्वों की आवश्यकता सर्वाधिक होती है। "
                f"मिट्टी {soil_info} (pH {soil_ph}) के अनुसार संतुलित खाद प्रयोग करें।"
            )
            guidance = [
                "प्रथम सिंचाई के तुरंत बाद जब पैर टिकने लगे, 40-45 किग्रा यूरिया प्रति एकड़ का भुरकाव करें।",
                "नैनो यूरिया (4 मिली/लीटर पानी) का पर्णीय छिड़काव कल्लों की संख्या व बढ़वार में सहायक है।",
                "यदि जिंक की कमी के लक्षण हों तो 5 किग्रा जिंक सल्फेट प्रति एकड़ का प्रयोग करें।"
            ]
            recommended_products = [
                ProductRecommendation(
                    name="Neem Coated Urea",
                    category="Fertilizer",
                    dosage="45 kg प्रति एकड़ टॉप ड्रेसिंग",
                    purpose="नाइट्रोजन आपूर्ति",
                    estimated_price=266.5
                ),
                ProductRecommendation(
                    name="Zinc Sulphate 33%",
                    category="Micronutrient",
                    dosage="5 kg प्रति एकड़",
                    purpose="जिंक सूक्ष्म पोषक तत्व संतुलन",
                    estimated_price=140.0
                )
            ]
            warnings = [
                "यूरिया का अत्यधिक उपयोग फसल को नाजुक बनाता है जिससे कीट-रोगों का प्रकोप बढ़ सकता है।"
            ]

        elif any(term in q_lower for term in ["दीमक", "कीट", "माहू", "aphid", "pest", "इल्ली"]):
            possible_issue = "Pest Infestation Risk (कीट प्रकोप जोखिम)"
            severity = "medium"
            confidence = 0.88
            summary = f"{crop_name} में दीमक व माहू कीट के संक्रमण की आशंका है। प्रारंभिक अवस्था में ही रोकथाम करें।"
            guidance = [
                "दीमक के लिए सिंचाई के पानी के साथ क्लोरपायरीफॉस 20% EC 1.5-2 लीटर प्रति एकड़ दें।",
                "माहू की संख्या बढ़ने पर इमिडाक्लोप्रिड 17.8% SL (1 मिली प्रति 3 लीटर पानी) का छिड़काव करें।",
                "शाम के समय छिड़काव करें जब मधुमक्खियों की गतिविधि कम हो।"
            ]
            recommended_products = [
                ProductRecommendation(
                    name="Chlorpyrifos 20% EC",
                    category="Insecticide",
                    dosage="1.5 - 2 लीटर प्रति एकड़ सिंचाई के साथ",
                    purpose="दीमक नियंत्रण",
                    estimated_price=420.0
                ),
                ProductRecommendation(
                    name="Imidacloprid 17.8% SL",
                    category="Insecticide",
                    dosage="1 ml प्रति 3 लीटर पानी",
                    purpose="माहू एवं रसचूसक कीट नियंत्रण",
                    estimated_price=310.0
                )
            ]
            warnings = ["कीटनाशक का प्रयोग करते समय दस्ताने और मास्क का अनिवार्य रूप से प्रयोग करें।"]

        else:
            # General agronomy or when question doesn't match specific disease
            if relevant_chunks:
                top_chunk = relevant_chunks[0]
                possible_issue = f"{top_chunk.topic} (कृषि ज्ञान संदर्भ)"
                severity = "low"
                confidence = 0.82
                summary = (
                    f"{crop_name} ({crop_stage}) के संदर्भ में: {top_chunk.content[:200]}..."
                )
                guidance = [
                    "खेत में उचित नमी बनाए रखें और नियमित अंतराल पर पौधों का निरीक्षण करें।",
                    "कृषि विज्ञान केंद्र के प्रमाणित दिशानिर्देशों के अनुसार ही किसी रसायन का प्रयोग करें।"
                ]
                recommended_products = []
                warnings = [
                    "उपलब्ध कृषि ज्ञान के आधार पर सामान्य मार्गदर्शन दिया गया है। लक्षण स्पष्ट न होने पर स्थानीय कृषि अधिकारी से परामर्श लें।"
                ]
            else:
                possible_issue = "अस्पष्ट लक्षण / अतिरिक्त जानकारी आवश्यक"
                severity = "low"
                confidence = 0.65
                summary = (
                    "उपलब्ध कृषि ज्ञान के आधार पर पर्याप्त जानकारी नहीं मिली। "
                    "कृपया लक्षण का अधिक विस्तार से वर्णन करें या फोटो अपलोड करें।"
                )
                guidance = [
                    "लक्षणों की स्पष्ट जानकारी जैसे पत्तियों का रंग, पौधे का भाग और फैलाव दर्ज करें।",
                    "नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।"
                ]
                recommended_products = []
                warnings = ["बिना सटीक पहचान के किसी भी रासायनिक कीटनाशक का छिड़काव न करें।"]

        # Match Nearby Stores & Inventory in Database
        nearby_stores_recs: List[StoreRecommendation] = []
        for store in all_stores:
            dist = calculate_haversine_distance(farm_lat, farm_lon, store.latitude, store.longitude)
            inv_items = store_inventory_map.get(store.id, [])
            matched = []

            for rp in recommended_products:
                rp_words = [w.lower() for w in rp.name.split() if len(w) > 3]
                for inv in inv_items:
                    inv_name_lower = inv.product_name.lower()
                    if any(w in inv_name_lower for w in rp_words):
                        matched.append(f"{inv.product_name} (₹{inv.price})")

            nearby_stores_recs.append(StoreRecommendation(
                store_id=store.id,
                name=store.name,
                distance_km=dist,
                in_stock=len(matched) > 0,
                matched_products=matched[:3],
                data_source=store.data_source,
                is_live_verified=False
            ))

        # Sort stores by in_stock first, then distance
        nearby_stores_recs.sort(key=lambda s: (not s.in_stock, s.distance_km))

        response = AdvisorResponse(
            summary=summary,
            possible_issue=possible_issue,
            confidence=confidence,
            severity=severity,
            general_guidance=guidance,
            recommended_products=recommended_products,
            nearby_stores=nearby_stores_recs[:3],
            warnings=warnings,
            sources=sources,
            knowledge_references=knowledge_refs,
            data_sources=data_sources,
            ai_generated=ai_generated,
            disclaimer="AI परामर्श केवल मार्गदर्शन हेतु है। गंभीर स्थिति में कृषि विज्ञान केंद्र से संपर्क करें।"
        )

        # 7. Persist AIInteraction in Database
        try:
            interaction = AIInteraction(
                user_id=user.id,
                farm_id=farm.id if farm else None,
                question=request.message,
                response=response.model_dump(),
                image_url=request.image_url,
                data_source="ai_rag_service"
            )
            db.add(interaction)
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to persist AIInteraction: {e}")
            db.rollback()

        return response


advisor_service = AdvisorService()
