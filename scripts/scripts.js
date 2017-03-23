"use strict";

$(document).ready(function() {
    var inputArr = $(".autocomplete__input");

    inputArr.eq(0).autocomplete({type: "with arrow"});
    inputArr.eq(1).autocomplete({type: "with arrow", favorites: true});
    inputArr.eq(2).autocomplete();
    inputArr.eq(3).autocomplete({favorites: true});
});