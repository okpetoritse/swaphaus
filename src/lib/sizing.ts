export interface SizeOption {
  value: string;
  label: string;
}

const CLOTHING_SIZES: SizeOption[] = [
  { value: "XXS", label: "XXS (US 00)" },
  { value: "XS", label: "XS (US 0–2)" },
  { value: "S", label: "S (US 4–6)" },
  { value: "M", label: "M (US 8–10)" },
  { value: "L", label: "L (US 12–14)" },
  { value: "XL", label: "XL (US 16–18)" },
  { value: "XXL", label: "XXL (US 20–22)" },
];

const SHOE_SIZES: SizeOption[] = [
  { value: "US5_EU37.5", label: "US 5 / EU 37.5" },
  { value: "US5.5_EU38", label: "US 5.5 / EU 38" },
  { value: "US6_EU38.5", label: "US 6 / EU 38.5" },
  { value: "US6.5_EU39", label: "US 6.5 / EU 39" },
  { value: "US7_EU40", label: "US 7 / EU 40" },
  { value: "US7.5_EU40.5", label: "US 7.5 / EU 40.5" },
  { value: "US8_EU41", label: "US 8 / EU 41" },
  { value: "US8.5_EU42", label: "US 8.5 / EU 42" },
  { value: "US9_EU42.5", label: "US 9 / EU 42.5" },
  { value: "US9.5_EU43", label: "US 9.5 / EU 43" },
  { value: "US10_EU44", label: "US 10 / EU 44" },
  { value: "US10.5_EU44.5", label: "US 10.5 / EU 44.5" },
  { value: "US11_EU45", label: "US 11 / EU 45" },
  { value: "US11.5_EU45.5", label: "US 11.5 / EU 45.5" },
  { value: "US12_EU46", label: "US 12 / EU 46" },
  { value: "US13_EU47", label: "US 13 / EU 47" },
];

const ONE_SIZE: SizeOption[] = [{ value: "ONE_SIZE", label: "One Size" }];

export function getSizeOptions(category: string | null): SizeOption[] {
  if (category === "Footwear") return SHOE_SIZES;
  if (category === "Bags" || category === "Accessories") return ONE_SIZE;
  return CLOTHING_SIZES;
}

// Note: shoe conversions above are unisex/men's-standard approximations.
// A men's/women's toggle is a good next-pass addition once real users flag mismatches.