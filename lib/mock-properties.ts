export type Property = {
  id: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  daduOpportunity: {
    parcelSize: string;
    existingFootprint: string;
    currentLotCoverage: string;
    zoning: string;
    setbackConstraints: string;
    estimatedDaduPotential: string;
  };
  imageClass: string;
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    price: 875000,
    address: "742 Evergreen Terrace",
    city: "Springfield",
    state: "OR",
    zip: "97477",
    beds: 4,
    baths: 3,
    sqft: 2400,
    description:
      "Classic two-story home with a fully updated kitchen, generous backyard deck, and flexible bonus room ideal for a home office.",
    daduOpportunity: {
      parcelSize: "8,100 sqft",
      existingFootprint: "2,450 sqft",
      currentLotCoverage: "30.2%",
      zoning: "R-1 Low Density Residential",
      setbackConstraints: "Front 20 ft, side 6 ft, rear 15 ft",
      estimatedDaduPotential: "Moderate",
    },
    imageClass: "from-slate-600 to-slate-800",
  },
  {
    id: "2",
    price: 429900,
    address: "1842 Maple Ave",
    city: "Portland",
    state: "OR",
    zip: "97214",
    beds: 3,
    baths: 2,
    sqft: 1650,
    description:
      "Light-filled bungalow near parks and cafes, featuring hardwood floors, a modern primary suite, and a private fenced yard.",
    daduOpportunity: {
      parcelSize: "5,000 sqft",
      existingFootprint: "1,920 sqft",
      currentLotCoverage: "38.4%",
      zoning: "R-5 Residential",
      setbackConstraints: "Front 10 ft, side 5 ft, rear 10 ft",
      estimatedDaduPotential: "Low to moderate",
    },
    imageClass: "from-stone-500 to-stone-700",
  },
  {
    id: "3",
    price: 1195000,
    address: "88 Ocean View Dr",
    city: "Newport",
    state: "OR",
    zip: "97365",
    beds: 5,
    baths: 4,
    sqft: 3200,
    description:
      "Coastal-view property with open-concept living, oversized windows, and a spacious entertaining kitchen with premium finishes.",
    daduOpportunity: {
      parcelSize: "10,800 sqft",
      existingFootprint: "2,900 sqft",
      currentLotCoverage: "26.9%",
      zoning: "R-2 Medium Density Residential",
      setbackConstraints: "Front 20 ft, side 7 ft, rear 20 ft",
      estimatedDaduPotential: "High",
    },
    imageClass: "from-sky-600 to-indigo-800",
  },
  {
    id: "4",
    price: 349500,
    address: "1205 Birch St",
    city: "Eugene",
    state: "OR",
    zip: "97401",
    beds: 2,
    baths: 2,
    sqft: 1180,
    description:
      "Thoughtfully renovated single-level home with new appliances, efficient layout, and low-maintenance landscaping.",
    daduOpportunity: {
      parcelSize: "4,500 sqft",
      existingFootprint: "1,430 sqft",
      currentLotCoverage: "31.8%",
      zoning: "R-1 Compact Residential",
      setbackConstraints: "Front 15 ft, side 5 ft, rear 10 ft",
      estimatedDaduPotential: "Moderate",
    },
    imageClass: "from-neutral-500 to-neutral-700",
  },
  {
    id: "5",
    price: 639000,
    address: "400 Cedar Ln",
    city: "Bend",
    state: "OR",
    zip: "97701",
    beds: 3,
    baths: 2,
    sqft: 1980,
    description:
      "Contemporary mountain-modern home with vaulted ceilings, gas fireplace, and seamless indoor-outdoor living.",
    daduOpportunity: {
      parcelSize: "7,800 sqft",
      existingFootprint: "2,050 sqft",
      currentLotCoverage: "26.3%",
      zoning: "RS Urban Residential Standard",
      setbackConstraints: "Front 15 ft, side 5 ft, rear 12 ft",
      estimatedDaduPotential: "High",
    },
    imageClass: "from-amber-600 to-orange-900",
  },
  {
    id: "6",
    price: 995000,
    address: "15 Summit Ridge",
    city: "Lake Oswego",
    state: "OR",
    zip: "97034",
    beds: 4,
    baths: 3,
    sqft: 2750,
    description:
      "Elegant residence in a quiet neighborhood with a chef's kitchen, large primary retreat, and landscaped patio.",
    daduOpportunity: {
      parcelSize: "9,200 sqft",
      existingFootprint: "3,050 sqft",
      currentLotCoverage: "33.2%",
      zoning: "R-7.5 Residential",
      setbackConstraints: "Front 20 ft, side 7 ft, rear 15 ft",
      estimatedDaduPotential: "Moderate",
    },
    imageClass: "from-teal-600 to-emerald-900",
  },
  {
    id: "7",
    price: 275000,
    address: "903 Willow Creek Rd",
    city: "Salem",
    state: "OR",
    zip: "97301",
    beds: 2,
    baths: 1,
    sqft: 920,
    description:
      "Charming starter home with refreshed interiors, efficient floorplan, and easy access to commuter routes.",
    daduOpportunity: {
      parcelSize: "6,000 sqft",
      existingFootprint: "1,150 sqft",
      currentLotCoverage: "19.2%",
      zoning: "RM1 Multi-Dwelling Residential",
      setbackConstraints: "Front 12 ft, side 5 ft, rear 10 ft",
      estimatedDaduPotential: "High",
    },
    imageClass: "from-zinc-500 to-zinc-700",
  },
  {
    id: "8",
    price: 1549000,
    address: "2 Harborside Way",
    city: "Astoria",
    state: "OR",
    zip: "97103",
    beds: 4,
    baths: 4,
    sqft: 3100,
    description:
      "Waterfront-inspired design with panoramic upper-level living, luxury bath finishes, and generous storage throughout.",
    daduOpportunity: {
      parcelSize: "11,400 sqft",
      existingFootprint: "3,400 sqft",
      currentLotCoverage: "29.8%",
      zoning: "R-2 Residential with coastal overlay",
      setbackConstraints: "Front 20 ft, side 8 ft, rear 25 ft",
      estimatedDaduPotential: "Moderate to high",
    },
    imageClass: "from-blue-700 to-slate-900",
  },
];

export function getPropertyById(id: string) {
  return MOCK_PROPERTIES.find((property) => property.id === id);
}
