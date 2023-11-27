<template>
  <div>
    <Header/>

    <div class="mainWindow">
      <div class="history">
        <div class="panel-header"> ИСТОРИЯ </div>
        <div style="display: flex">
          <input type="checkbox" id='showActual' class="custom-checkbox" v-model="showActual">
          <label for='showActual' class="checkbox-label">Только актуальные</label>
        </div>
        <div class="search-box">
          <label class="search-label">Поиск</label>
          <div style="width: 100%;">
            <input class="search-area" v-model="searchTextOrder"/>
          </div>
        </div>
        <div class="orderList" ref="orderListRef" :class="{ 'orderList-employee': !userIsAdmin() }">
          <div class="order" @click="getOrder(order)" v-for="order in filteredItems" :key="order.id" :data-key="order.id" :class="{ 'selected': order.id === selectedOrder.id }">
            <div class="header">
              <p class="status">{{ order.status }}</p>
              <p class="auto-number">{{ order.numberCar }}</p>
            </div>
            <div class="body">
              <div class="username"> {{ order.username }}</div>
              <div class="dates"> {{ formatDate(order.beginDate) }} - {{ formatDate(order.endDate) }}</div>
              <div class="description"> {{ order.desc }}</div>
            </div>
          </div>
          <div class="noOrders" v-if="orders.length == 0">
            <img src="../assets/icons/noOrders.png" width="74" height="74"> 
            <p> Заказов нет! </p>
            <p> Cоздайте новый по кнопке ниже </p>
          </div>
        </div>
        <div style="padding-right: 32px">
          <button class="records" v-if="userIsAdmin()" @click.prevent="openCreateOrderDialog"> Отчёты </button>
        </div>
      </div>

      <div class="info">
        <div class="panel-header" v-if="!editing"> НОВАЯ ЗАЯВКА </div>
        <div class="panel-header" v-if="editing"> ИНФОРМАЦИЯ </div>
        <p class="author"> Автор заявки: {{ userInfo.displayName }} </p>
        <p class="selectedCar"> Выбранная машина: {{ selectedCar.name }} </p>
        <p class="carNumber"> Гос. номер: {{  selectedCar.number }} </p>
        <p class="dateRent"> Дата арендования: </p>
        <div class="dateSettings">
          <tr> 
            <td> Начало аренды: </td> 
            <td> <input id="settingDateFrom" type="date"> </td> 
          </tr>
          <tr> 
            <td> Конец аренды: </td> 
            <td> <input id="settingDateTo" type="date"> </td> 
          </tr>
        </div>
        <div class="description">
          <p> Описание заявки </p>
          <textarea id="orderDesc"/>
        </div>
        <button class="createOrder" @click.prevent="createOrder()"> Новый заказ </button> 
      </div>

      <div class="lastPanel">
        <div class="availableCars">
        <div class="panel-header"> ДОСТУПНЫЕ МАШИНЫ </div>
          <div class="carList" ref="carListRef" @wheel="scrollHorizontally">
            <div class="car" :data-key="car.id" v-for="car in cars" :key="car.id" @click="selectCar(car)" :class="{ 'new-car-panel': car.id === -1 , 'selected': car.id === selectedCar.id, 'editingCar': car.id === editingCar.id }">
              <div class="header">
                <input class="name" v-bind:readonly="car.id !== editingCar.id" v-model="car.name" />
                <input v-if="car.id !== -1" class="carNumber" v-bind:readonly="car.id !== editingCar.id" v-model="car.number" :class="{ 'carNumber-employee': !userIsAdmin() }"/>
                <div v-if="car.id !== -1 && userIsAdmin()" class="editCar" :class="{ 'closeCar': car.id === editingCar.id }" @click.prevent="shareCarPanel(car.id)"> ! </div> 
                <div v-if="car.id !== -1 && userIsAdmin()" class="editCar" @click.prevent="shareCarPanel(car.id)"> ! </div> 
              </div>
              <div class="body">
                <textarea v-if="car.id !== -1" v-bind:readonly="car.id !== editingCar.id" class="description" v-model="car.desc" />
                <div v-if="car.id !== -1">
                  <input type="checkbox" :id="'scales_' + car.id" class="custom-checkbox" :checked="intToBool(car.isShowInList)" @change="updateShowInList(car, $event.target.checked)">
                  <label :for="'scales_' + car.id" class="checkbox-label">Показать в выдаче</label>
                  <div style="display: flex">
                    <button @click.prevent="saveCar(car)" class="save-car" :class="{ 'full-save-car': car.id === -2 }"> Сохранить </button> 
                    <button v-if="car.id !== -2" @click.prevent="deleteCar(car)" class="delete-car" :class="{ 'ready-delete': readyForRemoveCar }"> 🗑️ </button> 
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="calendar">
          <calendar-view
            :show-date="showDate"
            :startingDayOfWeek="1"
            :items="currentPlan"
            class="theme-default"
            @click-item="onClickOrderOnCalendar">
            <template #header="{ headerProps }">
              <calendar-view-header
                :header-props="headerProps"
                @input="setShowDate"/>
            </template>
          </calendar-view>
        </div>
        <div class="legenda">
          <div class="text-block">
            <div class="circle-with-text">
              <div class="circle solid"></div>
              Одобрен
            </div>
            <div class="circle-with-text">
              <div class="circle outlined"></div>
              В обработке
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
  <div>
    <CreateOrderDialog :data="orders" v-if="showCreateOrderDialog" @close="closeCreateOrderDialog" />
  </div>
