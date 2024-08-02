
export interface IProduct {
    id: string;
    title: string;
    category: string;
    description: string;
    price: number | null;
    image: string;
};


export interface IOrder {
    payment: string;
    address: string;
    email: string;
    phoneNumber: string;
}

export interface IProductsData {
    catalog: IProduct[];
    total: number;
    preview: string;
    addCatalog(products: IProduct[]):void;
    setPreview(product: IProduct):void;
}

export interface IBasketData {
    products: IProduct[];
    totalSum: number;
    add(id: string): void;
    remove(id: string): void;
    getTotalProducts(): number;
    setTotalSum(): number;
}


export interface IOrderErrors {
    checkPaymentValidation(data: Record<keyof TOrderPayment, string>): string;
    checkContactsValidation(data: Record<keyof TOrderContacts, string>): string;

}

export type TOrderPayment = Pick<IOrder, 'address' | 'payment'>;
export type TOrderContacts = Pick<IOrder, 'email' | 'phoneNumber'>;




