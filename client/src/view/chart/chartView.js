import PyChartView from './pyChartView';
import BarChartView from './barChartView';

export default class ChartView {
  constructor(parentDom) {
    this.parentDom = parentDom;
    this.rootClassName = 'chart';
    this.orderData = null;
    // this.render();
  }

  set transaction(transaction) {
    this.transactionData = transaction;
    this.orderData = this.setOrderData(this.transactionData);
  }

  render() {
    this.mount();
    this.renderElement();
  }

  getTemplate() {
    return `
      <div class=${this.rootClassName}>
      </div>`;
  }

  mount() {
    this.parentDom.insertAdjacentHTML('beforeend', this.getTemplate());
  }

  clear() {
    this.parentDom.innerHTML = '';
  }

  getTotalExpend() {
    return `
        <div class='chart-total-expend'>
            <div class='chart-expend-explain'>이번 달 총 지출 : </div>
            <div class='chart-expend-value'>${this.transactionData.allExpend}원</div>
        </div>
      `;
  }

  renderElement() {
    const chartDom = this.parentDom.querySelector(`.${this.rootClassName}`);
    chartDom.innerHTML = '';
    chartDom.insertAdjacentHTML('beforeend', this.getTotalExpend());
    new PyChartView(chartDom, this.orderData);
    new BarChartView(chartDom, this.orderData);
  }

  setOrderData(rawData) {
    // 1. 2중 foreach 돌면서 dic에 카테고리별로 금액누적
    let orderDic = {};
    rawData.items.forEach((item) => {
      item.transactions.forEach((transaction) => {
        if (transaction.type == '지출') {
          if (orderDic[transaction.category] == undefined) {
            orderDic[transaction.category] = transaction.charge;
          } else {
            orderDic[transaction.category] += transaction.charge;
          }
        }
      });
    });
    // 2. dic을 list로 변환하고 금액에 따라 정렬
    let orderList = [];
    for (const [key, value] of Object.entries(orderDic)) {
      orderList.push({ category: key, charge: value, percent: Math.round((value / rawData.allExpend) * 100) });
    }
    orderList.sort(function (a, b) {
      return b.charge - a.charge;
    });

    return orderList;
  }
}
