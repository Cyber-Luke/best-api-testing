// AUTO-GENERATED - DO NOT EDIT

export interface Order {
  id: string;
  date: string;
  time: string;
  details: OrderDetail[];
}

export interface OrderDetail {
  pizza: Pizza;
  quantity: number;
}

export interface Pizza {
  id: string;
  type: PizzaType;
  size: string;
  price: number;
}

export interface PizzaType {
  name: string;
  category: string;
  ingredients: string;
}
