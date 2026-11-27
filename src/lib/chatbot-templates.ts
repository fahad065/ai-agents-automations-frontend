// Per-template wording and fields for a chatbot's settings (Locations tab,
// booking link on Overview). Keyed by Chatbot.template on the backend
// (chatbot.schema.ts). A gym shouldn't be asked for delivery apps, and a
// restaurant's "facilities" aren't a clinic's "services".

export interface ChatbotTemplateProfile {
  /** "restaurant", "gym"… — used in "Enter gym name". */
  business: string;
  /** What one location is called in this business. */
  branch: string;
  /** Label for the per-branch list of what it offers (stored as `facilities`). */
  facilitiesLabel: string;
  /** Delivery apps + "delivery-only kitchen" switch (restaurants only). */
  delivery: boolean;
  /** "Insurance accepted" list on each branch (clinics). */
  insurance?: boolean;
  /** Optional "no walk-in customers" switch for this business type. */
  onlineOnly?: { title: string; hint: string; badge: string };
  /** Label + hint for the per-branch area list (default "Nearby areas"). */
  areasLabel?: string;
  areasHint?: string;
  bookingLabel: string;
  bookingHelp: string;
}

const DEFAULT_PROFILE: ChatbotTemplateProfile = {
  business: "business",
  branch: "branch",
  facilitiesLabel: "Facilities / services",
  delivery: false,
  bookingLabel: "Booking link",
  bookingHelp: "If a customer wants to book, the bot shares this link.",
};

const PROFILES: Record<string, Partial<ChatbotTemplateProfile>> = {
  restaurant: {
    business: "restaurant",
    facilitiesLabel: "Facilities",
    delivery: true,
    onlineOnly: { title: "Delivery-only kitchen", hint: "No dine-in at this branch.", badge: "DELIVERY ONLY" },
    bookingLabel: "Table reservation link",
    bookingHelp: "If a guest wants to reserve a table, the bot shares this link.",
  },
  gym: {
    business: "gym",
    facilitiesLabel: "Facilities",
    bookingLabel: "Free trial / class booking link",
    bookingHelp: "If a visitor wants a free trial or to book a class, the bot shares this link.",
  },
  clinic: {
    business: "clinic",
    facilitiesLabel: "Services / specialities",
    insurance: true,
    bookingLabel: "Appointment booking link",
    bookingHelp: "If a patient wants an appointment, the bot shares this link.",
  },
  salon: {
    business: "salon",
    facilitiesLabel: "Services offered",
    bookingLabel: "Appointment booking link",
    bookingHelp: "If a client wants an appointment, the bot shares this link.",
  },
  hotel: {
    business: "hotel",
    branch: "property",
    facilitiesLabel: "Facilities & amenities",
    bookingLabel: "Room booking link",
    bookingHelp: "If a guest wants to book a room, the bot shares this link.",
  },
  real_estate: {
    business: "agency",
    branch: "office",
    facilitiesLabel: "Areas & property types covered",
    bookingLabel: "Viewing booking link",
    bookingHelp: "If a client wants to book a viewing or a call, the bot shares this link.",
  },
  auto_dealership: {
    business: "dealership",
    branch: "showroom",
    facilitiesLabel: "Brands & services",
    bookingLabel: "Test drive booking link",
    bookingHelp: "If a customer wants a test drive or a service appointment, the bot shares this link.",
  },
  home_services: {
    business: "company",
    facilitiesLabel: "Services offered",
    onlineOnly: { title: "No walk-in office", hint: "Customers don't visit this branch — your team goes to them.", badge: "MOBILE TEAM" },
    areasLabel: "Areas covered",
    areasHint: 'Helps the bot answer "do you cover …?". List districts, neighbourhoods or postcodes.',
    bookingLabel: "Service booking link",
    bookingHelp: "If a customer wants to book a job, the bot shares this link.",
  },
};

// Clinics list the insurance plans each branch accepts (any country).
export function showsInsurance(profile: ChatbotTemplateProfile): boolean {
  return !!profile.insurance;
}

export function chatbotTemplateProfile(template?: string): ChatbotTemplateProfile {
  return { ...DEFAULT_PROFILE, ...(template ? PROFILES[template] : {}) };
}

// Service slug (catalog) → Chatbot.template (backend enum), plus the emoji
// and short name used on chatbot cards.
export const SERVICE_SLUG_TO_TEMPLATE: Record<string, string> = {
  "restaurant-chatbot": "restaurant",
  "real-estate-chatbot": "real_estate",
  "clinic-chatbot": "clinic",
  "gym-chatbot": "gym",
  "salon-chatbot": "salon",
  "hotel-chatbot": "hotel",
  "auto-dealership-chatbot": "auto_dealership",
  "home-services-chatbot": "home_services",
};

export const CHATBOT_TEMPLATE_META: Record<string, { emoji: string; name: string }> = {
  restaurant: { emoji: "🍽️", name: "Restaurant" },
  real_estate: { emoji: "🏠", name: "Real Estate" },
  clinic: { emoji: "🩺", name: "Clinic" },
  gym: { emoji: "🏋️", name: "Gym" },
  salon: { emoji: "💇", name: "Salon / Spa" },
  hotel: { emoji: "🏨", name: "Hotel / Travel" },
  auto_dealership: { emoji: "🚗", name: "Auto Dealership" },
  home_services: { emoji: "🛠️", name: "Home Services" },
  custom: { emoji: "✨", name: "Custom" },
};
