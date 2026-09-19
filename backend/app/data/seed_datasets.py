"""
Realistic Indian Agricultural Seed Datasets for KisanOS AI.
Covers:
- Curated agronomy RAG knowledge chunks for Wheat, Rice, Potato, Tomato
- Input retail stores clustered relative to configurable farm coordinates
- Regional Mandi benchmark prices & verified buyer listings
- Previous farm crop history (Rabi 2024, Kharif 2024)
- Crop observations and proactive notifications
All seeded records carry explicit data_source="seeded_demo" and is_live_verified=False labels.
"""
import hashlib
import numpy as np
from typing import List, Dict, Any
from app.data.seed_config import SeedConfig


def generate_deterministic_embedding(text: str, dim: int = 1536) -> List[float]:
    """
    Generates a deterministic, normalized embedding vector of given dimension
    based on word hashes. Enables immediate pgvector and cosine retrieval in demo environments.
    """
    words = text.lower().split()
    vector = np.zeros(dim, dtype=np.float32)
    for word in words:
        h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        vector[idx] += 1.0 + (h % 100) / 100.0
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
    return vector.tolist()


def get_curated_knowledge_chunks() -> List[Dict[str, Any]]:
    """Agronomy knowledge chunks derived from ICAR guidelines."""
    chunks = [
        {
            "crop": "Wheat",
            "topic": "Yellow Rust (Puccinia striiformis) Management",
            "content": (
                "पीला रतुआ (Yellow Rust) गेहूं का एक गंभीर फफूंद जनित रोग है। "
                "लक्षण: पत्तियों पर पीले रंग की धारियों के रूप में पाउडर जैसे धब्बे बनते हैं। "
                "अनुकूल मौसम: 10-15°C तापमान और उच्च आर्द्रता (कुहासा/ओस)। "
                "उपचार: रोग के शुरुआती लक्षण दिखते ही प्रोपीकोनाज़ोल (Propiconazole 25% EC) "
                "या टेबुकोनाज़ोल (Tebuconazole 25.9% EC) 1 मिली प्रति लीटर पानी में घोलकर 200 लीटर/एकड़ स्प्रे करें।"
            ),
            "source_document": "ICAR Indian Institute of Wheat and Barley Research Advisory",
            "metadata_json": {
                "disease": "Yellow Rust",
                "severity_default": "high",
                "preferred_chemicals": ["Propiconazole 25% EC", "Tebuconazole 25.9% EC"],
                "timing": "Tillering to Heading"
            }
        },
        {
            "crop": "Wheat",
            "topic": "Tillering Stage Nutrition & Irrigation",
            "content": (
                "गेहूं में कल्ले फूटने (Tillering) की अवस्था बुवाई के 20 से 45 दिनों के बीच होती है। "
                "यह उपज निर्धारण की अत्यंत महत्वपूर्ण अवस्था है। "
                "पोषण: प्रथम सिंचाई के बाद 40-45 किग्रा यूरिया प्रति एकड़ का टॉप ड्रेसिंग करें। "
                "नैनो यूरिया 4 मिली प्रति लीटर पानी का छिड़काव पत्तियों के विकास को गति देता है। "
                "सिंचाई: क्राउन रूट इनीशिएशन (CRI) एवं कल्ले फूटते समय मिट्टी में नमी सुनिश्चित करें।"
            ),
            "source_document": "ICAR Central Agronomic Practices for Sharbati & Durum Wheat",
            "metadata_json": {
                "stage": "Tillering",
                "recommended_nutrients": ["Urea", "Nano Urea", "Zinc Sulphate 33%"],
                "irrigation_advice": "Maintain optimum root-zone moisture without waterlogging"
            }
        },
        {
            "crop": "Wheat",
            "topic": "Termite and Aphid Pest Control",
            "content": (
                "दीमक एवं माहू (Aphid) गेहूं के प्रमुख कीट हैं। "
                "दीमक नियंत्रण: क्लोरपायरीफॉस 20% EC 1.5 से 2.0 लीटर प्रति एकड़ सिंचाई के पानी के साथ दें। "
                "माहू नियंत्रण: जब माहू की संख्या 5 प्रति बाली पहुंचे, इमिडाक्लोप्रिड 17.8% SL "
                "1 मिली प्रति 3 लीटर पानी में घोलकर छिड़काव करें।"
            ),
            "source_document": "ICAR Pest Management Schedule",
            "metadata_json": {
                "pests": ["Termite", "Aphid"],
                "remedies": ["Chlorpyrifos 20% EC", "Imidacloprid 17.8% SL"]
            }
        },
        {
            "crop": "Rice",
            "topic": "Bacterial Leaf Blight (BLB) Identification & Control",
            "content": (
                "धान का जीवाणु झुलसा रोग (Xanthomonas oryzae): "
                "पत्तियों के किनारे से पीले-भूरे रंग का सूखना शुरू होकर नीचे की ओर फैलता है। "
                "नियंत्रण: नत्रजन (यूरिया) का अत्यधिक उपयोग रोकें। "
                "स्ट्रेप्टोसाइक्लिन 6 ग्राम + कॉपर ऑक्सीक्लोराइड 500 ग्राम प्रति 200 लीटर पानी में मिलाकर स्प्रे करें।"
            ),
            "source_document": "National Rice Research Institute (NRRI) Guidelines",
            "metadata_json": {
                "disease": "Bacterial Leaf Blight",
                "control": ["Streptocycline", "Copper Oxychloride 50% WP"]
            }
        },
        {
            "crop": "Potato",
            "topic": "Late Blight (Phytophthora infestans) Early Warning",
            "content": (
                "आलू की पिछेती झुलसा (Late Blight): पत्तियों के किनारों पर जलसिक्त काले-भूरे धब्बे बनते हैं। "
                "मौसम में बदली एवं नमी होने पर यह रोग 48 घंटे में पूरी फसल नष्ट कर सकता है। "
                "रोकथाम: मैंकोजेब (Mancozeb 75% WP) 2.5 ग्राम/लीटर का सुरक्षात्मक छिड़काव करें। "
                "आक्रमण होने पर साइमोक्सानिल + मैंकोजेब (Curzate) 2 ग्राम/लीटर का स्प्रे करें।"
            ),
            "source_document": "CPRI Central Potato Research Institute Advisory",
            "metadata_json": {
                "disease": "Late Blight",
                "action": "Immediate preventive fungicide application"
            }
        },
        {
            "crop": "Tomato",
            "topic": "Tomato Leaf Curl Virus (ToLCV) Management",
            "content": (
                "टमाटर पर्ण कुंचन विषाणु (Leaf Curl): पत्तियां मुड़कर छोटी हो जाती हैं और पौधा बौना रह जाता है। "
                "यह रोग सफेद मक्खी (Bemisia tabaci) द्वारा फैलता है। "
                "प्रबंधन: पीले चिपचिपे कार्ड (Yellow sticky traps) लगाएं। "
                "सफेद मक्खी नियंत्रण हेतु थायमेथोक्सम 25% WG (0.5 ग्राम/लीटर) या एसिटामिप्रिड 20% SP का छिड़काव करें।"
            ),
            "source_document": "Indian Institute of Horticultural Research (IIHR)",
            "metadata_json": {
                "disease": "Leaf Curl Virus",
                "vector": "Whitefly",
                "control": ["Yellow Sticky Traps", "Thiamethoxam 25% WG"]
            }
        }
    ]

    for chunk in chunks:
        chunk["embedding"] = generate_deterministic_embedding(chunk["content"])
    return chunks


