(function ($) {
    $.fn.autocomplete = function (data, options) {

        options = $.extend({
            type: "without arrow",
            favorites: false
        }, options);

        var make = function () {
            var input = $(this);

            input.after("<ul class='autocomplete__option-list'></ul>");
            var list = input.next(".autocomplete__option-list");

            if (options.type == "with arrow") {
                list.addClass("option-list_with-arrow");
            } else {
                list.addClass("option-list_without-arrow");
            }

            var filteredArr;
            var currentListElem;
            var currentListElemIndex = -1;
            var numberOfVariants;
            var isInputDone = false;
            var currentScroll = 0;
            var prevKey;

            if (options.type == "with arrow") { // запоминаем высоту элементов, для их последующего уменьшения увеличения
                var listItemHeight = 27;
                var originalHeight = list.height();
            }

            function isEmpty() { // проверка листа на пустоту
                return !$.trim(list.html())
            }

            function capitalize(s) { // функция увеличения первой буквы для удобства ввода пользователя
                return s[0].toUpperCase() + s.slice(1);
            }

            function getElemIndex(value) { // функция для вычисления положения элемента в списке
                var index;
                for (var i = 0; i < data.length; i++) {
                    if (value == data[i].City) {
                        index = i;
                        break;
                    }
                }
                if (options.favorites) { // если в списке есть избранные, добавляем их количество к индексу
                    index += favoritesArr.length + 1;
                }

                return index
            }

            function fillList(arr, length) {
                for (var i = 0; i < length; i++) {
                    list.append("<li class='autocomplete__list-item'>" + arr[i].City + "</li>");
                }
            }

            if (options.favorites) { // формирование тестового списка избранных подсказок
                var favoritesArr = [
                    {
                        "Id": 4980,
                        "City": "Екатеринбург"
                    },
                    {
                        "Id": 4948,
                        "City": "Саратов"
                    },
                    {
                        "Id": 2428,
                        "City": "Астрахань"
                    }
                ]
            }

            list.on('mousewheel DOMMouseScroll', function(e) { // блокировка скролла странцы, при скролле листа
                var e0 = e.originalEvent;
                var delta = e0.wheelDelta || -e0.detail;

                this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
                e.preventDefault();
            });

            list.on("scroll", function() { // на скролл обновляем значение текущего скролла
                currentScroll = list.scrollTop();
            });

            input.on("focus", function () {
                var key = $(this).val();
                filteredArr = data;

                if (key != "") {
                    $(this).select();
                }

                if ($(this).hasClass("autocomplete-input_invalid")) {
                    $(this).removeClass("autocomplete-input_invalid");
                    $(this).next(".autocomplete__invalid-text").remove();
                }

                if (options.type == "with arrow") {
                    if (isInputDone || isEmpty()) {
                        if (!isEmpty()) {
                            list.empty();
                        }

                        if (options.favorites) { // добавление элементов в список
                            fillList(favoritesArr, favoritesArr.length);
                            list.append("<div class='autocomplete__option-list-separator'></div>");
                        }

                        fillList(data, data.length);

                        if (list.height() != originalHeight) { // если до этого лист был уменьшен, возвращаем ему первоначальную высоту
                            list.height(originalHeight);
                        }
                    }

                    list.show();

                    if (currentListElemIndex != -1) { // если до этого был выбран элемент, делаем фокус на него и скроллим
                        currentListElem = list.children().eq(currentListElemIndex);
                        currentListElem.addClass("option-list_current");

                        currentScroll = listItemHeight * currentListElemIndex;
                        if (options.favorites) {
                            currentScroll -= 20; // если в списке есть избранное, прибавляем так же высоту раздеояющей полосы
                        }
                        list.scrollTop(currentScroll);
                    }
                } else {

                    if (options.favorites && isEmpty()) {
                        list.append("<p class='autocomplete__list-hint list-hint_top'>Популярные города</p>");
                        fillList(favoritesArr, favoritesArr.length);
                    }

                    if ((options.favorites || $(this).val() != "") && !isInputDone) {
                        list.show();
                    }

                }
            });

            input.on("blur", function () {
                if (filteredArr.length == 1) { // если в списке остался один вариант, автоматические подставляем его
                    input.val(filteredArr[0].City);
                    isInputDone = true;
                    filteredArr = [];
                } else if (!isInputDone) {
                    $(this).addClass("autocomplete-input_invalid");
                    $(this).after("<div class='autocomplete__invalid-text'>Выберите значение из списка</div>");
                }
                list.hide();
            });

            input.on("input", function () {
                var key = $(this).val();
                prevKey = key;
                if (key.length <= prevKey.length) {
                    filteredArr = data;
                }
                isInputDone = false; // на любое изменение поля, делаем статус ввода незаконченным
                list.empty();

                //list.append("<p class='autocomplete__loading'><div class='loader'></div> Загружается</p>");
                //setTimeout(getElementsFromArr, 1000);

                if (key != "") {
                    key = capitalize(key);

                    list.empty();
                    filteredArr = JSON.search(filteredArr, '//*[starts-with(City, "' + key + '")]'); // поиск значения в массиве

                    if (filteredArr.length) {

                        numberOfVariants = filteredArr.length;

                        if (options.type == "with arrow") {

                            fillList(filteredArr, numberOfVariants);
                            if (numberOfVariants * listItemHeight < originalHeight) { // если суммарная высота элементов в списке, меньше чем изначальная высота, уменьшаем высоту листа
                                list.height(Math.ceil(numberOfVariants * listItemHeight))
                            } else { // иначе, если высота элементов больше, возвращаем первоначальную высоту
                                list.height(originalHeight);
                            }

                        } else if (options.type == "without arrow") {
                            if (numberOfVariants > 5) {
                                numberOfVariants = 5; // если вариантов больше 5, тогда отображаем только 5, остальные скрываем
                            }

                            fillList(filteredArr, numberOfVariants);
                        }

                        list.children(":first").addClass("option-list_current"); // присваиваем первому элементу в списке класс selected
                        currentListElem = list.children(":first");

                        if (filteredArr.length > numberOfVariants && options.type == "without arrow") { // выводим подсказку, сколько элементов не влезло в показ списка
                            list.append("<p class='autocomplete__list-hint'>Показано " + numberOfVariants + " из "
                                + filteredArr.length + " вариантов. Уточните запрос, чтобы увидеть остальные</p>")
                        }

                    } else { // если в исходном массиве ничего не найдено, выводим надпись не найдено
                        currentListElem = false;

                        list.empty();
                        if (options.type == "with arrow") { // так как у инпута со стрелкой фиксированная высота листа, уменьшаем его для показа подсказки
                            list.height(listItemHeight);
                        }
                        list.append("<p class='option-list_empty'>Не найдено</p>");
                    }
                    list.show();
                } else if (key == "") {

                    if (options.type == "with arrow") {
                        list.empty();
                        if (list.height != originalHeight) {
                            list.height(originalHeight);
                        }

                        if (options.favorites) {
                            for (var k = 0; k < favoritesArr.length; k++) {
                                list.append("<li class='autocomplete__list-item'>" + favoritesArr[k].City + "</li>");
                            }
                            list.append("<div class='autocomplete__option-list-separator'></div>");
                        }

                        for (var j = 0; j < data.length; j++) {
                            list.append("<li class='autocomplete__list-item'>" + data[j].City + "</li>");
                        }

                        currentScroll = 0;
                        list.scrollTop(currentScroll); // скроллим лист вверх
                    } else {
                        if (options.favorites) {
                            list.empty();
                            list.append("<p class='autocomplete__list-hint list-hint_top'>Популярные города</p>");
                            for (var j = 0; j < favoritesArr.length; j++) {
                                list.append("<li class='autocomplete__list-item'>" + favoritesArr[j].City + "</li>");
                            }
                            list.show();
                        } else {
                            list.hide();
                        }

                        }
                    }

            });

            input.on("keydown", function (event) {
                switch (event.keyCode) {
                    case 38: //up
                        event.preventDefault();
                        if (currentListElem && currentListElem.prev().is("li")) {
                            currentListElem.removeClass("option-list_current");
                            currentListElem = currentListElem.prev();
                            currentListElem.addClass("option-list_current");


                            if (currentListElem.position().top < 0) { // если элемент вылез за границы листа, скроллим вверх
                                currentScroll += Math.ceil(currentListElem.position().top);
                                list.scrollTop(currentScroll);
                            }

                        }
                        break;

                    case 40: //down
                        event.preventDefault();
                        if (currentListElem && currentListElem.next().is("li")) {
                            currentListElem.removeClass("option-list_current");
                            currentListElem = currentListElem.next();
                            currentListElem.addClass("option-list_current");

                            if (currentListElem.position().top + currentListElem.height() > list.height()) { // если элемент вылез за границы листа, скроллим вниз
                                currentScroll += Math.ceil(currentListElem.position().top + currentListElem.height() - list.height());
                                list.scrollTop(currentScroll);
                            }

                        }
                        break;

                    case 13: //enter
                        event.preventDefault();
                        if (currentListElem) { // если в списке есть выбранный элемент
                            list.hide();

                            var selectedValue = currentListElem[0].textContent;
                            if (options.type == "with arrow") {
                                if (options.type == "with arrow") {
                                    if (currentListElem) {
                                        if (input.val() == "") {
                                            currentListElemIndex = currentListElem.index();
                                        } else {
                                            currentListElemIndex = getElemIndex(selectedValue);
                                        }
                                    }
                                }
                            }

                            input.val(selectedValue);
                            isInputDone = true;
                            input.blur();
                            currentListElem = false;
                        }
                        break;

                    case 27: //escape
                        list.hide();
                        break;
                }
            });

            list.on('mouseenter', 'li', function () {
                if (currentListElem) {
                    currentListElem.removeClass("option-list_current");
                }
                $(this).addClass("option-list_current");
                currentListElem = $(this);
            });

            list.on('mousedown', 'li', function () {
                isInputDone = true;
                var selectedValue = $(this)[0].textContent;

                if (options.type == "with arrow") {
                    if (currentListElem) {
                        if (input.val() != "") {
                            currentListElemIndex = currentListElem.index();
                        } else {
                            currentListElemIndex = getElemIndex(selectedValue);
                        }
                    }
                }

                input.val(selectedValue);
                currentListElem.removeClass("option-list_current");
                currentListElem = false;
                list.hide();
            });

        };

        return this.each(make);

    };
})(jQuery);