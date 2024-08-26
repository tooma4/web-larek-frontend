import './scss/styles.scss';
import { CDN_URL, API_URL } from './utils/constants';
import { WebLarekApi } from './components/model/WebLarekApi';
import { EventEmitter } from './components/base/events';
import { ensureElement, cloneTemplate } from './utils/utils';
import { Product, ProductData} from './components/model/ProductData';
import { Card, CardPreview, CardBasket } from './components/view/Card';
import { Page } from './components/model/Page';
import { Modal } from './components/view/Modal';
import { BasketData } from './components/model/BasketData';
import { Basket } from './components/view/Basket';
import { OrderData } from './components/model/OrderData';
import { Order, Сontacts as Contacts } from './components/view/Order';
import { IOrder } from './types';
import { Success } from './components/view/Success';

const Events = {
  PRODUCTS_CHANGED: 'products:changed',
  PRODUCT_SELECT: 'product:select',
  PREVIEW_CHANGED: 'preview:changed',
  PRODUCT_ADD: 'product:add',
  BASKET_OPEN: 'basket:open',
  PRODUCT_REMOVE: 'product:remove',
  ORDER_OPEN: 'order:open',
  ORDER_SUBMIT: 'order:submit',
  CONTACTS_SUBMIT: 'contacts:submit',
  FORM_ERRORS_ORDER_CHANGE: 'formErrorsOrder:change',
  FORM_ERRORS_CONTACTS_CHANGE: 'formErrorsContacts:change',
  PAYMENT_CHANGE: 'payment:change',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close'
}

// Брокер событий
const emitter = new EventEmitter();

// Api
const api = new WebLarekApi(CDN_URL, API_URL);

// Модель Продуктов
const productData = new ProductData({}, emitter);

// Модель Корзины
const basketData = new BasketData({}, emitter);

// Модель Заказов
const orderData = new OrderData({}, emitter);

// Templates
const cardCatalogTpl = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTpl = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTpl = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
const orderTpl = ensureElement<HTMLTemplateElement>('#order');
const contactsTpl = ensureElement<HTMLTemplateElement>('#contacts');
const successTpl = ensureElement<HTMLTemplateElement>('#success');

// Контейнер страницы
const page = new Page(document.body, emitter);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), emitter);
const basketView = new Basket(cloneTemplate<HTMLTemplateElement>(basketTpl), emitter);
const orderView = new Order(cloneTemplate<HTMLFormElement>(orderTpl), emitter);
const contactsView = new Contacts(cloneTemplate<HTMLFormElement>(contactsTpl), emitter);


// Данные карточек — сохраняем в модели

emitter.on(Events.PRODUCTS_CHANGED, () => {
  page.catalog = productData.catalog.map((product) => {
    const card = new Card(cloneTemplate(cardCatalogTpl), {
      onClick: () => {
        if(true) {
          emitter.emit(Events.PRODUCT_SELECT, product)
        }        
      } 
    });
    
    return card.render({
        title: product.title,
        category: product.category,
        image: api.cdn + product.image,
        price: product.price
    })
  })
})

// при выборе карточки — передаем данные для превью

emitter.on(Events.PRODUCT_SELECT, (product: Product) => {
  productData.setPreview(product);
})

// Отобразить данные превью

emitter.on(Events.PREVIEW_CHANGED, (product: Product) => {
  const isInBasket = basketData.basketValue.some(item => item.id === product.id);

  const card = new CardPreview(cloneTemplate(cardPreviewTpl), {
    onClick: () => {
      if (isInBasket) {
        emitter.emit(Events.PRODUCT_REMOVE, product);
      } else {
        emitter.emit(Events.PRODUCT_ADD, product)}
      }
    });

    card.updateButton(isInBasket, () => {
      if (isInBasket) {
        emitter.emit(Events.PRODUCT_REMOVE, product);
      } else {
        emitter.emit(Events.PRODUCT_ADD, product);
      }
    });
  if (!product.price || product.price <= 0) {
    card.setDisabled(card.button, true);
  }
  modal.render({
    content: card.render({
      title: product.title,
      category: product.category,
      image: api.cdn + product.image,
      description: product.description,
      price: product.price,
    })
  })
})

// При добавлении товара в корзину, сохранить их в заказ и корзину

emitter.on(Events.PRODUCT_ADD, (product: Product) => {
  if(!basketData.basketValue.some(item => item.id === product.id)) {
    console.log(product.id);
    basketData.addToIdInTotalSum(product);
    orderData.addToOrder(product);
    basketData.setProductToBasket(product);
    page.counter = basketData.basketValue.length;
    modal.close();
  }
})

