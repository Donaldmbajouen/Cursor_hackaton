from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class PrepareBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_token: str = Field(min_length=1, max_length=200)


class PrepareOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    poll_id: str


class VoteIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    option_index: int = Field(..., ge=0)
