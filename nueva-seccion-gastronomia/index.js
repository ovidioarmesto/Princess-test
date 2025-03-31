// Obtener todos los elementos con la clase gastro-show-modal
const restaurantCards = document.querySelectorAll(".gastro-show-modal");
const modal = document.getElementById("restaurantModal");
const cerrarBtn = document.getElementById("cerrarModal");
const reservarBtn = document.querySelector(".reservar-btn");
const navTabs = document.querySelectorAll(".nav-tab");
const filterBtns = document.querySelectorAll(".filter-btn");

// Variable global para el observer
let scrollObserver = null;

// Función para activar el tab correcto según la categoría
function activateTab(tabId) {
    // Activar la pestaña visualmente
    navTabs.forEach(tab => {
        if (tab.getAttribute("data-tab-id") === tabId) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    // Mostrar/ocultar restaurantes según la categoría
    document.querySelectorAll('.restaurant-detail').forEach(detail => {
        const restaurantId = detail.id.replace('detail-', '');
        const restaurantCard = document.getElementById('n-' + restaurantId);
        const cardTab = restaurantCard ? restaurantCard.getAttribute('data-tab') : null;

        if (cardTab === tabId) {
            detail.style.display = 'block';
        } else {
            detail.style.display = 'none';
        }
    });
}

function setupScrollSpy() {
    const sections = document.querySelectorAll('.restaurant-detail');
    const modalContent = document.querySelector('.modal-contenido');

    // Usar un temporizador para evitar múltiples cambios rápidos
    let scrollTimeout;

    // Crear un objeto para rastrear qué elementos están visibles y su porcentaje
    const visibleSections = {};

    // Función para determinar el elemento más visible
    function updateMostVisibleSection() {
        let maxVisibleSection = null;
        let maxVisiblePercentage = 0;

        // Encontrar el elemento con mayor porcentaje visible
        Object.keys(visibleSections).forEach(sectionId => {
            if (visibleSections[sectionId] > maxVisiblePercentage) {
                maxVisiblePercentage = visibleSections[sectionId];
                maxVisibleSection = sectionId;
            }
        });

        // Si encontramos una sección, actualizar los botones
        if (maxVisibleSection) {
            const restaurantId = maxVisibleSection.replace('detail-', '');

            // Desactivar todos los botones primero
            filterBtns.forEach(btn => {
                btn.classList.remove('active');
            });

            // Activar el botón correspondiente
            const activeFilterBtn = Array.from(filterBtns).find(btn =>
                btn.getAttribute('data-restaurant-id') === restaurantId
            );

            if (activeFilterBtn) {
                activeFilterBtn.classList.add('active');
            }
        }
    }

    // Observer que calcula el porcentaje de visibilidad
    const observer = new IntersectionObserver((entries) => {
        // Procesar cada entrada
        entries.forEach(entry => {
            const sectionId = entry.target.id;

            // Calcular el porcentaje aproximado visible
            const intersectionRatio = entry.intersectionRatio;

            if (entry.isIntersecting) {
                // Añadir o actualizar la entrada en nuestro objeto de tracking
                visibleSections[sectionId] = intersectionRatio;
            } else {
                // Eliminar la entrada si ya no está visible
                delete visibleSections[sectionId];
            }
        });

        // Limpiar cualquier temporizador anterior
        clearTimeout(scrollTimeout);

        // Establecer un pequeño retraso antes de actualizar los botones
        scrollTimeout = setTimeout(updateMostVisibleSection, 100);

    }, {
        root: modalContent,
        rootMargin: '-80px 0px -50% 0px',
        // Usamos thresholds múltiples para un seguimiento más preciso
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    });

    // Observar cada sección
    sections.forEach(section => {
        observer.observe(section);
    });

    // Detectar final del scroll para el último elemento
    modalContent.addEventListener('scroll', function () {
        // Si estamos cerca del final
        const isNearBottom = modalContent.scrollHeight - modalContent.scrollTop - modalContent.clientHeight < 80;

        if (isNearBottom) {
            clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                // Marcar el último filtro como activo
                filterBtns.forEach(btn => {
                    if (btn.getAttribute('data-restaurant-id') === 'rebels') {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }, 100);
        }
    });

    return observer;
}

// Función para abrir el modal y hacer scroll al restaurante
function abrirModal(event) {
    // Obtener el elemento tarjeta actual
    const currentCard = event.currentTarget;

    // Prevenir la navegación por defecto si se hace clic en el enlace "ver más"
    const verMasLink = currentCard.querySelector(".n-gastro-restaurant-vermas");
    if (event.target === verMasLink) {
        event.preventDefault();
    }

    // Obtener el ID del restaurante
    const restaurantId = currentCard.id.replace('n-', ''); // Por ejemplo, convierte "n-lahispaniola" a "lahispaniola"

    // Mostrar el modal
    modal.style.display = "block";

    // Esperar a que el modal se muestre antes de hacer scroll
    setTimeout(() => {
        // Inicializar el ScrollSpy
        if (scrollObserver) {
            scrollObserver.disconnect();
        }
        scrollObserver = setupScrollSpy();

        // Encontrar el botón de filtro correspondiente y marcarlo como activo
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-restaurant-id') === restaurantId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Hacer scroll hasta la sección del restaurante
        const restaurantSection = document.getElementById('detail-' + restaurantId);
        if (restaurantSection) {
            restaurantSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Función para cerrar el modal
function cerrarModal() {
    // Desconectar el observer cuando se cierra el modal
    if (scrollObserver) {
        scrollObserver.disconnect();
        scrollObserver = null;
    }

    modal.style.display = "none";
}

// Agregar el evento de clic a cada tarjeta de restaurante
restaurantCards.forEach(card => {
    card.addEventListener("click", abrirModal);
});

// Cambiar pestaña activa
navTabs.forEach(tab => {
    tab.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab-id");
        activateTab(tabId);

        // Opcional: Podrías mostrar/ocultar restaurantes según el tab seleccionado
    });
});

// Cambiar filtro activo y hacer scroll a la sección correspondiente
filterBtns.forEach(btn => {
    btn.addEventListener("click", function () {
        // Quitar active de todos primero para selección única
        filterBtns.forEach(b => b.classList.remove("active"));

        // Marcar este botón como activo
        this.classList.add("active");

        // Hacer scroll hasta el restaurante correspondiente
        const restaurantId = this.getAttribute('data-restaurant-id');
        const restaurantSection = document.getElementById('detail-' + restaurantId);

        if (restaurantSection) {
            // Comportamiento especial para Rebels (último restaurante)
            if (restaurantId === 'rebels') {
                // Esperar un poco más y usar un scroll más específico para el último elemento
                setTimeout(() => {
                    const modalContent = document.querySelector('.modal-contenido');
                    modalContent.scrollTo({
                        top: modalContent.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            } else {
                restaurantSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Event listener para cerrar el modal
cerrarBtn.addEventListener("click", cerrarModal);

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener("click", function (event) {
    if (event.target === modal) {
        cerrarModal();
    }
});




