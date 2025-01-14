document.addEventListener('DOMContentLoaded', function () {
    const openModalButtons = document.querySelectorAll('.open-modal');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close');

    openModalButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const imgNumber = button.getAttribute('data-img');
            const imgSrc = `IMAGES/RED CROSS/screenshot${imgNumber}.png`; // Modify this according to your file paths
            modalImg.src = imgSrc;
            modal.style.display = 'flex';
        });
    });

    closeModal.addEventListener('click', function (event) {
        event.preventDefault();  // Prevent the default behavior of the anchor tag
        modal.style.display = 'none';
    });

    // Close modal if clicked outside the image
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
