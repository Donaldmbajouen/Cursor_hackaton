#!/usr/bin/env python3
"""
Test bout en bout: création sondage → session → prepare → vote → message WS (init + tick|counts).
Usage (après le backend lancé):
  export API_URL=http://127.0.0.1:3000
  pip install -r scripts/requirements-smoke.txt
  python3 scripts/smoke_vote.py
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime, timedelta, timezone

try:
    import httpx
except ImportError as e:  # pragma: no cover
    print("Installe: pip install -r scripts/requirements-smoke.txt", file=sys.stderr)
    raise e

try:
    import websockets
except ImportError as e:  # pragma: no cover
    print("Installe: websockets (voir scripts/requirements-smoke.txt)", file=sys.stderr)
    raise e

FP = "devfp123456789"  # >= 8 car. (FINGERPRINT_MIN)


async def _run(base: str, show_ws: bool) -> int:
    base = base.rstrip("/")
    closes = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.post(
            f"{base}/api/polls/",
            json={
                "question": "Test smoke",
                "options": ["A", "B"],
                "closes_at": closes,
            },
        )
        if r.is_error:
            print("create_poll:", r.status_code, r.text, file=sys.stderr)
        r.raise_for_status()
        poll = r.json()
        poll_id = poll["id"]
        print("ok create_poll", poll_id)

        r = await c.post(f"{base}/api/polls/{poll_id}/session")
        r.raise_for_status()
        session_token = r.json()["session_token"]
        print("ok session", session_token[:8] + "…")

        r = await c.post(
            f"{base}/api/votes/prepare",
            json={"session_token": session_token},
            headers={"X-Vote-Fingerprint": FP},
        )
        r.raise_for_status()
        p = r.json()
        access = p["access_token"]
        print("ok prepare, expires_in=", p.get("expires_in"))

        r = await c.post(
            f"{base}/api/votes/",
            json={"option_index": 0},
            headers={"Authorization": f"Bearer {access}"},
        )
        r.raise_for_status()
        v = r.json()
        assert v.get("ok")
        assert v.get("counts") is not None
        print("ok vote, counts", v.get("counts"))

    if not show_ws:
        print("SMOKE: tout HTTP OK. Skip WS (pass --ws pour tester le WebSocket).")
        return 0

    ws_b = base.replace("http://", "ws://", 1).replace("https://", "wss://", 1)
    wurl = f"{ws_b}/ws/votes/{poll_id}"
    print("WebSocket", wurl)
    async with websockets.connect(
        wurl, open_timeout=15, close_timeout=5, max_size=2_000_000
    ) as ws:
        m0 = json.loads(await asyncio.wait_for(ws.recv(), 15))
        assert m0.get("type") == "init", m0
        print("ok ws init, counts", m0.get("counts"), "closes_at" in m0)
        m1 = json.loads(await asyncio.wait_for(ws.recv(), 15))
        t = m1.get("type")
        assert t in ("tick", "counts"), m1
        st = m1.get("server_time", "")
        print("ok ws 2e message type=", t, end="")
        if t == "tick" and st:
            print(" server_time~", st[: 19], end="")
        print()
    print("SMOKE: complet (HTTP + WS).")
    return 0


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument(
        "--url",
        default=os.environ.get("API_URL", "http://127.0.0.1:3000"),
        help="Ex: http://localhost:3000",
    )
    p.add_argument(
        "--no-ws",
        action="store_true",
        help="N’exécuter que le flux HTTP",
    )
    a = p.parse_args()
    try:
        return asyncio.run(_run(a.url, show_ws=not a.no_ws))
    except Exception as e:  # noqa: BLE001
        print("ECHEC:", e, file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
