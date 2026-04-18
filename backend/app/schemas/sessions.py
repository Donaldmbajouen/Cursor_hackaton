from datetime import datetime

from pydantic import BaseModel, ConfigDict


class OpenSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_token: str
    poll_id: str
    created_at: datetime
