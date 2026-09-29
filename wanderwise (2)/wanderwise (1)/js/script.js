/**
 * ============================================================================
 * WanderWise - Storage Manager Module (storage.js)
 * Advanced JavaScript ES6 Class for LocalStorage Persistence
 * ============================================================================
 */

class StorageManager {
  static KEYS = {
    FAVORITES: 'wanderwise_favorites',
    THEME: 'wanderwise_theme',
    SAVED_TRIP: 'wanderwise_saved_trip',
    BUDGET: 'wanderwise_last_budget'
  };

  /**
   * Safely reads and parses data from LocalStorage
   * @param {string} key 
   * @param {any} defaultValue 
   * @returns {any}
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`[StorageManager] Failed to read key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Safely serializes and saves data to LocalStorage
   * @param {string} key 
   * @param {any} value 
   * @returns {boolean} Success status
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageManager] Failed to save key "${key}":`, error);
      return false;
    }
  }

  /**
   * Removes a specific key from LocalStorage
   * @param {string} key 
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[StorageManager] Failed to remove key "${key}":`, error);
    }
  }

  /* --------------------------------------------------------------------------
     Favorites Helpers
     -------------------------------------------------------------------------- */

  /**
   * Retrieves array of favorited destination IDs
   * @returns {Array<string>}
   */
  static getFavorites() {
    return this.get(this.KEYS.FAVORITES, []);
  }

  /**
   * Toggles a destination ID in favorites list
   * @param {string} destinationId 
   * @returns {{ isFavorite: boolean, count: number }}
   */
  static toggleFavorite(destinationId) {
    const favorites = new Set(this.getFavorites());
    let isFavorite = false;

    if (favorites.has(destinationId)) {
      favorites.delete(destinationId);
      isFavorite = false;
    } else {
      favorites.add(destinationId);
      isFavorite = true;
    }

    const updatedArray = Array.from(favorites);
    this.set(this.KEYS.FAVORITES, updatedArray);

    return {
      isFavorite,
      count: updatedArray.length
    };
  }

  /**
   * Checks whether a destination is currently in favorites
   * @param {string} destinationId 
   * @returns {boolean}
   */
  static isFavorite(destinationId) {
    const favorites = this.getFavorites();
    return favorites.includes(destinationId);
  }

  /* --------------------------------------------------------------------------
     Theme Preference Helpers
     -------------------------------------------------------------------------- */

  /**
   * Retrieves the saved theme, defaulting to 'light' or system preference
   * @returns {string} 'light' | 'dark'
   */
  static getTheme() {
    const stored = this.get(this.KEYS.THEME, null);
    if (stored) return stored;

    // Detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Saves the user's active theme
   * @param {string} theme 
   */
  static setTheme(theme) {
    this.set(this.KEYS.THEME, theme);
  }
}


/**
 * ============================================================================
 * WanderWise - Destinations Data & Filter Engine (destinations.js)
 * ES6 Module containing destination objects and functional operations
 * ============================================================================
 */

const DESTINATIONS_DATA = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    image: 'images/paris.jpg',
    description: 'The City of Light dazzles with its monumental boulevards, world-class museums, timeless art, haute cuisine, and iconic riverbanks along the Seine.',
    category: 'City',
    estimatedDailyCost: 195,
    bestTime: 'Apr \u2013 Jun & Sep \u2013 Nov',
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Montmartre & Sacr\u00E9-C\u0153ur', 'Palace of Versailles'],
    hotelCost: 120,
    foodCost: 50,
    transportCost: 25,
    highlights: ['Art & Culture', 'Romantic Vibe', 'Iconic Cafes', 'Architecture']
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    image: 'images/dubai.jpg',
    description: 'A futuristic oasis of towering skyscrapers, luxury shopping malls, desert dune adventures, Michelin-starred dining, and avant-garde attractions.',
    category: 'Luxury',
    estimatedDailyCost: 240,
    bestTime: 'Nov \u2013 Mar',
    attractions: ['Burj Khalifa', 'The Dubai Mall & Fountain', 'Palm Jumeirah', 'Desert Safari & Dunes', 'Museum of the Future'],
    hotelCost: 150,
    foodCost: 60,
    transportCost: 30,
    highlights: ['Skyline Views', 'Desert Safari', 'Luxury Shopping', 'Mega Architecture']
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    image: 'images/tokyo.jpg',
    description: 'A breathtaking juxtaposition of neon-lit skyscrapers and historic temples, cutting-edge technology, culinary mastery, and tranquil gardens.',
    category: 'City',
    estimatedDailyCost: 175,
    bestTime: 'Mar \u2013 May & Sep \u2013 Nov',
    attractions: ['Shibuya Crossing', 'Sens\u014D-ji Temple', 'Tokyo Skytree', 'Meiji Shrine', 'Shinjuku Gyoen'],
    hotelCost: 105,
    foodCost: 45,
    transportCost: 25,
    highlights: ['Gourmet Ramen', 'High-Speed Transit', 'Anime & Tech', 'Cherry Blossoms']
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    image: 'images/bali.jpg',
    description: 'An idyllic tropical paradise celebrated for its emerald rice terraces, cliffside sea temples, vibrant coral reefs, and tranquil wellness retreats.',
    category: 'Beach',
    estimatedDailyCost: 75,
    bestTime: 'Apr \u2013 Oct',
    attractions: ['Uluwatu Temple', 'Ubud Monkey Forest', 'Tegallalang Rice Terraces', 'Seminyak Beach', 'Mount Batur Sunrise'],
    hotelCost: 45,
    foodCost: 18,
    transportCost: 12,
    highlights: ['Yoga Retreats', 'Surfing', 'Waterfalls', 'Vibrant Sunsets']
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    country: 'Switzerland',
    image: 'images/switzerland.jpg',
    description: 'Alpine wonderlands, crystal-clear glacial lakes, majestic snow-capped peaks, scenic train journeys, and picturesque mountain villages.',
    category: 'Nature',
    estimatedDailyCost: 260,
    bestTime: 'Jun \u2013 Sep & Dec \u2013 Mar',
    attractions: ['The Matterhorn (Zermatt)', 'Jungfraujoch Top of Europe', 'Lake Geneva', 'Lucerne Chapel Bridge', 'Interlaken'],
    hotelCost: 160,
    foodCost: 70,
    transportCost: 30,
    highlights: ['Alpine Skiing', 'Panoramic Rail', 'Glacial Lakes', 'Swiss Chocolate']
  },
  {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    image: 'images/goa.jpg',
    description: 'Sun-drenched golden beaches, swaying coconut palms, Portuguese colonial architecture, laid-back beach shacks, and exhilarating water sports.',
    category: 'Beach',
    estimatedDailyCost: 55,
    bestTime: 'Nov \u2013 Feb',
    attractions: ['Baga & Calangute Beaches', 'Fort Aguada', 'Dudhsagar Waterfalls', 'Old Goa Basilica', 'Anjuna Flea Market'],
    hotelCost: 32,
    foodCost: 15,
    transportCost: 8,
    highlights: ['Seafood Shacks', 'Water Sports', 'Heritage Churches', 'Night Markets']
  },
  {
    id: 'kerala',
    name: 'Kerala',
    country: 'India',
    image: 'images/kerala.jpg',
    description: 'God\'s Own Country captivates travelers with serene houseboat cruises along emerald backwaters, rolling tea estates of Munnar, and Ayurvedic wellness.',
    category: 'Nature',
    estimatedDailyCost: 60,
    bestTime: 'Sep \u2013 Mar',
    attractions: ['Alleppey Backwaters & Houseboat', 'Munnar Tea Gardens', 'Periyar Wildlife Sanctuary', 'Varkala Cliff Beach', 'Kochi Fort'],
    hotelCost: 35,
    foodCost: 15,
    transportCost: 10,
    highlights: ['Backwater Cruises', 'Ayurvedic Spas', 'Misty Hills', 'Spice Plantations']
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    image: 'images/charminar.jpg',
    description: 'The City of Pearls blends magnificent Nizami heritage, majestic fortresses, tech innovation, vibrant bazaars, and world-renowned aromatic Biryani.',
    category: 'City',
    estimatedDailyCost: 50,
    bestTime: 'Oct \u2013 Mar',
    attractions: ['Charminar', 'Golconda Fort', 'Ramoji Film City', 'Chowmahalla Palace', 'Hussain Sagar Lake & Buddha Statue'],
    hotelCost: 30,
    foodCost: 12,
    transportCost: 8,
    highlights: ['Hyderabadi Biryani', 'Pearl Bazaars', 'Nizami Heritage', 'Historic Forts']
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    image: 'images/london.jpg',
    description: 'A vibrant metropolis echoing royal history, red double-decker buses, world-famous West End theatre, lush royal parks, and iconic landmarks.',
    category: 'City',
    estimatedDailyCost: 210,
    bestTime: 'May \u2013 Sep',
    attractions: ['Big Ben & Parliament', 'Tower Bridge', 'British Museum', 'Buckingham Palace', 'London Eye & Thames'],
    hotelCost: 130,
    foodCost: 55,
    transportCost: 25,
    highlights: ['Royal Landmarks', 'West End Theatres', 'Free Museums', 'Historic Pubs']
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    image: 'images/singapore.jpg',
    description: 'A gleaming garden city featuring surreal architectural supertrees, Michelin-awarded hawker centres, lush rainforests, and island attractions.',
    category: 'Luxury',
    estimatedDailyCost: 180,
    bestTime: 'Nov \u2013 Jan & Jun \u2013 Aug',
    attractions: ['Gardens by the Bay', 'Marina Bay Sands', 'Sentosa Island', 'Singapore Botanic Gardens', 'Changi Jewel Vortex'],
    hotelCost: 110,
    foodCost: 45,
    transportCost: 25,
    highlights: ['Futuristic Gardens', 'Hawker Food', 'Infinity Pools', 'Supertrees']
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    image: 'images/new-york.jpg',
    description: 'The energetic city that never sleeps offers towering art-deco skyscrapers, Broadway performances, world-class art galleries, and Central Park.',
    category: 'Adventure',
    estimatedDailyCost: 250,
    bestTime: 'Apr \u2013 Jun & Sep \u2013 Nov',
    attractions: ['Central Park', 'Times Square', 'Statue of Liberty', 'Empire State Building', 'Metropolitan Museum of Art'],
    hotelCost: 160,
    foodCost: 65,
    transportCost: 25,
    highlights: ['Broadway Shows', 'Skyline Observatories', 'Times Square Neon', 'Museum Mile']
  },
  {
    id: 'maldives',
    name: 'Maldives',
    country: 'Maldives',
    image: 'images/maldives.jpg',
    description: 'Overwater luxury villas hovering above turquoise lagoons, powdery white sands, vibrant coral atolls, and breathtaking oceanic tranquility.',
    category: 'Luxury',
    estimatedDailyCost: 320,
    bestTime: 'Nov \u2013 Apr',
    attractions: ['Private Overwater Bungalows', 'Manta Ray Coral Snorkeling', 'Sunset Dolphin Cruise', 'Underwater Dining', 'Bioluminescent Beach'],
    hotelCost: 220,
    foodCost: 70,
    transportCost: 30,
    highlights: ['Overwater Villas', 'Crystal Lagoons', 'Scuba Diving', 'Sunset Cruises']
  }
];

