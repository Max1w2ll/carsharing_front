<template>
  <div>
    <Header/>
    <div>
    <div class="mainWindow">
      <div class="history">
        <ul class="tabs clearfix" style="margin-top: 10px; margin-left: -45px">
          <li v-if="userIsAdmin()" :class="HISTORY_TABS.ALL">
            <a href="#" @click="clearHistoryTabs(); HISTORY_TABS.ALL = 'active' "> Все заявки </a>
          </li>
          <li v-if="userIsCoordinator()" :class="HISTORY_TABS.NEED_APPROVE">
            <a href="#" @click="clearHistoryTabs(); HISTORY_TABS.NEED_APPROVE = 'active' "> На согласование </a>
          </li>
          <li :class="HISTORY_TABS.HISTORY">
            <a href="#" @click="clearHistoryTabs(); HISTORY_TABS.HISTORY = 'active' "> История </a>
          </li>
        </ul>
        <div class="square">
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
            <div class="order" @click="getOrder(order.id)" v-for="order in filteredItems" :key="order.id" :data-key="order.id" :class="{ 'selected': order.id === selectedOrder.id }">
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
              <p> Cоздайте новый </p>
            </div>
          </div>
          <div style="padding-right: 10px">
            <button class="records" v-if="userIsAdmin()" @click.prevent="openCreateOrderDialog"> Отчёты </button>
          </div>
        </div>
      </div>

      <div class="info">
        <div class="panel-header"> Информация </div>
          <div :class="{'block-order': isBlockElementForEditingOrder()}" style="position: relative">
            <div class="square">
              <div class="inter-square">
                <div style="display: flex; justify-content: space-between;">
                  <div class = "rectangleGreen">
                    <div v-if="!userIsAdmin() || isBlockElementForEditingOrder()" style="padding-left: 10px;">{{ selectedOrder.status }}</div>
                    <vue-select style="min-width: 160px" :clearable="false" v-if="userIsAdmin() && selectedOrder.id && !isBlockElementForEditingOrder()" v-model="selectedOrder.status" :options="statusesList" @option:selected="setSaveStatusOrder"/>
                  </div>
                  <button :class = "{'clearSelectedFull': selectedOrder.id === undefined, 'clearSelectedHalf': 'id' in selectedOrder}" @click.prevent="clearSelected()">{{(selectedOrderForShow ? 'Новая заявка' : 'Создание заявки')}}</button>
                </div>
                  <div class="info-order">
                    <div class="dateSettings">
                      <div style="min-width: 130px;">
                        Командировка:
                      </div> 
                      <div style="width: 100%;">
                        <div class="date-input" style="margin-left: 10px;">
                          <div>
                            <label for="settingDateFrom">С</label>
                          </div>
                          <div>
                            <input id="settingDateFrom" type="date" v-model="selectedOrder.beginDate" @change="changeDateInOrder()" min="2023-01-01" max="2030-12-31"> 
                          </div>
                        </div> 
                        <div class="date-input">
                          <div>
                            <label for="settingDateTo">По</label>
                          </div>
                          <div>
                            <input id="settingDateTo" type="date" v-model="selectedOrder.endDate" @change="changeDateInOrder()" min="2023-01-01" max="2030-12-31">
                          </div>
                        </div>
                      </div> 
                    </div>
                    <div class="href-recomended-car">
                      <div class="d-flex" v-if="!isBlockElementForEditingOrder()">
                        <a v-if="avalibleCars.length > 0" href="#" @click="openModalRecomendedCar()" class="href-open-modal">Найдены подходящие машины</a>
                        <div v-else>Не найдено подходящих машин</div>
                      </div>
                    </div>
                    <div class="info-order-car">
                      <div class="auto">Автомобиль: </div>
                      <div style="width: 100%; padding-left: 5px; margin-top: -3px; font-size: 16px;">
                        <div v-if="carIsNotFindInList()" style="padding-left: 10px; margin-top: 3px;">Скрыт</div>
                        <vue-select style="height: 34px;" :clearable="false" label="label" v-else-if="!carIsNotFindInList() && (editingOrder || !selectedOrderForShow)" v-model="selectedCar" :options="getCarsList()" @option:selected="selectCarFromOrder"/>
                        <div class="label-car" v-else>{{ getCarLabelById(selectedOrder.car) }}</div>
                        <textarea readonly class="description" :value="carIsNotFindInList() ? 'Автомобиль скрыт администратором.' : (editingOrder || !selectedOrderForShow ? selectedCar.desc : getCarDescById(selectedOrder.car))" />
                      </div>
                    </div>
                    <div class="author"> 
                      <span> Автор заявки: </span> 
                      <span style="margin 5px 0"> {{ selectedOrder.username ? selectedOrder.username : userInfo.displayName }} </span>
                    </div>
                    <div class="admin" style="display: flex; height: 55px;"> 
                      <p style="margin-top: 5px; margin-bottom: 0px; margin-left: 1px;"> Согласующий заявки: </p>
                      <p style="margin-top: 5px; margin-bottom: 5px; margin-left: 1px;" v-if="!(editingOrder || !selectedOrderForShow)"> {{ orderInfo.oorManager }} </p>
                      <vue-select style="padding: 0; margin-left: 0" label="name" :clearable="false" v-model="selectedManager" v-if="coordinators.length > 0 && (editingOrder || !selectedOrderForShow)" :options="coordinators"/>
                    </div>
                    <div>
                      <div class="comment" style="margin-bottom: 5px;">Комментарий: </div>
                      <textarea v-if="!isBlockElementForEditingOrder()" id="orderDesc" class="description" v-model="selectedOrder.desc" />
                      <div v-else class="description">{{ selectedOrder.desc }}</div>
                    </div>
                  </div>
                  <div class="controller-order">
                    <button class="createOrder" v-if="editingOrder || !selectedOrderForShow || isBlockActivateEditingOrder()" :class="{ 'width-100': !selectedOrderForShow}" @click.prevent="createOrder()"> {{ selectedOrderForShow ? "Сохранить" : "Создать"}} </button>
                    <button class="activate-editing-order" v-else @click.prevent="activateEditingOrder()"> Изменить </button>
                    <button class="deleteOrder" v-if="selectedOrderForShow" @click.prevent="openModalDeleteOrder()"> Удалить заявку </button>
                  </div>
                </div>
                <div v-if="readyForRemoveOrder" class="modal-accept-delete">
                  <div class="modal-content">
                    <div style="display: flex; justify-content: center;">
                      Вы уверены, что хотите удалить?
                    </div>
                    <div class="buttons">
                      <button @click="cancelDeleteOrder()" class="createOrder">Отмена</button>
                      <button @click="deleteOrder()" class="deleteOrder">Удалить</button>
                    </div>
                  </div>
                </div>
                <div v-if="openRecomendedCar" class="modal-recomended-car">
                  <div class="modal-content">
                    <div class="header">
                      Список рекомендованных машин
                      <span class="close" @click="openRecomendedCar = false">&times;</span>
                    </div>
                    <table class="recomended-table">
                        <tr v-for="car in avalibleCars" @click="selectCar(car)">
                          <td class="recomended-car">{{ car.label }}</td>
                        </tr>
                    </table>
                  </div>
                </div>
              </div>
          </div>
        </div>

      <div class="lastPanel">
        <div class="availableCars">
          <div class="tab-container">
            <ul class="tabs clearfix">
              <li :class="{ active: activeTab === TABS.ALL }">
                <a href="#" @click="setActiveTab(TABS.ALL)">Весь автопарк</a>
              </li>
              <li :class="{ active: activeTab === TABS.AVAL }">
                <a href="#" @click="setActiveTab(TABS.AVAL)">Доступные машины</a>
              </li>
              <li :class="{ active: activeTab === TABS.FREE }">
                <a href="#" @click="setActiveTab(TABS.FREE)">Свободные сегодня</a>
              </li>
            </ul>
          </div>
          <div class="carList" ref="carListRef" @wheel="scrollHorizontally">
            <div class="car" :data-key="car.id" v-for="car in getCarsByTabs()" :key="car.id" @click="selectCar(car)" :class="{ 'new-car-panel': car.id === -1 , 'selected': car.id === selectedCar.id, 'editingCar': car.id === editingCar.id, 'hide': car.isShowInList === false }">
              <div class="header" :class="{ 'hide': !car.isShowInList }">
                <input class="name" :class="{ 'hide': !car.isShowInList }" v-bind:readonly="car.id !== editingCar.id" v-model="car.name" />
                <input v-if="car.id !== -1" class="carNumber"  v-bind:readonly="car.id !== editingCar.id" v-model="car.number" :class="{ 'carNumber-employee': !userIsAdmin(), 'hide': !car.isShowInList }"/>
                <div v-if="car.id !== -1 && userIsAdmin()" class="editCar" :class="{ 'closeCar': car.id === editingCar.id }" @click.prevent="shareCarPanel(car.id)"> ! </div> 
                <div v-if="car.id !== -1 && userIsAdmin()" class="editCar" @click.prevent="shareCarPanel(car.id)"> ! </div> 
              </div>
              <div class="body">
                <textarea v-if="car.id !== -1" v-bind:readonly="car.id !== editingCar.id" class="description" :class="{'hide': !car.isShowInList}" v-model="car.desc" :title="car.desc" />
                <div v-if="car.id !== -1">
                  <input type="checkbox" :id="'scales_' + car.id" class="custom-checkbox" :checked="intToBool(car.isShowInList)" @change="updateShowInList(car, $event.target.checked)">
                  <label :for="'scales_' + car.id" class="checkbox-label">Доступность</label>
                  <div style="display: flex">
                    <button @click.prevent="saveCar(car)" class="save-car" :class="{ 'full-save-car': car.id === -2 }"> Сохранить </button> 
                    <button v-if="car.id !== -2" @click.prevent="deleteCar(car)" class="delete-car" :class="{ 'ready-delete': readyForRemoveCar }"> 🗑️ </button> 
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="legenda">
            <div class="text-block">
              <div class="circle-with-text">
                <div class="circle avalible"></div>
                Доступные
              </div>
              <div class="circle-with-text">
                <div class="circle unavalible"></div>
                Недоступные
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