def get_seed_stores(config: SeedConfig) -> List[Dict[str, Any]]:
    """
    Generates realistic agri-input stores clustered around the configurable farm coordinates.
    """
    base_lat = config.farm_latitude
    base_lon = config.farm_longitude

    return [
        {
            "name": "किसान सेवा केंद्र (Kisan Seva Kendra)",
            "address": f"कृषि उपज मंडी रोड, {config.farm_location}",
            "phone": "+91 94250 11223",
            "latitude": round(base_lat + 0.018, 4),
            "longitude": round(base_lon + 0.012, 4),
            "verified": True,
            "data_source": "seeded_demo",
            "inventory": [
                {
                    "product_name": "Tilt Propiconazole 25% EC (फफूंदनाशक)",
                    "category": "Pesticide",
                    "quantity": 35.0,
                    "unit": "bottles (500ml)",
                    "price": 850.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                },
                {
                    "product_name": "IFFCO Nano Urea Liquid (नैनो यूरिया)",
                    "category": "Fertilizer",
                    "quantity": 120.0,
                    "unit": "bottles (500ml)",
                    "price": 225.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                },
                {
                    "product_name": "DAP 18:46:0 (डीएपी खाद)",
                    "category": "Fertilizer",
                    "quantity": 40.0,
                    "unit": "bags (50kg)",
                    "price": 1350.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                },
                {
                    "product_name": "Neem Coated Urea (नीम लेपित यूरिया)",
                    "category": "Fertilizer",
                    "quantity": 65.0,
                    "unit": "bags (45kg)",
                    "price": 266.5,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                }
            ]
        },
        {
            "name": "भारत एग्री इनपुट्स एवं बीज भंडार (Bharat Agri Inputs)",
            "address": f"पुराना बस स्टैंड, तहसील चौक, {config.farm_location}",
            "phone": "+91 98261 44556",
            "latitude": round(base_lat - 0.015, 4),
            "longitude": round(base_lon - 0.009, 4),
            "verified": True,
            "data_source": "seeded_demo",
            "inventory": [
                {
                    "product_name": "Mancozeb 75% WP (सुरक्षात्मक फफूंदनाशक)",
                    "category": "Pesticide",
                    "quantity": 25.0,
                    "unit": "packets (500g)",
                    "price": 380.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                },
                {
                    "product_name": "Zinc Sulphate 33% (चिलेटेड जिंक)",
                    "category": "Fertilizer",
                    "quantity": 50.0,
                    "unit": "kg packets",
                    "price": 140.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                },
                {
                    "product_name": "Sharbati Wheat Certified Seeds (गेहूं बीज)",
                    "category": "Seed",
                    "quantity": 15.0,
                    "unit": "bags (40kg)",
                    "price": 2400.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                },
                {
                    "product_name": "Bio NPK Consortia (जैविक जीवाणु खाद)",
                    "category": "Bio-Organic",
                    "quantity": 40.0,
                    "unit": "liters",
                    "price": 350.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                }
            ]
        },
        {
            "name": "श्री गणेश कृषि केंद्र (Shree Ganesh Krishi Kendra)",
            "address": f"हाईवे बायपास, ग्राम पंचायत के पास, {config.farm_location}",
            "phone": "+91 91112 77889",
            "latitude": round(base_lat + 0.032, 4),
            "longitude": round(base_lon - 0.021, 4),
            "verified": True,
            "data_source": "seeded_demo",
            "inventory": [
                {
                    "product_name": "Imidacloprid 17.8% SL (माहू/कीटनाशक)",
                    "category": "Pesticide",
                    "quantity": 18.0,
                    "unit": "bottles (250ml)",
                    "price": 290.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                },
                {
                    "product_name": "Drip Lateral Pipe 16mm (ड्रिप पाइप रोल)",
                    "category": "Equipment",
                    "quantity": 12.0,
                    "unit": "rolls (100m)",
                    "price": 1250.0,
                    "available": True,
                    "data_source": "seeded_demo",
                    "is_live_verified": False
                }
            ]
        }
    ]


