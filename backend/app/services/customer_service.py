from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.customer import Customer


def list_customers(session: Session, page: int, page_size: int, search: str | None = None) -> tuple[list[Customer], int]:
    query = select(Customer)
    count_query = select(func.count()).select_from(Customer)
    if search:
        pattern = f"%{search}%"
        condition = or_(Customer.external_customer_id.ilike(pattern), Customer.customer_persona.ilike(pattern))
        query = query.where(condition)
        count_query = count_query.where(condition)
    total = int(session.scalar(count_query) or 0)
    items = list(session.scalars(query.order_by(Customer.created_at.desc()).offset((page - 1) * page_size).limit(page_size)))
    return items, total


def get_customer(session: Session, customer_id: str) -> Customer | None:
    return session.scalar(select(Customer).where(Customer.external_customer_id == customer_id))