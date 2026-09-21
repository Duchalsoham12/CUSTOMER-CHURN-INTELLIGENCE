import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.customer_id", ondelete="CASCADE"), index=True)
    amount_usd: Mapped[float] = mapped_column(Numeric(12, 2))
    transaction_type: Mapped[str | None] = mapped_column(String)
    transaction_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)