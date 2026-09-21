import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    ticket_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.customer_id", ondelete="CASCADE"), index=True)
    category: Mapped[str | None] = mapped_column(String)
    status: Mapped[str | None] = mapped_column(String)
    priority: Mapped[str | None] = mapped_column(String)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution_time: Mapped[int | None] = mapped_column(Integer)