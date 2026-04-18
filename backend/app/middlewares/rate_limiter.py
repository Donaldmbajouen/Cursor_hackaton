"""
rate_limiter.py — Rate limiting (SlowAPI / IP)
Responsable : Dev 1 (Senior - Anti-fraude)
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

# TODO Dev 1 : clé composite poll_id + IP, fenêtres dynamiques
limiter = Limiter(key_func=get_remote_address)