</template>

<script>
import VueSelect from 'vue-select';
import ModalWindows from '@/components/ModalWindows.js';

import "@/css/default.css"
import "@/css/holidays-us.css"

import axios from 'axios';
import Header from '@/components/Header.vue'
import CreateOrderDialog from '@/components/CreateOrderDialog.vue';
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar"

import "@/css/style-calendar.css"
import "@/css/default.css"

export default {
  name: 'Main',
  components: {
    Header,
    CreateOrderDialog,
    VueSelect,
    CalendarView,
    CalendarViewHeader
  },

  data() {
    return {
        showCreateOrderDialog: false,
        ///*'https://portal.npf-isb.ru*/ 'http://localhost:4451
        USER_JWT_GET: 'https://portal.npf-isb.ru/auth/api/checkjwt',
        userJWT: () => [], 
 
        USER_INFO_GET: 'https://portal.npf-isb.ru/carsharing/api/auth/userinfo',
        userInfo: () => [], 
 
        AUTH_GET: 'https://portal.npf-isb.ru/auth/api/ldapauth',
 
        CARS_GET: 'https://portal.npf-isb.ru/carsharing/api/manager/cars/all',
        CAR_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/cars/',
        CAR_DELETE: 'https://portal.npf-isb.ru/carsharing/api/manager/cars/',
        CAR_POST: 'https://portal.npf-isb.ru/carsharing/api/manager/cars/create',
        CAR_PATCH: 'https://portal.npf-isb.ru/carsharing/api/manager/cars/edit',
        cars: () => [], 
 
        CAR_PLAN_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/orders/in-month',

        ORDERS_POST: 'https://portal.npf-isb.ru/carsharing/api/orders/create',
        ORDERS_GET: 'https://portal.npf-isb.ru/carsharing/api/manager/orders/all',
        ORDER_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/orders/',
        orders: () => [],
        filteredOrders: () => [],
        showActual: true,

        searchTextOrder: '',

        selectedOrder: {},
        selectedCar: {},
        orderInfo: {
          car: null,
          desc: "Тестовое описание",
          beginDate: "",
          endDate: ""
        },
        showDate: new Date(),
        currentPlan: [],

        editing: false,
        editingCar: {},
        emptyCar: {
          desc: "",
          id: -1,
          isShowInList: 1,
          name: "Новая машина",
          number: ""
        },
        readyForRemoveCar: false,
    }
  },

  computed: {
    filteredItems() {
      if (!this.searchTextOrder) {
        return this.showActual ? this.filteredOrders : this.orders;
      }
      
      const searchTerms = this.searchTextOrder.toLowerCase().split(' ');
      return (this.showActual ? this.filteredOrders : this.orders).filter(item => {
        return searchTerms.every(term => {
          return Object.values(item).some(value => {
            if (typeof value === 'string' || value instanceof String) {
              return value.toLowerCase().includes(term);
            }
            return false;
          });
        });
      });
    }
  },

  watch: {
    filteredItems(newFilteredItems, oldFilteredItems) {
      if (newFilteredItems !== oldFilteredItems) {
        if (newFilteredItems.length > 0) {
          setTimeout(() => {this.scrollElementInList(this.selectedOrder, this.$refs.orderListRef, false)}, 300);
        }
      }
    },
    
    selectedOrder(newSelectedOrder, oldSelectedOrder) {
      if (newSelectedOrder !== oldSelectedOrder && this.currentPlan && this.currentPlan !== {}) {
        if (oldSelectedOrder && 'id' in oldSelectedOrder) {
          let oldOrderPlan = this.currentPlan.find(plan => plan.id === oldSelectedOrder.id.toString());
          if (oldOrderPlan && 'classes' in oldOrderPlan) {
            oldOrderPlan.classes = oldOrderPlan.classes.filter(it => it !== 'selected');
          }
        }
        if (newSelectedOrder && 'id' in newSelectedOrder) {
          let newOrderPlan = this.currentPlan.find(plan => plan.id === newSelectedOrder.id.toString());
          if (newOrderPlan && 'classes' in newOrderPlan) {
            newOrderPlan.classes.push("selected");
          }
        }
      }
    },

    currentPlan(newPlan, oldPlan) {
      if (newPlan !== oldPlan && newPlan && this.selectedOrder && 'id' in this.selectedOrder) {
        let newOrderPlan = newPlan.find(plan => plan.id === this.selectedOrder.id.toString());
        if (newOrderPlan && 'classes' in newOrderPlan) {
          newOrderPlan.classes.push("selected");
        }
      }
    },
  },

  methods: {
    userIsAdmin(){
      return true //this.userInfo.role === "globaladmin";
    },

    updateShowInList(car, value) {
      this.cars[this.cars.findIndex(it => it.id === car.id)].isShowInList = value ? 1 : 0;
    },

    updateShowActual(value) {
      this.showActual = value;
    },

    intToBool(int) {
      return int === 1;
    },

    shareCarPanel(carId) {
      this.readyForRemoveCar = false;
      if (this.editingCar.id === null || this.editingCar.id !== carId) {
        this.shareCarPanel(this.editingCar.id);
        this.editingCar = { ...this.cars.find(it => it.id === carId) };
        if (carId === -2) {
          const observer = new ResizeObserver(() => {
            this.$refs.carListRef.scrollLeft += 1500;
            observer.disconnect();
          });
          observer.observe(this.$refs.carListRef);
        }
      } else if (this.editingCar.id === carId) {
        if (carId === -2) {
          this.editingCar.id = -1;
        }
        this.cars[this.cars.findIndex(car => car.id === carId)] = { ...this.editingCar };
        this.selectedCar = { ...this.editingCar };
        this.editingCar = {};
      }
    },
    
    scrollHorizontally(event) {
      const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
      this.$refs.carListRef.scrollLeft -= delta * 40;
      event.preventDefault();
    },

    saveCar(car) {      
      try {
        let carForSave;
        const isEdit = car.id !== -2;
        if (!isEdit) {
          carForSave = {
            name: car.name,
            number: car.number,
            isShowInList: car.isShowInList === 1,
            desc: car.desc,
          }
          axios.post(this.CAR_POST, carForSave, { withCredentials: true })
          .then((res) => {
            this.cars[this.cars.findIndex(car => car.id === -2)] = { ...res.data };
            ModalWindows.showModal('Создана машина ' + res.data.name, true);
            this.doAfterSaveCar(isEdit);
          });
        } else {
          carForSave = {
            id: car.id,
            name: car.name,
            number: car.number,
            isShowInList: car.isShowInList === 1,
            desc: car.desc,
          }
          axios.patch(this.CAR_PATCH, carForSave, { withCredentials: true })
          .then((res) => {
            ModalWindows.showModal('Отредактирована машина ' + res.data.name, true);
            this.doAfterSaveCar(isEdit);
          });
        }
      }
      catch (e) {
        console.log(e);
        ModalWindows.showModal(e.response.data.message, false);
      }
    },

    deleteCar(car) {
      if (this.readyForRemoveCar) {
        axios.delete(this.CAR_DELETE + car.id, { withCredentials: true })
        .then((res) => {
          this.readyForRemoveCar = false;
          ModalWindows.showModal('Удалена машина ' + car.name, false);
          this.getCars();
        })
      }
      this.readyForRemoveCar = true;
    },

    doAfterSaveCar(isEdit) {
      this.editingCar = {};
      if (!isEdit) {
        this.cars.push({ ...this.emptyCar });
      }
    },

    setShowDate(dateCalendar) {
      if ('id' in this.selectedCar) {
        this.setInCalendarPlanCar(this.selectedCar.id, dateCalendar);
      }
      this.showDate = dateCalendar;
    },

    setInCalendarPlanCar(carId, dateCalendar) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      axios.get(this.CAR_PLAN_GET + `/${carId}` + `/${new Date(dateCalendar).toLocaleDateString('fr-CA', options)}`, { withCredentials: true })
      .then((res) => {
          this.currentPlan = res.data.ordersPerMonth;
      })
    },

    openCreateOrderDialog() {
      this.showCreateOrderDialog = true;
    },

    closeCreateOrderDialog() {
      this.showCreateOrderDialog = false;
    },

    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('ru-RU', options);
    },
    
    getUserJWT() {
      axios.get(this.USER_JWT_GET, { withCredentials: true })
      .then((res) => {
        this.userJWT = res.data;
        console.log(this.userJWT);
      },
      () => {
        this.createAuthWindow();
      });
    },

    getUserInfo() {
      axios.get(this.USER_INFO_GET, { withCredentials: true })
      .then((res) => {
        this.userInfo = res.data;
        console.log(this.userInfo);
      })
    },

    createAuthWindow() {
      let darkLayer = document.createElement('div');
      darkLayer.className = 'darkLayer';
      document.body.appendChild(darkLayer);

      let authSection = document.createElement('div');
      authSection.className = 'authSection';
      darkLayer.appendChild(authSection);

      let userIcon = document.createElement('img');
      userIcon.src = require('../assets/icons/logo.png');
      userIcon.className = 'userIcon';
      authSection.appendChild(userIcon);

      let title = document.createElement('p');
      title.textContent = 'ВОЙДИТЕ В СИСТЕМУ';
      title.className = 'title';
      authSection.appendChild(title);

      let inputsForm = document.createElement('form');
      inputsForm.className = 'inputsForm';
      authSection.appendChild(inputsForm);

      let usernameSection = document.createElement('div');
      usernameSection.className = 'usernameSection';
      inputsForm.appendChild(usernameSection);

      let usernameLabel = document.createElement('label');
      usernameLabel.textContent = "Почта"
      usernameSection.appendChild(usernameLabel);

      let username = document.createElement('input');
      username.required = true
      usernameSection.appendChild(username);

      let usernameIcon = document.createElement('img');
      usernameIcon.className = "usernameIcon";
      usernameIcon.src = require('../assets/icons/usernameIcon.png');
      usernameSection.appendChild(usernameIcon);

      let passwordSection = document.createElement('div');
      passwordSection.className = 'passwordSection';
      inputsForm.appendChild(passwordSection);

      let passwordLabel = document.createElement('label');
      passwordLabel.textContent = "Пароль"
      passwordSection.appendChild(passwordLabel);

      let password = document.createElement('input');
      password.type = 'password'
      password.className = 'password';
      password.required = true;
      passwordSection.appendChild(password);

      let passwordIcon = document.createElement('img');
      passwordIcon.className = "passwordIcon";
      passwordIcon.src = require('../assets/icons/passwordIcon.png');
      passwordSection.appendChild(passwordIcon);

      let submitButton = document.createElement('button');
      submitButton.textContent = 'Войти';
      submitButton.className = 'submitButton';
      inputsForm.appendChild(submitButton);

      inputsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        axios.post(this.AUTH_GET, { "username": username.value, "password": password.value }, { withCredentials: true })
        .then((res) => {
          ModalWindows.showModal(res.data.message, true);
          setTimeout(() => { location.reload() }, 1000);
        },
        () => {
          ModalWindows.showModal("Вы ввели неправильную почту или пароль!", false);
        });
      })
    },

    selectCar(car) {
      if (car && car.id !== -1) {
        if (car.id !== this.selectedCar.id) {
          this.selectedCar = car;
          this.setInCalendarPlanCar(car.id, this.showDate);
        }
      } else if (car && car.id === -1) {
        car.id = -2
        this.selectedCar = car;
        this.currentPlan = null;
        this.shareCarPanel(car.id);
      }
    },

    getCars() {
      axios.get(this.CARS_GET, { withCredentials: true })
      .then((res) => {
          this.cars = res.data
          if (this.cars && this.cars[0])  {
            this.selectCar(this.cars[0]);
          }
          if (this.userIsAdmin()) {
            this.cars.push({ ...this.emptyCar });
          }
      });
    },

    getCar(carID) {
      axios.get(this.CAR_GET + carID, { withCredentials: true })
      .then((res) => {
        return res.data
      })
    },

    getOrder(order) {
      this.selectedOrder = order;
      const selectedCarByOrder = this.cars.find(it => it.id === this.selectedOrder.car)
      if (selectedCarByOrder) {
        this.selectCar(selectedCarByOrder);
        this.scrollElementInList(this.selectedCar, this.$refs.carListRef, true);
      }
      this.editing = true;
      axios.get(this.ORDER_GET + order.id, { withCredentials: true })
      .then((res) => {
        this.orderInfo = res.data;  
        this.getCar(this.orderInfo.car);
      });
    },
    
		onClickOrderOnCalendar(clickOrder) {
      const findedOrder = this.orders.find(it => it.id.toString() === clickOrder.id);
      const actualDate = new Date();
      if (findedOrder) {
        this.searchTextOrder = '';
        if (this.showActual && new Date(findedOrder.endDate) < actualDate) {
          this.showActual = false;
        }
        this.getOrder(findedOrder);
        this.scrollElementInList(findedOrder, this.$refs.orderListRef, false);
      }
		},

    scrollElementInList(elementToScroll, parentElement, isHorizontal) {
      if (parentElement && elementToScroll) {
        const element = parentElement.querySelector(`[data-key="${elementToScroll.id}"]`);
        if (element) {
          const start = isHorizontal ? parentElement.scrollLeft : parentElement.scrollTop;
          const end = (isHorizontal ? (element.offsetLeft + element.offsetWidth - 1300) : (element.offsetTop - element.offsetHeight - 100));
          const duration = 500;
          let startTime = null;

          const animateScroll = timestamp => {
            if (!startTime) {
              startTime = timestamp;
            }
            const progress = timestamp - startTime;
            const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const ease = easeInOutQuad(Math.min(progress / duration, 1));

            if (isHorizontal) {
              parentElement.scrollLeft = start + (end - start) * ease;
            } else {
              parentElement.scrollTop = start + (end - start) * ease;
            }

            if (progress < duration) {
              window.requestAnimationFrame(animateScroll);
            }
          };

          window.requestAnimationFrame(animateScroll);
        }
      }
    },

    getOrders() {
      axios.get(this.ORDERS_GET, { withCredentials: true })
      .then((res) => {
          this.orders = res.data
          const actualDate = new Date();
          this.filteredOrders = this.orders.filter(order =>  new Date(order.endDate) >= actualDate);
      });
    },

    async createOrder() {
      this.orderInfo.car = this.selectedCar.id;
      this.orderInfo.desc = document.getElementById('orderDesc').value;
      this.orderInfo.beginDate = document.getElementById('settingDateFrom').value;
      this.orderInfo.endDate = document.getElementById('settingDateTo').value;
      console.log(this.orderInfo);
      try {
        await axios.post(this.ORDERS_POST, this.orderInfo, { withCredentials: true })
        .then((res) => {
          console.log(res);
          ModalWindows.showModal("Заказ создан!", true);
          this.getOrders();
        });
      }
      catch (e) {
        console.log(e);
        ModalWindows.showModal(e.response.data.message, false);
      }
    },

  },

  mounted() {
    setTimeout(() => {
      this.getUserJWT();
      this.getUserInfo();
      this.getCars();
      this.getOrders();
    }, 100);
  }
}
</script>

