const dropdownTriggers = document.querySelectorAll(`[data-dropdown-target]`);
let offset = 8;

const initiateDropdowns = () => {
    for (dropdownTrigger of dropdownTriggers) {
        dropdownTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            showDropdown(e);
        })
    }
}

const showDropdown = (e) => {
    let triggerData = e.target.getBoundingClientRect();
    let triggerX = triggerData.x;
    let triggerY = triggerData.y;
    let triggerWidth = triggerData.width;
    let triggerHeight = triggerData.height;

    let targetClass = e.target.getAttribute("data-dropdown-target");
    let targetEl = document.querySelector(`#${targetClass}`);

    if (targetEl.classList.contains(`u-d_none`)) {
        closeAllDropdowns();
        targetEl.classList.remove("u-d_none");
        targetEl.style.left = triggerX -triggerWidth + offset;
        targetEl.style.top = triggerY + triggerHeight + offset;

    } else {
        targetEl.classList.add("u-d_none")
    }
}

const closeAllDropdowns = () => {
    for (dropdownTrigger of dropdownTriggers) {
        let targetClass = dropdownTrigger.getAttribute("data-dropdown-target");
        let targetEl = document.querySelector(`#${targetClass}`);
        targetEl.classList.add("u-d_none");
    }
}

initiateDropdowns();