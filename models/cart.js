module.exports = function (oldCart) {
    this.items = oldCart.items || {};
    this.totalPrice = oldCart.totalPrice || 0;
    this.totalQty = oldCart.totalQty || 0;
    this.add = (item, id) => {
        storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, price: 0, qty: 0 };
        }
        storedItem.qty++;
        storedItem.price = item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };
    this.generateArray = () => {
        let arr = [];
        for (let id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
}