<style>

:root {
  --main-font: "Open Sans", "Segoe UI", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;;
  --text-color: #ffffff;
  --text-color-hover-active: #f5f5f5;
  --text-color-hover: #d2d2d2;
  --text-color-active: #999999;

  --button-idle: #456ead;
  --button-hover: #405c91;
  --button-active: #7d98c9;

  --main-color: #2767c9;
  --sub-color: #2767c9;
  --main-background: #f1f8ff;
  --sub-background: #182D57;

  --left-side-background: #f1f8ff;
  --left-side-scrollbar-track: #d3e0ed;
  --left-side-scrollbar-thumb: #2767c9;

  --deleteButton-background: #f44336;

  --wait-border: #bbb04d;
  --wait-background: #e7e7587e;
  --ready-border: #57be68;
  --ready-background: #81faa075;
  --success-background: #429974;
  --error-background: #f44336;
}

body {
  margin: 0;

  overflow-y: hidden;
  overflow-x: hidden;

  background: var(--main-background);
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  color: #2c3e50;
  height: 67vh;
}

.darkLayer {
  position: fixed;
  left: 0;
  top: 0;

  display: flex;
  align-items: center;

  height: 100%;
  width: 100%;
  z-index: 2;

  background-color: var(--main-background);
}

.authSection {
  margin: auto;
  padding: 32px;

  display: flex;
  flex-direction: column;
  align-items: center;

  height: 434px;
  width: 334px;

  border: 1px solid var(--main-color);

  justify-content: start;
  background-color: #fff;
}