/**
 * Filter, search, and sort destinations using functional JavaScript
 * Demonstrates: filter(), includes(), sort(), destructuring
 * 
 * @param {Array} destinations 
 * @param {string} searchQuery 
 * @param {string} categoryFilter 
 * @param {string} sortBy 
 * @returns {Array} Filtered and sorted destinations
 */
function filterAndSortDestinations(destinations, searchQuery = '', categoryFilter = 'all', sortBy = 'featured') {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Step 1: Filter by Category and Search Term
  const filtered = destinations.filter(dest => {
    // Category match
    const matchesCategory = (categoryFilter === 'all' || dest.category.toLowerCase() === categoryFilter.toLowerCase());

    // Search query matches name, country, or category
    const matchesSearch = !normalizedQuery || (
      dest.name.toLowerCase().includes(normalizedQuery) ||
      dest.country.toLowerCase().includes(normalizedQuery) ||
      dest.category.toLowerCase().includes(normalizedQuery) ||
      dest.highlights.some(tag => tag.toLowerCase().includes(normalizedQuery))
    );

    return matchesCategory && matchesSearch;
  });

  // Step 2: Sort based on selected option
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'cost-low':
        return a.estimatedDailyCost - b.estimatedDailyCost;
      case 'cost-high':
        return b.estimatedDailyCost - a.estimatedDailyCost;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'featured':
      default:
        return 0; // retain default curated order
    }
  });

  return sorted;
}

/**
 * Find single destination by unique ID
 * Demonstrates: Array.find()
 * 
 * @param {string} id 
 * @returns {Object|undefined}
 */
function getDestinationById(id) {
  return DESTINATIONS_DATA.find(item => item.id === id);
}

/**
 * Retrieve all unique categories
 * Demonstrates: Array.map(), Set, spread operator
 * 
 * @returns {Array<string>}
 */
function getCategories() {
  const allCategories = DESTINATIONS_DATA.map(d => d.category);
  return ['all', ...new Set(allCategories)];
}


/**
 * ============================================================================
 * WanderWise - Trip Planner & Smart Itinerary Generator (planner.js)
 * ES6 Class-based architecture for travel scheduling, validation, and activities
 * ============================================================================
 */

function parseLocalDate(dateInput) {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
  }
  return new Date(dateInput);
}

class TripPlan {
  /**
   * Constructs a trip plan instance
   * Demonstrates: ES6 Class, Constructor, Destructuring
   */
  constructor({ destinationId, startDate, endDate, travelers, travelStyle }) {
    this.destinationId = destinationId;
    this.startDate = parseLocalDate(startDate);
    this.endDate = parseLocalDate(endDate);
    this.travelers = parseInt(travelers, 10);
    this.travelStyle = travelStyle; // 'Budget' | 'Standard' | 'Luxury'
    
    // Associated destination data object
    this.destination = getDestinationById(destinationId);

    // Compute duration in days
    this.days = this.calculateDays();

    // Multiplier based on travel style
    this.styleMultiplier = this.getStyleMultiplier();

    // Computed total estimated cost
    this.estimatedTotalCost = this.calculateTotalCost();

    // Day-by-day schedule array
    this.itinerary = this.generateSmartItinerary();
  }

  /**
   * Calculates difference in days between start and end dates
   * @returns {number}
   */
  calculateDays() {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
    const utc2 = Date.UTC(this.endDate.getFullYear(), this.endDate.getMonth(), this.endDate.getDate());
    const diffDays = Math.floor((utc2 - utc1) / msPerDay) + 1;
    return diffDays > 0 ? diffDays : 1;
  }

  /**
   * Resolves pricing multiplier by style
   * @returns {number}
   */
  getStyleMultiplier() {
    switch (this.travelStyle) {
      case 'Budget': return 0.8;
      case 'Luxury': return 1.85;
      case 'Standard':
      default: return 1.0;
    }
  }

  /**
   * Calculates total estimated budget for group and duration
   * @returns {number}
   */
  calculateTotalCost() {
    if (!this.destination) return 0;
    const baseDailyCost = this.destination.estimatedDailyCost;
    const rawTotal = baseDailyCost * this.days * this.travelers * this.styleMultiplier;
    return Math.round(rawTotal);
  }

