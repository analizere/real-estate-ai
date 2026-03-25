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
    imageClass: "from-blue-700 to-slate-900",
  },
];

export function getPropertyById(id: string) {
  return MOCK_PROPERTIES.find((property) => property.id === id);
}
