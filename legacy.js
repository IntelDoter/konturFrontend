/*var input = $(".autocomplete");
 var list = input.next();

 var cityArray;
 var found;
 var moreCount;
 var prevKey;
 var currentListElem;
 var numberOfVariants;
 var nextElem;
 var isInputDone = false;

 function isEmpty(el) {
 return !$.trim(el.html())
 }

 function capitalize(s) {
 return s[0].toUpperCase() + s.slice(1);
 }

 $.ajax({
 url: "./kladr.json",
 async: false,
 dataType: 'json',
 success: function (data) {
 cityArray = data;
 }
 });

 input.focus(function () {
 if ($(this).val() != "") {
 $(this).select();
 }

 if ($(this).val() != "" && !isInputDone) {
 list.show();
 }

 if (isInputDone) {
 isInputDone = false;
 }
 });

 input.blur(function () {
 list.hide();
 });

 input.on("keyup keydown", function(event) {
 if (event.type == "keydown") {
 switch (event.keyCode) {
 case 38: //up
 event.preventDefault();
 if (currentListElem.prev().is("li")) {
 currentListElem.prev().addClass("current");
 currentListElem.removeClass("current");
 currentListElem = $(".current");
 } else {
 nextElem = currentListElem.parent().children(":last");
 nextElem.addClass("current");
 currentListElem.removeClass("current");
 currentListElem = $(".current");
 }
 break;
 case 40: //down
 event.preventDefault();
 if (currentListElem.next().is("li")) {
 currentListElem.next().addClass("current");
 currentListElem.removeClass("current");
 currentListElem = $(".current");
 } else {
 nextElem = currentListElem.parent().children(":first");
 nextElem.addClass("current");
 currentListElem.removeClass("current");
 currentListElem = $(".current");
 }
 break;
 case 13: //enter
 list.hide();
 input.val(currentListElem[0].textContent);
 isInputDone = true;
 input.blur();
 break;
 }
 }

 if (event.type == "keyup") {
 var key = $(this).val();
 if (key && key != prevKey && !isInputDone) {
 key = capitalize(key);
 prevKey = key;
 found = JSON.search(cityArray, '//*[starts-with(City, "' + key + '")]');
 list.show();

 if (found.length) {
 if (!isEmpty(list)) {
 list.empty();
 }
 if (found.length > 5) {
 numberOfVariants = 5;
 } else {
 numberOfVariants = found.length
 }
 for (var i = 0; i < numberOfVariants; i++) {
 list.append("<li>" + found[i].City + "</li>");
 }
 list.children(":first").addClass("current");
 currentListElem = list.children(":first");
 if (found.length > numberOfVariants) {
 list.append("<p class='list_hint'>Показано " + numberOfVariants + " из " + found.length + " вариантов. Уточните запрос, чтобы увидеть остальные</p>")
 }
 moreCount = found.length - 4;

 } else {
 if (!isEmpty(list)) {
 list.empty();
 }
 list.append("<li class='empty_search'>Не найдено</li>");

 }

 } else if (key == "") {
 isInputDone = false;
 prevKey = key;
 list.hide();
 }
 }
 });

 list.on('mouseenter', 'li', function () {
 if (currentListElem) {
 currentListElem.removeClass("current");
 }
 $(this).addClass("current");
 currentListElem = $(this);
 });

 list.on('mousedown', 'li', function () {
 isInputDone = true;
 var new_value = $(this)[0].textContent;
 input.val(new_value);
 list.hide();
 });*/