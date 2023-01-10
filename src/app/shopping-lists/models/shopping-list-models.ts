export const defaultBasisWeights = [
  "kg",
  "g",
  "dkg",
  "l",
  "ml",
  "pcs"
]

export const defaultSuggestedItems = [
  "milk",
  "bread",
  "water",
  "cheese",
  "candies",
  "potatoes",
  "tomatoes",
  "cucumbers",
];

export interface ShoppingItem {
  id: string,
  name: string,
  quantity: number,
  basicWeight: string,
  imageId: string | null;
}

export interface ShoppingList {
  id?: string,
  name: string,
  createdAt: number,
  realizationDate: number,
  items: ShoppingItem[],
  realized: boolean;
}