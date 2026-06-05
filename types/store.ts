import type { LucideIcon } from "lucide-react";

export type Category = {
  title: string;
  image: string;
  tone: string;
};

export type Product = {
  id?: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  rating: number;
  reviews: number;
  sold: number;
  category?: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type BlogPost = {
  title: string;
  image: string;
  date: string;
  category: string;
};