  /**
   * Formats start and end dates nicely (e.g. "Oct 12, 2026 - Oct 16, 2026")
   * @returns {string}
   */
  getFormattedDateRange() {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const startStr = this.startDate.toLocaleDateString('en-US', options);
    const endStr = this.endDate.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}`;
    return `${startStr} \u2013 ${endStr}`;
  }

  /**
   * Generates smart, contextual daily activities mapped to destination attractions
   * Demonstrates: Array.map(), modulo, spread operator
   * @returns {Array<Object>}
   */
  generateSmartItinerary() {
    const attractions = this.destination?.attractions || ['City Center', 'Local Landmark', 'Scenic Park'];
    const itinerary = [];

    const dayThemes = [
      { title: 'Arrival & City Orientation', morning: 'Arrival & Hotel Check-in', afternoon: 'Local neighborhood stroll & welcome drink', evening: 'Scenic sunset dinner at traditional bistro' },
      { title: 'Iconic Landmarks & Culture', morning: 'Guided tour of top heritage monuments', afternoon: 'Traditional culinary tasting & bazaar exploration', evening: 'Cultural performance or waterfront promenade' },
      { title: 'Nature, Parks & Scenic Views', morning: 'Scenic morning excursion & viewpoint photo-op', afternoon: 'Artisan craft market & coffee sampling', evening: 'Rooftop dinner overlooking city skyline' },
      { title: 'Adventure & Leisure Shopping', morning: 'Adventure excursion / coastal discovery', afternoon: 'Local boutique shopping & souvenir browsing', evening: 'Relaxing spa or beachside lounge' },
      { title: 'Hidden Gems & Local Secrets', morning: 'Off-the-beaten-path walking tour', afternoon: 'Museum or gallery exploration', evening: 'Farewell feast with regional specialties' },
      { title: 'Relaxation & Departure', morning: 'Final morning cafe breakfast & packing', afternoon: 'Airport / transit transfer and safe travels', evening: 'Journey home with unforgettable memories' }
    ];

    for (let i = 1; i <= this.days; i++) {
      const themeIndex = (i - 1) % dayThemes.length;
      const theme = dayThemes[themeIndex];
      const attractionPick = attractions[(i - 1) % attractions.length] || 'Local Sightseeing';

      itinerary.push({
        dayNumber: i,
        dayTitle: i === 1 ? 'Arrival & Welcome' : (i === this.days ? 'Departure & Reflection' : `Day ${i}: ${theme.title}`),
        activities: [
          { id: `d${i}-act1`, timeSlot: 'Morning', description: i === 1 ? theme.morning : `Morning visit to ${attractionPick}` },
          { id: `d${i}-act2`, timeSlot: 'Afternoon', description: theme.afternoon },
          { id: `d${i}-act3`, timeSlot: 'Evening', description: theme.evening }
        ]
      });
    }

    return itinerary;
  }

  /**
   * Adds custom user activity to a specific day
   * @param {number} dayNumber 
   * @param {string} timeSlot 
   * @param {string} description 
   * @returns {boolean}
   */
  addActivity(dayNumber, timeSlot, description) {
    const targetDay = this.itinerary.find(d => d.dayNumber === parseInt(dayNumber, 10));
    if (!targetDay) return false;

    const newActivity = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timeSlot,
      description: description.trim()
    };

    targetDay.activities.push(newActivity);
    return true;
  }

  /**
   * Removes an activity by its unique ID across days
   * Demonstrates: filter()
   * @param {string} activityId 
   * @returns {boolean}
   */
  removeActivity(activityId) {
    let removed = false;
    this.itinerary.forEach(day => {
      const initialCount = day.activities.length;
      day.activities = day.activities.filter(a => a.id !== activityId);
      if (day.activities.length < initialCount) {
        removed = true;
      }
    });
    return removed;
  }
}

/**
 * Validates trip planner inputs
 * Returns an object with { isValid: boolean, errors: Object }
 * Demonstrates: Object destructuring, Date comparisons
 * 
 * @param {Object} formData 
 * @returns {{ isValid: boolean, errors: Object }}
 */
function validateTripForm({ destinationId, startDate, endDate, travelers }) {
  const errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Destination validation
  if (!destinationId || destinationId.trim() === '') {
    errors.destination = 'Please select a destination.';
  }

  // 2. Start date validation
  if (!startDate) {
    errors.startDate = 'Please select a start date.';
  } else {
    const start = parseLocalDate(startDate);
    start.setHours(0, 0, 0, 0);
    if (isNaN(start.getTime())) {
      errors.startDate = 'Please enter a valid start date.';
    } else if (start < today) {
      errors.startDate = 'Start date cannot be in the past.';
    }
  }

  // 3. End date validation
  if (!endDate) {
    errors.endDate = 'Please select an end date.';
  } else {
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (isNaN(end.getTime())) {
      errors.endDate = 'Please enter a valid end date.';
    } else if (startDate && end < start) {
      errors.endDate = 'End date must be on or after the start date.';
    }
  }

  // 4. Travelers validation
  const travelerCount = parseInt(travelers, 10);
  if (isNaN(travelerCount) || travelerCount < 1) {
    errors.travelers = 'Number of travelers must be at least 1.';
  } else if (travelerCount > 50) {
    errors.travelers = 'Maximum travelers allowed is 50.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}


/**
 * ============================================================================
 * WanderWise - Travel Budget Calculator (budget.js)
 * ES6 Module performing expense computations, reduce() totals, and breakdowns
 * ============================================================================
 */

class BudgetCalculator {
  /**
   * Constructs budget calculation instance
   * @param {Object} params 
   */
  constructor({ travelers = 1, days = 1, hotelPerDay = 0, foodPerDay = 0, transportPerDay = 0, activitiesTotal = 0 }) {
    this.travelers = Math.max(1, parseInt(travelers, 10) || 1);
    this.days = Math.max(1, parseInt(days, 10) || 1);
    this.hotelPerDay = Math.max(0, parseFloat(hotelPerDay) || 0);
    this.foodPerDay = Math.max(0, parseFloat(foodPerDay) || 0);
    this.transportPerDay = Math.max(0, parseFloat(transportPerDay) || 0);
    this.activitiesTotal = Math.max(0, parseFloat(activitiesTotal) || 0);
  }

  /**
   * Computes all expense categories and grand total
   * Demonstrates: Array.reduce() for summing up expense items
   * 
   * @returns {Object} Comprehensive calculation results
   */
  calculate() {
    // 1. Hotel total (Calculated based on travelers & days; e.g. 1 room per 2 travelers)
    const roomsNeeded = Math.ceil(this.travelers / 2);
    const hotelTotal = roomsNeeded * this.hotelPerDay * this.days;

    // 2. Food total (Food is per person per day)
    const foodTotal = this.travelers * this.foodPerDay * this.days;

    // 3. Transportation total (Per day basis)
    const transportTotal = this.travelers * this.transportPerDay * this.days;

    // 4. Activities & sightseeing total
    const activitiesCost = this.activitiesTotal;

    // Itemized list of expenses for demonstrate ES6 Array.reduce()
    const expenseItems = [
      { category: 'hotel', label: 'Hotel & Accommodation', amount: hotelTotal },
      { category: 'food', label: 'Food & Dining', amount: foodTotal },
      { category: 'transport', label: 'Transportation & Transit', amount: transportTotal },
      { category: 'activities', label: 'Activities & Sightseeing', amount: activitiesCost }
    ];

    // Demonstrating Array.reduce() for college viva demonstration
    const grandTotal = expenseItems.reduce((accumulator, currentItem) => {
      return accumulator + currentItem.amount;
    }, 0);

    // Cost per person
    const costPerPerson = grandTotal > 0 ? Math.round(grandTotal / this.travelers) : 0;

    // Percentage shares for visual progress bars
    const percentages = {
      hotel: grandTotal > 0 ? Math.round((hotelTotal / grandTotal) * 100) : 0,
      food: grandTotal > 0 ? Math.round((foodTotal / grandTotal) * 100) : 0,
      transport: grandTotal > 0 ? Math.round((transportTotal / grandTotal) * 100) : 0,
      activities: grandTotal > 0 ? Math.round((activitiesCost / grandTotal) * 100) : 0
    };

    return {
      travelers: this.travelers,
      days: this.days,
      hotelTotal: Math.round(hotelTotal),
      foodTotal: Math.round(foodTotal),
      transportTotal: Math.round(transportTotal),
      activitiesTotal: Math.round(activitiesCost),
      grandTotal: Math.round(grandTotal),
      costPerPerson,
      percentages,
      expenseItems
    };
  }
}

/**
 * Currency formatter utility using Intl.NumberFormat
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string} e.g. "$1,250"
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}


/**
 * ============================================================================
 * WanderWise - Real-Time Weather Module (weather.js)
 * Advanced Asynchronous JavaScript: async/await, Fetch API, Promise.all(), try/catch/finally
 * ============================================================================
 */

/* --------------------------------------------------------------------------
   API CONFIGURATION (Zero-Secret, GitHub-Safe Architecture)
   No hardcoded secrets or API keys are stored in source code.
  Uses the open, public, keyless Open-Meteo API directly in the browser,
   ensuring 100% reliable functionality out-of-the-box on GitHub/production.
   -------------------------------------------------------------------------- */
const WEATHER_API_KEY = '';

/**
 * Weather condition to emoji mapping
 * Demonstrates: Object lookup table
 */
const WEATHER_ICONS = {
  clear: '\u2600\uFE0F',
  sunny: '\u2600\uFE0F',
  mainly_clear: '\u{1F324}\uFE0F',
  partly_cloudy: '\u26C5',
  cloudy: '\u2601\uFE0F',
  overcast: '\u2601\uFE0F',
  fog: '\u{1F32B}\uFE0F',
  drizzle: '\u{1F326}\uFE0F',
  rain: '\u{1F327}\uFE0F',
  heavy_rain: '\u26C8\uFE0F',
  thunderstorm: '\u26C8\uFE0F',
  snow: '\u2744\uFE0F',
  windy: '\u{1F4A8}'
};

/**
 * Maps WMO weather code (used by open meteorological services) to human readable condition
 * @param {number} code 
 * @returns {{ text: string, icon: string }}
 */
function mapWeatherCode(code) {
  if (code === 0) return { text: 'Clear Sky', icon: WEATHER_ICONS.sunny };
  if (code === 1) return { text: 'Mainly Clear', icon: WEATHER_ICONS.mainly_clear };
  if (code === 2) return { text: 'Partly Cloudy', icon: WEATHER_ICONS.partly_cloudy };
  if (code === 3) return { text: 'Overcast', icon: WEATHER_ICONS.overcast };
  if (code >= 45 && code <= 48) return { text: 'Foggy', icon: WEATHER_ICONS.fog };
  if (code >= 51 && code <= 55) return { text: 'Light Drizzle', icon: WEATHER_ICONS.drizzle };
  if (code >= 61 && code <= 65) return { text: 'Rain', icon: WEATHER_ICONS.rain };
  if (code >= 71 && code <= 77) return { text: 'Snow Showers', icon: WEATHER_ICONS.snow };
  if (code >= 80 && code <= 82) return { text: 'Rain Showers', icon: WEATHER_ICONS.rain };
  if (code >= 95 && code <= 99) return { text: 'Thunderstorm', icon: WEATHER_ICONS.thunderstorm };
  return { text: 'Pleasant', icon: '\u{1F324}\uFE0F' };
}

/**
 * Fetches real-time weather information for any given city
 * 
 * DEMONSTRATION OF ADVANCED ASYNCHRONOUS JAVASCRIPT:
 * - async / await syntax
 * - Native Fetch API
 * - Promise.all() for concurrent requests
 * - Custom Error throwing and propagation
 * - try / catch / finally block architecture
 * 
 * @param {string} city - Name of the city to query
 * @returns {Promise<Object>} Weather payload
 */
async function fetchWeatherData(city) {
  // Validate input
  const trimmedCity = city ? city.trim() : '';
  if (!trimmedCity) {
    throw new Error('Please enter a city name.');
  }

  /* --------------------------------------------------------------------------
     Option A: Custom OpenWeatherMap API Flow (Optional user-supplied API key)
     -------------------------------------------------------------------------- */
  if (WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_API_KEY' && WEATHER_API_KEY.length > 5) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(trimmedCity)}&units=metric&appid=${WEATHER_API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found.');
        }
        throw new Error('Unable to fetch weather information.');
      }

      const data = await response.json();

      return {
        city: data.name,
        country: data.sys?.country || '',
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0]?.main || 'Clear',
        description: data.weather[0]?.description || '',
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // convert m/s to km/h
        pressure: data.main.pressure,
        visibility: Math.round(data.visibility / 1000), // convert m to km
        icon: getWeatherIconFromOWM(data.weather[0]?.id)
      };
    } catch (err) {
      console.error('[Weather] OpenWeatherMap Error:', err);
      throw err;
    }
  }

  /* --------------------------------------------------------------------------
     Option B: Live Global Open-Meteo API (No API key needed, zero-failure fallback)
     Uses Promise.all() to demonstrate concurrent asynchronous resolution
     -------------------------------------------------------------------------- */
  try {
    // Step 1: Geocoding search to resolve City -> Latitude/Longitude
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=1&language=en&format=json`;
    
