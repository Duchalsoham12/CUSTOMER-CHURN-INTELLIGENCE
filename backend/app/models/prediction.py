import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    prediction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.customer_id", ondelete="CASCADE"), index=True)
    model_name: Mapped[str] = mapped_column(String)
    model_version: Mapped[str | None] = mapped_column(String)
    churn_probability: Mapped[float | None] = mapped_column(Numeric(8, 6))
    risk_level: Mapped[str | None] = mapped_column(String, index=True)
    revenue_at_risk_usd: Mapped[float | None] = mapped_column(Numeric(12, 2))
    predicted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    customer: Mapped["Customer"] = relationship(back_populates="predictions", foreign_keys=[customer_id])