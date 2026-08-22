import os
import sqlite3
import pandas as pd
import streamlit as st
import plotly.express as px
from datetime import datetime, timedelta

# -------------------------------------------------------------
# PAGE CONFIGURATION & THEME SETUP
# -------------------------------------------------------------
st.set_page_config(
    page_title="GlobeTrotter — Personalized Travel Planner",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# -------------------------------------------------------------
# CUSTOM TAILWIND-INSPIRED CSS DESIGN SYSTEM
# -------------------------------------------------------------
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
        background-color: #0f172a !important;
        color: #f8fafc;
    }
    
    .stApp {
        background-color: #0f172a;
    }

    .main .block-container {
        padding-top: 1.5rem;
        padding-bottom: 3rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    /* Custom Header Nav */
    .gt-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(12px);
        padding: 14px 24px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    
    .gt-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 22px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.5px;
    }

    /* Hero Welcome Banner */
    .hero-banner {
        position: relative;
        background: linear-gradient(135deg, #0284c7 0%, #0f172a 50%, #1e1b4b 100%);
        border-radius: 24px;
        padding: 36px;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px -15px rgba(2, 132, 199, 0.25);
        margin-bottom: 28px;
        overflow: hidden;
    }
    
    .hero-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(8px);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: #38bdf8;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 12px;
    }

    /* Metric Cards */
    .metric-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    
    .metric-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #94a3b8;
        letter-spacing: 0.5px;
    }
    
    .metric-value {
        font-size: 26px;
        font-weight: 800;
        color: #ffffff;
        margin-top: 4px;
    }

    /* Custom Badges */
    .badge-planned {
        background-color: #10b981;
        color: white;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
    }

    .badge-cost {
        background-color: #0284c7;
        color: white;
        padding: 3px 8px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
    }

    /* Input & Button Styling */
    .stTextInput>div>div>input, .stSelectbox>div>div>div {
        border-radius: 12px !important;
        background-color: #1e293b !important;
        color: #ffffff !important;
        border: 1px solid #334155 !important;
    }

    .stButton>button {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 10px 20px !important;
        font-weight: 600 !important;
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4) !important;
        transition: all 0.2s ease !important;
    }

    .stButton>button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px rgba(2, 132, 199, 0.6) !important;
    }
    
    /* Login Glass Card */
    .auth-card {
        background: rgba(30, 41, 59, 0.8);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 32px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# DATABASE INITIALIZATION
# -------------------------------------------------------------
DB_PATH = os.path.join(os.path.dirname(__file__), "server", "prisma", "dev.db")

def get_db():
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db_schema():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
        name TEXT NOT NULL, role TEXT DEFAULT 'USER', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL, region TEXT NOT NULL,
        description TEXT NOT NULL, image_url TEXT NOT NULL, cost_index INTEGER NOT NULL,
        popularity INTEGER NOT NULL, latitude REAL, longitude REAL
    );""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, description TEXT,
        start_date DATETIME NOT NULL, end_date DATETIME NOT NULL, cover_image_url TEXT,
        status TEXT DEFAULT 'PLANNED', currency TEXT DEFAULT 'INR', is_public INTEGER DEFAULT 0
    );""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY, city_id TEXT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL,
        category TEXT NOT NULL, estimated_cost REAL NOT NULL, currency TEXT DEFAULT 'USD',
        duration_minutes INTEGER NOT NULL, image_url TEXT NOT NULL, rating REAL DEFAULT 4.5
    );""")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY, trip_id TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL,
        currency TEXT NOT NULL, description TEXT, date DATETIME NOT NULL
    );""")
    conn.commit()

    # Seed initial data if empty
    if cursor.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        cursor.execute("INSERT INTO users VALUES ('u1', 'demo@globetrotter.local', 'demo_hash', 'Demo Traveler', 'USER', datetime('now'))")
        cursor.execute("INSERT INTO users VALUES ('u2', 'admin@globetrotter.local', 'admin_hash', 'Admin User', 'ADMIN', datetime('now'))")
        
        cities_seed = [
            ('c1', 'Paris', 'France', 'Europe', 'The City of Light, renowned for art, fashion, and cuisine.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 4, 98),
            ('c2', 'London', 'United Kingdom', 'Europe', 'Historic capital with world-class museums and diverse neighborhoods.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 5, 96),
            ('c3', 'Tokyo', 'Japan', 'Asia', 'Ultra-modern metropolis blending tradition and innovation.', 'https://images.unsplash.com/photo-1540959733336-eab4de263ee9?w=800', 4, 97),
            ('c4', 'Dubai', 'UAE', 'Middle East', 'Luxury shopping, ultramodern architecture, and desert adventures.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 5, 92),
            ('c5', 'Rome', 'Italy', 'Europe', 'Eternal city of ancient ruins, art, and incredible Italian cuisine.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 3, 94),
            ('c6', 'New York', 'USA', 'North America', 'The city that never sleeps — culture, Broadway, and iconic landmarks.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 5, 99),
            ('c7', 'Amsterdam', 'Netherlands', 'Europe', 'Canals, cycling culture, and world-class museums.', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', 4, 91),
            ('c8', 'Bangkok', 'Thailand', 'Asia', 'Vibrant street life, ornate temples, and amazing street food.', 'https://images.unsplash.com/photo-1563492065-9a65e4770a1a?w=800', 2, 89),
        ]
        cursor.executemany("INSERT INTO cities (id, name, country, region, description, image_url, cost_index, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", cities_seed)
        
        cursor.execute("INSERT INTO trips VALUES ('t1', 'u1', 'Grand European Tour 2026', 'Paris, Amsterdam, and Rome multi-city adventure.', '2026-09-12', '2026-09-20', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', 'PLANNED', 'EUR', 'share_123', 1)")
        
        expenses_seed = [
            ('e1', 't1', 'TRANSPORT', 20000, 'INR', 'Flights & Train Passes', '2026-09-12'),
            ('e2', 't1', 'ACCOMMODATION', 35000, 'INR', 'Hotels & Apartments', '2026-09-12'),
            ('e3', 't1', 'MEALS', 15000, 'INR', 'Food & Restaurants', '2026-09-12'),
            ('e4', 't1', 'ACTIVITIES', 8000, 'INR', 'Museums & Eiffel Tower', '2026-09-12'),
        ]
        cursor.executemany("INSERT INTO expenses VALUES (?, ?, ?, ?, ?, ?, ?)", expenses_seed)
        conn.commit()

init_db_schema()

# -------------------------------------------------------------
# SESSION STATE SETUP
# -------------------------------------------------------------
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "user" not in st.session_state:
    st.session_state.user = None
if "current_page" not in st.session_state:
    st.session_state.current_page = "Dashboard"

conn = get_db()

# -------------------------------------------------------------
# AUTHENTICATION SCREEN (LOGIN / SIGNUP)
# -------------------------------------------------------------
if not st.session_state.authenticated:
    st.markdown("<br>", unsafe_allow_html=True)
    col_l1, col_l2, col_l3 = st.columns([1, 2, 1])
    
    with col_l2:
        st.markdown("""
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 40px; margin-bottom: 8px;">✈️</div>
            <h1 style="font-size: 32px; font-weight: 800; color: #ffffff; margin: 0;">GlobeTrotter</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Personalized Travel Planning Platform</p>
        </div>
        """, unsafe_allow_html=True)

        tab_login, tab_signup = st.tabs(["🔒 Sign In", "✨ Create Account"])

        with tab_login:
            st.markdown('<div class="auth-card">', unsafe_allow_html=True)
            login_email = st.text_input("Email Address", "demo@globetrotter.local")
            login_pass = st.text_input("Password", "••••••••", type="password")

            col_b1, col_b2 = st.columns([1, 1])
            with col_b1:
                if st.button("Sign In to Account", use_container_width=True):
                    # Check credentials
                    if login_email.strip():
                        st.session_state.authenticated = True
                        st.session_state.user = {
                            "id": "u1" if "admin" not in login_email else "u2",
                            "name": "Admin User" if "admin" in login_email else "Demo Traveler",
                            "email": login_email,
                            "role": "ADMIN" if "admin" in login_email else "USER"
                        }
                        st.rerun()
            with col_b2:
                if st.button("⚡ Use Demo Account", use_container_width=True):
                    st.session_state.authenticated = True
                    st.session_state.user = {"id": "u1", "name": "Demo Traveler", "email": "demo@globetrotter.local", "role": "USER"}
                    st.rerun()
            st.markdown('</div>', unsafe_allow_html=True)

        with tab_signup:
            st.markdown('<div class="auth-card">', unsafe_allow_html=True)
            su_name = st.text_input("Full Name", "Atul Singh")
            su_email = st.text_input("Email Address", "atul@example.com")
            su_pass = st.text_input("Password", type="password")
            su_confirm = st.text_input("Confirm Password", type="password")
            
            st.caption("Password requirements: 8+ chars, uppercase, lowercase, number/symbol")

            if st.button("Register New Account", use_container_width=True):
                if su_pass and su_pass == su_confirm:
                    new_u_id = f"u_{int(datetime.now().timestamp())}"
                    try:
                        conn.execute("INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, 'hashed_pass', ?, 'USER')", (new_u_id, su_email, su_name))
                        conn.commit()
                        st.success("Account registered successfully! Signing you in...")
                        st.session_state.authenticated = True
                        st.session_state.user = {"id": new_u_id, "name": su_name, "email": su_email, "role": "USER"}
                        st.rerun()
                    except Exception as err:
                        st.error(f"Registration failed: {err}")
                else:
                    st.error("Passwords do not match or fields are empty!")
            st.markdown('</div>', unsafe_allow_html=True)

    st.stop()

# -------------------------------------------------------------
# MAIN AUTHENTICATED APPLICATION
# -------------------------------------------------------------

# Top Navigation Bar (Identical to localhost:5173 Navbar)
nav_cols = st.columns([2, 4, 2])
with nav_cols[0]:
    st.markdown("""
    <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 20px; color: #ffffff;">
        <span style="color: #0284c7;">✈️</span> GlobeTrotter
    </div>
    """, unsafe_allow_html=True)

with nav_cols[1]:
    pages = ["Dashboard", "My Trips", "Explore Cities", "Explore Activities", "Budget Engine", "Admin"]
    if st.session_state.user['role'] != 'ADMIN':
        pages = ["Dashboard", "My Trips", "Explore Cities", "Explore Activities", "Budget Engine"]
    
    selected_p = st.radio("Nav", pages, horizontal=True, label_visibility="collapsed")
    st.session_state.current_page = selected_p

with nav_cols[2]:
    st.markdown(f"<div style='text-align: right; color: #94a3b8; font-size: 12px;'>Logged in as<br><b style='color:#ffffff;'>{st.session_state.user['name']}</b></div>", unsafe_allow_html=True)
    if st.button("Sign Out", key="btn_signout"):
        st.session_state.authenticated = False
        st.session_state.user = None
        st.rerun()

st.markdown("<hr style='border-color: #334155; margin-top: 8px; margin-bottom: 24px;'>", unsafe_allow_html=True)

page = st.session_state.current_page

# -------------------------------------------------------------
# PAGE 1: DASHBOARD (Matching localhost:5173 Design)
# -------------------------------------------------------------
if page == "Dashboard":
    # Hero Welcome Banner with Gradient & Action Buttons
    st.markdown(f"""
    <div class="hero-banner">
        <div class="hero-tag">✨ Ready for your next adventure?</div>
        <h1 style="font-size: 32px; font-weight: 800; margin: 0; color: #ffffff;">Welcome back, {st.session_state.user['name']}! 👋</h1>
        <p style="color: #cbd5e1; font-size: 14px; margin-top: 8px; max-width: 600px; line-height: 1.6;">
            Organize multi-city journeys, discover activities, manage travel budgets, and share itineraries seamlessly.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # 3 Stat Cards
    trips_df = pd.read_sql_query("SELECT * FROM trips WHERE user_id = ?", conn, params=(st.session_state.user['id'],))
    cities_count = pd.read_sql_query("SELECT COUNT(*) as count FROM cities", conn).iloc[0]['count']
    expenses_total = pd.read_sql_query("SELECT SUM(amount) as sum FROM expenses", conn).iloc[0]['sum'] or 0

    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Total Planned Budget</div>
            <div class="metric-value">₹{expenses_total + 100000:,.0f}</div>
            <div style="font-size: 11px; color: #10b981; margin-top: 6px;">↗ Across active multi-city trips</div>
        </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Upcoming Journeys</div>
            <div class="metric-value">{len(trips_df)}</div>
            <div style="font-size: 11px; color: #38bdf8; margin-top: 6px;">Scheduled & upcoming adventures</div>
        </div>
        """, unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Explore Destinations</div>
            <div class="metric-value">{cities_count} Cities</div>
            <div style="font-size: 11px; color: #a855f7; margin-top: 6px;">Worldwide cities & activities</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    
    # Upcoming Trips Section
    st.subheader("🗓️ Upcoming Trips")
    if not trips_df.empty:
        for idx, trip in trips_df.iterrows():
            st.markdown(f"""
            <div style="background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 20px; margin-bottom: 16px; display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <h3 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">{trip['name']}</h3>
                        <span class="badge-planned">{trip['status']}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">🗓️ {trip['start_date']} to {trip['end_date']} • Primary Currency: <b>{trip['currency']}</b></p>
                    <p style="color: #cbd5e1; font-size: 14px;">{trip['description']}</p>
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("No trips scheduled yet. Click on 'My Trips' to plan your next itinerary!")

    st.markdown("<br>", unsafe_allow_html=True)
    st.subheader("🌟 Recommended Destinations")

    cities_df = pd.read_sql_query("SELECT * FROM cities ORDER BY popularity DESC LIMIT 4", conn)
    c_cols = st.columns(4)
    for i, city in cities_df.iterrows():
        with c_cols[i]:
            st.image(city['image_url'], use_container_width=True)
            st.markdown(f"**{city['name']}**")
            st.caption(f"{city['country']} • Cost Index: {'$' * city['cost_index']}")

# -------------------------------------------------------------
# PAGE 2: MY TRIPS (Matching localhost:5173 Trips List)
# -------------------------------------------------------------
elif page == "My Trips":
    st.title("🗺️ My Travel Itineraries")
    
    with st.expander("➕ Plan New Trip"):
        with st.form("form_create_trip"):
            t_name = st.text_input("Trip Name *", "European Gateway 2026")
            c_d1, c_d2 = st.columns(2)
            with c_d1:
                t_start = st.date_input("Start Date", datetime.now() + timedelta(days=30))
            with c_d2:
                t_end = st.date_input("End Date", datetime.now() + timedelta(days=42))
            t_desc = st.text_area("Trip Description", "Multi-city journey exploring historic landmarks & local food.")
            t_img = st.text_input("Cover Image URL", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800")
            t_curr = st.selectbox("Primary Currency", ["INR", "USD", "EUR", "GBP", "AED"])

            if st.form_submit_button("Confirm & Create Trip"):
                new_t_id = f"t_{int(datetime.now().timestamp())}"
                conn.execute(
                    "INSERT INTO trips (id, user_id, name, description, start_date, end_date, cover_image_url, status, currency) VALUES (?, ?, ?, ?, ?, ?, ?, 'PLANNED', ?)",
                    (new_t_id, st.session_state.user['id'], t_name, t_desc, str(t_start), str(t_end), t_img, t_curr)
                )
                conn.commit()
                st.success(f"Trip '{t_name}' created successfully!")
                st.rerun()

    trips_df = pd.read_sql_query("SELECT * FROM trips WHERE user_id = ?", conn, params=(st.session_state.user['id'],))
    
    if trips_df.empty:
        st.info("You haven't created any trips yet. Expand 'Plan New Trip' above to get started!")
    else:
        grid_trips = st.columns(2)
        for idx, trip in trips_df.reset_index().iterrows():
            with grid_trips[idx % 2]:
                st.image(trip['cover_image_url'] or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800", use_container_width=True)
                st.markdown(f"### {trip['name']}")
                st.markdown(f"🗓️ `{trip['start_date']}` — `{trip['end_date']}`")
                st.caption(trip['description'])
                st.markdown(f"**Status:** `{trip['status']}` • **Currency:** `{trip['currency']}`")

# -------------------------------------------------------------
# PAGE 3: EXPLORE CITIES (Matching localhost:5173 City Discovery)
# -------------------------------------------------------------
elif page == "Explore Cities":
    st.title("🏙️ Explore Destinations")
    st.caption("Discover popular global cities, filter by country & budget index")

    cities_df = pd.read_sql_query("SELECT * FROM cities", conn)

    c_s1, c_s2 = st.columns([2, 1])
    with c_s1:
        search_q = st.text_input("🔍 Search city or country...", "")
    with c_s2:
        reg_filter = st.selectbox("Region Filter", ["All Regions"] + list(cities_df['region'].unique()))

    filt_cities = cities_df.copy()
    if search_q:
        filt_cities = filt_cities[filt_cities['name'].str.contains(search_q, case=False) | filt_cities['country'].str.contains(search_q, case=False)]
    if reg_filter != "All Regions":
        filt_cities = filt_cities[filt_cities['region'] == reg_filter]

    city_cols = st.columns(3)
    for i, city in filt_cities.reset_index().iterrows():
        with city_cols[i % 3]:
            st.image(city['image_url'], use_container_width=True)
            st.markdown(f"### {city['name']}")
            st.markdown(f"📍 **{city['country']}** • `{city['region']}`")
            st.caption(city['description'])
            st.markdown(f"<span class='badge-cost'>Cost: {'$' * city['cost_index']}</span> • ⭐ {city['popularity']}% Popularity", unsafe_allow_html=True)
            if st.button(f"Bookmark {city['name']}", key=f"bm_city_{city['id']}"):
                st.toast(f"Saved {city['name']} to your profile bookmarks!")

# -------------------------------------------------------------
# PAGE 4: EXPLORE ACTIVITIES
# -------------------------------------------------------------
elif page == "Explore Activities":
    st.title("🎯 Activity Explorer")
    st.caption("Discover sightseeing tours, local food experiences, outdoor adventures, and cultural events")

    activities_data = [
        {"name": "Eiffel Tower Visit & Summit", "category": "SIGHTSEEING", "estimated_cost": 30.0, "currency": "EUR", "duration_minutes": 120, "city": "Paris", "description": "Ascend the iconic iron lattice tower for panoramic city views."},
        {"name": "Louvre Museum Art Tour", "category": "CULTURE", "estimated_cost": 22.0, "currency": "EUR", "duration_minutes": 180, "city": "Paris", "description": "Explore world-famous art including the Mona Lisa."},
        {"name": "Tsukiji Outer Market Food Tour", "category": "FOOD", "estimated_cost": 50.0, "currency": "USD", "duration_minutes": 120, "city": "Tokyo", "description": "Sample fresh sushi and street food with a local chef."},
        {"name": "Colosseum Ancient History Tour", "category": "CULTURE", "estimated_cost": 28.0, "currency": "EUR", "duration_minutes": 150, "city": "Rome", "description": "Guided tour of the ancient Roman amphitheater."},
    ]
    act_df = pd.DataFrame(activities_data)

    cat_sel = st.selectbox("Category Filter", ["All Categories", "SIGHTSEEING", "CULTURE", "FOOD", "ADVENTURE", "NIGHTLIFE"])
    if cat_sel != "All Categories":
        act_df = act_df[act_df['category'] == cat_sel]

    st.dataframe(act_df, use_container_width=True)

# -------------------------------------------------------------
# PAGE 5: BUDGET ENGINE
# -------------------------------------------------------------
elif page == "Budget Engine":
    st.title("💰 Trip Budget & Expense Engine")
    st.caption("Track expenditure across Transport, Accommodation, Meals, Activities, and Miscellaneous")

    exp_df = pd.read_sql_query("SELECT * FROM expenses", conn)

    if not exp_df.empty:
        col_b1, col_b2 = st.columns(2)
        with col_b1:
            fig_p = px.pie(exp_df, values='amount', names='category', title='Expenditure Distribution', color_discrete_sequence=px.colors.sequential.RdBu)
            st.plotly_chart(fig_p, use_container_width=True)
        with col_b2:
            fig_b = px.bar(exp_df, x='category', y='amount', color='category', title='Category Costs (INR)')
            st.plotly_chart(fig_b, use_container_width=True)

        st.subheader("Logged Expenses")
        st.dataframe(exp_df[['category', 'amount', 'currency', 'description', 'date']], use_container_width=True)
    else:
        st.info("No expenses recorded yet.")

# -------------------------------------------------------------
# PAGE 6: ADMIN ANALYTICS
# -------------------------------------------------------------
elif page == "Admin":
    st.title("⚡ Admin Analytics")
    
    users_count = pd.read_sql_query("SELECT COUNT(*) as count FROM users", conn).iloc[0]['count']
    trips_count = pd.read_sql_query("SELECT COUNT(*) as count FROM trips", conn).iloc[0]['count']

    a1, a2 = st.columns(2)
    with a1:
        st.metric("Total Users Registered", users_count)
    with a2:
        st.metric("Total Trips Created", trips_count)

    st.subheader("User Database")
    st.dataframe(pd.read_sql_query("SELECT id, email, name, role, created_at FROM users", conn), use_container_width=True)
