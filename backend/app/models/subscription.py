import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    subscription_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.customer_id", ondelete="CASCADE"), index=True)
    plan_name: Mapped[str | None] = mapped_column(String)
    plan_type: Mapped[str | None] = mapped_column(String, index=True)
    seats: Mapped[int | None] = mapped_column(Integer)
    active_seats: Mapped[int | None] = mapped_column(Integer)
    mrr_usd: Mapped[float | None] = mapped_column(Numeric(12, 2))
    started_at: Mapped[date | None] = mapped_column(Date)
    ended_at: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    customer: Mapped["Customer"] = relationship(back_populates="subscriptions", foreign_keys=[customer_id])