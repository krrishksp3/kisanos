from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    read: bool
    data_source: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class NotificationListOut(BaseModel):
    unread_count: int
    total_count: int
    notifications: List[NotificationOut]
