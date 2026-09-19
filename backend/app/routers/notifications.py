from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User, Notification
from app.schemas.notification import NotificationOut, NotificationListOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListOut)
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve all notifications and unread alert count for the farmer."""
    all_notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    unread_count = sum(1 for n in all_notifs if not n.read)
    return NotificationListOut(
        unread_count=unread_count,
        total_count=len(all_notifs),
        notifications=all_notifs
    )


@router.patch("/{id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a proactive farming advisory notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="सूचना नहीं मिली।")

    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif
