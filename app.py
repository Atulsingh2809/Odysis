import os
import sys
import time
import subprocess
import urllib.request
import streamlit as st
import streamlit.components.v1 as components

# Set full-width layout
st.set_page_config(
    page_title="GlobeTrotter — Travel Planning Platform",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit header padding & margins
st.markdown("""
<style>
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    .main .block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
    }
</style>
""", unsafe_allow_html=True)

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def is_server_ready():
    try:
        urllib.request.urlopen("http://localhost:3001/api/health", timeout=1)
        return True
    except Exception:
        return False

def start_backend():
    if not is_server_ready():
        env = os.environ.copy()
        env["DATABASE_URL"] = "file:./prisma/dev.db"
        env["PORT"] = "3001"
        env["SERVER_PORT"] = "3001"
        env["NODE_ENV"] = "production"
        
        # Check if server/dist/server.js exists, else run build
        dist_path = os.path.join(ROOT_DIR, "server", "dist", "server.js")
        if not os.path.exists(dist_path):
            subprocess.run("npm run build", shell=True, cwd=ROOT_DIR, env=env)

        subprocess.Popen(
            "node server/dist/server.js",
            shell=True,
            cwd=ROOT_DIR,
            env=env,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        time.sleep(2)

start_backend()

# Render full React SPA interface (including Login/Signup, Dashboard, Itinerary Drag-and-drop)
if is_server_ready():
    components.iframe("http://localhost:3001", height=950, scrolling=True)
else:
    st.info("⚡ Launching GlobeTrotter Full-Stack Application... Please wait a few seconds.")
    time.sleep(3)
    st.rerun()
