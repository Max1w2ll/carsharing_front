<template>
    <div class="header">
      <div class="buttons">
        <a href="https://portal.npf-isb.ru/"> Главная </a>
        <a href="https://portal.npf-isb.ru/employee-base"> Сотрудники </a>
        <a href="https://wiki.npf-isb.ru/doku.php/start"> База знаний </a>
        <div id="dropdownContainer" class="dropdownContainer" @mouseover="dropdownOpen()" @mouseleave="dropdownClose()">
          <a> Заявки </a>
          <div v-if="dropdown" class="dropdown">
            <a href="https://helpdesk.npf-isb.ru/help/2611416429"> Техподдержка СИТ </a>
            <a href="https://portal.npf-isb.ru/chancery"> Канцелярия </a>
          </div>
        </div>
      </div>
      <div class="banner">
        <a href="/">
          <img src="./isb_logo.jpg" width=79 height="64">
        </a>
        <p> Заявки на транспорт ООО «НПФ «ИСБ»</p>
      </div>
    </div>
</template>

<script>
export default {

  data() {
    return {
      dropdown: false,
    }
  },

  methods: {
    dropdownOpen() {
      this.dropdown = true;
      document.getElementById("dropdownContainer").style.height = "96px"
    },

    dropdownClose() {
      this.dropdown = false;
      document.getElementById("dropdownContainer").style.height = "32px"
    }
  },
}

</script>

<style scoped>

.header {
  height: 32px;
  width: 100%;

  background: #2767c9;
}

.buttons {
  display: flex;
}
.buttons a, .buttons div {
  height: 32px;
  width: 160px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--text-color);
  background: var(--main-color);

  font-size: 17px;
  text-align: center;
  text-decoration: none;

  cursor: pointer;
}
.buttons a:hover, .buttons div:hover {
  background-color: #f1f8ff;
  color: #2767c9;
  transition: all .1s ease-in-out;
}

.header .dropdownContainer {
  z-index: 1;
  display: block;
}

.header .dropdown {
  display: block;
  background: #2767c9;
}

.banner {
  position: absolute;
  top: 32px;

  height: 80px;
  width: 100%;

  display: flex;
  align-items: center;

  background: var(--div-color);
  border: 1px solid var(--border-color);
}
.banner a {
  height: 79px;
  width: 160px;

  display: flex;
  align-items: center;
  justify-content: center;
}
.banner p {
  font-size: 32px;
  color: var(--main-color);
}

</style>

