import { Model } from "../base/Model";
import { IOrder, FormErrors, IOrderItems } from "../../types";
import { Product } from "./ProductData";

export class OrderData extends Model<IOrder> {
    order: IOrderItems = {
        address: '',
        payment: 'card',
        email: '',
        total: 0,
        phone: '',
        items: []
    }

    formErrors: FormErrors = {};

    addToOrder(product: Product) {
        this.order.items.push(product.id)
    }

    removeFromOrder(product: Product) {
        this.order.items = this.order.items.filter(id => id !== product.id);
      }

    clearOrder() {
        this.order.items = [];
    }

    setOrderField(field: keyof IOrder, value: string) {
        this.order[field] = value;
      }

      setContactsField(field: keyof IOrder, value: string) {
        this.order[field] = value;
      }

      validateOrder() {
        const errors: typeof this.formErrors = {};
        
        if (!this.order.address) {
          errors.address = 'Необходимо указать адресс';
        }
        this.formErrors = errors;
        this.events.emit('formErrorsOrder:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        
        this.formErrors = errors;
        this.events.emit('formErrorsContacts:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}