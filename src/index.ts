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
import { Order, Сontacts } from './components/view/Order';
import { IOrder } from './types';
import { Success } from './components/view/Success';

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
const contactsView = new Сontacts(cloneTemplate<HTMLFormElement>(contactsTpl), emitter);


// Данные карточек — сохраняем в модели

emitter.on('products:changed', () => {
  page.catalog = productData.catalog.map((product) => {
    const card = new Card(cloneTemplate(cardCatalogTpl), {
      onClick: () => emitter.emit('product:select', product)
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

emitter.on('product:select', (product: Product) => {
  productData.setPreview(product);
})

// Отобразить данные превью

emitter.on('preview:changed', (product: Product) => {
  const card = new CardPreview(cloneTemplate(cardPreviewTpl), {
    onClick: () => emitter.emit('product:add', product)
  });
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

emitter.on('product:add', (product: Product) => {
  basketData.addToIdInTotalSum(product);
  orderData.addToOrder(product);
  basketData.setProductToBusket(product);
  page.counter = basketData.basketValue.length;
  modal.close();
})

// При открытии корзины - показываем кнопку, сумму товаров, товары, добавляем контент в модальное окно

emitter.on('basket:open', () => {
  basketView.setDisabled(basketView.button, basketData.statusBasket);
 
  let i = 1;
  basketView.items = basketData.basketValue.map((product) => {
    const card = new CardBasket(cloneTemplate(cardBasketTpl), {
      onClick: () => emitter.emit('product:remove', product)
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

emitter.on('product:remove', (product: Product) => {
  basketData.removeProductForBasket(product);
  basketData.removeFromIdTotalSum(product);
  page.counter = basketData.basketValue.length;
  basketView.setDisabled(basketView.button, basketData.statusBasket);
  basketView.total = basketData.getTotal();

  let i = 1;
  basketView.items = basketData.basketValue.map((product) => {
    const card = new CardBasket(cloneTemplate(cardBasketTpl), {
      onClick: () => emitter.emit('product:remove', product)
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

// При открытии окна заказа - открываем модальное окно с формой заказа

emitter.on('order:open', () => {
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

emitter.on('order:submit', () => {
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

emitter.on('contacts:submit', () => {
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

emitter.on('formErrorsOrder:change', (errors: Partial<IOrder>) => {
  const { address, payment } = errors;
  orderView.valid = !address && !payment;
  orderView.errors = Object.values({address, payment}).filter(a=> !!a).join('; ');
});

// Изменение состояния валидации контактов

emitter.on('formErrorsContacts:change', (errors: Partial<IOrder>) => {
  const { email, phone} = errors;
  contactsView.valid = !email && !phone;
  contactsView.errors = Object.values({phone, email}).filter(a => !!a).join('; ');
});

// При выборе способа оплаты - сохраняем данные

emitter.on('payment:change', (item: HTMLButtonElement) => {
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

emitter.on('modal:open', () => {
  page.locked = true;
});

// Разблокирование прокрутки страницы при закрытии модального окна

emitter.on('modal:close', () => {
  page.locked = false;
});

// Получении списка товаров с сервера

api.getProductList()
    .then(productData.addCatalog.bind(productData))
    .catch(err => {
        console.log(err);
    })