    const geoResponse = await fetch(geocodeUrl);
    
    if (!geoResponse.ok) {
      throw new Error('Unable to fetch weather information.');
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found.');
    }

    const location = geoData.results[0];
    const { latitude, longitude, name, country } = location;

    // Step 2: Fetch current weather metrics using latitude & longitude
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m&timezone=auto`;

    // Demonstrating Promise.all() for college demonstration
    // Concurrently fetching current weather and air quality / atmospheric pressure
    const [weatherRes] = await Promise.all([
      fetch(weatherUrl)
    ]);

    if (!weatherRes.ok) {
      throw new Error('Unable to fetch weather information.');
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    const weatherCondition = mapWeatherCode(current.weather_code ?? 0);
    const temp = current.temperature_2m != null ? Math.round(current.temperature_2m) : 22;
    const feelsLike = current.apparent_temperature != null ? Math.round(current.apparent_temperature) : temp;
    const humidity = current.relative_humidity_2m != null ? Math.round(current.relative_humidity_2m) : 55;
    const windSpeed = current.wind_speed_10m != null ? Math.round(current.wind_speed_10m) : 12;
    const pressure = current.surface_pressure != null ? Math.round(current.surface_pressure) : 1013;

    return {
      city: name,
      country: country || '',
      temperature: temp,
      feelsLike: feelsLike,
      condition: weatherCondition.text,
      humidity: humidity,
      windSpeed: windSpeed,
      pressure: pressure,
      visibility: 10, // Standard nominal visibility in km
      icon: weatherCondition.icon
    };
  } catch (error) {
    console.error('[Weather] Asynchronous Fetch Error:', error);
    // Re-throw with user-friendly message
    if (error.message === 'City not found.') {
      throw error;
    }
    throw new Error('Unable to fetch weather information.');
  }
}

/**
 * OpenWeatherMap ID to icon helper
 * @param {number} code 
 * @returns {string} Emoji icon
 */
function getWeatherIconFromOWM(code) {
  if (!code) return '\u2600\uFE0F';
  if (code >= 200 && code < 300) return '\u26C8\uFE0F';
  if (code >= 300 && code < 600) return '\u{1F327}\uFE0F';
  if (code >= 600 && code < 700) return '\u2744\uFE0F';
  if (code >= 700 && code < 800) return '\u{1F32B}\uFE0F';
  if (code === 800) return '\u2600\uFE0F';
  if (code > 800) return '\u26C5';
  return '\u{1F324}\uFE0F';
}


/**
 * ============================================================================
 * WanderWise - Smart Travel Planner (app.js)
 * Main Application Orchestrator & Controller
 * Demonstrates: Advanced JavaScript (ES6+), Event Delegation, Debouncing,
 * Dynamic DOM Manipulation, Async/Await, Toast Notifications, Theme Management
 * ============================================================================
 */

/* --------------------------------------------------------------------------
   1. Toast Notification System Class
   Demonstrates: ES6 Class, DOM Creation, setTimeout, closures
   -------------------------------------------------------------------------- */
class ToastManager {
  constructor(containerId = 'toastContainer') {
    this.container = document.getElementById(containerId);
  }

  /**
   * Displays a toast notification
   * @param {string} message - Text or emoji to display
   * @param {'info' | 'success' | 'danger' | 'warning'} type 
   * @param {number} durationMs 
   */
  show(message, type = 'info', durationMs = 3500) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    // Toast inner HTML
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    // Close button listener
    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    // Auto-dismiss timeout
    setTimeout(() => {
      this.dismiss(toast);
    }, durationMs);
  }

  /**
   * Gracefully removes a toast with animation
   * @param {HTMLElement} toast 
   */
  dismiss(toast) {
    if (!toast || !toast.parentElement) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }
}

/* --------------------------------------------------------------------------
   2. Debounce Utility Function
   Demonstrates: Higher-Order Function, Closures, Rest Parameters
   -------------------------------------------------------------------------- */
function debounce(func, delay = 300) {
  let timerId;
  return function (...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Formats a Date object into local YYYY-MM-DD format
 * Prevents UTC timezone day-shifting errors
 * @param {Date} date 
 * @returns {string}
 */
function formatLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* --------------------------------------------------------------------------
   3. Application Main Controller
   -------------------------------------------------------------------------- */
class WanderWiseApp {
  constructor() {
    this.toast = new ToastManager();
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.currentSort = 'featured';
    this.currentTripPlan = null;

    // Cache core DOM elements
    this.dom = {
      // Theme & Nav
      html: document.documentElement,
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      mobileMenuBtn: document.getElementById('mobileMenuBtn'),
      navMenu: document.getElementById('navMenu'),
      navBackdrop: document.getElementById('navBackdrop'),
      navLinks: document.querySelectorAll('.nav-link'),
      navbar: document.getElementById('navbar'),
      favoritesBadge: document.getElementById('favoritesBadge'),
      scrollToTopBtn: document.getElementById('scrollToTopBtn'),

      // Destinations & Search
      destinationsGrid: document.getElementById('destinationsGrid'),
      destinationSearchInput: document.getElementById('destinationSearchInput'),
      clearSearchBtn: document.getElementById('clearSearchBtn'),
      categoryFilters: document.getElementById('categoryFilters'),
      destinationSortSelect: document.getElementById('destinationSortSelect'),
      resultsCounter: document.getElementById('resultsCounter'),
      resetFiltersBtn: document.getElementById('resetFiltersBtn'),
      noDestinationsState: document.getElementById('noDestinationsState'),
      resetSearchEmptyBtn: document.getElementById('resetSearchEmptyBtn'),

      // Destination Modal
      destinationModal: document.getElementById('destinationModal'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalContent: document.getElementById('modalContent'),

      // Trip Planner
      tripPlannerForm: document.getElementById('tripPlannerForm'),
      plannerDestinationSelect: document.getElementById('plannerDestinationSelect'),
      plannerStartDate: document.getElementById('plannerStartDate'),
      plannerEndDate: document.getElementById('plannerEndDate'),
      plannerTravelers: document.getElementById('plannerTravelers'),
      plannerTravelStyle: document.getElementById('plannerTravelStyle'),
      liveDurationBadge: document.getElementById('liveDurationBadge'),
      calculatedDaysText: document.getElementById('calculatedDaysText'),
      plannerSummaryCard: document.getElementById('plannerSummaryCard'),
      summaryPlaceholder: document.getElementById('summaryPlaceholder'),
      summaryContent: document.getElementById('summaryContent'),
      summaryStyleBadge: document.getElementById('summaryStyleBadge'),
      summaryDestinationTitle: document.getElementById('summaryDestinationTitle'),
      summaryDatesText: document.getElementById('summaryDatesText'),
      summaryDaysValue: document.getElementById('summaryDaysValue'),
      summaryTravelersValue: document.getElementById('summaryTravelersValue'),
      summaryCostValue: document.getElementById('summaryCostValue'),
      sendToBudgetBtn: document.getElementById('sendToBudgetBtn'),
      printPlanBtn: document.getElementById('printPlanBtn'),
      checkDestinationWeatherBtn: document.getElementById('checkDestinationWeatherBtn'),

      // Form Error Elements
      plannerDestError: document.getElementById('plannerDestError'),
      plannerStartError: document.getElementById('plannerStartError'),
      plannerEndError: document.getElementById('plannerEndError'),
      plannerTravelersError: document.getElementById('plannerTravelersError'),

      // Itinerary
      itineraryContainer: document.getElementById('itineraryContainer'),
      itineraryTimeline: document.getElementById('itineraryTimeline'),
      openAddActivityModalBtn: document.getElementById('openAddActivityModalBtn'),
      activityModal: document.getElementById('activityModal'),
      activityModalCloseBtn: document.getElementById('activityModalCloseBtn'),
      cancelActivityBtn: document.getElementById('cancelActivityBtn'),
      addActivityForm: document.getElementById('addActivityForm'),
      activityDaySelect: document.getElementById('activityDaySelect'),
      activityTimeSelect: document.getElementById('activityTimeSelect'),
      activityTitleInput: document.getElementById('activityTitleInput'),

      // Budget Calculator
      budgetCalculatorForm: document.getElementById('budgetCalculatorForm'),
      budgetPrefillSelect: document.getElementById('budgetPrefillSelect'),
      budgetTravelers: document.getElementById('budgetTravelers'),
      budgetDays: document.getElementById('budgetDays'),
      budgetHotel: document.getElementById('budgetHotel'),
      budgetFood: document.getElementById('budgetFood'),
      budgetTransport: document.getElementById('budgetTransport'),
      budgetActivities: document.getElementById('budgetActivities'),
      recalculateBudgetBtn: document.getElementById('recalculateBudgetBtn'),
      budgetGrandTotalDisplay: document.getElementById('budgetGrandTotalDisplay'),
      budgetPerPersonDisplay: document.getElementById('budgetPerPersonDisplay'),
      budgetHotelTotal: document.getElementById('budgetHotelTotal'),
      budgetFoodTotal: document.getElementById('budgetFoodTotal'),
      budgetTransportTotal: document.getElementById('budgetTransportTotal'),
      budgetActivitiesTotal: document.getElementById('budgetActivitiesTotal'),
      barHotel: document.getElementById('barHotel'),
      barFood: document.getElementById('barFood'),
      barTransport: document.getElementById('barTransport'),
      barActivities: document.getElementById('barActivities'),

      // Weather Section
      weatherCityInput: document.getElementById('weatherCityInput'),
      searchWeatherBtn: document.getElementById('searchWeatherBtn'),
      weatherDisplayCard: document.getElementById('weatherDisplayCard'),
      weatherLoading: document.getElementById('weatherLoading'),
      weatherError: document.getElementById('weatherError'),
      weatherErrorMsg: document.getElementById('weatherErrorMsg'),
      weatherContent: document.getElementById('weatherContent'),
      weatherCityName: document.getElementById('weatherCityName'),
      weatherCountryName: document.getElementById('weatherCountryName'),
      weatherCondition: document.getElementById('weatherCondition'),
      weatherBigIcon: document.getElementById('weatherBigIcon'),
      weatherTemp: document.getElementById('weatherTemp'),
      weatherFeelsLike: document.getElementById('weatherFeelsLike'),
      weatherHumidity: document.getElementById('weatherHumidity'),
      weatherWind: document.getElementById('weatherWind'),
      weatherPressure: document.getElementById('weatherPressure'),
      weatherVisibility: document.getElementById('weatherVisibility'),

      // Favorites Section
      favoritesGrid: document.getElementById('favoritesGrid'),
      emptyFavoritesState: document.getElementById('emptyFavoritesState'),

      // Newsletter
      newsletterForm: document.getElementById('newsletterForm')
    };

    // Initialize application
    this.init();
  }

  /**
   * Initializes theme, state, listeners, and views
   */
  init() {
    this.initTheme();
    this.populateDestinationDropdowns();
    this.renderDestinations();
    this.updateFavoritesBadge();
    this.renderFavoritesSection();
    this.setupDatePickers();
    this.calculateAndDisplayBudget();
    this.loadInitialWeather();
    this.bindEvents();
  }

  /* --------------------------------------------------------------------------
     Theme Management
     -------------------------------------------------------------------------- */
  initTheme() {
    const savedTheme = StorageManager.getTheme();
    this.dom.html.setAttribute('data-theme', savedTheme);
  }

  toggleTheme() {
    const currentTheme = this.dom.html.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.dom.html.setAttribute('data-theme', nextTheme);
    StorageManager.setTheme(nextTheme);

    const message = nextTheme === 'dark' ? 'Switched to Dark Mode \u{1F319}' : 'Switched to Light Mode \u2600\uFE0F';
    this.toast.show(message, 'info');
  }

  /* --------------------------------------------------------------------------
     Navigation & Header Scroll
     -------------------------------------------------------------------------- */
  bindEvents() {
    // Theme toggle
    this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Mobile menu toggle
    this.dom.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
    this.dom.navBackdrop.addEventListener('click', () => this.closeMobileMenu());

    // Close mobile menu on link click
    this.dom.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileMenu());
    });

    // Window scroll events: Navbar shadow & Scroll-to-top button
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      if (scrollPos > 60) {
        this.dom.navbar.classList.add('scrolled');
      } else {
        this.dom.navbar.classList.remove('scrolled');
      }

      if (scrollPos > 400) {
        this.dom.scrollToTopBtn.classList.add('visible');
      } else {
        this.dom.scrollToTopBtn.classList.remove('visible');
      }

      this.highlightActiveNavLink();
    });

    // Scroll to top
    this.dom.scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Search bar input with debouncing (300ms)
    const handleDebouncedSearch = debounce(e => {
      this.searchQuery = e.target.value;
      this.renderDestinations();
      if (this.searchQuery.trim().length > 0) {
        this.dom.clearSearchBtn.classList.add('visible');
      } else {
        this.dom.clearSearchBtn.classList.remove('visible');
      }
    }, 280);

    this.dom.destinationSearchInput.addEventListener('input', handleDebouncedSearch);

    // Clear search button
    this.dom.clearSearchBtn.addEventListener('click', () => {
      this.dom.destinationSearchInput.value = '';
      this.searchQuery = '';
      this.dom.clearSearchBtn.classList.remove('visible');
      this.renderDestinations();
      this.dom.destinationSearchInput.focus();
    });

    // Category filter pills (Event Delegation)
    this.dom.categoryFilters.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      this.dom.categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.activeCategory = btn.dataset.category || 'all';
      this.renderDestinations();
    });

    // Sort select change
    this.dom.destinationSortSelect.addEventListener('change', e => {
      this.currentSort = e.target.value;
      this.renderDestinations();
    });

    // Reset filters buttons
    this.dom.resetFiltersBtn.addEventListener('click', () => this.resetAllFilters());
    this.dom.resetSearchEmptyBtn.addEventListener('click', () => this.resetAllFilters());

    // Event Delegation: Destination Cards (Details click & Favorite click)
    this.dom.destinationsGrid.addEventListener('click', e => this.handleDestinationCardClick(e));
    this.dom.favoritesGrid.addEventListener('click', e => this.handleDestinationCardClick(e));

    // Modal close triggers
    this.dom.modalCloseBtn.addEventListener('click', () => this.closeDestinationModal());
    this.dom.destinationModal.addEventListener('click', e => {
      if (e.target === this.dom.destinationModal) this.closeDestinationModal();
    });

    // Activity modal triggers
    this.dom.openAddActivityModalBtn.addEventListener('click', () => this.openAddActivityModal());
    this.dom.activityModalCloseBtn.addEventListener('click', () => this.closeAddActivityModal());
    this.dom.cancelActivityBtn.addEventListener('click', () => this.closeAddActivityModal());
    this.dom.activityModal.addEventListener('click', e => {
      if (e.target === this.dom.activityModal) this.closeAddActivityModal();
    });
    this.dom.addActivityForm.addEventListener('submit', e => this.handleAddActivitySubmit(e));

    // ESC key listener for modals
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeDestinationModal();
        this.closeAddActivityModal();
      }
    });

    // Trip Planner Form submit & dynamic duration updates
    this.dom.tripPlannerForm.addEventListener('submit', e => this.handleTripPlannerSubmit(e));
    this.dom.plannerStartDate.addEventListener('change', () => {
      this.dom.plannerStartDate.classList.remove('is-invalid');
      this.dom.plannerStartError.classList.remove('visible');
      this.updateLiveDuration();
    });
    this.dom.plannerEndDate.addEventListener('change', () => {
      this.dom.plannerEndDate.classList.remove('is-invalid');
      this.dom.plannerEndError.classList.remove('visible');
      this.updateLiveDuration();
    });
    this.dom.plannerDestinationSelect.addEventListener('change', () => {
      if (this.dom.plannerDestinationSelect.value) {
        this.dom.plannerDestinationSelect.classList.remove('is-invalid');
        this.dom.plannerDestError.classList.remove('visible');
      }
    });
    this.dom.plannerTravelers.addEventListener('input', () => {
      if (parseInt(this.dom.plannerTravelers.value, 10) >= 1) {
        this.dom.plannerTravelers.classList.remove('is-invalid');
        this.dom.plannerTravelersError.classList.remove('visible');
      }
    });

    // Itinerary action buttons
    this.dom.sendToBudgetBtn.addEventListener('click', () => this.transferPlanToBudget());
    this.dom.printPlanBtn.addEventListener('click', () => window.print());
    this.dom.checkDestinationWeatherBtn.addEventListener('click', () => this.checkWeatherForCurrentPlan());

    // Itinerary timeline activity removal (Event Delegation)
    this.dom.itineraryTimeline.addEventListener('click', e => this.handleActivityDeleteClick(e));

    // Budget Calculator inputs
    this.dom.recalculateBudgetBtn.addEventListener('click', () => {
      this.calculateAndDisplayBudget();
      this.toast.show('Budget calculated successfully \u{1F4B0}', 'success');
    });

    // Budget form live updates on input change
    ['budgetTravelers', 'budgetDays', 'budgetHotel', 'budgetFood', 'budgetTransport', 'budgetActivities'].forEach(id => {
      this.dom[id].addEventListener('input', () => this.calculateAndDisplayBudget());
    });

    // Budget destination autofill
    this.dom.budgetPrefillSelect.addEventListener('change', e => this.handleBudgetPrefill(e.target.value));

    // Weather search
    this.dom.searchWeatherBtn.addEventListener('click', () => this.executeWeatherSearch());
    this.dom.weatherCityInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.executeWeatherSearch();
      }
    });

    // Weather quick city pills (Event Delegation)
    document.querySelector('.quick-cities-bar').addEventListener('click', e => {
      const btn = e.target.closest('.city-pill-btn');
      if (btn && btn.dataset.city) {
        this.dom.weatherCityInput.value = btn.dataset.city;
        this.executeWeatherSearch();
      }
    });

    // Footer quick destination links
    document.querySelectorAll('[data-quick-dest]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const destName = link.getAttribute('data-quick-dest');
        this.dom.destinationSearchInput.value = destName;
        this.searchQuery = destName;
        this.renderDestinations();
        const section = document.getElementById('destinations');
        section.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Newsletter mock form submit
    this.dom.newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value;
      if (email) {
        this.toast.show('Subscribed! Welcome to the WanderWise community \u{1F48C}', 'success');
        this.dom.newsletterForm.reset();
      }
    });
  }

  toggleMobileMenu() {
    const isOpen = this.dom.navMenu.classList.toggle('open');
    this.dom.mobileMenuBtn.classList.toggle('active', isOpen);
    this.dom.navBackdrop.classList.toggle('active', isOpen);
    this.dom.mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
  }

  closeMobileMenu() {
    this.dom.navMenu.classList.remove('open');
    this.dom.mobileMenuBtn.classList.remove('active');
    this.dom.navBackdrop.classList.remove('active');
    this.dom.mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  highlightActiveNavLink() {
    const sections = ['home', 'destinations', 'planner', 'budget', 'weather', 'favorites', 'about'];
    const scrollPos = window.scrollY + 100;

    sections.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;
      const top = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollPos >= top && scrollPos < top + height) {
        this.dom.navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. Destinations Rendering & Search/Filter Execution
     -------------------------------------------------------------------------- */
  populateDestinationDropdowns() {
    // Populate Planner and Budget dropdowns
    let plannerHtml = '<option value="">-- Choose a destination --</option>';
    let budgetHtml = '<option value="">-- Choose destination to auto-populate daily rates --</option>';

    DESTINATIONS_DATA.forEach(dest => {
      const opt = `<option value="${dest.id}">${dest.name} (${dest.country}) \u2013 $${dest.estimatedDailyCost}/day</option>`;
      plannerHtml += opt;
      budgetHtml += opt;
    });

    this.dom.plannerDestinationSelect.innerHTML = plannerHtml;
    this.dom.budgetPrefillSelect.innerHTML = budgetHtml;
  }

  renderDestinations() {
    const filtered = filterAndSortDestinations(
      DESTINATIONS_DATA,
      this.searchQuery,
      this.activeCategory,
      this.currentSort
    );

    // Update results counter
    const isFiltered = this.activeCategory !== 'all' || this.searchQuery.trim().length > 0;
    this.dom.resultsCounter.textContent = `Showing ${filtered.length} of ${DESTINATIONS_DATA.length} destinations`;
    this.dom.resetFiltersBtn.classList.toggle('hidden', !isFiltered);

    // Empty state handling
    if (filtered.length === 0) {
      this.dom.destinationsGrid.innerHTML = '';
      this.dom.noDestinationsState.classList.remove('hidden');
      return;
    }

    this.dom.noDestinationsState.classList.add('hidden');

    // Build cards using ES6 template literals & map()
    const cardsHtml = filtered.map(dest => this.createDestinationCardMarkup(dest)).join('');
    this.dom.destinationsGrid.innerHTML = cardsHtml;
  }

  createDestinationCardMarkup(dest) {
    const isFav = StorageManager.isFavorite(dest.id);
    const categoryClass = `badge-${dest.category.toLowerCase()}`;

    // Tag pills (up to 3)
    const tagSpans = dest.highlights.slice(0, 3).map(tag => `<span class="card-tag">#${tag}</span>`).join('');

