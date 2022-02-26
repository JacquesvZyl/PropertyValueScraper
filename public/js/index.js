// AIzaSyBcOibmoJeEFrDWJUAkS_kzuL0eN7EjHIo

let autocomplete;
function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    document.querySelector("#autocomplete"),
    {
      componentRestrictions: { country: ["ZA"] },
    }
  );
}
