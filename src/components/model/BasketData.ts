import { Model } from "../base/Model";
import { IBasketData } from "../../types";
import { Product } from "./ProductData";


export class BasketData extends Model<IBasketData> {
    basket: Product[] = [];
    idTotalSum: string[] = [];

    setProductToBasket(product: Product) {
        if (!this.basketValue.find(item => item.id === product.id)) {
            this.basket.push(product);
        }
        
    }

    addToIdInTotalSum(product: Product) {
        this.idTotalSum.push(product.id);
    }

    getTotal() {

        if (!this.idTotalSum || this.idTotalSum.length === 0) {
            return 0;
        }
        
        return this.idTotalSum.reduce((a, c) => {
            const foundProduct = this.basket.find(id => id.id === c);
            return foundProduct ? a + foundProduct.price : a;
        }, 0);
    }

    clearBasket() {
        this.basket = []
        this.idTotalSum = [];
    }

    removeProductForBasket(product: Product) {
        const index = this.basket.indexOf(product);
        if (index >= 0) {
          this.basket.splice( index, 1 );
        }
    }

    removeFromIdTotalSum(product: Product) {
        const index = this.idTotalSum.indexOf(product.id);
        if (index >= 0) {
          this.idTotalSum.splice( index, 1 );
        }
      }

    get basketValue(): Product[] {
        return this.basket
    }

    get statusBasket(): boolean {
        return this.basket.length === 0
    }


}