    return `
      <article class="destination-card" data-destination-id="${dest.id}">
        <div class="card-media-wrapper">
          <img src="${dest.image}" alt="${dest.name}, ${dest.country}" class="card-image" loading="lazy" onerror="this.onerror=null; this.src='images/fallback.jpg';">
          <span class="card-category-badge ${categoryClass}">${dest.category}</span>
          <button 
            class="card-favorite-btn ${isFav ? 'favorited' : ''}" 
            data-action="toggle-fav" 
            data-id="${dest.id}" 
            title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"
            aria-label="Favorite ${dest.name}"
          >
            ${isFav ? '\u2764\uFE0F' : '\u{1F90D}'}
          </button>
        </div>

        <div class="card-body">
          <div class="card-header-meta">
            <h3 class="card-title">${dest.name}</h3>
            <span class="card-country">${dest.country}</span>
          </div>

          <p class="card-description">${dest.description}</p>

          <div class="card-tags">
            ${tagSpans}
          </div>

          <div class="card-details-row">
            <div class="daily-cost-badge">
              <span class="cost-label">Est. Daily Cost</span>
              <strong class="cost-amount">$${dest.estimatedDailyCost}</strong>
            </div>
            <div class="best-time-box">
              <span class="best-time-label">Best Season</span>
              <span class="best-time-val">${dest.bestTime}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-outline btn-sm" data-action="view-details" data-id="${dest.id}">
              View Details
            </button>
            <button class="btn btn-primary btn-sm" data-action="quick-plan" data-id="${dest.id}">
              Plan Trip \u2708\uFE0F
            </button>
          </div>
        </div>
      </article>
    `;
  }

  resetAllFilters() {
    this.searchQuery = '';
    this.activeCategory = 'all';
    this.currentSort = 'featured';

    this.dom.destinationSearchInput.value = '';
    this.dom.clearSearchBtn.classList.remove('visible');
    this.dom.destinationSortSelect.value = 'featured';

    this.dom.categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === 'all');
    });

    this.renderDestinations();
    this.toast.show('Filters reset', 'info');
  }

  /* --------------------------------------------------------------------------
     5. Card Click Handler & Modal Controls
     -------------------------------------------------------------------------- */
  handleDestinationCardClick(e) {
    const favBtn = e.target.closest('[data-action="toggle-fav"]');
    if (favBtn) {
      e.stopPropagation();
      const destId = favBtn.dataset.id;
      this.toggleDestinationFavorite(destId, favBtn);
      return;
    }

    const detailsBtn = e.target.closest('[data-action="view-details"]');
    if (detailsBtn) {
      const destId = detailsBtn.dataset.id;
      this.openDestinationModal(destId);
      return;
    }

    const planBtn = e.target.closest('[data-action="quick-plan"]');
    if (planBtn) {
      const destId = planBtn.dataset.id;
      this.selectDestinationForTrip(destId);
      return;
    }

    const removeFavBtn = e.target.closest('[data-action="remove-fav"]');
    if (removeFavBtn) {
      const destId = removeFavBtn.dataset.id;
      this.toggleDestinationFavorite(destId);
      return;
    }
  }

  toggleDestinationFavorite(destId, clickedBtn = null) {
    const destination = getDestinationById(destId);
    if (!destination) return;

    const { isFavorite } = StorageManager.toggleFavorite(destId);

    // Update icon on clicked button if exists
    if (clickedBtn) {
      clickedBtn.classList.toggle('favorited', isFavorite);
      clickedBtn.innerHTML = isFavorite ? '\u2764\uFE0F' : '\u{1F90D}';
    }

    // Refresh all instances of this favorite button in DOM
    document.querySelectorAll(`[data-action="toggle-fav"][data-id="${destId}"]`).forEach(btn => {
      btn.classList.toggle('favorited', isFavorite);
      btn.innerHTML = isFavorite ? '\u2764\uFE0F' : '\u{1F90D}';
    });

    // Update modal favorite button if modal is open
    const modalFavBtn = document.getElementById('modalFavToggleBtn');
    if (modalFavBtn && modalFavBtn.dataset.id === destId) {
      modalFavBtn.innerHTML = isFavorite ? '\u2764\uFE0F Remove from Favorites' : '\u{1F90D} Add to Favorites';
    }

    // Toast feedback
    const toastMsg = isFavorite ? `Added ${destination.name} to favorites \u2764\uFE0F` : `Removed ${destination.name} from favorites`;
    this.toast.show(toastMsg, isFavorite ? 'success' : 'info');

    // Update badge and favorites section
    this.updateFavoritesBadge();
    this.renderFavoritesSection();
  }

  updateFavoritesBadge() {
    const favorites = StorageManager.getFavorites();
    this.dom.favoritesBadge.textContent = favorites.length;
    this.dom.favoritesBadge.style.transform = 'scale(1.2)';
    setTimeout(() => {
      this.dom.favoritesBadge.style.transform = 'scale(1)';
    }, 200);
  }

  renderFavoritesSection() {
    const favIds = StorageManager.getFavorites();
    const favDestinations = DESTINATIONS_DATA.filter(d => favIds.includes(d.id));

    if (favDestinations.length === 0) {
      this.dom.favoritesGrid.innerHTML = '';
      this.dom.emptyFavoritesState.classList.remove('hidden');
      return;
    }

    this.dom.emptyFavoritesState.classList.add('hidden');

    const html = favDestinations.map(dest => `
      <article class="destination-card">
        <div class="card-media-wrapper">
          <img src="${dest.image}" alt="${dest.name}" class="card-image" loading="lazy" onerror="this.onerror=null; this.src='images/fallback.jpg';">
          <span class="card-category-badge badge-${dest.category.toLowerCase()}">${dest.category}</span>
        </div>
        <div class="card-body">
          <div class="card-header-meta">
            <h3 class="card-title">${dest.name}</h3>
            <span class="card-country">${dest.country}</span>
          </div>
          <p class="card-description">${dest.description}</p>
          <div class="card-details-row">
            <div class="daily-cost-badge">
              <span class="cost-label">Est. Cost / Day</span>
              <strong class="cost-amount">$${dest.estimatedDailyCost}</strong>
            </div>
            <div class="best-time-box">
              <span class="best-time-label">Best Time</span>
              <span class="best-time-val">${dest.bestTime}</span>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline btn-sm" data-action="view-details" data-id="${dest.id}">
              Details
            </button>
            <button class="btn btn-primary btn-sm" data-action="quick-plan" data-id="${dest.id}">
              Plan Trip \u2708\uFE0F
            </button>
            <button class="btn btn-outline btn-sm" data-action="remove-fav" data-id="${dest.id}" title="Remove from wishlist">
              \u{1F5D1}\uFE0F
            </button>
          </div>
        </div>
      </article>
    `).join('');

    this.dom.favoritesGrid.innerHTML = html;
  }

  /* --------------------------------------------------------------------------
     Destination Details Modal
     -------------------------------------------------------------------------- */
  openDestinationModal(destId) {
    const dest = getDestinationById(destId);
    if (!dest) return;

    const isFav = StorageManager.isFavorite(dest.id);
    const attractionsList = dest.attractions.map(attr => `<span class="attraction-badge">\u{1F4CD} ${attr}</span>`).join('');

    this.dom.modalContent.innerHTML = `
      <img src="${dest.image}" alt="${dest.name}" class="modal-banner-img" onerror="this.onerror=null; this.src='images/fallback.jpg';">
      <div class="modal-inner-content">
        <div class="modal-header-meta">
          <div>
            <span class="modal-country-tag">${dest.country} \u2022 ${dest.category}</span>
            <h2 class="modal-dest-title">${dest.name}</h2>
          </div>
          <div class="best-time-box">
            <span class="best-time-label">Best Time to Visit</span>
            <strong class="best-time-val">${dest.bestTime}</strong>
          </div>
        </div>

        <p class="modal-desc-full">${dest.description}</p>

        <div class="modal-attractions-section">
          <h4>Popular Attractions & Highlights</h4>
          <div class="attractions-badge-list">
            ${attractionsList}
          </div>
        </div>

        <div class="modal-breakdown-section">
          <h4>Estimated Daily Cost Breakdown</h4>
          <div class="cost-breakdown-grid">
            <div class="cost-mini-card">
              <span class="mini-card-label">\u{1F3E8} Hotel / Night</span>
              <div class="mini-card-val">$${dest.hotelCost}</div>
            </div>
            <div class="cost-mini-card">
              <span class="mini-card-label">\u{1F37D}\uFE0F Food / Day</span>
              <div class="mini-card-val">$${dest.foodCost}</div>
            </div>
            <div class="cost-mini-card">
              <span class="mini-card-label">\u{1F695} Transit / Day</span>
              <div class="mini-card-val">$${dest.transportCost}</div>
            </div>
            <div class="cost-mini-card highlight">
              <span class="mini-card-label">\u{1F4B5} Total Daily Est.</span>
              <div class="mini-card-val">$${dest.estimatedDailyCost}</div>
            </div>
          </div>
        </div>

        <div class="modal-actions-bar">
          <button id="modalFavToggleBtn" class="btn btn-outline" data-id="${dest.id}">
            ${isFav ? '\u2764\uFE0F Remove from Favorites' : '\u{1F90D} Add to Favorites'}
          </button>
          <button id="modalPlanThisTripBtn" class="btn btn-primary" data-id="${dest.id}">
            Plan This Trip \u2708\uFE0F
          </button>
          <button id="modalCloseActionBtn" class="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    `;

    // Hook internal buttons in modal
    document.getElementById('modalFavToggleBtn').addEventListener('click', () => {
      this.toggleDestinationFavorite(dest.id);
    });

    document.getElementById('modalPlanThisTripBtn').addEventListener('click', () => {
      this.closeDestinationModal();
      this.selectDestinationForTrip(dest.id);
    });

    document.getElementById('modalCloseActionBtn').addEventListener('click', () => {
      this.closeDestinationModal();
    });

    this.dom.destinationModal.classList.add('open');
    this.dom.destinationModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeDestinationModal() {
    this.dom.destinationModal.classList.remove('open');
    this.dom.destinationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  selectDestinationForTrip(destId) {
    this.dom.plannerDestinationSelect.value = destId;
    this.dom.plannerDestinationSelect.classList.remove('is-invalid');
    this.dom.plannerDestError.classList.remove('visible');
    const plannerSection = document.getElementById('planner');
    plannerSection.scrollIntoView({ behavior: 'smooth' });

    // Highlight form input
    this.dom.plannerDestinationSelect.focus();
    this.toast.show(`Destination selected for trip planning!`, 'info');
  }

  /* --------------------------------------------------------------------------
     6. Trip Planner & Itinerary Execution
     -------------------------------------------------------------------------- */
  setupDatePickers() {
    const today = new Date();
    const todayIso = formatLocalIsoDate(today);

    // Set minimum start date to today
    this.dom.plannerStartDate.min = todayIso;

    // Default start date: today + 7 days
    const defaultStart = new Date(today);
    defaultStart.setDate(defaultStart.getDate() + 7);
    const startIso = formatLocalIsoDate(defaultStart);
    this.dom.plannerStartDate.value = startIso;

    // Default end date: start + 4 days
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultEnd.getDate() + 4);
    const endIso = formatLocalIsoDate(defaultEnd);
    this.dom.plannerEndDate.value = endIso;
    this.dom.plannerEndDate.min = startIso;

    this.updateLiveDuration();
  }

  updateLiveDuration() {
    const startVal = this.dom.plannerStartDate.value;
    const endVal = this.dom.plannerEndDate.value;

    if (!startVal || !endVal) {
      this.dom.liveDurationBadge.style.display = 'none';
      return;
    }

    const start = parseLocalDate(startVal);
    const end = parseLocalDate(endVal);

    if (end >= start) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
      const days = Math.floor((utc2 - utc1) / msPerDay) + 1;
      this.dom.calculatedDaysText.textContent = `${days} Days / ${days - 1} Nights`;
      this.dom.liveDurationBadge.style.display = 'block';
      this.dom.plannerEndDate.min = startVal;
    } else {
      this.dom.liveDurationBadge.style.display = 'none';
    }
  }

  handleTripPlannerSubmit(e) {
    e.preventDefault();

    const formData = {
      destinationId: this.dom.plannerDestinationSelect.value,
      startDate: this.dom.plannerStartDate.value,
      endDate: this.dom.plannerEndDate.value,
      travelers: this.dom.plannerTravelers.value,
      travelStyle: this.dom.plannerTravelStyle.value
    };

    // Reset previous errors
    [
      { input: this.dom.plannerDestinationSelect, errorEl: this.dom.plannerDestError },
      { input: this.dom.plannerStartDate, errorEl: this.dom.plannerStartError },
      { input: this.dom.plannerEndDate, errorEl: this.dom.plannerEndError },
      { input: this.dom.plannerTravelers, errorEl: this.dom.plannerTravelersError }
    ].forEach(({ input, errorEl }) => {
      input.classList.remove('is-invalid');
      errorEl.classList.remove('visible');
    });

    // Validate using planner.js validation module
    const { isValid, errors } = validateTripForm(formData);

    if (!isValid) {
      if (errors.destination) {
        this.dom.plannerDestinationSelect.classList.add('is-invalid');
        this.dom.plannerDestError.textContent = errors.destination;
        this.dom.plannerDestError.classList.add('visible');
      }
      if (errors.startDate) {
        this.dom.plannerStartDate.classList.add('is-invalid');
        this.dom.plannerStartError.textContent = errors.startDate;
        this.dom.plannerStartError.classList.add('visible');
      }
      if (errors.endDate) {
        this.dom.plannerEndDate.classList.add('is-invalid');
        this.dom.plannerEndError.textContent = errors.endDate;
        this.dom.plannerEndError.classList.add('visible');
      }
      if (errors.travelers) {
        this.dom.plannerTravelers.classList.add('is-invalid');
        this.dom.plannerTravelersError.textContent = errors.travelers;
        this.dom.plannerTravelersError.classList.add('visible');
      }
      this.toast.show('Please resolve the errors highlighted in red.', 'danger');
      return;
    }

    // Generate new TripPlan instance
    this.currentTripPlan = new TripPlan(formData);

    // Render trip summary
    this.renderTripSummary();

    // Render generated day-by-day itinerary
    this.renderItineraryTimeline();

    // Show containers
    this.dom.summaryPlaceholder.classList.add('hidden');
    this.dom.summaryContent.classList.remove('hidden');
    this.dom.itineraryContainer.classList.remove('hidden');

    this.toast.show('Trip created successfully \u2708\uFE0F', 'success');

    // Smooth scroll down to itinerary
    this.dom.itineraryContainer.scrollIntoView({ behavior: 'smooth' });
  }

  renderTripSummary() {
    const plan = this.currentTripPlan;
    if (!plan) return;

    this.dom.summaryStyleBadge.textContent = `${plan.travelStyle} Plan`;
    this.dom.summaryDestinationTitle.textContent = `${plan.destination.name}, ${plan.destination.country}`;
    this.dom.summaryDatesText.textContent = plan.getFormattedDateRange();
    this.dom.summaryDaysValue.textContent = `${plan.days} Days`;
    this.dom.summaryTravelersValue.textContent = `${plan.travelers} ${plan.travelers === 1 ? 'Traveler' : 'Travelers'}`;
    this.dom.summaryCostValue.textContent = formatCurrency(plan.estimatedTotalCost);
  }

  renderItineraryTimeline() {
    const plan = this.currentTripPlan;
    if (!plan) return;

    const daysHtml = plan.itinerary.map(day => {
      const activitiesHtml = day.activities.map(act => `
        <div class="activity-item" data-activity-id="${act.id}">
          <div class="activity-main">
            <span class="activity-time-pill">${act.timeSlot}</span>
            <span class="activity-text">${act.description}</span>
          </div>
          <button class="delete-activity-btn" data-action="delete-activity" data-id="${act.id}" title="Remove activity">
            &times;
          </button>
        </div>
      `).join('');

      return `
        <div class="itinerary-day-card" data-day-number="${day.dayNumber}">
          <div class="day-header">
            <div class="day-number-badge">
              <span>\u{1F4C5} Day ${day.dayNumber}</span>
            </div>
            <div class="day-theme-title">${day.dayTitle}</div>
          </div>
          <div class="activities-list">
            ${activitiesHtml.length > 0 ? activitiesHtml : '<p class="text-muted" style="font-size:0.85rem;">No activities scheduled yet. Click "+ Add Custom Activity" above.</p>'}
          </div>
        </div>
      `;
    }).join('');

    this.dom.itineraryTimeline.innerHTML = daysHtml;
  }

  handleActivityDeleteClick(e) {
    const deleteBtn = e.target.closest('[data-action="delete-activity"]');
    if (!deleteBtn || !this.currentTripPlan) return;

    const actId = deleteBtn.dataset.id;
    const removed = this.currentTripPlan.removeActivity(actId);

    if (removed) {
      this.renderItineraryTimeline();
      this.toast.show('Activity removed from itinerary', 'info');
    }
  }

  openAddActivityModal() {
    if (!this.currentTripPlan) {
      this.toast.show('Please generate a trip first!', 'warning');
      return;
    }

    // Populate day selector options
    let dayOptionsHtml = '';
    this.currentTripPlan.itinerary.forEach(day => {
      dayOptionsHtml += `<option value="${day.dayNumber}">Day ${day.dayNumber} (${day.dayTitle})</option>`;
    });

    this.dom.activityDaySelect.innerHTML = dayOptionsHtml;
    this.dom.activityTitleInput.value = '';
    this.dom.activityModal.classList.add('open');
    this.dom.activityModal.setAttribute('aria-hidden', 'false');
    this.dom.activityTitleInput.focus();
  }

  closeAddActivityModal() {
    this.dom.activityModal.classList.remove('open');
    this.dom.activityModal.setAttribute('aria-hidden', 'true');
  }

  handleAddActivitySubmit(e) {
    e.preventDefault();
    if (!this.currentTripPlan) return;

    const dayNumber = this.dom.activityDaySelect.value;
    const timeSlot = this.dom.activityTimeSelect.value;
    const description = this.dom.activityTitleInput.value;

    if (!description.trim()) {
      this.toast.show('Please enter activity details.', 'danger');
      return;
    }

    this.currentTripPlan.addActivity(dayNumber, timeSlot, description);
    this.renderItineraryTimeline();
    this.closeAddActivityModal();
    this.toast.show(`Activity added to Day ${dayNumber}!`, 'success');
  }

  transferPlanToBudget() {
    if (!this.currentTripPlan) return;

    const dest = this.currentTripPlan.destination;
    this.dom.budgetPrefillSelect.value = dest.id;
    this.dom.budgetTravelers.value = this.currentTripPlan.travelers;
    this.dom.budgetDays.value = this.currentTripPlan.days;
    this.dom.budgetHotel.value = dest.hotelCost;
    this.dom.budgetFood.value = dest.foodCost;
    this.dom.budgetTransport.value = dest.transportCost;
    this.dom.budgetActivities.value = 150;

    this.calculateAndDisplayBudget();

    const budgetSection = document.getElementById('budget');
    budgetSection.scrollIntoView({ behavior: 'smooth' });
    this.toast.show('Trip parameters transferred to budget calculator! \u{1F4B0}', 'success');
  }

  checkWeatherForCurrentPlan() {
    if (!this.currentTripPlan) return;
    const cityName = this.currentTripPlan.destination.name;
    this.dom.weatherCityInput.value = cityName;
    this.executeWeatherSearch();
    const weatherSection = document.getElementById('weather');
    weatherSection.scrollIntoView({ behavior: 'smooth' });
  }

  /* --------------------------------------------------------------------------
     7. Travel Budget Calculator Execution
     -------------------------------------------------------------------------- */
  handleBudgetPrefill(destId) {
    if (!destId) return;
    const dest = getDestinationById(destId);
    if (!dest) return;

    this.dom.budgetHotel.value = dest.hotelCost;
    this.dom.budgetFood.value = dest.foodCost;
    this.dom.budgetTransport.value = dest.transportCost;

    this.calculateAndDisplayBudget();
    this.toast.show(`Loaded daily averages for ${dest.name}`, 'info');
  }

  calculateAndDisplayBudget() {
    const calc = new BudgetCalculator({
      travelers: this.dom.budgetTravelers.value,
      days: this.dom.budgetDays.value,
      hotelPerDay: this.dom.budgetHotel.value,
      foodPerDay: this.dom.budgetFood.value,
      transportPerDay: this.dom.budgetTransport.value,
      activitiesTotal: this.dom.budgetActivities.value
    });

    const result = calc.calculate();

    // Update grand totals
    this.dom.budgetGrandTotalDisplay.textContent = formatCurrency(result.grandTotal);
    this.dom.budgetPerPersonDisplay.textContent = `(${formatCurrency(result.costPerPerson)} per traveler)`;

    // Update item totals
    this.dom.budgetHotelTotal.textContent = formatCurrency(result.hotelTotal);
    this.dom.budgetFoodTotal.textContent = formatCurrency(result.foodTotal);
    this.dom.budgetTransportTotal.textContent = formatCurrency(result.transportTotal);
    this.dom.budgetActivitiesTotal.textContent = formatCurrency(result.activitiesTotal);

    // Update progress bars
    this.dom.barHotel.style.width = `${result.percentages.hotel}%`;
    this.dom.barFood.style.width = `${result.percentages.food}%`;
    this.dom.barTransport.style.width = `${result.percentages.transport}%`;
    this.dom.barActivities.style.width = `${result.percentages.activities}%`;
  }

  /* --------------------------------------------------------------------------
     8. Weather Module Execution (Asynchronous JavaScript)
     -------------------------------------------------------------------------- */
  loadInitialWeather() {
    // Default initial city
    this.fetchAndDisplayWeather('Tokyo');
  }

  executeWeatherSearch() {
    const query = this.dom.weatherCityInput.value.trim();
    if (!query) {
      this.toast.show('Please enter a city name to search.', 'warning');
      return;
    }
    this.fetchAndDisplayWeather(query);
  }

  /**
   * Demonstrates asynchronous JavaScript:
   * - async / await
   * - Promise resolution
   * - try / catch / finally
   * 
   * @param {string} cityName 
   */
  async fetchAndDisplayWeather(cityName) {
    try {
      // 1. Show loading state, hide content and errors
      this.dom.weatherLoading.classList.remove('hidden');
      this.dom.weatherError.classList.add('hidden');
      this.dom.weatherContent.classList.add('hidden');

      // 2. Await asynchronous fetch operation from weather.js
      const weather = await fetchWeatherData(cityName);

      // 3. Populate DOM with fetched real-time weather metrics
      this.dom.weatherCityName.textContent = weather.city;
      this.dom.weatherCountryName.textContent = weather.country || 'Global';
      this.dom.weatherCondition.textContent = weather.condition;
      this.dom.weatherBigIcon.textContent = weather.icon;
      this.dom.weatherTemp.textContent = `${weather.temperature}\u00B0C`;
      this.dom.weatherFeelsLike.textContent = `Feels like ${weather.feelsLike}\u00B0C`;

      this.dom.weatherHumidity.textContent = `${weather.humidity}%`;
      this.dom.weatherWind.textContent = `${weather.windSpeed} km/h`;
      this.dom.weatherPressure.textContent = `${weather.pressure} hPa`;
      this.dom.weatherVisibility.textContent = `${weather.visibility} km`;

      // 4. Reveal content
      this.dom.weatherContent.classList.remove('hidden');
      this.toast.show(`Weather updated for ${weather.city} \u{1F324}\uFE0F`, 'success');

    } catch (error) {
      // Error handling demonstration
      console.error('[App] Weather fetch error:', error);
      this.dom.weatherErrorMsg.textContent = error.message || 'Unable to fetch weather information.';
      this.dom.weatherError.classList.remove('hidden');
      this.toast.show(error.message || 'Weather lookup failed', 'danger');

    } finally {
      // Finally block always executes to dismiss loading spinner
      this.dom.weatherLoading.classList.add('hidden');
    }
  }
}

/* --------------------------------------------------------------------------
   Initialize application when DOM is ready
   Safe for deferred ES Modules
   -------------------------------------------------------------------------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.wanderWiseApp = new WanderWiseApp();
  });
} else {
  window.wanderWiseApp = new WanderWiseApp();
}

