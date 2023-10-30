var ModalWindows = {
    showModal(message, status) {  // Status - Warning message or success? Warning - false. Success - true.
        this.deleteModals();

        let modalWindow = document.createElement('div');
        modalWindow.className = "modalWindow";
        modalWindow.classList.add(status ? "Success" : "Error");
        document.body.appendChild(modalWindow);

        setTimeout(() => {
            modalWindow.classList.add("remove");
            setTimeout(() => {
                modalWindow.remove
            }, 280);
        }, 3500);

        let modalMessage = document.createElement('span');
        modalMessage.textContent = message;
        modalWindow.appendChild(modalMessage);
    },

    deleteModals() {
        let modalWindows = document.querySelectorAll('.modalWindow'); // Prevent spam modals
        for (let i = 0; i < modalWindows.length; i++) {
            modalWindows[i].remove();
        }
    }
}

export default ModalWindows