.authSection .userIcon {
  margin: 0 0 32px;

  height: 160px;
  width: 200px;
}

.authSection p {
  font-family: var(--main-font);

  color: var(--main-color);
}

.authSection .title {
  margin-top: 0;

  font-size: 25px;
  margin-bottom: 32px;

  text-transform: uppercase;
}

.authSection .description {
  margin: 20px auto;

  width: 250px;

  line-height: 22px;

  font-size: 14px;
}

.authSection .inputsForm {
  height: 200px;
  width: -webkit-fill-available;
}

.authSection .inputsForm input {
  padding: 15px 0 4px 8px;

  outline: none;
  border: none;

  width: 280px;

  font-family: var(--main-font);
  font-size: 17px;

  color: var(--main-color);
  background: transparent;
}

.authSection .inputsForm label {
  margin-left: 7px;

  position: absolute;

  font-family: var(--main-font);

  opacity: 0.7;
  color: var(--main-color);

  font-size: 13px;
}

.authSection .inputsForm .usernameIcon {
  margin-left: 11px;

  transform: translateY(1px);

  height: 22px;
  width: 20px;
}

.authSection .inputsForm .passwordIcon {
  margin-left: 13px;

  height: 20px;
  width: 16px;
}

.usernameSection {
  margin-bottom: 8px;

  height: 46px;

  border: 1px solid var(--main-color);
}
.passwordSection {
  margin-bottom: 8px;

  height: 46px;

  border: 1px solid var(--main-color);
}

