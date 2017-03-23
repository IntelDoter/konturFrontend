(function ($) {
    $.fn.autocomplete = function (options) {

        options = $.extend({
            type: "without arrow",
            favorites: false
        }, options);

        var make = function () {
            var input = $(this);

            input.after("<ul class='autocomplete__option-list'></ul>");
            var list = input.next(".autocomplete__option-list");

            if (options.type == "with arrow") {
                list.addClass("autocomplete__option-list_with-arrow");
            } else {
                list.addClass("autocomplete__option-list_without-arrow");
            }

            var filteredArr = [];
            var favoritesArr = [];
            var currentListElem;
            var currentListElemIndex = -1;
            var numberOfVariants;
            var isInputDone = false;
            var currentScroll = 0;
            var prevKey = "";
            var originArr = [];

            function isEmpty() { // проверка листа на пустоту
                return !$.trim(list.html())
            }

            function capitalize(s) { // функция увеличения первой буквы для удобства ввода
                return s[0].toUpperCase() + s.slice(1);
            }

            function fillList(arr, length) { // функция заполнения листа
                for (var i = 0; i < length; i++) {
                    list.append("<li class='autocomplete__list-item'>" + arr[i].City + "</li>");
                }
            }

            list.on("mousewheel DOMMouseScroll", function (e) { // блокировка скролла страницы, при скролле листа
                var e0 = e.originalEvent;
                var delta = e0.wheelDelta || -e0.detail;

                this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
                e.preventDefault();
            });

            list.on("scroll", function () {
                currentScroll = list.scrollTop();
            });

            input.on("blur", function () {
                if (filteredArr.length == 1) { // если в списке остался один вариант, автоматические подставляем его
                    input.val(filteredArr[0].City);
                    isInputDone = true;
                    filteredArr = [];
                } else if (!isInputDone) {
                    $(this).addClass("autocomplete__input_invalid");
                    $(this).after("<div class='autocomplete__invalid-text'>Выберите значение из списка</div>");
                }
                list.hide();
            });

            list.on("mouseenter", "li", function () {
                if (currentListElem) {
                    currentListElem.removeClass("autocomplete__list-item_current");
                }
                $(this).addClass("autocomplete__list-item_current");
                currentListElem = $(this);
            });

            list.on("mousedown", "li", function () {
                var selectedValue = $(this).text();
                input.val(selectedValue);

                isInputDone = true;
                currentListElem.removeClass("autocomplete__list-item_current");
                list.hide();
            });

            input.on("keydown", function (event) {
                switch (event.keyCode) {
                    case 38: //up
                        event.preventDefault();
                        if (currentListElem && currentListElem.prev().is("li")) {
                            currentListElem.removeClass("autocomplete__list-item_current");
                            currentListElem = currentListElem.prev();
                            currentListElem.addClass("autocomplete__list-item_current");

                            if (currentListElem.position().top < 0) { // если элемент вылез за границы листа, скроллим вверх
                                currentScroll += Math.ceil(currentListElem.position().top);
                                list.scrollTop(currentScroll);
                            }

                        }
                        break;

                    case 40: //down
                        event.preventDefault();
                        if (currentListElem && currentListElem.next().is("li")) {
                            currentListElem.removeClass("autocomplete__list-item_current");
                            currentListElem = currentListElem.next();
                            currentListElem.addClass("autocomplete__list-item_current");

                            if (currentListElem.position().top + currentListElem.height() > list.height()) { // если элемент вылез за границы листа, скроллим вниз
                                currentScroll += Math.ceil(currentListElem.position().top + currentListElem.height() - list.height());
                                list.scrollTop(currentScroll);
                            }

                        }
                        break;

                    case 13: //enter
                        event.preventDefault();
                        if (currentListElem) { // если в списке есть выбранный элемент
                            var selectedValue = currentListElem.text();
                            input.val(selectedValue);

                            isInputDone = true;
                            currentListElem.removeClass("autocomplete__list-item_current");
                            input.blur();
                        }
                        break;

                    case 27: //escape
                        list.hide();
                        break;

                    case 37: // отменяем стандартные действия при нажатии стрелок
                    case 39:
                        event.preventDefault();
                }
            });

            // Общие функции объявлены

            if (options.type == "with arrow") {
                var listItemHeight = 27;
                var originalHeight = list.height();


                function getElemIndex(value) { // функция для вычисления положения элемента в списке
                    var index;
                    for (var i = 0; i < originArr.length; i++) {
                        if (value == originArr[i].City) {
                            index = i;
                            break;
                        }
                    }
                    if (options.favorites) { // если в списке есть избранные, добавляем их количество к индексу
                        index += favoritesArr.length + 1; // также учитываем, что между избранным и списком есть разделитель
                    }

                    return index
                }

                list.on("mousedown", "li", function () {
                    var selectedValue = $(this).text();
                    if (currentListElem) {
                        if (input.val() != "") {
                            currentListElemIndex = currentListElem.index();
                        } else {
                            currentListElemIndex = getElemIndex(selectedValue);
                        }
                    }
                    currentListElem = false;
                });

                input.on("keydown", function (event) {
                    switch (event.keyCode) {
                        case 13: //enter
                            var selectedValue = currentListElem.text();
                                if (currentListElem) {
                                    if (input.val() == "") {
                                        currentListElemIndex = currentListElem.index();
                                    } else {
                                        currentListElemIndex = getElemIndex(selectedValue);
                                    }
                                }
                            currentListElem = false;
                            break;
                    }
                });

                input.on("focus", function () {
                    var key = $(this).val();

                    if (key != "") {
                        $(this).select();
                    }

                    if ($(this).hasClass("autocomplete__input_invalid")) {
                        $(this).removeClass("autocomplete__input_invalid");
                        $(this).next(".autocomplete__invalid-text").remove();
                    }

                    if (isInputDone || isEmpty()) {
                        if (!isEmpty()) {
                            list.empty();
                        }

                        if (options.favorites) {
                            $.get("http://localhost:3000/favoriteCities/", function (data) {
                                favoritesArr = data;
                            }).done(function () {
                                for (var i = favoritesArr.length - 1; i >= 0; i--) { // не будем пользоваться функцией добавления, так как список избранных всегда должен быть в начале
                                    list.prepend("<li class='autocomplete__list-item autocomplete__list-item_favorite'>" + favoritesArr[i].City + "</li>");
                                }
                                list.children().last().after("<div class='autocomplete__option-list-separator'></div>");
                            });
                        }

                        $.get("http://localhost:3000/shortArray/", function (data) { // запрос данных
                            originArr = data;
                            numberOfVariants = originArr.length;
                        }).done(function () {
                            fillList(originArr, numberOfVariants);
                            filteredArr = originArr;

                            if (list.height() != originalHeight) { // если до этого лист был уменьшен, возвращаем ему первоначальную высоту
                                list.height(originalHeight);
                            }

                            if (currentListElemIndex != -1) { // если до этого был выбран элемент, делаем фокус на него и скроллим
                                currentListElem = list.children().eq(currentListElemIndex);
                                currentListElem.addClass("autocomplete__list-item_current autocomplete__list-item_selected");

                                currentScroll = listItemHeight * currentListElemIndex;
                                if (options.favorites) {
                                    currentScroll -= 20; // учитываем, что между избранным и списком есть разделитель
                                }
                                list.scrollTop(currentScroll);
                            }
                        });
                    }

                    list.show();
                });

                input.on("input", function () {
                    var key = $(this).val();

                    if (key.length <= prevKey.length && key != "") {
                        filteredArr = originArr;
                    }
                    prevKey = key;

                    isInputDone = false; // на любое изменение поля, делаем статус ввода незаконченным
                    list.empty();

                    if (key != "") {
                        key = capitalize(key);
                        list.empty();

                        filteredArr = filteredArr.filter(function (item) {
                            return item.City.indexOf(key) == 0
                        });
                        numberOfVariants = filteredArr.length;

                        if (numberOfVariants) {
                            fillList(filteredArr, filteredArr.length);

                            if (numberOfVariants * listItemHeight < originalHeight) { // если суммарная высота элементов в списке, меньше чем изначальная высота, уменьшаем высоту листа
                                list.height(Math.ceil(numberOfVariants * listItemHeight))
                            } else { // иначе, если высота элементов больше, возвращаем первоначальную высоту
                                list.height(originalHeight);
                            }


                            list.children(":first").addClass("autocomplete__list-item_current"); // присваиваем первому элементу в списке класс selected
                            currentListElem = list.children(":first");

                        } else { // если в исходном массиве ничего не найдено, выводим надпись не найдено
                            currentListElem = false;

                            list.empty();
                            if (options.type == "with arrow") { // так как у инпута со стрелкой фиксированная высота листа, уменьшаем его для показа подсказки
                                list.height(listItemHeight);
                            }
                            list.append("<p class='autocomplete__list-item autocomplete__option-list_empty'>Не найдено</p>");
                        }

                        list.show();

                    } else if (key == "") {
                        list.empty();
                        if (list.height != originalHeight) {
                            list.height(originalHeight);
                        }

                        if (options.favorites) {
                            fillList(favoritesArr, favoritesArr.length);
                            list.append("<div class='autocomplete__option-list-separator'></div>");
                        }
                        fillList(originArr, originArr.length);
                        filteredArr = originArr;

                        currentScroll = 0;
                        list.scrollTop(currentScroll);
                    }

                });

            } else if (options.type == "without arrow") {
                var calculatedHeight;

                input.on("focus", function () {
                    var key = $(this).val();
                    if (key != "") {
                        $(this).select();
                    }

                    if ($(this).hasClass("autocomplete__input_invalid")) {
                        $(this).removeClass("autocomplete__input_invalid");
                        $(this).next(".autocomplete__invalid-text").remove();
                    }

                    if (options.favorites && isEmpty()) {
                        list.append("<p class='autocomplete__list-hint autocomplete__list-hint_top'>Популярные города</p>");

                        $.get("http://localhost:3000/favoriteCities/", function (data) {
                            favoritesArr = data;
                            fillList(favoritesArr, favoritesArr.length);
                        });

                    }

                    if ((options.favorites || $(this).val() != "") && !isInputDone) {
                        list.show();
                    }
                });

                input.on("input", function () {
                    var key = $(this).val();


                    isInputDone = false; // на любое изменение поля, делаем статус ввода незаконченным
                    list.empty();

                    if (key != "") {
                        key = capitalize(key);
                        list.empty();

                        function getList() { // выделим заполнение листа в отдельную функцию
                            if (numberOfVariants) {
                                if (numberOfVariants > 5) { // если вариантов больше 5, тогда отображаем только 5, остальные скрываем
                                    numberOfVariants = 5;
                                }

                                fillList(filteredArr, numberOfVariants);

                                calculatedHeight = numberOfVariants * listItemHeight;

                                list.children(":first").addClass("autocomplete__list-item_current"); // присваиваем первому элементу в списке класс selected
                                currentListElem = list.children(":first");

                                if (filteredArr.length > numberOfVariants) { // выводим подсказку, сколько элементов не влезло в показ списка
                                    list.append("<p class='autocomplete__list-hint'>Показано " + numberOfVariants + " из "
                                        + filteredArr.length + " вариантов. Уточните запрос, чтобы увидеть остальные</p>")
                                    calculatedHeight += list.last().height();
                                }

                                if (calculatedHeight != list.height()) {
                                    list.height(calculatedHeight);
                                }

                            } else { // если в исходном массиве ничего не найдено, выводим надпись
                                list.empty();
                                list.append("<p class='autocomplete__list-item autocomplete__option-list_empty'>Не найдено</p>");
                            }
                        }

                        if (originArr.length && prevKey.length < key.length) { // если мы уже прогружали данные, обратимся к ним
                            filteredArr = originArr.filter(function (item) {
                                return item.City.indexOf(key) == 0
                            });

                            numberOfVariants = filteredArr.length;
                            getList();
                        } else {
                            $.get("http://localhost:3000/cities/" + key, function () {
                            }).done(function (data) {
                                originArr = data;
                                filteredArr = originArr;

                                prevKey = key;
                                numberOfVariants = filteredArr.length;
                                getList();
                            });
                        }
                        list.show();

                    } else if (key == "") {
                        originArr = [];
                        if (options.favorites) {
                            list.empty();
                            list.append("<p class='autocomplete__list-hint autocomplete__list-hint_top'>Популярные города</p>");

                            fillList(favoritesArr, favoritesArr.length);
                            list.show();
                        } else {
                            list.hide();
                        }
                    }
                });
            }
        };

        return this.each(make);

    };
})(jQuery);