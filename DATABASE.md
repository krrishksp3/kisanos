# KisanOS AI — Database Schema & Data Models
**PostgreSQL 16 + pgvector Data Architecture**

---

## 1. Relational Schema & Entity-Relationship Model

```mermaid
erDiagram
    USERS ||--o{ FARMS : owns
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AI_INTERACTIONS : initiates
    FARMS ||--o{ CROP_HISTORIES : logs
    FARMS ||--o{ CROP_OBSERVATIONS : monitors
    FARMS ||--o{ HARVEST_LOTS : produces
    STORES ||--o{ STORE_INVENTORIES : stocks
    HARVEST_LOTS ||--o{ MARKET_BIDS : receives

    USERS {
        uuid id PK
        string name
        string phone UK
        string password_hash
        string language
        string location
        timestamp created_at
        timestamp updated_at
    }

    FARMS {
        uuid id PK
        uuid user_id FK
        string name
        string location
        float latitude
        float longitude
        float area_acres
        string soil_type
        float soil_ph
        string irrigation_type
        string current_crop
        string current_stage
        timestamp created_at
        timestamp updated_at
    }

    CROP_HISTORIES {
        uuid id PK
        uuid farm_id FK
        string crop_name
        string season
        float area
        float yield_quintal
        float selling_price
        text inputs_used
        text notes
        timestamp created_at
    }

    CROP_OBSERVATIONS {
        uuid id PK
        uuid farm_id FK
        string crop
        string image_url
        text symptoms
        string ai_diagnosis
        string severity
        text recommendation
        timestamp created_at
    }

    STORES {
        uuid id PK
        string name
        string address
        string phone
        float latitude
        float longitude
        boolean verified
        timestamp created_at
    }

    STORE_INVENTORIES {
        uuid id PK
        uuid store_id FK
        string product_name
        string category
        float quantity
        string unit
        float price
        boolean available
        timestamp updated_at
    }

    MARKETS {
        uuid id PK
        string name
        string location
        float latitude
        float longitude
        string crop
        float price_per_quintal
        string buyer_name
        float available_quantity
        timestamp updated_at
    }

    HARVEST_LOTS {
        uuid id PK
        uuid farm_id FK
        string crop
        float quantity
        string quality
        string location
        string status
        timestamp created_at
    }

    AI_INTERACTIONS {
        uuid id PK
        uuid user_id FK
        uuid farm_id FK
        text question
        jsonb response
        string image_url
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string type
        string title
        text message
        boolean read
        timestamp created_at
    }

    KNOWLEDGE_CHUNKS {
        uuid id PK
        string crop
        string topic
        text content
        vector_1536 embedding
        jsonb metadata
        timestamp created_at
    }
```

---

## 2. Table Specifications & Indexes

### 2.1. `users`
- Primary Key: `id` (UUID)
- Unique Index: `phone`
- Fields: `name`, `phone`, `password_hash`, `language` (default `'hi'`), `location`, `created_at`, `updated_at`.

### 2.2. `farms`
- Foreign Key: `user_id` references `users(id)` ON DELETE CASCADE
- Index: `user_id`, `(latitude, longitude)`

### 2.3. `crop_histories`
- Foreign Key: `farm_id` references `farms(id)` ON DELETE CASCADE
- Index: `farm_id`, `season`

### 2.4. `crop_observations`
- Foreign Key: `farm_id` references `farms(id)` ON DELETE CASCADE
- Index: `farm_id`, `severity`

### 2.5. `stores` & `store_inventories`
- Index on `stores`: `(latitude, longitude)` for spatial bounding box / Haversine filtering.
- Foreign Key: `store_id` references `stores(id)` ON DELETE CASCADE.
- Index on `store_inventories`: `(store_id, available)`, `product_name`.

### 2.6. `markets` & `harvest_lots`
- `harvest_lots.farm_id` references `farms(id)`.
- Status enum: `draft`, `ready_for_sale`, `bidding`, `sold`.
- `markets` indexed on `crop` and `location`.

### 2.7. `ai_interactions` & `notifications`
- Indexed on `user_id` and `created_at` DESC for rapid dashboard feeds.

### 2.8. `knowledge_chunks` (RAG Vector Index)
- Extension: `CREATE EXTENSION IF NOT EXISTS vector;`
- Column: `embedding vector(1536)` (or 384 for lightweight local models / Cosine similarity fallback)
- Index: HNSW index on `embedding vector_cosine_ops`.
