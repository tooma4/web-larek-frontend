import { Api, ApiListResponse } from "../base/api";
import { IProduct } from "../../types";
import { IOrder, IOrderResult } from "../../types";

export class WebLarekApi extends Api {
    cdn: string;
  
    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
      super(baseUrl, options)
      this.cdn = cdn;
    }
    getProductList() {
      return this.get('/product')
        .then((data: ApiListResponse<IProduct>) => {
          return data.items.map((item) => ({ ...item }))
        })
    }
    orderProducts(order: IOrder): Promise<IOrderResult> {
      return this.post('/order', order).then(
          (data: IOrderResult) => data
      );
    }
  }