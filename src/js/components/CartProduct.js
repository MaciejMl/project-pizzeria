import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.priceSingle * menuProduct.amount;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    //thisCartProduct.productPriceInCart();
    thisCartProduct.initActions();
    //console.log('cartProduct', thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );
  }

  productPriceInCart() {
    const thisCartProduct = this;
    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price =
      thisCartProduct.amount * thisCartProduct.priceSingle;
    thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.productPriceInCart();
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault;
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault;
      thisCartProduct.remove(event.detail.cartProduct);
      //console.log(thisCartProduct.remove(event.detail.cartProduct));
    });
  }

  getData() {
    const thisCartProduct = this;

    const cartData = {};
    cartData.id = thisCartProduct.id;
    cartData.name = thisCartProduct.name;
    cartData.amount = thisCartProduct.amountWidget.value;
    cartData.priceSingle = thisCartProduct.priceSingle;
    cartData.price =
      thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
    cartData.params = thisCartProduct.params;

    return cartData;
  }
}

export default CartProduct;