.authSection .inputsForm button {
  align-items: center;

  display: flex;
  flex-direction: row;
  justify-content: center;

  height: 40px;
  width: 100%;

  background-color: var(--main-color);
  color: var(--text-color);

  border: none;

  transition: all 0.01s ease-in-out 0s;
}

/* Auth window END */

/*-------*/
/* Other */
/*-------*/

.modalWindow {
    right: 16px;
    top: 16px;

    padding: 8px;

    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;

    min-height: 48px;
    width: 384px;

    font-size: 17px;
    font-family: var(--main-font);

    color: var(--text-color);
    opacity: 1;

    z-index: 2000;

    animation-duration: 0.3s;
    animation-name: modalOpen
}
@keyframes modalOpen {
    from {
        opacity: 0;
        transform: translateY(100%);
    }
    to {
        opacity: 1;
        transform: translateY(0%);
    }
}

.modalWindow.remove {
    opacity: 0;
    animation-name: modalClose
}
@keyframes modalClose {
    from {
        opacity: 1;
        transform: translateY(0%);
    }
    to {
        opacity: 0;
        transform: translateY(100%);
    }
}

.modalWindow.Error {
    background: var(--error-background);
}

.modalWindow.Success {
    background: var(--success-background);
}

:root {
  --main-color: #2767c9;
  --text-color: #ffffff;
  --div-color: #ffffff;
  --border-color: rgba(39, 103, 201, .2);
}

