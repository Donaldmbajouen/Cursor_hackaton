from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MAX_QUESTION_LEN = 2000
MAX_OPTIONS = 20
MAX_OPTION_LEN = 500


class PollCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str = Field(..., min_length=1, max_length=MAX_QUESTION_LEN)
    options: list[str] = Field(..., min_length=2, max_length=MAX_OPTIONS)
    closes_at: datetime

    @field_validator("options")
    @classmethod
    def strip_and_check_options(cls, v: list[str]) -> list[str]:
        out = [o.strip() for o in v]
        if any(len(x) == 0 for x in out):
            raise ValueError("Each option must be a non-empty string (after trim)")
        if any(len(x) > MAX_OPTION_LEN for x in out):
            raise ValueError(f"Each option must be at most {MAX_OPTION_LEN} characters")
        return out

    @field_validator("closes_at")
    @classmethod
    def must_be_utc_or_naive_utc(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)

    @model_validator(mode="after")
    def must_close_in_future(self) -> Self:
        now = datetime.now(timezone.utc)
        if self.closes_at <= now:
            raise ValueError("closes_at must be strictly in the future")
        return self


def _options_from_db(raw: str | list[Any]) -> list[str]:
    if isinstance(raw, list):
        return [str(x) for x in raw]
    return [str(x) for x in json.loads(raw)]


class PollRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question: str
    options: list[str]
    closes_at: datetime
    created_at: datetime
    creator_token: str | None = None

    @classmethod
    def from_row(cls, row: dict, *, include_creator: bool) -> Self:
        options = _options_from_db(row["options"])
        return cls(
            id=row["id"],
            question=row["question"],
            options=options,
            closes_at=row["closes_at"],
            created_at=row["created_at"],
            creator_token=row["creator_token"] if include_creator else None,
        )
