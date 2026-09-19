import os
import logging
from typing import Generator, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.types import TypeDecorator, JSON
from pgvector.sqlalchemy import Vector
from app.core.config import settings

logger = logging.getLogger("kisanos.database")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()


class CompatibleVector(TypeDecorator):
    """
    Production-ready Vector type:
    Uses native pgvector Vector(dim) when on PostgreSQL.
    Transparently falls back to JSON representation when in SQLite development mode.
    """
    impl = Vector
    cache_ok = True

    def __init__(self, dim: int = 1536):
        super().__init__(dim)
        self.dim = dim

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(Vector(self.dim))
        else:
            return dialect.type_descriptor(JSON())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value
        # In SQLite fallback, store as python list/JSON
        if isinstance(value, (list, tuple)):
            return list(value)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value
        if isinstance(value, list):
            return value
        return value


def create_db_engine():
    """
    Creates the database engine with PostgreSQL as primary production target.
    Falls back to SQLite only if PostgreSQL is unreachable and ALLOW_SQLITE_FALLBACK is True.
    """
    pg_url = settings.DATABASE_URL
    if pg_url:
        if pg_url.startswith("postgres://"):
            pg_url = pg_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif pg_url.startswith("postgresql://") and not pg_url.startswith("postgresql+"):
            pg_url = pg_url.replace("postgresql://", "postgresql+psycopg://", 1)

    is_postgres = False
    engine = None

    if pg_url and pg_url.startswith("postgresql"):
        try:
            temp_engine = create_engine(
                pg_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 3}
            )
            with temp_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                # Attempt to register/enable pgvector extension
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                    conn.commit()
                    logger.info("pgvector extension verified on PostgreSQL")
                except Exception as ext_err:
                    logger.warning(f"pgvector extension check notice: {ext_err}")
            engine = temp_engine
            is_postgres = True
            logger.info("Connected to primary PostgreSQL database.")
        except Exception as e:
            logger.warning(f"Could not connect to primary PostgreSQL database: {e}")
            if not settings.ALLOW_SQLITE_FALLBACK:
                raise ConnectionError(f"PostgreSQL connection failed and fallback disabled: {e}")

    if not is_postgres:
        if settings.ALLOW_SQLITE_FALLBACK:
            sqlite_url = f"sqlite:///{settings.SQLITE_DB_PATH}"
            logger.info(f"Activating development/demo fallback: SQLite at {sqlite_url}")
            engine = create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False}
            )
        else:
            raise ConnectionError("No valid database configuration available.")

    return engine, is_postgres


engine, IS_POSTGRES = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health():
    """Returns database connection status and dialect details."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
        dialect_name = engine.dialect.name
        pgvector_supported = False
        if dialect_name == "postgresql":
            try:
                ext = conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'")).scalar()
                pgvector_supported = (ext == "vector")
            except Exception:
                pgvector_supported = False
        return {
            "status": "connected" if result == 1 else "degraded",
            "dialect": dialect_name,
            "is_postgres": (dialect_name == "postgresql"),
            "pgvector_available": pgvector_supported,
            "fallback_active": (dialect_name != "postgresql")
        }