.mainWindow {
  margin-top: 80px;

  width: 100%;

  display: flex;
  justify-content: center;
}

.mainWindow .history, .mainWindow .info, .mainWindow .lastPanel {
  padding-left: 32px;
  margin: 10px;

  font-size: 24px;
  font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;

  color: var(--main-color);
  background: var(--div-color);

  border: 1px solid var(--border-color);
}

.mainWindow .history, .mainWindow .info {
  height: 820px;
  width: 20%;
}

.mainWindow .info {
  width: 25%;
}

.mainWindow .lastPanel {
  width: 49%;
}

.mainWindow .lastPanel .calendar {
  margin-right: 32px;
  height: 550px;
  font-size: 19px;
}

.mainWindow .history .date {
  padding-bottom: 20px;

  width: 270px;
  min-width: 270px;
  max-width: 270px;
  line-height: 35px;
  font-size: 20px;
}

.mainWindow .history .search-box {
  display: flex; 
  padding-right: 38px;
  top: -12px;
  position: relative;
}

.mainWindow .history .search-label {
  font-size: 15px;
  padding-right: 5px;
  padding-top: 10px;
}

.mainWindow .history .search-area {
  font-size: 15px;
  border: 0.5px solid var(--text-color-hover);
  border-radius: 4px; 
  padding: 2px 2px; 
  color: var(--main-color);
  outline: none;
  width: 100%;
}

