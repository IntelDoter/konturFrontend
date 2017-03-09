"use strict";

$(document).ready(function() {
    var found = JSON.search(cityArray, '//*[starts-with(City, "' + "Е" + '")]');

    var inputArr = $(".autocomplete-input");
    var input_with_arrow = inputArr.eq(0); //with arrow
    var input = inputArr.eq(1); //without arrow

    input_with_arrow.autocomplete(found, {type: "with arrow"});
    input.autocomplete(cityArray);
    inputArr.eq(2).autocomplete(found, {type: "with arrow", favorites: true});
    inputArr.eq(3).autocomplete(cityArray, {favorites: true});
});