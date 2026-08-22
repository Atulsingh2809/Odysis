import os
import sys
import time
import subprocess
import urllib.request
import streamlit as st
import streamlit.components.v1 as components

# Set page layout to wide and title
st.set_page_config(
    page_title="GlobeTrotter — Travel Planning Platform",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for Streamlit header & container
st.markdown("""
<style>
    .main .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        max-width: 100%;
    }
    .stAppHeader {
        display: none;
    }
    .metric-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 16px;
    }
</style>
""", unsafe_allow_html=True)

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def is_port_open(port):
    try:
        urllib.request.urlopen(f"http://localhost:{port}/health", timeout=1)
        return True
    except Exception:
        try:
            urllib.request.urlopen(f"http://localhost:{port}/", timeout=1)
            return True
        except Exception:
            return False

@st.cache_resource
def start_node_servers():
    """Start Node backend and frontend servers in background subprocess."""
    try:
        # Check if API server port 3001 is open
        if not is_port_open(3001):
            env = os.environ.copy()
            env["DATABASE_URL"] = "file:./dev.db"
            env["PORT"] = "3001"
            env["SERVER_PORT"] = "3001"

            # Launch npm run dev or start process
            cmd = "npm run dev"
            subprocess.Popen(
                cmd,
                shell=True,
                cwd=ROOT_DIR,
                env=env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            time.sleep(3)
    except Exception as e:
        st.error(f"Error launching background servers: {e}")

# Start servers on initial load
start_node_servers()

# Sidebar Navigation & Information
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600", use_container_width=True)
    st.title("✈️ GlobeTrotter")
    st.caption("Personalized Travel Planning Platform")
    st.divider()

    st.markdown("### 🔑 Demo Credentials")
    st.markdown("""
    **Standard User:**
    - **Email:** `demo@globetrotter.local`
    - **Password:** `Demo@12345`

    **Admin Account:**
    - **Email:** `admin@globetrotter.local`
    - **Password:** `Admin@12345`
    """)

    st.divider()
    st.markdown("### 🌐 Server Status")
    
    api_status = is_port_open(3001)
    app_status = is_port_open(5173)

    if api_status:
        st.success("API Server: Online (Port 3001)")
    else:
        st.warning("API Server: Starting...")

    if app_status:
        st.success("React App: Online (Port 5173)")
    else:
        st.info("React App: Connecting...")

    st.divider()
    st.markdown("### 🔗 Quick Links")
    st.markdown("- [Open API Documentation](http://localhost:3001/api/docs)")
    st.markdown("- [Open Direct App Tab](http://localhost:5173)")
    st.markdown("- [GitHub Source Code](https://github.com/Atulsingh2809/Odysis)")

# Main Streamlit Display Area
st.title("GlobeTrotter — Travel Planning Platform")
st.write("Integrated Multi-City Itinerary Builder, Budget Calculator, & Activity Explorer.")

# Check server state and embed iframe
if is_port_open(5173):
    components.iframe("http://localhost:5173", height=820, scrolling=True)
elif is_port_open(3001):
    st.info("Frontend bundling in progress... Redirecting to API Swagger Docs.")
    components.iframe("http://localhost:3001/api/docs", height=800, scrolling=True)
else:
    st.warning("Starting application services... Please refresh in a few seconds.")
    if st.button("🔄 Refresh Application"):
        st.rerun()