.mainWindow .availableCars .car {
  transition: min-width 0.3s ease-in-out 0.1s;
  margin: 10px;
  margin-right: 0;
  min-width: 270px;
}

.mainWindow .availableCars .car.editingCar {
  min-width: 405px;
}

.mainWindow .availableCars .car.new-car-panel {
  min-width: 112px;
  max-height: 36px;
  margin-right: 10px;
  margin-top: 54px;
}

.mainWindow .availableCars .car.new-car-panel .carNumber {
  right: 0;
  max-width: 1px;
  pointer-events: none;
}

.mainWindow .availableCars .car.new-car-panel .name {
  max-width: 104px;
  pointer-events: none;
}

.lastPanel .car .header .editCar {
  position: absolute;
  right: 11px;
  transform: rotate(-135deg);
  transform-origin: 50% 50%;
  white-space: nowrap;
  font-size: 25px;
  cursor: default;
  transition: transform 0.3s ease-in-out 0.1s;
}

.lastPanel .car .header .editCar.closeCar {
  transform: rotate(-45deg);
}

.mainWindow .availableCars .car:hover, .mainWindow .orderList .order:hover,.mainWindow .history .date:hover {
  background-color: #eeeeee;
}

.orderList {
  padding-right: 15px;

  height: 630px; 

  overflow-x: clip;
  overflow-y: scroll;
}

.orderList-employee {
  height: 83%
}

.ordersList::-webkit-scrollbar-track {
      background-color: var(--left-side-scrollbar-track);
  }
.ordersList::-webkit-scrollbar {
    width: 10px;

    background-color: var(--left-side-scrollbar-track);
}
.ordersList::-webkit-scrollbar-thumb {
    background-color: var(--left-side-scrollbar-thumb);
}

.createOrder, .records {
  margin-top: 20px;

  height: 40px;
  width: 275px;

  color: var(--main-color);
  background: none;

  border: 1px solid var(--main-color);

  font-family: sans-serif;

  cursor: pointer;
}

.records {
  width: 100%;
}

.createOrder:hover, .records:hover {
  color: var(--text-color);
  background: var(--main-color);

  transition: all .1s ease-in-out;
}

.author, .selectedCar, .dateRent, .dateSettings, .carNumber, .description {
  font-size: 18px;
}

.mainWindow .info .dateSettings {
  display: inline-grid;
}

.dateSettings input {
  margin-bottom: 15px;
}

.info .description textarea {
  height: 285px;
  width: 90%;

  resize: none;
}

.order, .car {
  padding: 10px;
  margin-bottom: 10px;

  height: 120px;

  display: flex;
  flex-direction: column;

  border: 1px solid var(--sub-color);
}

.order {
  padding: 10px;
  margin-bottom: 10px;

  min-height: 140px;
  max-height: 140px;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--sub-color);
}

.order .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 34px;
  color: var(--text-color);
  background: var(--sub-color);
}

.order .body {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  font-family: var(--main-font);
  font-size: 15px;
}

