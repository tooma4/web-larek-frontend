import { Model } from "../base/Model";
import { IProduct, IProductsData } from "../../types";

export class ProductData extends Model<IProductsData> {
  catalog: Product[];
  preview: string;

  addCatalog(products: IProduct[]) {
    this.catalog = products.map(item => new Product(item, this.events));
    this.emitChanges('products:changed', { catalog: this.catalog });
  }

  setPreview(product: IProduct) {
    this.preview = product.id;
    this.emitChanges('preview:changed', product)

  }
}

export class Product extends Model<IProduct> {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number | null;
}
