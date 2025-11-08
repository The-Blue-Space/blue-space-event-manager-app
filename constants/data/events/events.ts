import { Event } from "@/types/event.types";
import { eventCategories } from "./event-category";
import { eventShotQuotas } from "./event-shot-quota";
import { manager_profiles } from "../manager-profile";

// Realistic event images from Unsplash
const eventImages = {
	musicFestival: [
		"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800", // Stage lights
		"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", // Concert crowd
		"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800", // Music festival - cover
	],
	techConference: [
		"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800", // Tech conference - cover
		"https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800", // Modern venue
		"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800", // Networking
	],
	artExhibition: [
		"https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800", // Art gallery - cover
		"https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800", // Art space
		"https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?w=800", // Exhibition
	],
	corporateGala: [
		"https://images.unsplash.com/photo-1511578314322-379afb476865?w=800", // Gala dinner - cover
		"https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800", // Elegant venue
		"https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800", // Event setup
	],
	fashionShow: [
		"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800", // Fashion runway - cover
		"https://images.unsplash.com/photo-1558769132-cb1aea41f877?w=800", // Fashion event
		"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800", // Model walk
	],
	productLaunch: [
		"https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800", // Product launch - cover
		"https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800", // Tech product
		"https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800", // Launch event
	],
};

export const events: Event[] = [
	// Event 1: Summer Music Festival (Upcoming)
	{
		id: "evt_001",
		title: "Summer Beats Music Festival 2025",
		description:
			"Join us for the biggest music festival of the summer! Featuring top artists from around the world, multiple stages, food trucks, and an unforgettable experience under the stars. Three days of non-stop music across multiple genres including pop, rock, electronic, and hip-hop.",
		location_id: "loc_001",
		venue_name: "Griffith Park Amphitheater",
		address: "4730 Crystal Springs Dr",
		city: "Los Angeles",
		state: "California",
		country: "United States",
		postal_code: "90027",
		google_map_url: "https://www.google.com/maps?q=Griffith+Park,+Los+Angeles",
		longitude: "-118.2967",
		latitude: "34.1365",
		event_category_id: eventCategories[0].id, // Music
		tags: "music, festival, summer, outdoor, live music, concerts",
		event_start_date: "2025-07-15T00:00:00.000Z",
		event_end_date: "2025-07-17T00:00:00.000Z",
		event_start_time: "14:00",
		event_end_time: "23:59",
		event_ticket_id: null,
		is_private: false,
		access_type: "ticket-based",
		access_code: null,
		qr_code: "QR_SUMMER_BEATS_2025",
		enable_downloads: true,
		allow_individual_upload: true,
		allow_professional_upload: true,
		published: true,
		is_duplicated: false,
		event_plan_id: "plan_premium",
		event_shot_quota_id: eventShotQuotas[0]?.id,
		created_by_id: manager_profiles[0].id,
		previous_event_id: null,
		max_participants: 25000,
		first_accessed_at: "2025-01-10T08:00:00.000Z",
		total_accessed_count: 15420,
		last_accessed_at: new Date().toISOString(),
		deleted_at: null,
		created_at: "2024-11-01T10:00:00.000Z",
		updated_at: new Date().toISOString(),
		created_by: manager_profiles[0],
		// Metrics
		ticket_sold: 18500,
		total_uploads: 42300,
		total_participants: 18500,
		total_revenue: 925000, // $925,000
		total_refunds: 12500, // $12,500
		published_at: "2024-11-05T10:00:00.000Z",
		// Overview and Good to Know
		overview:
			"<p><strong>Welcome to Summer Beats Music Festival 2025!</strong></p><p><strong>Date:</strong> Tuesday, July 15, 2025 at 2:00 PM</p><p><strong>Location:</strong> Griffith Park Amphitheater, Los Angeles, California</p><p>Join us for the biggest music festival of the summer! Featuring top artists from around the world, multiple stages, food trucks, and an unforgettable experience under the stars. Three days of non-stop music across multiple genres including pop, rock, electronic, and hip-hop.</p><p>Get ready for three days of non-stop entertainment featuring headlining acts, emerging artists, and everything in between. Bring your friends, make new ones, and create unforgettable memories under the summer sky!</p>",
		doors_open_at: "13:00", // 1 hour before event start (14:00)
		age_restriction: "18+",
		parking_type: "free-parking",
		faq: JSON.stringify([
			{
				question: "Is food available at the venue?",
				answer:
					"Yes! We have various food trucks and vendors offering a wide selection of cuisines throughout the festival.",
			},
			{
				question: "Can I bring my own food?",
				answer:
					"Outside food and beverages are not permitted. Water bottles (sealed/empty) are allowed.",
			},
			{
				question: "What items are prohibited?",
				answer:
					"Weapons, illegal substances, professional cameras, drones, and outside alcohol are strictly prohibited.",
			},
		]),
		event_media: [
			// Cover image
			{
				id: "media_001_1",
				event_id: "evt_001",
				url: eventImages.musicFestival[0],
				file_name: "summer-beats-cover.jpg",
				file_size: 2457600,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/cover",
				media_type: "cover",
				order: 0,
				is_active: true,
				created_at: "2024-11-01T10:05:00.000Z",
				updated_at: "2024-11-01T10:05:00.000Z",
			},
			// Active images (5 total)
			{
				id: "media_001_2",
				event_id: "evt_001",
				url: eventImages.musicFestival[1],
				file_name: "summer-beats-crowd.jpg",
				file_size: 1843200,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-1",
				media_type: "image",
				order: 1,
				is_active: true,
				created_at: "2024-11-01T10:06:00.000Z",
				updated_at: "2024-11-01T10:06:00.000Z",
			},
			{
				id: "media_001_3",
				event_id: "evt_001",
				url: eventImages.musicFestival[2],
				file_name: "summer-beats-stage.jpg",
				file_size: 2150400,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-2",
				media_type: "image",
				order: 2,
				is_active: true,
				created_at: "2024-11-01T10:07:00.000Z",
				updated_at: "2024-11-01T10:07:00.000Z",
			},
			{
				id: "media_001_4",
				event_id: "evt_001",
				url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
				file_name: "live-performance.jpg",
				file_size: 1920000,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-3",
				media_type: "image",
				order: 3,
				is_active: true,
				created_at: "2024-11-01T10:08:00.000Z",
				updated_at: "2024-11-01T10:08:00.000Z",
			},
			{
				id: "media_001_5",
				event_id: "evt_001",
				url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
				file_name: "sunset-concert.jpg",
				file_size: 2100000,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-4",
				media_type: "image",
				order: 4,
				is_active: true,
				created_at: "2024-11-01T10:09:00.000Z",
				updated_at: "2024-11-01T10:09:00.000Z",
			},
			{
				id: "media_001_6",
				event_id: "evt_001",
				url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
				file_name: "dj-lights.jpg",
				file_size: 1750000,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-5",
				media_type: "image",
				order: 5,
				is_active: true,
				created_at: "2024-11-01T10:10:00.000Z",
				updated_at: "2024-11-01T10:10:00.000Z",
			},
			// Inactive images (3 total)
			{
				id: "media_001_7",
				event_id: "evt_001",
				url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
				file_name: "festival-preparations.jpg",
				file_size: 1650000,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-6",
				media_type: "image",
				order: 6,
				is_active: false,
				created_at: "2024-11-01T10:11:00.000Z",
				updated_at: "2024-11-01T10:11:00.000Z",
			},
			{
				id: "media_001_8",
				event_id: "evt_001",
				url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
				file_name: "backstage-area.jpg",
				file_size: 1820000,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-7",
				media_type: "image",
				order: 7,
				is_active: false,
				created_at: "2024-11-01T10:12:00.000Z",
				updated_at: "2024-11-01T10:12:00.000Z",
			},
			{
				id: "media_001_9",
				event_id: "evt_001",
				url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
				file_name: "food-vendors.jpg",
				file_size: 1570000,
				mime_type: "image/jpeg",
				public_id: "events/summer-beats-2025/gallery-8",
				media_type: "image",
				order: 8,
				is_active: false,
				created_at: "2024-11-01T10:13:00.000Z",
				updated_at: "2024-11-01T10:13:00.000Z",
			},
			// Video (1 total)
			{
				id: "media_001_10",
				event_id: "evt_001",
				url: "https://file-examples.com/storage/fef0d158b368fe91e969abf/2017/04/file_example_MP4_1280_10MG.mp4",
				file_name: "festival-highlights.mp4",
				file_size: 15728640, // 15 MB
				mime_type: "video/mp4",
				public_id: "events/summer-beats-2025/video-1",
				media_type: "video",
				order: 9,
				is_active: true,
				created_at: "2024-11-01T10:14:00.000Z",
				updated_at: "2024-11-01T10:14:00.000Z",
			},
		],
		event_category: eventCategories[0],
		event_shot_quota: eventShotQuotas[0],
	},

	// Event 2: Tech Innovation Conference (Active - happening now)
	{
		id: "evt_002",
		title: "TechForward Summit 2025",
		description:
			"The premier technology conference bringing together industry leaders, innovators, and visionaries. Featuring keynote speeches, panel discussions, networking sessions, and workshops on AI, blockchain, cloud computing, and the future of technology. Connect with 5,000+ tech professionals.",
		location_id: "loc_002",
		venue_name: "Moscone Center",
		address: "747 Howard St",
		city: "San Francisco",
		state: "California",
		country: "United States",
		postal_code: "94103",
		google_map_url: "https://www.google.com/maps?q=Moscone+Center,+San+Francisco",
		longitude: "-122.4007",
		latitude: "37.7839",
		event_category_id: eventCategories[4].id, // Technology
		tags: "technology, conference, innovation, AI, blockchain, networking, business",
		event_start_date: new Date(Date.now() - 86400000).toISOString(), // Started yesterday
		event_end_date: new Date(Date.now() + 86400000).toISOString(), // Ends tomorrow
		event_start_time: "08:00",
		event_end_time: "18:00",
		event_ticket_id: null,
		is_private: false,
		access_type: "ticket-based",
		access_code: null,
		qr_code: "QR_TECHFORWARD_2025",
		enable_downloads: true,
		allow_individual_upload: false,
		allow_professional_upload: true,
		published: true,
		is_duplicated: false,
		event_plan_id: "plan_enterprise",
		event_shot_quota_id: eventShotQuotas[1]?.id,
		created_by_id: manager_profiles[0].id,
		previous_event_id: null,
		max_participants: 5000,
		first_accessed_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
		total_accessed_count: 8934,
		last_accessed_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
		deleted_at: null,
		created_at: "2024-09-15T09:00:00.000Z",
		updated_at: new Date().toISOString(),
		created_by: manager_profiles[0],
		// Metrics
		ticket_sold: 4250,
		total_uploads: 15680,
		total_participants: 4250,
		total_revenue: 637500, // $637,500
		total_refunds: 8750, // $8,750
		published_at: "2024-09-20T09:00:00.000Z",
		// Overview and Good to Know
		overview:
			"<p><strong>Welcome to TechForward Summit 2025!</strong></p><p><strong>Date:</strong> Currently Active</p><p><strong>Location:</strong> Moscone Center, San Francisco, California</p><p>The premier technology conference bringing together industry leaders, innovators, and visionaries. Featuring keynote speeches, panel discussions, networking sessions, and workshops on AI, blockchain, cloud computing, and the future of technology. Connect with 5,000+ tech professionals.</p><p>Join us for an exciting day filled with engaging talks, interactive workshops, and networking opportunities with top tech professionals. Whether you're a seasoned developer or just starting in the tech industry, this event is perfect for anyone looking to stay ahead of the curve!</p>",
		doors_open_at: "07:00", // 1 hour before event start (08:00)
		age_restriction: "18+",
		parking_type: "paid-parking",
		faq: JSON.stringify([
			{
				question: "Is WiFi available?",
				answer: "Yes, free high-speed WiFi is available throughout the venue for all attendees.",
			},
			{
				question: "Will sessions be recorded?",
				answer:
					"Yes, all keynote sessions will be recorded and made available to attendees after the event.",
			},
		]),
		event_media: [
			{
				id: "media_002_1",
				event_id: "evt_002",
				url: eventImages.techConference[0],
				file_name: "techforward-cover.jpg",
				file_size: 2100000,
				mime_type: "image/jpeg",
				public_id: "events/techforward-2025/cover",
				media_type: "cover",
				order: 1,
				is_active: true,
				created_at: "2024-09-15T09:05:00.000Z",
				updated_at: "2024-09-15T09:05:00.000Z",
			},
			{
				id: "media_002_2",
				event_id: "evt_002",
				url: eventImages.techConference[1],
				file_name: "techforward-venue.jpg",
				file_size: 1950000,
				mime_type: "image/jpeg",
				public_id: "events/techforward-2025/gallery-1",
				media_type: "image",
				order: 2,
				is_active: true,
				created_at: "2024-09-15T09:06:00.000Z",
				updated_at: "2024-09-15T09:06:00.000Z",
			},
		],
		event_category: eventCategories[4],
		event_shot_quota: eventShotQuotas[1],
	},

	// Event 3: Contemporary Art Exhibition (Past)
	{
		id: "evt_003",
		title: "Visions of Tomorrow: Modern Art Exhibition",
		description:
			"An exclusive showcase of contemporary art featuring works from emerging and established artists. Explore thought-provoking pieces across painting, sculpture, digital art, and mixed media. Includes artist talks, guided tours, and a networking reception with collectors and curators.",
		location_id: "loc_003",
		venue_name: "Chelsea Art Gallery",
		address: "529 W 20th St",
		city: "New York",
		state: "New York",
		country: "United States",
		postal_code: "10011",
		google_map_url: "https://www.google.com/maps?q=Chelsea+Art+Gallery,+New+York",
		longitude: "-74.0066",
		latitude: "40.7456",
		event_category_id: eventCategories[1].id, // Art
		tags: "art, exhibition, gallery, contemporary art, modern art, culture",
		event_start_date: "2024-12-01T00:00:00.000Z",
		event_end_date: "2024-12-15T00:00:00.000Z",
		event_start_time: "10:00",
		event_end_time: "20:00",
		event_ticket_id: null,
		is_private: false,
		access_type: "ticket-based",
		access_code: null,
		qr_code: "QR_VISIONS_TOMORROW_2024",
		enable_downloads: true,
		allow_individual_upload: true,
		allow_professional_upload: true,
		published: false,
		is_duplicated: false,
		event_plan_id: "plan_standard",
		event_shot_quota_id: eventShotQuotas[0]?.id,
		created_by_id: manager_profiles[0].id,
		previous_event_id: null,
		max_participants: 1500,
		first_accessed_at: "2024-11-20T09:00:00.000Z",
		total_accessed_count: 2847,
		last_accessed_at: "2024-12-15T20:00:00.000Z",
		deleted_at: null,
		created_at: "2024-10-01T11:00:00.000Z",
		updated_at: "2024-12-15T20:05:00.000Z",
		created_by: manager_profiles[0],
		// Metrics (Past event, unpublished - had some sales before being unpublished)
		ticket_sold: 890,
		total_uploads: 3420,
		total_participants: 890,
		total_revenue: 44500, // $44,500
		total_refunds: 2250, // $2,250
		published_at: null, // Never published or unpublished later
		// Overview and Good to Know
		overview:
			"<p><strong>Welcome to Downtown Art Gallery Exhibition!</strong></p><p><strong>Date:</strong> March 10, 2025</p><p><strong>Location:</strong> New York Contemporary Art Gallery, New York, New York</p><p>Experience contemporary art from emerging local artists. This exhibition features paintings, sculptures, digital art, and interactive installations. Free entry, all ages welcome. Perfect for art enthusiasts and casual visitors alike.</p><p>Join us for a celebration of creativity and artistic expression. Explore diverse styles and mediums while mingling with fellow art lovers and the artists themselves!</p>",
		doors_open_at: "09:00", // 1 hour before event start (10:00)
		age_restriction: "18+",
		parking_type: "no-parking",
		faq: JSON.stringify([
			{
				question: "Is photography allowed?",
				answer:
					"Yes, personal photography is allowed. Flash photography and tripods are not permitted.",
			},
			{
				question: "Are the artworks for sale?",
				answer:
					"Yes, many pieces are available for purchase. Please inquire at the front desk for details.",
			},
		]),
		event_media: [
			{
				id: "media_003_1",
				event_id: "evt_003",
				url: eventImages.artExhibition[0],
				file_name: "visions-cover.jpg",
				file_size: 1800000,
				mime_type: "image/jpeg",
				public_id: "events/visions-tomorrow/cover",
				media_type: "cover",
				order: 1,
				is_active: true,
				created_at: "2024-10-01T11:05:00.000Z",
				updated_at: "2024-10-01T11:05:00.000Z",
			},
			{
				id: "media_003_2",
				event_id: "evt_003",
				url: eventImages.artExhibition[1],
				file_name: "visions-gallery.jpg",
				file_size: 2200000,
				mime_type: "image/jpeg",
				public_id: "events/visions-tomorrow/gallery-1",
				media_type: "image",
				order: 2,
				is_active: true,
				created_at: "2024-10-01T11:06:00.000Z",
				updated_at: "2024-10-01T11:06:00.000Z",
			},
		],
		event_category: eventCategories[1],
		event_shot_quota: eventShotQuotas[0],
	},

	// Event 4: Annual Corporate Gala (Upcoming)
	{
		id: "evt_004",
		title: "Excellence Awards Gala 2025",
		description:
			"An elegant evening celebrating outstanding achievements in business and community service. Black-tie event featuring a gourmet dinner, awards ceremony, live entertainment, silent auction, and dancing. Honoring leaders who have made significant contributions to industry and society.",
		location_id: "loc_004",
		venue_name: "The Drake Hotel Grand Ballroom",
		address: "140 E Walton Pl",
		city: "Chicago",
		state: "Illinois",
		country: "United States",
		postal_code: "60611",
		google_map_url: "https://www.google.com/maps?q=The+Drake+Hotel,+Chicago",
		longitude: "-87.6254",
		latitude: "41.8995",
		event_category_id: eventCategories[4].id, // Technology (closest to corporate)
		tags: "gala, corporate, awards, formal, networking, charity, business",
		event_start_date: "2025-03-22T00:00:00.000Z",
		event_end_date: "2025-03-22T00:00:00.000Z",
		event_start_time: "18:00",
		event_end_time: "23:00",
		event_ticket_id: null,
		is_private: true,
		access_type: "individual",
		access_code: "EXCELLENCE2025",
		qr_code: "QR_EXCELLENCE_GALA_2025",
		enable_downloads: true,
		allow_individual_upload: false,
		allow_professional_upload: true,
		published: true,
		is_duplicated: false,
		event_plan_id: "plan_premium",
		event_shot_quota_id: eventShotQuotas[1]?.id,
		created_by_id: manager_profiles[0].id,
		previous_event_id: null,
		max_participants: 500,
		first_accessed_at: "2025-01-15T10:00:00.000Z",
		total_accessed_count: 892,
		last_accessed_at: new Date().toISOString(),
		deleted_at: null,
		created_at: "2024-12-01T08:00:00.000Z",
		updated_at: new Date().toISOString(),
		created_by: manager_profiles[0],
		// Metrics (Individual access - no tickets)
		ticket_sold: null,
		total_uploads: 2150,
		total_participants: 425,
		total_revenue: null,
		total_refunds: null,
		published_at: "2024-12-05T08:00:00.000Z",
		// Overview and Good to Know
		overview:
			"<p><strong>Welcome to Winter Wonderland Holiday Market!</strong></p><p><strong>Date:</strong> December 20, 2024 at 10:00 AM</p><p><strong>Location:</strong> Chicago Holiday Village, Chicago, Illinois</p><p>Experience the magic of the season! Browse local artisan crafts, holiday decorations, seasonal treats, warm beverages, and enjoy live carolers. Meet Santa, enjoy hot cocoa, and find unique gifts for everyone on your list. Family-friendly event with activities for children.</p><p>Bring your family and friends to celebrate the holiday spirit in style. This is the perfect place to find one-of-a-kind gifts while enjoying festive entertainment!</p>",
		doors_open_at: "09:30", // 30 minutes before event start (10:00)
		age_restriction: "18+",
		parking_type: "paid-parking",
		faq: JSON.stringify([
			{
				question: "Will Santa be there?",
				answer:
					"Yes! Santa will be available for photos from 11 AM to 3 PM daily. Free photos with your own camera.",
			},
			{
				question: "Is the market pet-friendly?",
				answer:
					"Service animals are welcome. Pets are not allowed due to crowding and safety concerns.",
			},
		]),
		event_media: [
			{
				id: "media_004_1",
				event_id: "evt_004",
				url: eventImages.corporateGala[0],
				file_name: "excellence-gala-cover.jpg",
				file_size: 2300000,
				mime_type: "image/jpeg",
				public_id: "events/excellence-gala-2025/cover",
				media_type: "cover",
				order: 1,
				is_active: true,
				created_at: "2024-12-01T08:05:00.000Z",
				updated_at: "2024-12-01T08:05:00.000Z",
			},
			{
				id: "media_004_2",
				event_id: "evt_004",
				url: eventImages.corporateGala[1],
				file_name: "excellence-venue.jpg",
				file_size: 1900000,
				mime_type: "image/jpeg",
				public_id: "events/excellence-gala-2025/gallery-1",
				media_type: "image",
				order: 2,
				is_active: true,
				created_at: "2024-12-01T08:06:00.000Z",
				updated_at: "2024-12-01T08:06:00.000Z",
			},
		],
		event_category: eventCategories[4],
		event_shot_quota: eventShotQuotas[1],
	},

	// Event 5: Fashion Week Showcase (Upcoming)
	{
		id: "evt_005",
		title: "Spring Fashion Week 2025",
		description:
			"Experience the latest trends from top designers and emerging talents at our exclusive fashion showcase. Featuring runway shows, designer presentations, pop-up shops, and networking opportunities with fashion industry professionals. Witness the future of fashion as models strut the latest collections.",
		location_id: "loc_005",
		venue_name: "Ice Palace Film Studios",
		address: "59 NW 14th St",
		city: "Miami",
		state: "Florida",
		country: "United States",
		postal_code: "33136",
		google_map_url: "https://www.google.com/maps?q=Ice+Palace+Studios,+Miami",
		longitude: "-80.1976",
		latitude: "25.7886",
		event_category_id: eventCategories[3].id, // Fashion
		tags: "fashion, runway, designer, models, style, trends, showcase",
		event_start_date: "2025-04-10T00:00:00.000Z",
		event_end_date: "2025-04-14T00:00:00.000Z",
		event_start_time: "15:00",
		event_end_time: "22:00",
		event_ticket_id: null,
		is_private: false,
		access_type: "ticket-based",
		access_code: null,
		qr_code: "QR_FASHION_WEEK_2025",
		enable_downloads: true,
		allow_individual_upload: true,
		allow_professional_upload: true,
		published: true,
		is_duplicated: false,
		event_plan_id: "plan_premium",
		event_shot_quota_id: eventShotQuotas[0]?.id,
		created_by_id: manager_profiles[0].id,
		previous_event_id: null,
		max_participants: 3000,
		first_accessed_at: "2025-01-20T12:00:00.000Z",
		total_accessed_count: 4521,
		last_accessed_at: new Date().toISOString(),
		deleted_at: null,
		created_at: "2024-11-15T14:00:00.000Z",
		updated_at: new Date().toISOString(),
		created_by: manager_profiles[0],
		// Metrics
		ticket_sold: 2340,
		total_uploads: 8920,
		total_participants: 2340,
		total_revenue: 351000, // $351,000
		total_refunds: 4500, // $4,500
		published_at: "2024-11-20T14:00:00.000Z",
		// Overview and Good to Know
		overview:
			"<p><strong>Welcome to Yoga & Wellness Workshop!</strong></p><p><strong>Date:</strong> February 8, 2025 at 7:00 AM</p><p><strong>Location:</strong> Serenity Yoga Studio, Miami, Florida</p><p>Start your day with mindfulness, meditation, and rejuvenating yoga flows. Suitable for all skill levels. Includes guided meditation, breathing exercises, and a light healthy breakfast. Bring your own mat or rent one onsite. Limited spots available for an intimate experience.</p><p>Join us for a morning of peace, movement, and wellness. Perfect for beginners and experienced practitioners alike!</p>",
		doors_open_at: "06:45", // 15 minutes before event start (07:00)
		age_restriction: "18+",
		parking_type: "free-parking",
		faq: JSON.stringify([
			{
				question: "Do I need to bring my own mat?",
				answer:
					"You can bring your own mat or rent one from us for $5. Rental mats are sanitized after each use.",
			},
			{
				question: "What should I wear?",
				answer:
					"Wear comfortable, stretchy clothing. We recommend layers as the studio temperature may vary.",
			},
		]),
		event_media: [
			{
				id: "media_005_1",
				event_id: "evt_005",
				url: eventImages.fashionShow[0],
				file_name: "fashion-week-cover.jpg",
				file_size: 2600000,
				mime_type: "image/jpeg",
				public_id: "events/fashion-week-2025/cover",
				media_type: "cover",
				order: 1,
				is_active: true,
				created_at: "2024-11-15T14:05:00.000Z",
				updated_at: "2024-11-15T14:05:00.000Z",
			},
			{
				id: "media_005_2",
				event_id: "evt_005",
				url: eventImages.fashionShow[1],
				file_name: "fashion-week-runway.jpg",
				file_size: 2100000,
				mime_type: "image/jpeg",
				public_id: "events/fashion-week-2025/gallery-1",
				media_type: "image",
				order: 2,
		is_active: true,
				created_at: "2024-11-15T14:06:00.000Z",
				updated_at: "2024-11-15T14:06:00.000Z",
			},
		],
		event_category: eventCategories[3],
		event_shot_quota: eventShotQuotas[0],
	},

	// Event 6: Product Launch Event (Upcoming)
	{
		id: "evt_006",
		title: "NextGen Smartphone Launch",
		description:
			"Be among the first to experience our revolutionary new smartphone. Join us for the official product launch featuring live demonstrations, hands-on experiences, exclusive pre-order offers, and Q&A sessions with the development team. Refreshments and swag bags for all attendees. Limited seats available.",
		location_id: "loc_006",
		venue_name: "Seattle Convention Center",
		address: "705 Pike St",
		city: "Seattle",
		state: "Washington",
		country: "United States",
		postal_code: "98101",
		google_map_url: "https://www.google.com/maps?q=Seattle+Convention+Center",
		longitude: "-122.3321",
		latitude: "47.6101",
		event_category_id: eventCategories[4].id, // Technology
		tags: "product launch, technology, smartphone, innovation, demo, exclusive",
		event_start_date: "2025-02-28T00:00:00.000Z",
		event_end_date: "2025-02-28T00:00:00.000Z",
		event_start_time: "17:00",
		event_end_time: "21:00",
		event_ticket_id: null,
		is_private: false,
		access_type: "ticket-based",
		access_code: null,
		qr_code: "QR_NEXTGEN_LAUNCH_2025",
		enable_downloads: false,
		allow_individual_upload: false,
		allow_professional_upload: true,
		published: true,
		is_duplicated: false,
		event_plan_id: "plan_standard",
		event_shot_quota_id: eventShotQuotas[1]?.id,
		created_by_id: manager_profiles[0].id,
		previous_event_id: null,
		max_participants: 800,
		first_accessed_at: "2025-01-25T09:00:00.000Z",
		total_accessed_count: 1247,
		last_accessed_at: new Date().toISOString(),
		deleted_at: null,
		created_at: "2025-01-05T10:00:00.000Z",
		updated_at: new Date().toISOString(),
		created_by: manager_profiles[0],
		// Metrics
		ticket_sold: 650,
		total_uploads: 1240,
		total_participants: 650,
		total_revenue: 48750, // $48,750
		total_refunds: 1250, // $1,250
		published_at: "2025-01-10T10:00:00.000Z",
		// Overview and Good to Know
		overview:
			"<p><strong>Welcome to Startup Pitch Night!</strong></p><p><strong>Date:</strong> May 5, 2025 at 6:00 PM</p><p><strong>Location:</strong> Innovation Hub, Seattle, Washington</p><p>Watch 10 innovative startups pitch their ideas to a panel of investors and industry experts. Network with entrepreneurs, investors, and fellow innovators. Includes appetizers and drinks. Vote for your favorite pitch! Great opportunity to discover new companies and make valuable connections.</p><p>Whether you're an aspiring entrepreneur, investor, or just curious about the startup ecosystem, this event offers valuable insights and networking opportunities!</p>",
		doors_open_at: "17:00", // 1 hour before event start (18:00)
		age_restriction: "21+",
		parking_type: "free-parking",
		faq: JSON.stringify([
			{
				question: "Can I pitch my startup?",
				answer:
					"Pitching spots are pre-selected. However, you can submit your startup for future events via our website.",
			},
			{
				question: "Will there be networking time?",
				answer:
					"Yes! There will be 30 minutes of structured networking before pitches and open networking afterward.",
			},
		]),
		event_media: [
			{
				id: "media_006_1",
				event_id: "evt_006",
				url: eventImages.productLaunch[0],
				file_name: "nextgen-launch-cover.jpg",
				file_size: 1950000,
				mime_type: "image/jpeg",
				public_id: "events/nextgen-launch-2025/cover",
				media_type: "cover",
				order: 1,
				is_active: true,
				created_at: "2025-01-05T10:05:00.000Z",
				updated_at: "2025-01-05T10:05:00.000Z",
			},
			{
				id: "media_006_2",
				event_id: "evt_006",
				url: eventImages.productLaunch[1],
				file_name: "nextgen-product.jpg",
				file_size: 1600000,
				mime_type: "image/jpeg",
				public_id: "events/nextgen-launch-2025/gallery-1",
				media_type: "image",
				order: 2,
				is_active: true,
				created_at: "2025-01-05T10:06:00.000Z",
				updated_at: "2025-01-05T10:06:00.000Z",
			},
		],
		event_category: eventCategories[4],
		event_shot_quota: eventShotQuotas[1],
	},
];