.order .header p {
  margin: 0;
  font-family: var(--main-font);
  font-size: 17px;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order .header .auto-number {
  text-align: right;
}

.order .body .description {
  padding-top: 10px;
  font-size: 16px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  width: auto;
  float: left;
}

.order .body .username {
  font-weight: bold;
  font-size: 17px;
}

.order .body .dates {
  font-size: 15px;
}

.panel-header {
  display: block;
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
}

.lastPanel .carList {
  margin-top: 10px;
  margin-bottom: 8px;
  margin-right: 32px;

  overflow-x: scroll;

  display: flex;

  font-family: var(--main-font);
  font-size: 15px;
  border: 1px solid var(--border-color);
}

.selected {
  background-color: var(--text-color-hover-active);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.car .header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 34px;
  color: var(--text-color);
  background: var(--sub-color);
}

.car .header .name,.car .header .carNumber {
  transition: color 0.3s ease-in-out 0.3s, background-color 0s ease-in-out 0s, min-width 0.3s ease-in-out 0.1s;
  font-size: 15px;
  width: 125px;
  border: none; 
  border-radius: 4px; 
  padding: 6px 4px; 
  color: var(--text-color);
  background-color: var(--sub-color);
  outline: none;
  height: 17px;
  font-size: 15px;
}

.car.editingCar .header .name,.car.editingCar .header .carNumber {
  transition: color 0s ease-in-out 0s, background-color 0.2s ease-in-out 0.4s, min-width 0.3s ease-in-out 0.1s;
  color: var(--sub-color);
  background-color: var(--div-color);
}

.car.editingCar .header .name:focus,.car.editingCar .header .carNumber:focus {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.car.editingCar .header .name {
  width: 260px;
  position: relative;
  left: 2px;
}

.car .header .carNumber {
  text-align: center;
  max-width: 90px;
  position: relative;
  right: 28px;
}

.car .header .carNumber-employee {
  right: 0;
}

.car .body {
  margin-top: 4px;
  display: flex;
  min-height: 65%;
  overflow: hidden;
}

.car .description {
  transition: color 0.3s ease-in-out 0.4s, background-color 0.3s ease-in-out 0.4s, min-width 0.3s ease-in-out 0.1s;
  font-size: 15px;
  border: none; 
  padding: 4px 4px; 
  outline: none;
  resize: none;
  overflow-y: auto; 
  line-height: 1.3;
  background-color: transparent;
  font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
  color: var(--main-color);
  min-height: 100%;
  max-width: 262px;
  min-width: 262px;
  overflow-y: hidden;
}

.car.editingCar .description {
  background-color: var(--div-color);
}

.car .header p {
  margin: 0;
  font-family: var(--main-font);
  font-size: 14px;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.car .header .carId {
  text-align: right;
}

.lastPanel {
  width: 40%;
  background-color: var(--div-color);
}

.custom-checkbox {
  opacity: 0;
  margin-left: 112px;
}

.checkbox-label {
  display: inline-block;
  position: relative;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding-top: 6px;
}

.car .body .checkbox-label {
  width: 70px;
  top: -20px;
  padding-left: 23px;
}

.history .checkbox-label {
  min-width: 170px;
  top: -12px;
  left: -127px;
}

.checkbox-label:before {
  content: '';
  position: absolute;
  width: 17px;
  height: 17px;
  border: 0.5px solid var(--text-color-hover);
  background-color: var(--div-color);
}

.car .body .checkbox-label:before {
  left: 110px;
  top: 13px;
}

.history .checkbox-label:before {
  left: 140px;
  top: 5px;
}

.custom-checkbox:checked + .checkbox-label:before {
  content: '\2713'; 
  text-align: center;
  line-height: 16px;
  font-size: 24px;
  color: var(--main-color);
}

.car .body .save-car {
  margin-top: -8px;
  margin-left: 9px;
  height: 32px;
  width: 90px;
  color: var(--ready-border);
  background-color: var(--div-color);
  border: 1px solid var(--ready-border);
  font-family: sans-serif;
  cursor: pointer;
}

.car .body .save-car.full-save-car {
  width: 126px;
}

.car .body .save-car:hover {
  color: var(--text-color);
  background-color: var(--ready-border);
  transition: all .1s ease-in-out;
}

.car .body .delete-car {
  margin-top: -8px;
  margin-left: 4px;
  height: 32px;
  width: 32px;
  color: var(--deleteButton-background);
  background-color: var(--div-color);
  border: 1px solid var(--deleteButton-background);
  font-family: sans-serif;
  cursor: pointer;
}

.car .body .delete-car.ready-delete {
  color: var(--text-color);
  background-color: var(--deleteButton-background);
  transition: all .1s ease-in-out;
}

.legenda {
  margin-top: -2px;
  padding-right: 38px;
}

.legenda .text-block {
  justify-content: right;
  padding: 2px;
  width: 100%;
  display: flex;
  font-size: 14px;
  margin-right: 25px;
}

.legenda .text-block .circle-with-text {
  padding-top: 2px;
  display: flex;
  align-items: center;
  padding-left: 45px;
}

.legenda .text-block .circle-with-text .circle {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 10px;
}

.legenda .text-block .circle-with-text .solid {
  background-color: var(--main-color);
  border: 2px solid var(--main-color);
}

.legenda .text-block .circle-with-text .outlined {
  border: 2px solid var(--main-color);
}

</style>
