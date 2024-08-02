# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Описание данных 

Товар

```
interface IProduct {
    id: string;
    title: string;
    category: string;
    description: string;
    price: number | null;
    image: string;
  };
```

Заказ

```
interface IOrder {
    payment: string;
    address: string;
    email: string;
    phoneNumber: string;
}
```

Интерфейс для модели данных продукта

```
interface IProductsData {
    catalog: IProduct[];
    total: number;
    preview: string;
    addCatalog(products: IProduct[]):void;
    setPreview(product: IProduct):void;
}
```

Интерфейс для модели данных корзины

```
interface IBasketData {
    products: IProduct[];
    totalSum: number;
    add(id: string): void;
    remove(id: string): void;
    getTotalProducts(): number;
    setTotalSum(): number;
}
```

Интерфейс для модели данных ошибок заказа
```
export interface IOrderErrors {
    checkPaymentValidation(data: Record<keyof TOrderPayment, string>): string;
    checkContactsValidation(data: Record<keyof TOrderContacts, string>): string;

}
```

Данные покупателя в заказе - способы оплаты

```
type TOrderPayment = Pick<IOrder, 'address' | 'payment'>;
```

Данные покупателя в заказе - контакты

```
type TOrderContacts = Pick<IOrder, 'email' | 'phoneNumber'>;
```


## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `off` - снимает событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие   

### Слой данных

#### Класс ProductsData
Класс отвечает за хранение и логику работы с данными товаров.\
Конструктор класса принимает инстант брокера событий.\
В полях класса хранятся следующие данные:
- _catalog: IProduct[] - массив объектов товаров
- _total: number - общее кол-во товаров
- _preview: string - id товара, выбранной для просмотра в модальной окне
- events: IEvents - экземпляр класса `EventEmitter` для инициации событий при изменении данных.

Так же класс предоставляет набор методов для взаимодействия с этими данными.
- addCatalog(products: IProduct[]):void - добавляет список товаров на страницу
- setPreview(product: IProduct):void - устанавливает товар для просмотра
- а так-же сеттеры и геттеры для сохранения и получения данных из полей класса

#### Класс BasketData
Класс отвечает за хранение и логику работы с корзиной покупателя.\
Конструктор класса принимает инстант брокера событий\
В полях класса хранятся следующие данные:
- _products: IProduct[] - массив товаров покупателя
- _totalSum: number - общая сумма товаров
- events: IEvents - экземпляр класса `EventEmitter` для инициации событий при изменении данных.

Так же класс предоставляет набор методов для взаимодействия с этими данными.
- add(id: string): void - добавляет товар в корзину
- remove(id: string): void - удаляет товар из корзины
- getTotalProducts(): number - возвращает кол-во товаров
- setTotalSum(): number - возвращает общую сумму цены товаров

#### Класс OrderErrors
Класс отвечает за логику работы с ошибками заказов.

Класс предоставляет набор методов для взаимодействия с этими данными.
- checkPaymentValidation(data: Record<keyof TOrderPaymentForm, string>): string; - проверка валидации Способа оплаты
- checkContactsValidation(data: Record<keyof TOrderContactsForm, string>): string - проверка валидации Контактов

### Классы представления
Классы представления  отвечают за отображение внутри контейнера, передаваемых в них данные.

#### Класс Modal
Реализует  модальное окно. Для управления отображения модального окна, служат методы `open` и `close`. Устанавливает слушатели на клавиатуру, для закрытия окна по Esc, на клик в оверлэй и кнопку-крестик.

- constructor(selector: string, events: IEvents) - Конструктор принимает селектор по кторому будет идентифицировано в разметке страницы, модальное окно и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля класса:
- modal: HTMLElement - элемент модально окна
- events: IEvents - брокер событий
- submitButton: HTMLButtonElement - кнопка сабмита
- _form: HTMLFormElement - элемент формы









