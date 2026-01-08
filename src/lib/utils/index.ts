export function formatPrice(amount: number, currency: string = "EGP"): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