const API_LINKS = {
  CARS_GET: `cars/all`,
  CAR_GET: `cars/`,
  CAR_DELETE: `cars/`,
  CAR_GET_AVALIBLE: `cars/avalible-car/`,
  CAR_POST: `cars/create`,
  CAR_PATCH: `cars/edit`,
  CAR_PLAN_GET: `orders/in-month`,

  ORDERS_GET: `orders/all`,
  ORDER_GET: `orders/`,
  ORDER_DELETE: `orders/`,
  ORDER_PATCH: `orders/edit`,
  ORDERS_POST: `orders/create`
}

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
        // https://portal.npf-isb.ru  http://localhost:4451  https://portal.npf-isb.ru/back-test'
        PARRENT_URL: `https://portal.npf-isb.ru/back-test/api/`,

        USER_JWT_GET: 'https://portal.npf-isb.ru/auth/api/checkjwt',
        USER_INFO_GET: 'https://portal.npf-isb.ru/carsharing/api/auth/userinfo',
        AUTH_GET: 'https://portal.npf-isb.ru/auth/api/ldapauth',

        COORDINATORS_GET: 'https://portal.npf-isb.ru/employee-base/api/users/groups/10-01%20%D0%93%D1%80%D1%83%D0%BF%D0%BF%D0%B0%20%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0%D0%BC%D0%B8',
        COORDINATOR_ABRAMOVICH_GET: 'https://portal.npf-isb.ru/employee-base/api/users/fullname/%D0%90%D0%B1%D1%80%D0%B0%D0%BC%D0%BE%D0%B2%D0%B8%D1%87', //Abramovich
        //COORDINATOR_ABRAMOVICH_GET: 'https://portal.npf-isb.ru/employee-base/api/users/fullname/%D0%9F%D0%BB%D0%B5%D1%82%D1%82', //Plett
        //COORDINATOR_ABRAMOVICH_GET: 'https://portal.npf-isb.ru/employee-base/api/users/fullname/%D0%92%D0%B5%D0%BB%D0%B8%D0%BA%D0%BE%D0%B4%D0%BD%D1%8B%D0%B9', //Max
        
        STATUS_ORDER: {
          DONE: 'Одобрен',
          DENY: 'Отклонен',
          PROCESS: 'В обработке'
        },
        TABS: {
          AVAL: 'availableCars',
          ALL: 'allFleet',
          FREE: 'freeToday'
        },
        statusesList: () => [], 
        HISTORY_TABS: { 
          HISTORY: "active", 
          NEED_APPROVE: "",  
          ALL: "" 
        },

        userJWT: () => [], 
        userInfo: () => [], 
        cars: () => [], 
        avalibleCars: () => [], 
        orders: () => [],
        filteredOrders: () => [],

        showActual: true,
        searchTextOrder: '',

        coordinators: [],

        selectedOrder: {},
        selectedCar: {},
        selectedManager: {},
        showDate: new Date(),
        currentPlan: [],
        editingCar: {},
        editingOrderHolder: {},

        activeTab: '',
        selectedOrderForShow: false,
        editingOrder: false,
        readyForRemoveCar: false,
        readyForRemoveOrder: false,
        openRecomendedCar: false,

        emptyCar: {
          desc: "",
          id: -1,
          isShowInList: 1,
          name: "Новая машина",
          number: "",
          isAvalibleNow: 1
        },

        orderInfo: {
          car: null,
          desc: "Тестовое описание",
          beginDate: "",
          endDate: ""
        },

        newOrderPlan: {
          id: "-1",
          title: "",
          status: 'В обработке',
          classes: ["wait"],
          startDate: "",
          endDate: ""
        },
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
    userIsAdmin() {
      return this.userInfo.role === "globaladmin";
    },

    updateShowInList(car, value) {
      this.cars[this.cars.findIndex(it => it.id === car.id)].isShowInList = value ? 1 : 0;
      this.setActiveTab(this.TABS.ALL);
    },

    updateShowActual(value) {
      this.showActual = value;
    },

    intToBool(int) {
      return int === 1 || int;
    },

    getFullUrl(secondPartUrl) {
      return this.PARRENT_URL + (this.userIsAdmin() ? 'manager/' : 'employee/') + secondPartUrl
    },

    setActiveTab(tabName) {
      this.activeTab = tabName;
      if (!this.getCarsByTabs().find(it => it.id == this.selectedCar.id)) {
        this.selectCar(this.getCarsByTabs()[0]);
      }
      setTimeout(async () => {
        this.scrollElementInList(this.selectedCar, this.$refs.carListRef, true);
      }, 500);
    },

    clearHistoryTabs() {
      for (var tab in this.HISTORY_TABS) {
        this.HISTORY_TABS[tab] = "";
      }
    },

    getCarsByTabs() {
      if (this.cars.length !== 0) {
        if (this.activeTab == this.TABS.FREE) {
          return this.cars.filter(it => it.isAvalibleNow && it.isShowInList);
        } else if (this.activeTab == this.TABS.AVAL) {
          return this.cars.filter(it => it.isShowInList);
        }
      }
      return this.cars;
    },

    shareCarPanel(carId) {
      this.readyForRemoveCar = false;
      if (this.editingCar.id === null || this.editingCar.id !== carId) {
        this.shareCarPanel(this.editingCar.id);
        this.editingCar = { ...this.cars.find(it => it.id === carId) };
        if (carId === -2) {
          this.selectedCar.id = -2;
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
            isAvalibleNow: car.isAvalibleNow === 1,
            desc: car.desc,
          }
          axios.post(this.getFullUrl(API_LINKS.CAR_POST), carForSave, { withCredentials: true })
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
            isAvalibleNow: car.isAvalibleNow === 1,
            desc: car.desc,
          }
          axios.patch(this.getFullUrl(API_LINKS.CAR_PATCH), carForSave, { withCredentials: true })
          .then((res) => {
            ModalWindows.showModal('Отредактирована машина ' + res.data.name, true);
            this.doAfterSaveCar(isEdit);
          });
        }
      }
      catch (e) {
        ModalWindows.showModal(e.response.data.message, false);
      }
    },

    deleteCar(car) {
      if (this.readyForRemoveCar) {
        axios.delete(this.getFullUrl(API_LINKS.CAR_DELETE) + car.id, { withCredentials: true })
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

    async setInCalendarPlanCar(carId, dateCalendar) {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      await axios.get(this.getFullUrl(API_LINKS.CAR_PLAN_GET) + `/${carId}` + `/${new Date(dateCalendar).toLocaleDateString('fr-CA', options)}`, { withCredentials: true })
      .then((res) => {
          this.currentPlan = res.data.ordersPerMonth;
          this.changeDateInOrder();
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
      },
      () => {
        this.createAuthWindow();
      });
    },

    async getUserInfo() {
      await axios.get(this.USER_INFO_GET, { withCredentials: true })
      .then((res) => {
        console.log(res.data);
        this.userInfo = res.data;
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
      while (!this.getCarsByTabs().find(it => it.id == car.id)) {
        if (this.activeTab == this.TABS.FREE) {
          this.activeTab = this.TABS.AVAL;
        } else if (this.activeTab == this.TABS.AVAL) {
          this.activeTab = this.TABS.ALL;
        } else {
          break;
        }
        setTimeout(async () => {
          this.scrollElementInList(this.selectedCar, this.$refs.carListRef, true);
        }, 500);
      }
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
      this.openRecomendedCar = false;
    },

    getCars() {
      axios.get(this.getFullUrl(API_LINKS.CARS_GET), { withCredentials: true })
      .then((res) => {
          this.cars = res.data.map(it => {
            it.label = '[' + it.number + '] ' + it.name;
            return it;
          });
          if (this.userIsAdmin()) {
            this.cars.push({ ...this.emptyCar });
          }
          this.setActiveTab(this.TABS.FREE);
      });
    },

    getCarsList() {
      return this.cars.length ? this.cars.filter(it => it.id !== -1 && it.id !== -2) : [];
    },

    getCar(carID) {
      axios.get(this.getFullUrl(API_LINKS.CAR_GET) + carID, { withCredentials: true })
      .then((res) => {
        return res.data
      })
    },

    userIsCoordinator() {
      for (var order in this.orders) {
        if (this.orders[order].oorManager == this.userInfo.displayName) {
          this.userInfo.isCoord = true;
          break;
        }
      }
      this.userInfo.isCoord = false;
    },

    async getCoordinators() {
      await axios.get(this.COORDINATOR_ABRAMOVICH_GET, { withCredentials: true })
        .then((res) => {
          this.coordinators.push({name: res.data[0].displayName, email: res.data[0].mail});
          this.selectedManager = this.coordinators[0];
          console.log(this.selectedManager);
        });
      // Пока тестируем, лучше не давать возможность отправлять письма менеджерам
      /*
      await axios.get(this.COORDINATORS_GET, { withCredentials: true })
      .then((res) => {
        res.data.forEach(element => {
          this.coordinators.push({name: element.displayName, email: element.mail});
          console.log(this.coordinators);
        });
      })*/
    },

    async getOrder(orderId) {
      const order = this.orders.find(obj => obj.id === orderId);
      if (order) {
        this.revertChangeInOrder(order)
        this.selectedOrderForShow = true;
        this.editingOrder = false;
        this.selectedOrder = order;
        this.showDate = order.beginDate;
        const selectedCarByOrder = this.cars.find(it => it.id === this.selectedOrder.car)
        if (selectedCarByOrder) {
          this.selectCar(selectedCarByOrder);
          this.scrollElementInList(this.selectedCar, this.$refs.carListRef, true);
        }
        axios.get(this.getFullUrl(API_LINKS.ORDER_GET) + order.id, { withCredentials: true })
        .then((res) => {
          this.orderInfo = res.data;  
          this.getCar(this.orderInfo.car);
        });
        this.changeDateInOrder();
        this.readyForRemoveOrder = false;
      }
    },

    async selectCarFromOrder() {
      await this.setInCalendarPlanCar(this.selectedCar.id, this.showDate);
      this.scrollElementInList(this.selectedCar, this.$refs.carListRef, true);
    },

    revertChangeInOrder(order) {
      if (Object.keys(this.editingOrderHolder).length === 0) {
        this.editingOrderHolder = { ...order };
      } else if (!order.id || order.id !== this.editingOrderHolder.id) {
        this.orders[this.orders.findIndex(obj => obj.id === this.editingOrderHolder.id)] = { ...this.editingOrderHolder };
        this.filteredItems[this.filteredItems.findIndex(obj => obj.id === this.editingOrderHolder.id)] = { ...this.editingOrderHolder };
        this.selectedOrder = { ...this.editingOrderHolder };
        this.editingOrderHolder = { ...order };
        this.revertCalendarAfterChangeInOrder();
      }
    },

    revertCalendarAfterChangeInOrder() {
      const findPlan = this.currentPlan && this.selectedOrder.id ? 
        this.currentPlan.find(it => it.id === this.selectedOrder.id.toString()) : false;
      if (findPlan) {
        findPlan.startDate = this.selectedOrder.beginDate;
        findPlan.endDate = this.selectedOrder.endDate;
      }
    },

    changeDateInOrder() {
      this.addAndEditOrderCalendar();
      this.remathAvalibleCar();
    },

    async remathAvalibleCar() {
      if (this.selectedOrder.beginDate && this.selectedOrder.endDate) {
        await axios.get(this.getFullUrl(API_LINKS.CAR_GET_AVALIBLE) + `/${this.selectedOrder.beginDate}` + `/${this.selectedOrder.endDate}` + `/${this.selectedOrder.id ? this.selectedOrder.id : 0}`, { withCredentials: true })
          .then((res) => {
            this.avalibleCars = [];
            res.data.forEach(it => {
              const findElement = this.cars.find(car => car.id === it.id && it.isShowInList);
              if (findElement) {
                this.avalibleCars.push(findElement);
              }
            })
          })
      } else {
        this.avalibleCars = [];
      }
    },

    addAndEditOrderCalendar() {
      const findPlan = this.currentPlan ? (this.selectedOrder.id ? 
        this.currentPlan.find(it => it.id.toString() === this.selectedOrder.id.toString()) : 
        this.currentPlan.find(it => it.id === "-1")) : false;
      if (findPlan) {
        findPlan.startDate = this.selectedOrder.beginDate;
        findPlan.endDate = this.selectedOrder.endDate;
        const newOrderPlanForRemove = this.currentPlan.findIndex(it => it.id === "-1");
        if (newOrderPlanForRemove !== -1 && this.selectedOrder.id) {
          this.currentPlan.splice(newOrderPlanForRemove, 1);
        }
      } else {
        if (this.selectedOrder.status !== this.STATUS_ORDER.DENY && !this.isBlockElementForEditingOrder()) {
          this.newOrderPlan.classes = this.selectedOrder.status == this.STATUS_ORDER.DONE ? ["ready", "selected"] : ["wait", "selected"];
          this.newOrderPlan.title = this.selectedOrderForShow ? this.selectedOrder.username : this.userInfo.displayName;
          this.newOrderPlan.startDate = this.selectedOrder.beginDate;
          this.newOrderPlan.endDate = this.selectedOrder.endDate;
          if (!this.currentPlan) {
            this.currentPlan = [this.newOrderPlan];
          } else {
            this.currentPlan.push(this.newOrderPlan);
          }
        }
      }
      this.currentPlan = this.currentPlan;
    },
    
		onClickOrderOnCalendar(clickOrder) {
      const findedOrder = this.orders.length > 0 ? this.orders.find(it => it.id.toString() === clickOrder.id.toString()) : false;
      const actualDate = new Date();
      if (findedOrder) {
        this.searchTextOrder = '';
        if (this.showActual && new Date(findedOrder.endDate) < actualDate) {
          this.showActual = false;
        }
        this.getOrder(findedOrder.id);
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

    async getOrders() {
      await axios.get(this.getFullUrl(API_LINKS.ORDERS_GET), { withCredentials: true })
      .then((res) => {
          this.orders = res.data
          console.log(this.orders);
          const actualDate = new Date();
          this.filteredOrders = this.orders.filter(order =>  new Date(order.endDate) >= actualDate);
      });
    },

    isOrderSelected(obj) {
      if (obj && Object.keys(obj).length === 0 && obj.constructor === Object) {
        return true
      }
      else false
    },

    setSaveStatusOrder() {
      this.orderInfo.car = this.editingOrderHolder ? this.editingOrderHolder.car : this.selectedOrder.car;
      this.orderInfo.desc = this.editingOrderHolder ? this.editingOrderHolder.desc : this.selectedOrder.desc;
      this.orderInfo.beginDate = this.editingOrderHolder ? this.editingOrderHolder.beginDate : this.selectedOrder.beginDate;
      this.orderInfo.endDate = this.editingOrderHolder ? this.editingOrderHolder.endDate : this.selectedOrder.endDate;
      this.orderInfo.status = this.selectedOrder.status;
      axios.patch(this.getFullUrl(API_LINKS.ORDER_PATCH), this.orderInfo, { withCredentials: true })
        .then(() => {
          ModalWindows.showModal("Статус установлен!", true);
          this.getOrders();
          this.setInCalendarPlanCar(this.selectedCar.id, this.showDate);
          this.editingOrderHolder.status = this.selectedOrder.status;
        }).catch((e) => {
          this.selectedOrder.status = this.editingOrderHolder.status;
          ModalWindows.showModal(e.response.data.message, false);
        })
    },

    async createOrder() {
      if (!this.validateForm()) {
        return;
      }
      if (!this.selectedOrder.id && this.selectedOrderForShow == false) {
        this.orderInfo.car = this.selectedCar.id;
        this.orderInfo.desc = document.getElementById('orderDesc').value;
        this.orderInfo.beginDate = this.selectedOrder.beginDate ? this.selectedOrder.beginDate : "";
        this.orderInfo.endDate = this.selectedOrder.endDate ? this.selectedOrder.endDate : "";
        this.orderInfo.oorManager = this.selectedManager.name ? this.selectedManager.name : "";
        this.orderInfo.oorManagerEmail = this.selectedManager.email ? this.selectedManager.email : "";
        try {
          const res = await axios.post(this.getFullUrl(API_LINKS.ORDERS_POST), this.orderInfo, { withCredentials: true });
          ModalWindows.showModal("Заказ создан!", true);
          await this.getOrders();
          await this.setInCalendarPlanCar(this.selectedCar.id, this.showDate);
          this.editingOrderHolder = {};
          this.onClickOrderOnCalendar(res.data);
          this.selectedOrderForShow = true;
        } catch (e) {
          this.readyForRemoveOrder = false;
          this.selectedOrderForShow = false;
          ModalWindows.showModal(e.response.data.message, false);
        }
      } else {
        this.orderInfo.car = this.selectedCar.id;
        this.orderInfo.desc = document.getElementById('orderDesc').value;
        this.orderInfo.beginDate = this.selectedOrder.beginDate ? this.selectedOrder.beginDate : "";
        this.orderInfo.endDate = this.selectedOrder.endDate ? this.selectedOrder.endDate : "";
        axios.patch(this.getFullUrl(API_LINKS.ORDER_PATCH), this.orderInfo, { withCredentials: true })
          .then(async () => {
            ModalWindows.showModal("Заказ сохранен!", true);
            await this.getOrders();
            await this.setInCalendarPlanCar(this.selectedCar.id, this.showDate);
            this.editingOrderHolder = this.selectedOrder;
            this.editingOrder = false;
          }).catch((e) => {
            ModalWindows.showModal(e.response.data.message, false);
          })
      }
      this.readyForRemoveOrder = false;
    },

    validateForm() {
      try {
        this.validateDate(this.selectedOrder.beginDate);
        this.validateDate(this.selectedOrder.endDate);
      } catch (e) {
        console.log(e);
        ModalWindows.showModal(e.error, false);
        return false;
      }
      return true;
    },

    validateDate(inputDate) {
      const userDate = new Date(inputDate);
      if (userDate.getFullYear() < 2022) {
        throw new Error('Введенная дата имеет год меньше допустимого 2022');
      }
      if (userDate.getFullYear() > 2025) {
        throw new Error('Введенная дата имеет год больше допустимого 2025');
      }
    },

    deleteOrder() {
      if (this.readyForRemoveOrder) {
        axios.delete(this.getFullUrl(API_LINKS.ORDER_DELETE) + this.selectedOrder.id, {withCredentials: true})
        .then(() =>{
          this.readyForRemoveOrder = false;
          ModalWindows.showModal('Заказ пользователя ' + this.selectedOrder.username + ' удален');
          this.clearSelected();
          this.getOrders();
          this.setInCalendarPlanCar(this.selectedCar.id, this.showDate);
        }).catch((e) => {
          this.readyForRemoveOrder = false;
          ModalWindows.showModal(e.response.data.message, false);
        })
      }
    },

    openModalDeleteOrder() {
      this.readyForRemoveOrder = true;
    },
    openModalRecomendedCar() {
      this.openRecomendedCar = true;
    },

    cancelDeleteOrder() {
      this.readyForRemoveOrder = false;
    },
    cancelModalRecomendedCar() {
      this.openRecomendedCar = false;
    },

    clearSelected() {
      this.revertChangeInOrder({});
      this.selectedOrder = {};
      this.selectedOrderForShow = false;
      this.editingOrder = false;
      this.readyForRemoveOrder = false;
      this.newOrderPlan = {
          id: "-1",
          title: "",
          status: this.STATUS_ORDER.PROCESS,
          classes: ["wait"],
          startDate: "",
          endDate: ""
        };
      this.changeDateInOrder();
    },

    activateEditingOrder() {
      const selectedCarByOrder = this.cars.find(it => it.id === this.selectedOrder.car)
      if (selectedCarByOrder) {
        this.selectCar(selectedCarByOrder);
        this.scrollElementInList(this.selectedCar, this.$refs.carListRef, true);
      }
      this.editingOrder = true;
    },

    isBlockElementForEditingOrder() {
      return this.isBlockActivateEditingOrder() || !this.editingOrder && this.selectedOrderForShow;
    },

    isBlockActivateEditingOrder() {
      return !this.userIsAdmin() && this.selectedOrder.status && this.selectedOrder.status !== this.STATUS_ORDER.PROCESS || this.carIsNotFindInList();
    },

    carIsNotFindInList() {
      return this.selectedOrderForShow && this.cars.length > 0 && !this.cars.find(car => car.id === this.selectedOrder.car);
    },

    getCarLabelById(carId) {
      return this.cars.length > 0 && carId ? this.cars.find(car => car.id === carId)?.label : null;
    },

    getCarDescById(carId) {
      return this.cars.length > 0 && carId ? this.cars.find(car => car.id === carId)?.desc : null;
    },

    async loadData() {
      await this.getUserJWT();
      await this.getUserInfo();
      this.getCars();
      this.getOrders();
    },
    
    onEscKeyPress(event) {
      if (event.key === 'Escape') {
        this.openRecomendedCar = false;
        this.readyForRemoveOrder = false;
        this.showCreateOrderDialog = false;
      }
    }

  },

  mounted() {
    this.getCoordinators();
    this.statusesList = [this.STATUS_ORDER.DONE, this.STATUS_ORDER.PROCESS, this.STATUS_ORDER.DENY]
    setTimeout(async () => {
      this.loadData();
      window.addEventListener('keydown', this.onEscKeyPress);
      setInterval(async () => {
        this.loadData();
      }, 1000 * 60 * 20)
    }, 100);
  }
}
</script>

<style>
@import "vue-select/dist/vue-select.css";

:root {
  --main-font: "Open Sans", "Segoe UI", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;;
  --text-color: #ffffff;
  --text-color-hover-active: #e3e3e3;
  --text-color-hover: #d2d2d2;
  --text-color-active: #999999;

  --button-idle: #456ead;
  --button-hover: #405c91;
  --button-active: #7d98c9;

  --main-color: #2767c9;
  --sub-color: #2767c9;
  --hide-color: #647f9e;
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
  --blue-gradient: #2767c980;
  --white-gradient: #f1f8ff80;
}

body {
  margin: 0;

  overflow-y: auto;
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

.modal-accept-delete, .modal-recomended-car {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.modal-recomended-car .close {
  cursor: pointer;
  font-size: 24px;
  margin-top: -6px;
}

.modal-recomended-car table {
  width: 100%;
  padding-top: 10px;
}

.modal-recomended-car td {
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}

.modal-recomended-car .header {
  display: flex;
  justify-content: space-around;     
  color: var(--text-color);
  border-radius: 5px;
  background-color: var(--main-color);
  padding-top: 5px;
  display: flex;
  justify-content: space-around;
  padding-bottom: 5px;
}

.modal-accept-delete .modal-content .buttons {
  display: flex;
  justify-content: space-around; 
}

.modal-accept-delete .modal-content, .modal-recomended-car .modal-content {
  width: 80%;
  background: var(--div-color);
  border-radius: 5px;
  padding: 14px;
}

.modal-accept-delete .recomended-table {
  border-collapse: collapse;
}

.modal-accept-delete .recomended-table {
  border-collapse: collapse;
}

.modal-accept-delete .recomended-table tr {
  border-bottom: 1px solid var(--border-color);
}

.recomended-table td {
  cursor: pointer;
}

.modal-accept-delete .recomended-table tr:hover, .recomended-table td:hover {
  background-color: var(--border-color);
}

:root {
  --main-color: #2767c9;
  --text-color: #ffffff;
  --div-color: #ffffff;
  --border-color: rgba(39, 103, 201, .2);
}

.mainWindow {
  margin-top: 80px;
  overflow-x: auto;
  width: 100%;

  display: flex;
  justify-content: center;
}

.mainWindow .history, .mainWindow .info, .mainWindow .lastPanel {
  min-width: 322px;
  width: 20%;
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
}

.modalWindow .history {
  min-width: 322px;
  width: 26%;
}

.mainWindow .info {
  min-width: 360px;
  width: 23%;
}

.block-order .info-order .description, .block-order .dateSettings input, .block-order .deleteOrder, .block-order .createOrder{
  background-color: #fafafa !important;
}
.block-order .info-order .description {
  height: 193px;
  overflow: auto;
  pointer-events: auto;
}

.block-order .createOrder, .block-order .deleteOrder {
  border: 1px solid #9e9e9e !important;
  color: #9e9e9e !important;
}

.block-order .dateSettings input, .block-order .info-order .description {
  border-color: var(--div-color) !important;
}

.block-order .info-order .description {
  padding-left: 2px;
  padding-top: 2px;
}


.mainWindow .lastPanel {
  width: 51%;
  min-width: 640px;
}

.mainWindow .lastPanel .calendar {
  margin-right: 32px;
  height: 550px;
  font-size: 19px;
  padding-top: 2px;
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
  min-width: 210px;
  max-width: 210px;
  cursor: pointer;
}

.mainWindow .availableCars {
  margin-top: 5px;
}

.mainWindow .availableCars .car.editingCar {
  min-width: 340px;
}

.car.hide {
  border: 1px solid var(--hide-color);
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

.mainWindow .availableCars .car.new-car-panel .header {
  max-height: 34px;
  min-height: 34px;
}

.mainWindow .availableCars .car.new-car-panel .name {
  max-width: 102px;
  margin-left: 0;
  pointer-events: none;
  margin-top: 4px;
}

.lastPanel .car .header .editCar {
  position: absolute;
  right: 11px;
  top: -2px;
  transform: rotate(-135deg);
  transform-origin: 50% 50%;
  white-space: nowrap;
  font-size: 25px;
  cursor: default;
  transition: transform 0.3s ease-in-out 0.1s;
  cursor: pointer;
}

.lastPanel .car .header .editCar.closeCar {
  transform: rotate(-45deg);
}

.mainWindow .availableCars .car:hover, .mainWindow .orderList .order:hover,.mainWindow .history .date:hover {
  background-color: #eeeeee;
}

.mainWindow .availableCars .car, .mainWindow .orderList .order {
  border-radius: 5px;
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

.createOrder, .records, .deleteOrder, .activate-editing-order, .selectCarList {
  margin-top: 20px;

  height: 40px;

  color: var(--main-color);
  background: none;

  border: 1px solid var(--main-color);

  font-family: sans-serif;

  cursor: pointer;
}

.selectCarList {
  margin-top: 10px;
  margin-right: 10px;
}

.controller-order {
  display: flex;
  justify-content: space-between;
  bottom: 10px;
  left: 10px;
  position: absolute;
  right: 10px;
}

.createOrder, .deleteOrder, .activate-editing-order {
  width: 40%;
}

.deleteOrder {
  color: var(--deleteButton-background);
  border: 1px solid var(--deleteButton-background);
}

.deleteOrder:hover {
  color: var(--text-color);
  background: var(--deleteButton-background);

  transition: all .1s ease-in-out;
}

.records {
  width: 100%;
}

.createOrder:hover, .records:hover, .mainWindow .info .clearSelectedHalf:hover, .activate-editing-order:hover, .selectCarList:hover {
  color: var(--text-color);
  background: var(--main-color);

  transition: all .1s ease-in-out;
}

.info-order-car {
  display: flex;
  position: relative;
  margin-top: 12px;
}

.mainWindow .info .square {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  background: none;
  margin-left: -15px;
  font-size: 16px;
  border: 1px solid var(--border-color);
}

.mainWindow .history .square {
  transform: translateY(-6px);

  margin-right: 10px;
  margin-left: -20px;
  padding-top: 10px;
  padding-left: 10px;
  padding-bottom: 10px;

  border: 1px solid var(--border-color);
}

.mainWindow .info .block-order {
  pointer-events: none;
  user-select: text;
}

.mainWindow .info .block-order .clearSelectedHalf, .mainWindow .info .block-order .activate-editing-order {
  pointer-events: all;
}

.mainWindow .info .inter-square {
  padding: 10px;
  width: 100%;
  height: 732px;
  position: relative;
}

.mainWindow .info .rectangleGreen {
  flex-grow: 0px;
  position: absolute;
  display: inline-block;

  height: 38px;
  width: 100%;

  position: relative;
  border: 1px solid var(--main-color);

  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-family: sans-serif;
  font-size: 18px;
  color: var(--div-color);
  background-color: var(--main-color);
}

.mainWindow .info .rectangleGreen p {
  padding-left: 30px;
}

.mainWindow .info .clearSelectedFull, .mainWindow .info .clearSelectedHalf {
  position: absolute;
  background-color: var(--div-color);
  flex-grow: 0;
  display: inline-block;

  height: 40px;

  color: var(--main-color);

  border: 1px solid var(--main-color);
  font-family: sans-serif;

  transition: all 0.3s ease-in-out 0.1s;
}

.mainWindow .info .clearSelectedFull {
  width: calc(100% - 20px);
  position: absolute;
  right: 10px;
  font-size: 17px;
  border: none;
  border-bottom: 1px solid var(--border-color);
}

.mainWindow .info .clearSelectedHalf {
  position: absolute;
  right: 10px;
  width: 35%;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
}

.info-order .dateSettings {
  margin-top: 25px;
  width: 100%;
  justify-content: space-between;
  table-layout: fixed;
  display: flex;
}

.info-order .dateSettings .date-input {
  place-content: start;
  display: flex;
}
.info-order .dateSettings label {
  padding-right: 5px;
  font-size: 15px;
}

.info-order .dateSettings input {
  font-size: 15px;
  margin-bottom: 10px;
  display: inline-block;
}

.info-order .description {
  width: 98%;
  height: 260px;
  resize: none;
  font-size: 18px;
  outline: none;
  line-height: 1.3;
  background-color: transparent;
  font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
  color: var(--main-color);
  border: 1px solid var(--sub-color);
}

.info-order .author, .info-order .admin {
  margin-top: 5px;
  font-size: 16px;
  color: var(--sub-color);
}

.v-select {
  width: 100%;
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
  cursor: pointer;
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
  margin-block-start: 1.4em;
  margin-block-end: 0.7em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;

  font-size: 16px;
}

.lastPanel .carList {
  margin-right: 32px;

  overflow-x: scroll;

  display: flex;

  font-family: var(--main-font);
  font-size: 15px;
  border: 1px solid var(--border-color);
}

.tab-container{
  margin: 0;
  padding: 0;
  max-height: 35px;
  padding-top: 1px;
}

ul.tabs{
  margin: 0;
  list-style-type: none;
  line-height: 35px;
  max-height: 35px;
  overflow: hidden;
  display: inline-block;
  padding-right: 10px;
  margin-left: -27px;
}

ul.tabs > li.active{
  z-index: 2;
  background: var(--div-color);
}

ul.tabs > li.active:before{
  border-color: transparent var(--div-color) transparent transparent;
}


ul.tabs > li.active:after{
  border-color: transparent transparent transparent var(--div-color);
}

ul.tabs > li{
  float: right;
  margin: 5px -10px 0;
  border-top-right-radius: 25px 170px;
  border-top-left-radius: 5px 90px;
  padding: 0 30px 0 15px;
  height: 170px;
  background: #eeeeee;
  position: relative;
  box-shadow: 0 4px 7px rgba(0,0,0,.5)
}

ul.tabs > li > a{
  display: inline-block;
  max-width:100%;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  color: var(--main-color);
  font-size: 16px;
  margin-top: -3px;
  padding-left: 3px;
}

ul.tabs > li:before, ul.tabs > li:after{
  content: '';
  background: transparent;
  height: 20px;
  width: 20px;
  border-radius: 100%;
  border-width: 10px;
  top: 0px;
  border-style: solid;
  position: absolute;
}

ul.tabs > li:before{
  border-color: transparent #eeeeee transparent transparent;
  -webkit-transform: rotate(48deg);
  left: -23px;
}

ul.tabs > li:after{
  border-color: transparent transparent transparent #eeeeee;
  -webkit-transform: rotate(-48deg);
  right: -17px;
}

/* Clear Fix took for HTML 5 Boilerlate*/

.clearfix:before, .clearfix:after { content: ""; display: table; }
.clearfix:after { clear: both; }
.clearfix { zoom: 1; }

.selected {
  background-color: var(--text-color-hover-active);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.car .header {
  position: relative;
  color: var(--text-color);
  background: var(--sub-color);
  min-height: 56px;
}

.car .header.hide {
  background: var(--hide-color)
}

.car .header .name, .car .header .carNumber {
  transition: color 0.3s ease-in-out 0.3s, background-color 0s ease-in-out 0s, min-width 0.3s ease-in-out 0.1s;
  font-size: 15px;
  width: 200px;
  margin-top: 2px;
  margin-left: 2px;
  border: none;
  border-radius: 4px;
  padding: 4px 4px;
  color: var(--text-color);
  background-color: var(--sub-color);
  outline: none;
  height: 17px;
  font-size: 15px;
  cursor: pointer;
}

.car .header .name.hide, .car .header .carNumber.hide {
  background-color: var(--hide-color);
}

.car.editingCar .header .name,.car.editingCar .header .carNumber {
  transition: color 0s ease-in-out 0s, background-color 0.2s ease-in-out 0.4s, min-width 0.3s ease-in-out 0.1s;
  color: var(--sub-color);
  background-color: var(--div-color);
}

.car.editingCar .header .name:focus,.car.editingCar .header .carNumber:focus {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.car.editingCar .header .name, .car .header .carNumber {
  position: relative;
}

.car .header .carNumber-employee {
  right: 0;
}

.car .body {
  margin-top: 4px;
  display: flex;
  min-height: 50%;
  overflow: hidden;
  cursor: pointer;
}

.info-order-car .vs__selected-options {
  max-height: 31px;
  overflow: hidden;
}

.info-order-car .label-car {
  max-height: 24px;
  padding-left: 2px;
  margin-bottom: 4px;
  margin-top: 3px;
  overflow: hidden;
}

.info-order-car .description {
  font-size: 16px;
  border: none;
  padding: 4px 4px;
  outline: none;
  resize: none;
  line-height: 1.3;
  background-color: transparent;
  font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
  color: var(--main-color);
  height: 77px;
  width: 100%;
  overflow-y: hidden;
  padding-left: 10px;
}

.car .description {
  transition: color 0.3s ease-in-out 0.4s, background-color 0.3s ease-in-out 0.4s, min-width 0.3s ease-in-out 0.1s;
  font-size: 15px;
  border: none;
  padding: 4px 4px;
  outline: none;
  resize: none;
  line-height: 1.3;
  background-color: transparent;
  font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
  color: var(--main-color);
  min-height: 100%;
  max-width: 202px;
  min-width: 202px;
  overflow-y: hidden;
  cursor: pointer;
}

.car .description.hide {
  color: var(--hide-color);
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
  padding-left: 6px;
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
  left: 104px;
  top: 4px;
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
  margin-top: -15px;
  margin-left: 4px;
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
  margin-top: -15px;
  margin-left: 4px;
  height: 32px;
  width: 32px;
  color: var(--deleteButton-background);
  background-color: var(--div-color);
  border: 1px solid var(--deleteButton-background);
  font-family: sans-serif;
  cursor: pointer;
}

.ready-delete {
  color: var(--text-color) !important;
  background-color: var(--deleteButton-background) !important;
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

.legenda .text-block .circle-with-text .unavalible {
  border: 1px solid var(--hide-color);
  background-color: var(--hide-color);  
}

.legenda .text-block .circle-with-text .avalible {
  border: 1px solid var(--main-color);
  background-color: var(--main-color);
}

.legenda .text-block .circle-with-text .outlined {
  border: 2px solid var(--main-color);
}

input[type="date"]{
    color: var(--main-color);
    outline: none;
    border-radius: 5px;
    border: 1px solid var(--main-color);
}
::-webkit-calendar-picker-indicator{
    background-color: var(--border-color);
    padding: 5px;
    cursor: pointer;
    border-radius: 3px;
}

.theme-default .cv-item.selected::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background-image: linear-gradient(to right, var(--blue-gradient), var(--white-gradient), var(--blue-gradient), var(--white-gradient), var(--blue-gradient), var(--white-gradient), var(--blue-gradient), var(--white-gradient), var(--blue-gradient));
  background-size: 200% auto;
  opacity: 0.5;
  animation: gradientBackground 4s linear infinite;
}

@keyframes gradientBackground {
  0% {
    background-position: 0 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.width-100 {
  width: 100%;
}

.d-flex {
  display: flex;
}

.href-open-modal:visited {
  color: var(--button-active) !important;
}

.href-recomended-car {
  margin-top: 10px;
  display: flex;
  color: var(--button-active) !important; 
  min-height: 24px;
}

.vs__search, .vs__selected-options, .vs__dropdown-toggle, .vs__open-indicator {
  cursor: pointer;
}

</style>
