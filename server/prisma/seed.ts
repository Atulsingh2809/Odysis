import 'dotenv/config';
import { PrismaClient, ActivityCategory, Currency } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const cities = [
  { name: 'Paris', country: 'France', region: 'Europe', description: 'The City of Light, renowned for art, fashion, and cuisine.', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', costIndex: 4, popularity: 98, latitude: 48.8566, longitude: 2.3522 },
  { name: 'London', country: 'United Kingdom', region: 'Europe', description: 'Historic capital with world-class museums and diverse neighborhoods.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', costIndex: 5, popularity: 96, latitude: 51.5074, longitude: -0.1278 },
  { name: 'Tokyo', country: 'Japan', region: 'Asia', description: 'Ultra-modern metropolis blending tradition and innovation.', imageUrl: 'https://images.unsplash.com/photo-1540959733336-eab4de263ee9?w=800', costIndex: 4, popularity: 97, latitude: 35.6762, longitude: 139.6503 },
  { name: 'Dubai', country: 'UAE', region: 'Middle East', description: 'Luxury shopping, ultramodern architecture, and desert adventures.', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', costIndex: 5, popularity: 92, latitude: 25.2048, longitude: 55.2708 },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', description: 'Garden city with incredible food and futuristic skyline.', imageUrl: 'https://images.unsplash.com/photo-1525628835447-3d059d0a5b4e?w=800', costIndex: 4, popularity: 90, latitude: 1.3521, longitude: 103.8198 },
  { name: 'New York', country: 'USA', region: 'North America', description: 'The city that never sleeps — culture, Broadway, and iconic landmarks.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', costIndex: 5, popularity: 99, latitude: 40.7128, longitude: -74.006 },
  { name: 'Rome', country: 'Italy', region: 'Europe', description: 'Eternal city of ancient ruins, art, and incredible Italian cuisine.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', costIndex: 3, popularity: 94, latitude: 41.9028, longitude: 12.4964 },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', description: 'Gaudi architecture, Mediterranean beaches, and vibrant nightlife.', imageUrl: 'https://images.unsplash.com/photo-1583422409519-3200bfe4e866?w=800', costIndex: 3, popularity: 93, latitude: 41.3874, longitude: 2.1686 },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', description: 'Canals, cycling culture, and world-class museums.', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', costIndex: 4, popularity: 91, latitude: 52.3676, longitude: 4.9041 },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', description: 'Vibrant street life, ornate temples, and amazing street food.', imageUrl: 'https://images.unsplash.com/photo-1563492065-9a65e4770a1a?w=800', costIndex: 2, popularity: 89, latitude: 13.7563, longitude: 100.5018 },
  { name: 'Denpasar', country: 'Indonesia', region: 'Asia', description: 'Gateway to Bali — beaches, temples, and rice terraces.', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', costIndex: 2, popularity: 88, latitude: -8.6705, longitude: 115.2126 },
  { name: 'Mumbai', country: 'India', region: 'Asia', description: 'Bollywood, bustling markets, and Gateway of India.', imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800', costIndex: 2, popularity: 85, latitude: 19.076, longitude: 72.8777 },
  { name: 'Delhi', country: 'India', region: 'Asia', description: 'Capital city with Mughal heritage and diverse culture.', imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', costIndex: 2, popularity: 84, latitude: 28.7041, longitude: 77.1025 },
  { name: 'Jaipur', country: 'India', region: 'Asia', description: 'Pink City with magnificent palaces and forts.', imageUrl: 'https://images.unsplash.com/photo-1599661044168-48f173af0d5b?w=800', costIndex: 2, popularity: 82, latitude: 26.9124, longitude: 75.7873 },
  { name: 'Goa', country: 'India', region: 'Asia', description: 'Tropical beaches, Portuguese heritage, and laid-back vibes.', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', costIndex: 2, popularity: 83, latitude: 15.2993, longitude: 74.124 },
  { name: 'Kolkata', country: 'India', region: 'Asia', description: 'Cultural capital with colonial architecture and literary heritage.', imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800', costIndex: 1, popularity: 75, latitude: 22.5726, longitude: 88.3639 },
  { name: 'Bengaluru', country: 'India', region: 'Asia', description: 'Garden City and tech hub with pleasant climate.', imageUrl: 'https://images.unsplash.com/photo-1596176530734-9f874d118d2c?w=800', costIndex: 2, popularity: 78, latitude: 12.9716, longitude: 77.5946 },
  { name: 'Istanbul', country: 'Turkey', region: 'Europe', description: 'Where East meets West — mosques, bazaars, and Bosphorus views.', imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', costIndex: 2, popularity: 90, latitude: 41.0082, longitude: 28.9784 },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', description: 'Harbour city with Opera House and stunning beaches.', imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e785?w=800', costIndex: 4, popularity: 91, latitude: -33.8688, longitude: 151.2093 },
  { name: 'Cairo', country: 'Egypt', region: 'Africa', description: 'Ancient pyramids, bustling bazaars, and Nile cruises.', imageUrl: 'https://images.unsplash.com/photo-1572252009285-7ef6936328a8?w=800', costIndex: 2, popularity: 86, latitude: 30.0444, longitude: 31.2357 },
  { name: 'Prague', country: 'Czech Republic', region: 'Europe', description: 'Fairytale architecture and affordable European charm.', imageUrl: 'https://images.unsplash.com/photo-1541849543449-793a34a2613a?w=800', costIndex: 2, popularity: 87, latitude: 50.0755, longitude: 14.4378 },
  { name: 'Vienna', country: 'Austria', region: 'Europe', description: 'Imperial palaces, classical music, and coffeehouse culture.', imageUrl: 'https://images.unsplash.com/photo-1516556469107-f870369ee7ca?w=800', costIndex: 3, popularity: 85, latitude: 48.2082, longitude: 16.3738 },
  { name: 'Lisbon', country: 'Portugal', region: 'Europe', description: 'Hilly coastal capital with tram rides and pastel de nata.', imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7aca7288f?w=800', costIndex: 2, popularity: 88, latitude: 38.7223, longitude: -9.1393 },
  { name: 'Seoul', country: 'South Korea', region: 'Asia', description: 'K-pop, palaces, street food, and cutting-edge technology.', imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea151?w=800', costIndex: 3, popularity: 89, latitude: 37.5665, longitude: 126.978 },
  { name: 'Hong Kong', country: 'China', region: 'Asia', description: 'Skyline, dim sum, and vibrant street markets.', imageUrl: 'https://images.unsplash.com/photo-1536599018102-397f792cc6bd?w=800', costIndex: 4, popularity: 90, latitude: 22.3193, longitude: 114.1694 },
  { name: 'Marrakech', country: 'Morocco', region: 'Africa', description: 'Medina souks, riads, and Sahara gateway.', imageUrl: 'https://images.unsplash.com/photo-1489749791425-3719339671cf?w=800', costIndex: 2, popularity: 84, latitude: 31.6295, longitude: -7.9811 },
  { name: 'Cape Town', country: 'South Africa', region: 'Africa', description: 'Table Mountain, wine country, and penguin beaches.', imageUrl: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', costIndex: 2, popularity: 86, latitude: -33.9249, longitude: 18.4241 },
  { name: 'Reykjavik', country: 'Iceland', region: 'Europe', description: 'Northern lights, geysers, and dramatic landscapes.', imageUrl: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=800', costIndex: 5, popularity: 80, latitude: 64.1466, longitude: -21.9426 },
  { name: 'Buenos Aires', country: 'Argentina', region: 'South America', description: 'Tango, steak, and European-style architecture.', imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4d7085a711?w=800', costIndex: 2, popularity: 82, latitude: -34.6037, longitude: -58.3816 },
  { name: 'San Francisco', country: 'USA', region: 'North America', description: 'Golden Gate Bridge, tech innovation, and diverse neighborhoods.', imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800', costIndex: 5, popularity: 88, latitude: 37.7749, longitude: -122.4194 },
  { name: 'Kyoto', country: 'Japan', region: 'Asia', description: 'Ancient temples, geisha districts, and cherry blossoms.', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', costIndex: 3, popularity: 92, latitude: 35.0116, longitude: 135.7681 },
  { name: 'Zurich', country: 'Switzerland', region: 'Europe', description: 'Alpine beauty, pristine lakes, and financial hub.', imageUrl: 'https://images.unsplash.com/photo-1515488764276-beab760683c1?w=800', costIndex: 5, popularity: 83, latitude: 47.3769, longitude: 8.5417 },
];

type ActivityTemplate = {
  name: string;
  description: string;
  category: ActivityCategory;
  estimatedCost: number;
  currency: Currency;
  durationMinutes: number;
  imageUrl: string;
  rating: number;
  popularity: number;
};

const activityTemplates: Record<string, ActivityTemplate[]> = {
  Paris: [
    { name: 'Eiffel Tower Visit', description: 'Ascend the iconic iron lattice tower for panoramic city views.', category: 'SIGHTSEEING', estimatedCost: 30, currency: 'EUR', durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600', rating: 4.8, popularity: 99 },
    { name: 'Louvre Museum', description: 'Explore world-famous art including the Mona Lisa.', category: 'CULTURE', estimatedCost: 22, currency: 'EUR', durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600', rating: 4.7, popularity: 97 },
    { name: 'Seine River Cruise', description: 'Evening cruise along the Seine with city lights.', category: 'RELAXATION', estimatedCost: 18, currency: 'EUR', durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', rating: 4.6, popularity: 90 },
    { name: 'French Cooking Class', description: 'Learn to make classic French dishes with a local chef.', category: 'FOOD', estimatedCost: 85, currency: 'EUR', durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', rating: 4.9, popularity: 85 },
    { name: 'Montmartre Walking Tour', description: 'Explore the artistic hilltop neighborhood and Sacré-Cœur.', category: 'SIGHTSEEING', estimatedCost: 25, currency: 'EUR', durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d894034?w=600', rating: 4.5, popularity: 88 },
  ],
  London: [
    { name: 'Tower of London', description: 'Historic castle and home of the Crown Jewels.', category: 'CULTURE', estimatedCost: 35, currency: 'GBP', durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600', rating: 4.6, popularity: 95 },
    { name: 'British Museum', description: 'Free entry to one of the worlds greatest museums.', category: 'CULTURE', estimatedCost: 0, currency: 'GBP', durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600', rating: 4.8, popularity: 93 },
    { name: 'West End Show', description: 'World-class theatre performance in the West End.', category: 'NIGHTLIFE', estimatedCost: 75, currency: 'GBP', durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600', rating: 4.7, popularity: 88 },
    { name: 'Afternoon Tea at The Ritz', description: 'Classic British afternoon tea experience.', category: 'FOOD', estimatedCost: 70, currency: 'GBP', durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', rating: 4.5, popularity: 82 },
  ],
  Tokyo: [
    { name: 'Senso-ji Temple', description: 'Tokyos oldest temple in the Asakusa district.', category: 'CULTURE', estimatedCost: 0, currency: 'JPY', durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1540959733336-eab4de263ee9?w=600', rating: 4.7, popularity: 96 },
    { name: 'Tsukiji Outer Market Food Tour', description: 'Sample fresh sushi and street food at the famous market.', category: 'FOOD', estimatedCost: 5000, currency: 'JPY', durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600', rating: 4.8, popularity: 94 },
    { name: 'TeamLab Borderless', description: 'Immersive digital art museum experience.', category: 'CULTURE', estimatedCost: 3800, currency: 'JPY', durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600', rating: 4.9, popularity: 92 },
    { name: 'Shibuya Crossing Experience', description: 'Walk the worlds busiest pedestrian crossing.', category: 'SIGHTSEEING', estimatedCost: 0, currency: 'JPY', durationMinutes: 30, imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600', rating: 4.4, popularity: 98 },
  ],
  'New York': [
    { name: 'Statue of Liberty Tour', description: 'Ferry to Liberty Island and Ellis Island.', category: 'SIGHTSEEING', estimatedCost: 25, currency: 'USD', durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=600', rating: 4.6, popularity: 97 },
    { name: 'Central Park Bike Ride', description: 'Cycle through the iconic urban park.', category: 'NATURE', estimatedCost: 30, currency: 'USD', durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600', rating: 4.5, popularity: 90 },
    { name: 'Broadway Musical', description: 'Catch a world-famous Broadway show.', category: 'NIGHTLIFE', estimatedCost: 120, currency: 'USD', durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=600', rating: 4.8, popularity: 95 },
    { name: 'Metropolitan Museum of Art', description: 'Explore one of the worlds largest art museums.', category: 'CULTURE', estimatedCost: 30, currency: 'USD', durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600', rating: 4.7, popularity: 92 },
  ],
  Rome: [
    { name: 'Colosseum Tour', description: 'Guided tour of the ancient Roman amphitheater.', category: 'CULTURE', estimatedCost: 24, currency: 'EUR', durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', rating: 4.8, popularity: 98 },
    { name: 'Vatican Museums', description: 'Sistine Chapel and vast art collections.', category: 'CULTURE', estimatedCost: 28, currency: 'EUR', durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1529260830197-3e28146a2211?w=600', rating: 4.7, popularity: 96 },
    { name: 'Trastevere Food Walk', description: 'Evening food tour through Romes charming neighborhood.', category: 'FOOD', estimatedCost: 65, currency: 'EUR', durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', rating: 4.9, popularity: 88 },
  ],
  Mumbai: [
    { name: 'Gateway of India', description: 'Iconic arch monument overlooking the Arabian Sea.', category: 'SIGHTSEEING', estimatedCost: 0, currency: 'INR', durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600', rating: 4.5, popularity: 92 },
    { name: 'Dharavi Slum Tour', description: 'Educational tour of one of Asias largest slums.', category: 'CULTURE', estimatedCost: 1500, currency: 'INR', durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600', rating: 4.3, popularity: 75 },
    { name: 'Street Food Tour', description: 'Sample vada pav, pani puri, and Mumbai classics.', category: 'FOOD', estimatedCost: 800, currency: 'INR', durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600', rating: 4.8, popularity: 90 },
    { name: 'Elephanta Caves', description: 'Ancient cave temples on Elephanta Island.', category: 'CULTURE', estimatedCost: 500, currency: 'INR', durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600', rating: 4.4, popularity: 80 },
  ],
  Dubai: [
    { name: 'Burj Khalifa At The Top', description: 'Views from the worlds tallest building.', category: 'SIGHTSEEING', estimatedCost: 150, currency: 'AED', durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', rating: 4.7, popularity: 98 },
    { name: 'Desert Safari', description: 'Dune bashing, camel rides, and Bedouin camp dinner.', category: 'ADVENTURE', estimatedCost: 250, currency: 'AED', durationMinutes: 360, imageUrl: 'https://images.unsplash.com/photo-1451337516015-6b5e8120f021?w=600', rating: 4.8, popularity: 95 },
    { name: 'Dubai Mall & Fountain Show', description: 'Shopping and the spectacular fountain display.', category: 'SHOPPING', estimatedCost: 0, currency: 'AED', durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830d5f3b09?w=600', rating: 4.5, popularity: 92 },
  ],
  Bangkok: [
    { name: 'Grand Palace', description: 'Stunning royal palace complex and Wat Phra Kaew.', category: 'CULTURE', estimatedCost: 500, currency: 'USD', durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1563492065-9a65e4770a1a?w=600', rating: 4.6, popularity: 96 },
    { name: 'Floating Market Tour', description: 'Boat tour through colorful floating markets.', category: 'CULTURE', estimatedCost: 800, currency: 'USD', durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1552465011-b0e668d96b08?w=600', rating: 4.4, popularity: 85 },
    { name: 'Thai Massage & Spa', description: 'Traditional Thai massage experience.', category: 'RELAXATION', estimatedCost: 600, currency: 'USD', durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600', rating: 4.7, popularity: 88 },
  ],
};

const defaultActivities: ActivityTemplate[] = [
  { name: 'City Walking Tour', description: 'Guided walking tour of the city highlights.', category: 'SIGHTSEEING', estimatedCost: 25, currency: 'USD', durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600', rating: 4.3, popularity: 70 },
  { name: 'Local Food Experience', description: 'Taste authentic local cuisine at popular spots.', category: 'FOOD', estimatedCost: 40, currency: 'USD', durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', rating: 4.5, popularity: 75 },
  { name: 'Museum Visit', description: 'Explore the citys premier museum.', category: 'CULTURE', estimatedCost: 15, currency: 'USD', durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600', rating: 4.2, popularity: 65 },
  { name: 'Sunset Viewpoint', description: 'Visit the best spot for sunset views.', category: 'NATURE', estimatedCost: 0, currency: 'USD', durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600', rating: 4.6, popularity: 80 },
];

async function main() {
  console.log('Seeding database...');

  await prisma.stopActivity.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.tripCollaborator.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.savedDestination.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const demoPasswordHash = await argon2.hash('Demo@12345');
  const adminPasswordHash = await argon2.hash('Admin@12345');

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@globetrotter.local',
      name: 'Demo Traveler',
      passwordHash: demoPasswordHash,
      profile: { create: { currency: 'INR', language: 'en' } },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@globetrotter.local',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      profile: { create: { currency: 'USD', language: 'en' } },
    },
  });

  const cityMap: Record<string, string> = {};
  for (const city of cities) {
    const created = await prisma.city.create({ data: city });
    cityMap[city.name] = created.id;

    const templates = activityTemplates[city.name] ?? defaultActivities;
    for (const tmpl of templates) {
      await prisma.activity.create({
        data: { ...tmpl, cityId: created.id },
      });
    }
  }

  const parisId = cityMap['Paris'];
  const romeId = cityMap['Rome'];
  const amsterdamId = cityMap['Amsterdam'];

  const europeTrip = await prisma.trip.create({
    data: {
      userId: demoUser.id,
      name: 'Europe Adventure 2026',
      description: 'A grand tour through Europes most beautiful cities.',
      startDate: new Date('2026-09-12'),
      endDate: new Date('2026-09-20'),
      coverImageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      status: 'PLANNED',
      currency: 'EUR',
      budget: { create: { totalAmount: 100000, currency: 'INR' } },
    },
  });

  await prisma.tripCollaborator.create({
    data: { tripId: europeTrip.id, userId: demoUser.id, role: 'OWNER' },
  });

  const stop1 = await prisma.tripStop.create({
    data: { tripId: europeTrip.id, cityId: parisId, orderIndex: 0, arrivalDate: new Date('2026-09-12'), departureDate: new Date('2026-09-14') },
  });
  const stop2 = await prisma.tripStop.create({
    data: { tripId: europeTrip.id, cityId: amsterdamId, orderIndex: 1, arrivalDate: new Date('2026-09-15'), departureDate: new Date('2026-09-17') },
  });
  const stop3 = await prisma.tripStop.create({
    data: { tripId: europeTrip.id, cityId: romeId, orderIndex: 2, arrivalDate: new Date('2026-09-18'), departureDate: new Date('2026-09-20') },
  });

  const parisActivities = await prisma.activity.findMany({ where: { cityId: parisId }, take: 3 });
  for (let i = 0; i < parisActivities.length; i++) {
    await prisma.stopActivity.create({
      data: {
        stopId: stop1.id,
        activityId: parisActivities[i].id,
        orderIndex: i,
        scheduledTime: ['09:00', '13:00', '16:00'][i],
        scheduledDate: new Date('2026-09-12'),
      },
    });
  }

  await prisma.expense.createMany({
    data: [
      { tripId: europeTrip.id, category: 'TRANSPORT', amount: 20000, currency: 'INR', description: 'Flights', date: new Date('2026-09-12') },
      { tripId: europeTrip.id, category: 'ACCOMMODATION', amount: 35000, currency: 'INR', description: 'Hotels', date: new Date('2026-09-12') },
      { tripId: europeTrip.id, category: 'MEALS', amount: 15000, currency: 'INR', description: 'Food budget', date: new Date('2026-09-12') },
      { tripId: europeTrip.id, category: 'OTHER', amount: 3000, currency: 'INR', description: 'Miscellaneous', date: new Date('2026-09-12') },
    ],
  });

  await prisma.savedDestination.create({
    data: { userId: demoUser.id, cityId: cityMap['Tokyo'] },
  });
  await prisma.savedDestination.create({
    data: { userId: demoUser.id, cityId: cityMap['Bali'] ?? cityMap['Denpasar'] },
  });

  console.log('Seed complete!');
  console.log('Demo user: demo@globetrotter.local / Demo@12345');
  console.log('Admin user: admin@globetrotter.local / Admin@12345');
  console.log(`Created ${cities.length} cities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
