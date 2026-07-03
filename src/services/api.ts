import { z } from 'zod';

import type { Circle, EventItem, Restaurant } from '../types';

const shareModeSchema = z.enum(['exact', 'approx', 'hidden']);

export const circleSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.number().int().positive(),
  shareMode: shareModeSchema,
});

export const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  distance: z.number().nonnegative(),
  open: z.boolean(),
  rating: z.number().min(0).max(5),
  cuisines: z.array(z.string()).min(1),
  price: z.string(),
  address: z.string(),
  menu: z.array(z.string()).min(1),
  hero: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  venue: z.string(),
  distance: z.number().nonnegative(),
  category: z.string(),
  hero: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const circles: Circle[] = [
  { id: 'family-pmb', name: 'Family PMB', members: 7, shareMode: 'approx' },
  { id: 'audit-team', name: 'Audit Team', members: 12, shareMode: 'hidden' },
  { id: 'vuka-darkie-ops', name: 'Vuka Darkie Ops', members: 5, shareMode: 'exact' },
];

export const restaurants: Restaurant[] = [
  {
    id: 'sultans-shawarma',
    name: "Sultan's Shawarma",
    distance: 0.8,
    open: true,
    rating: 4.7,
    cuisines: ['Middle Eastern', 'Fast casual'],
    price: '$$',
    address: 'Chief Albert Luthuli Street, Pietermaritzburg',
    menu: ['Chicken shawarma', 'Falafel wrap', 'Mint lemonade'],
    hero: 'Shawarma wraps and grills',
    lat: -29.6029,
    lng: 30.3794,
  },
  {
    id: 'vusis-grill',
    name: "Vusi's Grill",
    distance: 1.4,
    open: true,
    rating: 4.6,
    cuisines: ['Grill', 'South African'],
    price: '$$',
    address: 'Victoria Road, Pietermaritzburg',
    menu: ['Flame-grilled chicken', 'Pap and chakalaka', 'Beef kebabs'],
    hero: 'Local grill plates',
    lat: -29.5959,
    lng: 30.3847,
  },
  {
    id: 'lotus-veg',
    name: 'Lotus Veg',
    distance: 2.3,
    open: false,
    rating: 4.5,
    cuisines: ['Vegetarian', 'Indian'],
    price: '$',
    address: 'Langalibalele Street, Pietermaritzburg',
    menu: ['Paneer bunny chow', 'Masala dosa', 'Mango lassi'],
    hero: 'Vegetarian curries',
    lat: -29.6066,
    lng: 30.3718,
  },
  {
    id: 'liberty-coffee-yard',
    name: 'Liberty Coffee Yard',
    distance: 3.1,
    open: true,
    rating: 4.4,
    cuisines: ['Coffee', 'Bakery'],
    price: '$',
    address: 'Hayfields Mall, Pietermaritzburg',
    menu: ['Flat white', 'Croissant', 'Chicken mayo toastie'],
    hero: 'Coffee and pastries',
    lat: -29.6268,
    lng: 30.3923,
  },
  {
    id: 'royal-curry-house',
    name: 'Royal Curry House',
    distance: 4.7,
    open: true,
    rating: 4.8,
    cuisines: ['Indian', 'Curry'],
    price: '$$',
    address: 'Scottsville, Pietermaritzburg',
    menu: ['Mutton curry', 'Butter chicken', 'Garlic naan'],
    hero: 'Durban-style curries',
    lat: -29.6201,
    lng: 30.4046,
  },
  {
    id: 'garden-bowl',
    name: 'Garden Bowl',
    distance: 6.2,
    open: false,
    rating: 4.2,
    cuisines: ['Healthy', 'Salads'],
    price: '$$',
    address: 'Cascades Centre, Pietermaritzburg',
    menu: ['Harvest bowl', 'Green smoothie', 'Protein salad'],
    hero: 'Fresh bowls',
    lat: -29.5687,
    lng: 30.3399,
  },
];

export const events: EventItem[] = [
  {
    id: 'pmb-comedy-night',
    title: 'PMB Comedy Night',
    date: 'Sat, 4 Jul - 19:30',
    venue: 'The Hexagon Theatre',
    distance: 1.9,
    category: 'Comedy',
    hero: 'Stand-up comedy night',
    lat: -29.6162,
    lng: 30.3961,
  },
  {
    id: 'afro-house-live',
    title: 'Afro House Live',
    date: 'Sun, 5 Jul - 21:00',
    venue: 'Tatham Art Gallery Courtyard',
    distance: 0.7,
    category: 'Nightlife',
    hero: 'Afro house DJ set',
    lat: -29.6001,
    lng: 30.3786,
  },
  {
    id: 'open-mic-poetry',
    title: 'Open Mic & Poetry',
    date: 'Wed, 8 Jul - 17:00',
    venue: 'Liberty Midlands Mall',
    distance: 4.4,
    category: 'Arts',
    hero: 'Poetry and spoken word',
    lat: -29.5799,
    lng: 30.3523,
  },
  {
    id: 'midlands-jazz-sunset',
    title: 'Midlands Jazz Sunset',
    date: 'Fri, 10 Jul - 18:00',
    venue: 'Golden Horse',
    distance: 2.6,
    category: 'Nightlife',
    hero: 'Live jazz sunset session',
    lat: -29.6225,
    lng: 30.3924,
  },
  {
    id: 'maker-market',
    title: 'Maker Market PMB',
    date: 'Sat, 11 Jul - 10:00',
    venue: 'Cascades Lifestyle Centre',
    distance: 6.1,
    category: 'Arts',
    hero: 'Local crafts and food',
    lat: -29.5681,
    lng: 30.3378,
  },
  {
    id: 'laugh-lab',
    title: 'Laugh Lab: New Sets',
    date: 'Wed, 15 Jul - 19:00',
    venue: 'Scottsville Social Club',
    distance: 3.3,
    category: 'Comedy',
    hero: 'New comedy material',
    lat: -29.6177,
    lng: 30.4076,
  },
];

const endpoints = {
  '/api/circles': () => z.array(circleSchema).parse(circles),
  '/api/businesses': () => z.array(restaurantSchema).parse(restaurants),
  '/api/events': () => z.array(eventSchema).parse(events),
};

export type ApiPath = keyof typeof endpoints;

export type ApiResponse<TPath extends ApiPath> = ReturnType<(typeof endpoints)[TPath]>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiGet<TPath extends ApiPath>(path: TPath): Promise<ApiResponse<TPath>> {
  await wait(200);

  const endpoint = endpoints[path];
  if (!endpoint) {
    throw new Error(`Unknown API path: ${path}`);
  }

  return endpoint() as ApiResponse<TPath>;
}