// При открытии корзины - показываем кнопку, сумму товаров, товары, добавляем контент в модальное окно

emitter.on(Events.BASKET_OPEN, () => {
  basketView.setDisabled(basketView.button, basketData.statusBasket);
 
  let i = 1;
  basketView.items = basketData.basketValue.map((product) => {
    const card = new CardBasket(cloneTemplate(cardBasketTpl), {
      onClick: () => emitter.emit(Events.PRODUCT_REMOVE, product)
    });
    basketView.total = basketData.getTotal();
    return card.render({
      title: product.title,
      price: product.price,
      index: i++
    })
  });
  modal.render({
    content: basketView.render()
  })
})

// При удалении товара из корзины, удалить данные товара, из заказа. Обновить счетчик, обновить кнопку и сумму товаров.

emitter.on(Events.PRODUCT_REMOVE, (product: Product) => {
  basketData.removeProductForBasket(product);
  basketData.removeFromIdTotalSum(product);
  orderData.removeFromOrder(product);
  page.counter = basketData.basketValue.length;
  basketView.setDisabled(basketView.button, basketData.statusBasket);
  basketView.total = basketData.getTotal();

  let i = 1;
  basketView.items = basketData.basketValue.map((product) => {
    const card = new CardBasket(cloneTemplate(cardBasketTpl), {
      onClick: () => emitter.emit(Events.PRODUCT_REMOVE, product)
    });
    basketView.total = basketData.getTotal();
    return card.render({
      title: product.title,
      price: product.price,
      index: i++
    })
  });

  modal.close();

  // modal.render({
  //   content: basketView.render()
  // })
})

// При открытии окна заказа - открываем модальное окно с формой заказа

emitter.on(Events.ORDER_OPEN, () => {
  modal.render({
    content: orderView.render({
      address: '',
      payment: 'card',
      valid: false,
      errors: []
    })
  });
});

// При отправки формы заказа, передаем данные и открываем модальное окно с формой контакты

emitter.on(Events.ORDER_SUBMIT, () => {
  orderData.order.total = basketData.getTotal();
  modal.render({
      content: contactsView.render({
          email: '',
          phone: '',
          valid: false,
          errors: []
      })
  });
});

// При отправки формы контакты, передаем данные серверу и открываем модальное окно успешной отправки

emitter.on(Events.CONTACTS_SUBMIT, () => {
  console.log(orderData.order)
  api.orderProducts(orderData.order)
    .then(() => {
      const success = new Success(cloneTemplate(successTpl), {
        onClick: () => {
          modal.close();
          basketData.clearBasket();
          orderData.clearOrder();
          page.counter = basketData.basketValue.length;
          }
      });
        modal.render({
          content: success.render({
          total: basketData.getTotal()
          })
        });
    })
    .catch(err => {
      console.error(err);
    });
});

// Изменение состояния валидации заказа

emitter.on(Events.FORM_ERRORS_ORDER_CHANGE, (errors: Partial<IOrder>) => {
  const { address, payment } = errors;
  orderView.valid = !address && !payment;
  orderView.errors = Object.values({address, payment}).filter(a=> !!a).join('; ');
});

// Изменение состояния валидации контактов

emitter.on(Events.FORM_ERRORS_CONTACTS_CHANGE, (errors: Partial<IOrder>) => {
  const { email, phone} = errors;
  contactsView.valid = !email && !phone;
  contactsView.errors = Object.values({phone, email}).filter(a => !!a).join('; ');
});

// При выборе способа оплаты - сохраняем данные

emitter.on(Events.PAYMENT_CHANGE, (item: HTMLButtonElement) => {
  orderData.order.payment = item.name;
})

// При изменении поля заказа - сохраняем данные

emitter.on(/^order\..*:change/, (data: { field: keyof IOrder, value: string }) => {
  console.log(data.value);
  orderData.setOrderField(data.field, data.value);
  orderData.validateOrder()
});

// При изменении полей контактов - сохраняем данные

emitter.on(/^contacts\..*:change/, (data: { field: keyof IOrder, value: string }) => {
  console.log(data.value);
  orderData.setContactsField(data.field, data.value);
  orderData.validateContacts()
});

// Блокировка прокрутки страницы при открытии модального окна

emitter.on(Events.MODAL_OPEN, () => {
  page.locked = true;
});

// Разблокирование прокрутки страницы при закрытии модального окна

emitter.on(Events.MODAL_CLOSE, () => {
  page.locked = false;
});

// Получении списка товаров с сервера

api.getProductList()
    .then(productData.addCatalog.bind(productData))
    .catch(err => {
        console.log(err);
    })

