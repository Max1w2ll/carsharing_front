<script>
  import XLSX from 'xlsx-js-style'
  import vueSelect from 'vue-select';

  export default {
    name: 'modal',
    props: ['data'],

    components: {
      vueSelect,
    },

    data() {
      return {
        orders: this.data,
        selectedDateFrom: null, 
        selectedDateTo: null, 
        selectedNumbersCar: null, 
        selectedUsernames: null, 
        selectedStatuses: null, 
        numbersCar: Array.from(new Set(this.data.map(it => it.numberCar))),
        usernames: Array.from(new Set(this.data.map(it => it.username))),
        statuses: Array.from(new Set(this.data.map(it => it.status))),
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },

      formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('ru-RU', options);
      },

      updateFilter() {
        this.restoreOrders();
        this.updateListByDate();
        this.updateListByUsernames();
        this.updateListByNumberCar();
        this.updateListByStatuses(); 
      },

      restoreOrders() {
        this.orders = this.data;
      },

      updateListByDate() {
        if (this.selectedDateFrom) {
          this.orders = this.orders.filter(it => it.beginDate >= this.selectedDateFrom || it.endDate >= this.selectedDateFrom);
        }
        if (this.selectedDateTo) {
          this.orders = this.orders.filter(it => it.beginDate <= this.selectedDateTo || it.endDate <= this.selectedDateTo);
        }
      },

      updateListByNumberCar() {
        if (this.selectedNumbersCar && this.selectedNumbersCar.length > 0) {
          this.orders = this.orders.filter(it => this.selectedNumbersCar.includes(it.numberCar));
        }
      },

      updateListByUsernames() {
        if (this.selectedUsernames && this.selectedUsernames.length > 0) {
          this.orders = this.orders.filter(it => this.selectedUsernames.includes(it.username));
        }
      },

      updateListByStatuses() {
        if (this.selectedStatuses && this.selectedStatuses.length > 0) {
          this.orders = this.orders.filter(it => this.selectedStatuses.includes(it.status));
        }
      },
      
      async loadTotal() {
            const rows = this.orders.map(row => ({
                numberCar: row.numberCar,
                username: row.username,
                beginDate: row.beginDate,
                endDate: row.endDate,
                status: row.status,
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Бронирование автомобилей");
            XLSX.utils.sheet_add_aoa(worksheet, [["Номер машины","ФИО водителя","Дата начала заказа","Дата окончания заказа","Статус заказа"]], { origin: "A1" });

            for (let i in worksheet) {
                if (typeof(worksheet[i]) != "object") continue;
                let cell = XLSX.utils.decode_cell(i);

                worksheet[i].s = {
                    font: {
                        name: "Calibri",
                        color: { rgb: "2767C9" },
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "center",
                        wrapText: '1',
                    },
                };

                if (cell.r == 0 ) {
                    worksheet[i].s = {
                        font: {
                            name: "Calibri",
                            bold: true,
                            color: { rgb: "2767C9" },
                        },

                        alignment: {
                            vertical: "center",
                            horizontal: "center",
                            wrapText: '1',
                        },

                        border: {
                            bottom: {
                                style: "thick",
                                color: { rgb: "2767C9" }
                            }
                        }
                    };
                }
            }

            worksheet['!cols'] = [
                { 'width': 20  },
                { 'width': 40 },
                { 'width': 20  },
                { 'width': 20  },
                { 'width': 20  },
            ];

            // Write file
            XLSX.writeFile(workbook, "Бронирование автомобилей.xlsx", { compression: true });

        },
    },
  };
</script>

<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header">
        <slot name="header">
          <div class="title"> Построение отчета о заявках на машины </div>
          <img class="closeEditorButton" src="../assets/icons/close_white.png" @click="close"/>
        </slot>
      </header>
      <div style="display: flex;">
      <section class="content blueBack">
        <div id="filterMenu" class="filterMenu">
            <div class="filterSettings"> 
                <table class="bulkTableHeader">
                    <td class="filter"> Фильтры </td>
                </table> 
                <div style="overflow-y: auto; overflow-x: hidden; height: 400px; ">
                    <table class="bulkTableFilters">
                          Период создания
                        <tr class="dateFilter">
                          <div class="divDateFilter">
                            От: 
                          </div>
                          <input class="inputDateFilter" id="filterSettingDateFrom" type="date" v-model="selectedDateFrom" @change="updateFilter">
                        </tr>
                        <tr class="dateFilter">
                          <div class="divDateFilter">
                            До: 
                          </div>
                          <input class="inputDateFilter" id="filterSettingDateTo" type="date" v-model="selectedDateTo" @change="updateFilter">
                        </tr>
                        <tr class="vueSelectFilter">
                          ФИО водителя
                            <vue-select class="select" v-model="selectedUsernames" :options="usernames" multiple searchable @option:selected="updateFilter" @option:deselected="updateFilter"/>
                        </tr>
                        <tr class="vueSelectFilter">
                          Номер машины
                          <vue-select class="select" v-model="selectedNumbersCar" :options="numbersCar" multiple searchable @option:selected="updateFilter" @option:deselected="updateFilter"/>
                        </tr>
                        <tr class="vueSelectFilter">
                          Статус заказа
                            <vue-select class="select" v-model="selectedStatuses" :options="statuses" multiple searchable @option:selected="updateFilter" @option:deselected="updateFilter"/>
                        </tr>
                    </table>
                  </div>
                      <footer class="modal-footer">
                        <div class="totalCount">
                          Всего: {{ orders.length }}
                        </div>
                        <button @click="loadTotal();" class="loadBulk"> Скачать </button>
                      </footer>
                </div>
            </div>
            
      </section>
      <section class="content">
            <div>
                <table class="bulkTableHeader">
                    <td class="numberCar"> Номер машины </td>
                    <td class="fioOrder"> ФИО водителя </td>
                    <td class="beginDate">  Дата начала заказа </td>
                    <td class="endDate">  Дата окончания заказа </td>
                    <td class="status">  Статус заказа </td>
                </table>
                <table class="bulkTableContent">
                  <tr v-for="bulkOrders in orders" :key="orders">
                    <td class="numberCar"> {{ bulkOrders.numberCar }} </td>
                    <td class="fioOrder"> {{ bulkOrders.username }} </td>
                    <td class="beginDate"> {{ this.formatDate(bulkOrders.beginDate) }}</td>
                    <td class="endDate"> {{ this.formatDate(bulkOrders.endDate) }} </td>
                    <td class="status"> {{ bulkOrders.status }}</td>
                  </tr>
                </table>
            </div>
      </section>
      </div>
       
    </div>
  </div>
</template>

<style>
  @import "vue-select/dist/vue-select.css";
  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    background: #FFFFFF;
    box-shadow: 2px 2px 20px 1px;
    overflow-y: block;
    display: flex;
    flex-direction: column;
    height: 539px;
  }

  .modal-footer {
    padding: 15px;
    justify-content: space-between;
    display: flex;
    padding-top: 6px;
  }


  .modal-footer .totalCount {
    padding-top: 6px;
    color: var(--text-color);
  }

  .modal-header {
    background: var(--main-color);
    color: var(--text-color);
    justify-content: space-between;
    height: 9px;
    padding: 15px;
    display: flex;
  }

  .modal-header .title {
    position: relative;
    top: -7px;
  }

  .modal-body {
    position: relative;
    padding: 20px 10px;
  }

  .modal-backdrop .content {
    justify-content: center;
    font-family: var(--main-font);
    color: var(--main-color);
  }
  .blueBack {
    background-color: var(--main-color);
  }

  .filterMenu {  
    background-color: var(--main-color);
    overflow-x: hidden;
    white-space: nowrap;
    margin-bottom: -54px;
    transition: 0.3s;
    transition-timing-function: ease-in-out;
    color: var(--text-color);
    font-family: var(--main-font);
  }

  .filterSettings {
    font-family: var(--main-font);
    font-size: 16px;
    color: var(--text-color);
    height: 495px;
    overflow: hidden;
  }

  .modal-backdrop .closeEditorButton {
    margin-top: 20px;
    top: -24px;
    right: -6px;
    position: relative;
    
    height: 19px;
    width: 19px;

    border: 0;

    cursor: pointer;

    transition: 0.3s;
  }

  .modal-backdrop .loadBulk {
    all: unset;
    margin-right: 11px;
    height: 30px;
    width: 130px;

    border: 1px solid;

    font-family: var(--main-font);
    font-size: 15px;

    text-align: center;

    color: var(--sub-color);
    background: var(--text-color);

    cursor: pointer;

    transition: .3s;
  }

  .modal-backdrop .loadBulk:hover {
    color: var(--main-background);
    background: var(--main-color);
  }
  
  .modal-backdrop  .content .bulkTableHeader {
    border-bottom: 2px solid;
    font-weight: bold;
  }  

  .modal-backdrop  .content .bulkTableHeader td:hover, .filterMenu td:hover {
    background-color: transparent;
  }

  .modal-backdrop .content td {
    height: 40px;

    vertical-align: middle;
    text-align: center;
  }

  .modal-backdrop .content .bulkTableContent {
    border-collapse: collapse;
    height: 452px;
    overflow-x: hidden;
    display: block;
    border-bottom: 2px solid;
    overflow-y: scroll; 
  }

  .modal-backdrop .content .bulkTableContent tr {
    border-bottom: 1px solid;
  }

  .modal-backdrop .content .numberCar {
    width: 150px;
    max-width: 150px;
  }

  .modal-backdrop .content .fioOrder {
    width: 300px;
    max-width: 300px;
  }

  .modal-backdrop .content .beginDate {
    width: 200px;
    max-width: 200px;
  }

  .modal-backdrop .content .endDate {
    width: 200px;
    max-width: 200px;
  }

  .modal-backdrop .content .status {
    width: 150px;
    max-width: 150px;
  }
  
  .modal-backdrop .content .filter, .modal-backdrop .content .filterSettings {
    width: 270px;
    max-width: 280px;
  } 

  .bulkTableFilters {
    width: 100%;
    padding: 14px;
    overflow-y: auto;
    padding-right: 27px;
  }

  .bulkTableFilters .vueSelectFilter {
    height: 63px;
  }

  .bulkTableFilters .dateFilter {
    display: flex;
    justify-content: space-between;
    height: 45px;
    margin-bottom: -3px;
    margin-top: 10px;
  }

  .divDateFilter {
    margin-top: 5px;
  }

  .bulkTableFilters .dateFilter .inputDateFilter {
    height: 30px;
    width: 200px;
  }

  .vs__search::placeholder, .vs__dropdown-toggle, .vs__dropdown-menu {
    background: var(--div-color);
    border: none;
    color: var(--main-color);
  }

  .vs__dropdown-menu {
   overflow-x: hidden; 
  }

  .vs__clear, .vs__open-indicator {
    fill: var(--main-color);
  }

  .vs__selected {
    color: var(--main-color);
  }

</style>