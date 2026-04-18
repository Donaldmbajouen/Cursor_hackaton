"""
fraud_service.py — Fingerprint, hachage IP, garde-fous.
"""
import hashlib
import hmac

from fastapi import HTTPException, status

from app.config import settings

FINGERPRINT_MIN = 8
FINGERPRINT_MAX = 1024
FP_HEADER = "X-Vote-Fingerprint"


def hash_client_ip(client_ip: str) -> str:
    return hmac.new(
        settings.jwt_secret.encode("utf-8"),
        client_ip.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def assert_valid_fingerprint(fingerprint: str) -> str:
    if (
        not fingerprint
        or len(fingerprint) < FINGERPRINT_MIN
        or len(fingerprint) > FINGERPRINT_MAX
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid fingerprint (length or missing)",
        )
    return fingerprint
