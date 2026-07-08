from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import socket
import shutil
import psutil
import logging
import os

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="Server Page Public Metrics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=[],
)

PUBLIC_BASE = "https://andrefrndz.site"
SERVICES = [
    {"name": "Portafolio", "slug": "mi-portafolio", "url": f"{PUBLIC_BASE}", "port": 3003},
    {"name": "Server Page", "slug": "server-page", "url": f"{PUBLIC_BASE}/server", "port": 8080},
    {"name": "YouTube Dashboard", "slug": "dashboard-youtube", "url": f"{PUBLIC_BASE}/youtube", "port": 5173},
    {"name": "AdGuard Home", "slug": "adguard-home", "url": f"{PUBLIC_BASE}/adguard", "port": 8800},
]

HOST_TARGET = os.environ.get("HOST_TARGET", "localhost")


class HealthResponse(BaseModel):
    status: str


@app.get("/health", response_model=HealthResponse)
def health():
    return {"status": "ok"}


@app.get("/api/services")
def get_services():
    return {"services": SERVICES}


def is_host_port_open(port: int) -> bool:
    try:
        with socket.create_connection((HOST_TARGET, port), timeout=0.4) as conn:
            return True
    except OSError:
        return False


@app.get("/api/status")
def get_status():
    items = []
    for service in SERVICES:
        online = is_host_port_open(service["port"])
        items.append({
            "name": service["name"],
            "slug": service["slug"],
            "url": service["url"],
            "online": bool(online),
        })
    return {"services": items}


class SystemMetrics(BaseModel):
    cpu: float
    memory: float
    disk: float
    uptime: int


@app.get("/api/metrics", response_model=SystemMetrics)
def get_metrics():
    cpu = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory().percent
    disk = 0.0
    try:
        usage = shutil.disk_usage("/")
        disk = round((usage.used / usage.total) * 100, 1)
    except Exception:
        disk = 0.0

    uptime = 0
    try:
        with open("/proc/uptime", "r", encoding="utf-8") as f:
            uptime = int(float(f.read().split()[0]))
    except Exception:
        uptime = 0

    return {
        "cpu": round(cpu, 1),
        "memory": round(memory, 1),
        "disk": disk,
        "uptime": uptime,
    }
