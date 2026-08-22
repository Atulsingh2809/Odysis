import os
import sqlite3
import pandas as pd
import streamlit as st
import plotly.express as px
from datetime import datetime, timedelta

# Page Configuration
st.set_page_config(
    page_title="GlobeTrotter — Travel Planning Platform",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main .block-container {
        padding-top: 1.5rem;
        padding-bottom: 2rem;
        max-width: 95%;
    }
    .stButton>button {
        border-radius: 12px;
        font-weight: 600;
    }
    .metric-box {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# Database Connection Helper
DB_PATH = os.path.join(os.path.dirname(__file__), "server", "prisma", "dev.db")

def get_db():
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize DB tables if missing
def init_sqlite_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        region TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        cost_index INTEGER NOT NULL,
        popularity INTEGER NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        cover_image_url TEXT,
        status TEXT DEFAULT 'PLANNED',
        currency TEXT DEFAULT 'INR',
        share_token TEXT UNIQUE,
        is_public INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        city_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        estimated_cost REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        duration_minutes INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        rating REAL DEFAULT 4.5,
        popularity INTEGER DEFAULT 80,
        FOREIGN KEY(city_id) REFERENCES cities(id)
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );
    """)
    conn.commit()
    
    # Check if demo user exists
    user_count = cursor.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if user_count == 0:
        cursor.execute("INSERT INTO users (id, email, password_hash, name, role) VALUES ('u1', 'demo@globetrotter.local', 'demo_hash', 'Demo Traveler', 'USER')")
        cursor.execute("INSERT INTO users (id, email, password_hash, name, role) VALUES ('u2', 'admin@globetrotter.local', 'admin_hash', 'Admin User', 'ADMIN')")
        
        # Seed Cities
        cities_data = [
            ('c1', 'Paris', 'France', 'Europe', 'The City of Light, renowned for art, fashion, and cuisine.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 4, 98),
            ('c2', 'London', 'United Kingdom', 'Europe', 'Historic capital with world-class museums and diverse neighborhoods.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 5, 96),
            ('c3', 'Tokyo', 'Japan', 'Asia', 'Ultra-modern metropolis blending tradition and innovation.', 'https://images.unsplash.com/photo-1540959733336-eab4de263ee9?w=800', 4, 97),
            ('c4', 'Dubai', 'UAE', 'Middle East', 'Luxury shopping, ultramodern architecture, and desert adventures.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 5, 92),
            ('c5', 'Rome', 'Italy', 'Europe', 'Eternal city of ancient ruins, art, and incredible Italian cuisine.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 3, 94),
            ('c6', 'New York', 'USA', 'North America', 'The city that never sleeps — culture, Broadway, and iconic landmarks.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 5, 99),
            ('c7', 'Amsterdam', 'Netherlands', 'Europe', 'Canals, cycling culture, and world-class museums.', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', 4, 91),
            ('c8', 'Bangkok', 'Thailand', 'Asia', 'Vibrant street life, ornate temples, and amazing street food.', 'https://images.unsplash.com/photo-1563492065-9a65e4770a1a?w=800', 2, 89),
        ]
        cursor.executemany("INSERT INTO cities (id, name, country, region, description, image_url, cost_index, popularity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", cities_data)
        
        # Seed Sample Trip
        cursor.execute("INSERT INTO trips (id, user_id, name, description, start_date, end_date, cover_image_url, status, currency) VALUES ('t1', 'u1', 'Grand European Tour 2026', 'Paris, Amsterdam, and Rome multi-city adventure.', '2026-09-12', '2026-09-20', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', 'PLANNED', 'EUR')")
        
        # Seed Expenses
        expenses_data = [
            ('e1', 't1', 'TRANSPORT', 20000, 'INR', 'Flights & Train Passes', '2026-09-12'),
            ('e2', 't1', 'ACCOMMODATION', 35000, 'INR', 'Hotels & Apartments', '2026-09-12'),
            ('e3', 't1', 'MEALS', 15000, 'INR', 'Food & Restaurants', '2026-09-12'),
            ('e4', 't1', 'ACTIVITIES', 8000, 'INR', 'Museums & Eiffel Tower', '2026-09-12'),
        ]
        cursor.executemany("INSERT INTO expenses (id, trip_id, category, amount, currency, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)", expenses_data)
        
        conn.commit()

init_sqlite_db()

# Session State Initialization
if "user" not in st.session_state:
    st.session_state.user = {"id": "u1", "email": "demo@globetrotter.local", "name": "Demo Traveler", "role": "USER"}

# Sidebar Navigation
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600", use_container_width=True)
    st.title("✈️ GlobeTrotter")
    st.caption("Personalized Travel Planning Platform")
    
    st.divider()

    # User Profile Status
    if st.session_state.user:
        st.markdown(f"**Logged in as:** `{st.session_state.user['name']}`")
        if st.button("Logout", key="btn_logout"):
            st.session_state.user = None
            st.rerun()
    else:
        st.markdown("### 🔑 Quick Demo Login")
        col_demo1, col_demo2 = st.columns(2)
        with col_demo1:
            if st.button("Demo User", use_container_width=True):
                st.session_state.user = {"id": "u1", "email": "demo@globetrotter.local", "name": "Demo Traveler", "role": "USER"}
                st.rerun()
        with col_demo2:
            if st.button("Admin User", use_container_width=True):
                st.session_state.user = {"id": "u2", "email": "admin@globetrotter.local", "name": "Admin User", "role": "ADMIN"}
                st.rerun()

    st.divider()

    # Navigation Options
    page = st.radio(
        "Navigation",
        ["📊 Dashboard", "🗺️ My Trips", "🏙️ Explore Destinations", "🎯 Explore Activities", "💰 Budget & Expenses", "⚡ Admin Analytics"],
        index=0
    )

conn = get_db()

# -------------------------------------------------------------
# PAGE 1: DASHBOARD
# -------------------------------------------------------------
if page == "📊 Dashboard":
    st.title(f"Welcome back, {st.session_state.user['name'] if st.session_state.user else 'Traveler'}! 👋")
    st.caption("Plan multi-city itineraries, discover global destinations, and manage travel budgets.")

    # Metric Cards
    trips_df = pd.read_sql_query("SELECT * FROM trips WHERE user_id = ?", conn, params=(st.session_state.user['id'] if st.session_state.user else 'u1',))
    cities_count = pd.read_sql_query("SELECT COUNT(*) as count FROM cities", conn).iloc[0]['count']
    expenses_total = pd.read_sql_query("SELECT SUM(amount) as sum FROM expenses", conn).iloc[0]['sum'] or 0

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Trips Planned", len(trips_df), "+1 Active Journey")
    with col2:
        st.metric("Explore Cities", cities_count, "Destinations Available")
    with col3:
        st.metric("Total Tracked Expenses", f"₹{expenses_total:,.2f}", "Across Active Trips")

    st.divider()

    st.subheader("🗓️ Upcoming Trips")
    if not trips_df.empty:
        for idx, trip in trips_df.iterrows():
            with st.container():
                c_img, c_info = st.columns([1, 3])
                with c_img:
                    st.image(trip['cover_image_url'] or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800", use_container_width=True)
                with c_info:
                    st.markdown(f"### {trip['name']}")
                    st.markdown(f"**Dates:** `{trip['start_date']}` to `{trip['end_date']}` • **Status:** `{trip['status']}`")
                    st.write(trip['description'])
    else:
        st.info("No upcoming trips found. Click on 'My Trips' to create your first journey!")

    st.divider()
    st.subheader("🌟 Featured Destinations")
    cities_df = pd.read_sql_query("SELECT * FROM cities ORDER BY popularity DESC LIMIT 4", conn)
    c_cols = st.columns(4)
    for i, city in cities_df.iterrows():
        with c_cols[i]:
            st.image(city['image_url'], use_container_width=True)
            st.markdown(f"**{city['name']}, {city['country']}**")
            st.caption(f"Cost Index: {'$' * city['cost_index']} • {city['popularity']}% Popularity")

# -------------------------------------------------------------
# PAGE 2: MY TRIPS
# -------------------------------------------------------------
elif page == "🗺️ My Trips":
    st.title("🗺️ My Multi-City Trips")
    
    with st.expander("➕ Plan New Trip"):
        with st.form("form_new_trip"):
            trip_name = st.text_input("Trip Name *", "Grand European Adventure 2026")
            col_d1, col_d2 = st.columns(2)
            with col_d1:
                start_date = st.date_input("Start Date", datetime.now() + timedelta(days=30))
            with col_d2:
                end_date = st.date_input("End Date", datetime.now() + timedelta(days=40))
            description = st.text_area("Description", "Multi-city journey across top European landmarks.")
            cover_url = st.text_input("Cover Image URL", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800")
            currency = st.selectbox("Primary Currency", ["INR", "USD", "EUR", "GBP", "AED"])
            
            submit_trip = st.form_submit_button("Create Trip")
            if submit_trip:
                new_id = f"t_{int(datetime.now().timestamp())}"
                conn.execute(
                    "INSERT INTO trips (id, user_id, name, description, start_date, end_date, cover_image_url, status, currency) VALUES (?, ?, ?, ?, ?, ?, ?, 'PLANNED', ?)",
                    (new_id, st.session_state.user['id'] if st.session_state.user else 'u1', trip_name, description, str(start_date), str(end_date), cover_url, currency)
                )
                conn.commit()
                st.success(f"Trip '{trip_name}' created successfully!")
                st.rerun()

    trips_df = pd.read_sql_query("SELECT * FROM trips WHERE user_id = ?", conn, params=(st.session_state.user['id'] if st.session_state.user else 'u1',))
    st.markdown(f"### Planned Journeys ({len(trips_df)})")
    
    for idx, trip in trips_df.iterrows():
        with st.card if hasattr(st, 'card') else st.container():
            col_a, col_b = st.columns([1, 4])
            with col_a:
                st.image(trip['cover_image_url'] or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800", use_container_width=True)
            with col_b:
                st.subheader(trip['name'])
                st.caption(f"🗓️ {trip['start_date']} — {trip['end_date']} | Currency: {trip['currency']}")
                st.write(trip['description'])
                st.button(f"Manage Itinerary #{trip['id']}", key=f"btn_it_{trip['id']}")

# -------------------------------------------------------------
# PAGE 3: EXPLORE DESTINATIONS
# -------------------------------------------------------------
elif page == "🏙️ Explore Destinations":
    st.title("🏙️ Explore Destinations")
    st.caption("Browse popular global cities, filter by country & budget level")

    cities_df = pd.read_sql_query("SELECT * FROM cities", conn)
    
    col_f1, col_f2 = st.columns(2)
    with col_f1:
        search_query = st.text_input("🔍 Search City Name", "")
    with col_f2:
        selected_region = st.selectbox("Filter Region", ["All"] + list(cities_df['region'].unique()))

    filtered_df = cities_df.copy()
    if search_query:
        filtered_df = filtered_df[filtered_df['name'].str.contains(search_query, case=False)]
    if selected_region != "All":
        filtered_df = filtered_df[filtered_df['region'] == selected_region]

    grid_cols = st.columns(3)
    for idx, city in filtered_df.reset_index().iterrows():
        with grid_cols[idx % 3]:
            st.image(city['image_url'], use_container_width=True)
            st.markdown(f"### {city['name']}")
            st.markdown(f"**{city['country']}** • `{city['region']}`")
            st.caption(city['description'])
            st.markdown(f"**Cost Index:** {'$' * city['cost_index']} • **Rating:** {city['popularity']}%")
            if st.button(f"➕ Bookmark {city['name']}", key=f"bm_{city['id']}"):
                st.toast(f"Bookmarked {city['name']} to your saved list!")

# -------------------------------------------------------------
# PAGE 4: EXPLORE ACTIVITIES
# -------------------------------------------------------------
elif page == "🎯 Explore Activities":
    st.title("🎯 Activity Explorer")
    st.caption("Discover sightseeing tours, local food experiences, outdoor adventures, and cultural events")

    activities_df = pd.read_sql_query("""
        SELECT a.*, c.name as city_name, c.country as city_country 
        FROM activities a 
        LEFT JOIN cities c ON a.city_id = c.id
    """, conn)

    if activities_df.empty:
        st.info("Default sample activities loaded below:")
        activities_data = [
            {"name": "Eiffel Tower Sunset Tour", "category": "SIGHTSEEING", "estimated_cost": 30.0, "currency": "EUR", "duration_minutes": 120, "city_name": "Paris", "description": "Ascend the iconic iron lattice tower for panoramic city views."},
            {"name": "Louvre Museum Guided Walk", "category": "CULTURE", "estimated_cost": 25.0, "currency": "EUR", "duration_minutes": 180, "city_name": "Paris", "description": "Explore world-famous art including the Mona Lisa."},
            {"name": "Tsukiji Sushi Food Tasting", "category": "FOOD", "estimated_cost": 50.0, "currency": "USD", "duration_minutes": 90, "city_name": "Tokyo", "description": "Sample fresh sashimi and street food with a local chef."},
            {"name": "Colosseum & Forum Ancient Tour", "category": "CULTURE", "estimated_cost": 35.0, "currency": "EUR", "duration_minutes": 150, "city_name": "Rome", "description": "Walk through ancient Roman gladiator ruins."},
        ]
        activities_df = pd.DataFrame(activities_data)

    cat_filter = st.selectbox("Category Filter", ["All Categories", "SIGHTSEEING", "CULTURE", "FOOD", "ADVENTURE", "NIGHTLIFE"])
    if cat_filter != "All Categories":
        activities_df = activities_df[activities_df['category'] == cat_filter]

    st.dataframe(
        activities_df[['name', 'category', 'city_name', 'estimated_cost', 'currency', 'duration_minutes', 'description']],
        use_container_width=True
    )

# -------------------------------------------------------------
# PAGE 5: BUDGET & EXPENSES
# -------------------------------------------------------------
elif page == "💰 Budget & Expenses":
    st.title("💰 Trip Budget & Expenses")
    st.caption("Real-time category breakdown, over-budget warnings, and expenditure charts")

    expenses_df = pd.read_sql_query("SELECT * FROM expenses", conn)

    if not expenses_df.empty:
        col_chart1, col_chart2 = st.columns(2)
        with col_chart1:
            fig_pie = px.pie(expenses_df, values='amount', names='category', title='Expenditure by Category', color_discrete_sequence=px.colors.qualitative.Pastel)
            st.plotly_chart(fig_pie, use_container_width=True)
        with col_chart2:
            fig_bar = px.bar(expenses_df, x='category', y='amount', color='category', title='Expenses Breakdown (INR)')
            st.plotly_chart(fig_bar, use_container_width=True)

        st.markdown("### Expense Records")
        st.dataframe(expenses_df[['category', 'amount', 'currency', 'description', 'date']], use_container_width=True)
    else:
        st.info("No expense records logged yet.")

# -------------------------------------------------------------
# PAGE 6: ADMIN ANALYTICS
# -------------------------------------------------------------
elif page == "⚡ Admin Analytics":
    st.title("⚡ Admin Analytics Dashboard")
    
    u_count = pd.read_sql_query("SELECT COUNT(*) as cnt FROM users", conn).iloc[0]['cnt']
    t_count = pd.read_sql_query("SELECT COUNT(*) as cnt FROM trips", conn).iloc[0]['cnt']
    c_count = pd.read_sql_query("SELECT COUNT(*) as cnt FROM cities", conn).iloc[0]['cnt']

    col_m1, col_m2, col_m3 = st.columns(3)
    with col_m1:
        st.metric("Total Registered Users", u_count)
    with col_m2:
        st.metric("Total Trips Created", t_count)
    with col_m3:
        st.metric("Destinations In Database", c_count)

    st.subheader("Registered Users")
    users_df = pd.read_sql_query("SELECT id, email, name, role, created_at FROM users", conn)
    st.dataframe(users_df, use_container_width=True)
