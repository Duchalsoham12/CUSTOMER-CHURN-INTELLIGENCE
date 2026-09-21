import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    external_customer_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    customer_persona: Mapped[str | None] = mapped_column(String)
    company_size: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="customer")
    predictions: Mapped[list["Prediction"]] = relationship(back_populates="customer")