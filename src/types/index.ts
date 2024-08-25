
export interface IProduct {
    id?: string;
    title?: string;
    category?: string;
    description?: string;
    price?: number | null;
    image?: string;
};

export interface IProductsData {
    catalog?: IProduct[];
    preview?: string;
    addCatalog(products: IProduct[]):void;
    setPreview(product: IProduct):void;
}

export interface IBasketData {
    basket: IProduct[];
    idTotalSum: string[];
    setProductToBusket(product: IProduct): void;
    removeProductForBasket(product: IProduct): void;
    addToIdInTotalSum(product: IProduct): void;
    removeFromIdTotalSum(product: IProduct): void;
    getTotal(): IProduct;
    clearBasket(): void;
}

export interface IOrder {
    payment?: string;
    address?: string;
    email?: string;
    phone?: string;
    total?: string | number;   
}

export interface IOrderItems extends IOrder {
    items: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
}





