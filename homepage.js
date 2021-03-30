$(document).ready(function () {
  $('.toggler').on('click', function () {
    $('.menu-container').toggleClass('active');
  });

  $('.nav-toggler').on('click', function () {
    $('.navbar-toggler').toggleClass('is-active');
    $('.navbar-menu').toggleClass('is-active');
  });

  function setMenuHeight() {
    var navbarHeight = $('.navbar').outerHeight();
    $('.menu-wrapper')
      .outerHeight(document.documentElement.clientHeight - navbarHeight)
      .niceScroll({
        emulatetouch: true
      });
  }
  setMenuHeight();
  $(window).on('resize', function () {
    setMenuHeight();
  });
});

// tabs
const tabs = document.querySelectorAll('.tabs li');
const tabContentBoxes = document.querySelectorAll('#tab-content > div');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    // console.log(tabs);
    // console.log(tabContentBoxes);
    tabs.forEach(item => item.classList.remove('is-active'))
    tab.classList.add('is-active');

    const target = tab.dataset.target;
    // console.log(target);
    tabContentBoxes.forEach(box => {
      if(box.getAttribute('id') === target){
        box.classList.remove('is-hidden');
      }
      else {
        box.classList.add('is-hidden');
      }
    })
  })
})

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /*loop through a collection of all HTML elements:*/
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /*make an HTTP request using the attribute value as the file name:*/
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /*remove the attribute, and call this function once more:*/
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }      
      xhttp.open("GET", file, true);
      xhttp.send();
      /*exit the function:*/
      return;
    }
  }
};