def get_seed_markets(config: SeedConfig) -> List[Dict[str, Any]]:
    """
    Generates realistic Mandi market price benchmarks and verified buyer demands.
    """
    base_lat = config.farm_latitude
    base_lon = config.farm_longitude

    return [
        {
            "name": f"कृषि उपज मंडी समिति ({config.farm_location} APMC Mandi)",
            "location": config.farm_location,
            "latitude": round(base_lat + 0.025, 4),
            "longitude": round(base_lon + 0.015, 4),
            "crop": "Wheat (Sharbati Gold)",
            "price_per_quintal": 2750.0,
            "buyer_name": "APMC Registered Traders Association",
            "available_quantity": 450.0,
            "data_source": "seeded_demo",
            "is_live_verified": False
        },
        {
            "name": "आईटीसी ई-चौपाल प्रोक्योरमेंट हब (ITC e-Choupal Hub)",
            "location": f"इंडस्ट्रियल एरिया, {config.farm_location}",
            "latitude": round(base_lat - 0.038, 4),
            "longitude": round(base_lon + 0.042, 4),
            "crop": "Wheat (Mill Quality)",
            "price_per_quintal": 2425.0,
            "buyer_name": "ITC Agribusiness Direct",
            "available_quantity": 800.0,
            "data_source": "seeded_demo",
            "is_live_verified": False
        },
        {
            "name": "क्षेत्रीय मुख्य कृषि मंडी (Regional Central Mandi)",
            "location": "भोपाल संभाग मुख्य यार्ड (Bhopal Main Yard)",
            "latitude": 23.2599,
            "longitude": 77.4126,
            "crop": "Wheat (Lokwan / Sharbati)",
            "price_per_quintal": 2680.0,
            "buyer_name": "मध्य प्रदेश राज्य नागरिक आपूर्ति निगम (MPSCSC)",
            "available_quantity": 1200.0,
            "data_source": "seeded_demo",
            "is_live_verified": False
        },
        {
            "name": f"किसान उत्पादक संगठन - FPO ({config.farm_location} FPO)",
            "location": f"किसान भवन, {config.farm_location}",
            "latitude": round(base_lat + 0.005, 4),
            "longitude": round(base_lon - 0.015, 4),
            "crop": "Soybean (पीला सोयाबीन)",
            "price_per_quintal": 4350.0,
            "buyer_name": "समृद्धि किसान प्रोड्यूसर कंपनी",
            "available_quantity": 300.0,
            "data_source": "seeded_demo",
            "is_live_verified": False
        }
    ]


def get_seed_farm_history() -> List[Dict[str, Any]]:
    """
    Realistic multi-season memory for the demo farm.
    Shows previous wheat crop and kharif crop as requested in the prompt.
    """
    return [
        {
            "crop_name": "Wheat (गेहूं - Sharbati)",
            "season": "Rabi 2024-25",
            "area": 2.0,
            "yield_quintal": 18.0,
            "selling_price": 41400.0,  # ~2300 per quintal
            "inputs_used": "DAP 50kg, Urea 45kg, Tilt 250ml, Micro-nutrients",
            "notes": "उत्कृष्ट उपज, दानों की चमक अच्छी रही। पानी समय पर मिला।",
            "data_source": "seeded_demo"
        },
        {
            "crop_name": "Soybean (सोयाबीन - JS 9560)",
            "season": "Kharif 2024",
            "area": 2.5,
            "yield_quintal": 20.0,
            "selling_price": 86000.0,  # ~4300 per quintal
            "inputs_used": "SSP 3 bags, Rhizobium culture, Coragen for girdle beetle",
            "notes": "अच्छी वर्षा के कारण फलियां भरपूर आईं। खरपतवार नियंत्रण समय पर हुआ।",
            "data_source": "seeded_demo"
        }
    ]
